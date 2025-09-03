import { Request, Response } from 'express';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import dns from 'dns';
import { Address4, Address6 } from 'ip-address';
import { promisify } from 'util';
const resolve = promisify(dns.resolve);

import { extractMetadata } from './utils/extractMetadata';

export const preview = async (req: Request, res: Response) => {
  const { url, raw_html } = req.body;
  if (!url || typeof url !== 'string') return res.status(400).json({ error: 'Invalid URL' });

  let html: string;
  if (raw_html) {
    html = raw_html;
  } else {
    try {
      const parsedUrl = new URL(url);
      const host = parsedUrl.hostname;

      // SSRF guard: Check if IP resolves to private range
      const ips = await resolve(host);
      const isPrivate = ips.some(ip => {
        if (Address4.isValid(ip)) {
          const addr = new Address4(ip);
          return addr.isInSubnet(new Address4('10.0.0.0/8')) ||
                 addr.isInSubnet(new Address4('172.16.0.0/12')) ||
                 addr.isInSubnet(new Address4('192.168.0.0/16'));
        }
        if (Address6.isValid(ip)) {
          const addr = new Address6(ip);
          return addr.isLoopback() || addr.isInSubnet(new Address6('fc00::/7'));
        }
        return false;
      });
      if (isPrivate) return res.status(403).json({ error: 'Private IP blocked' });

      let response = await fetch(url, {
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-IN,en-US;q=0.9,en;q=0.8',
          'Referer': 'https://www.amazon.in/'
        },
        redirect: 'manual'
      });

      // Manual redirect handling
      let redirectCount = 0;
      while (response.status >= 300 && response.status < 400 && redirectCount < 3) {
        const location = response.headers.get('location');
        if (!location) break;
        const redirectUrl = new URL(location, url).toString();
        response = await fetch(redirectUrl, { timeout: 5000, headers: { 'User-Agent': 'CentscapeBot/1.0' }, redirect: 'manual' });
        redirectCount++;
      }
      if (redirectCount >= 3) return res.status(400).json({ error: 'Too many redirects' });

      if (!response.headers.get('content-type')?.includes('text/html')) return res.status(400).json({ error: 'Invalid content type' });

      const buffer = await response.buffer();
      if (buffer.length > 2 * 1024 * 1024) return res.status(413).json({ error: 'HTML too large' });

      html = buffer.toString();
      console.log('Fetched HTML length:', html.length);
      console.log('HTML start:', html.substring(0, 300));
      console.log('Contains og:title:', html.includes('og:title'));
      console.log('Contains priceblock:', html.includes('priceblock'));
      console.log('Contains a-price:', html.includes('a-price'));
    } catch (error) {
      console.error('Fetch error:', (error as Error).message);
      return res.status(500).json({ error: 'Fetch error: ' + (error as Error).message });
    }
  }

  console.log('HTML before metadata:', html.substring(0, 100)); // Log first 100 chars for debugging
  const metadata = extractMetadata(html, url);
  res.json(metadata);
};