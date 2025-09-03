import * as cheerio from 'cheerio';

export const extractMetadata = (html: string, sourceUrl: string) => {
  // Validate and log the input
  if (!html || typeof html !== 'string' || html.trim() === '') {
    console.error('Invalid or empty HTML input:', { html, length: html?.length, type: typeof html });
    return { title: 'N/A', image: '', price: 'N/A', currency: 'USD', siteName: new URL(sourceUrl).hostname, sourceUrl };
  }

  try {
    const $ = cheerio.load(html);
    console.log('Cheerio loaded HTML start:', $.html().substring(0, 100));

    // Open Graph
    let title = $('meta[property="og:title"]').attr('content');
    let image = $('meta[property="og:image"]').attr('content');
    let price = $('meta[property="og:price:amount"]').attr('content');
    let currency = $('meta[property="og:price:currency"]').attr('content') || 'USD';
    let siteName = $('meta[property="og:site_name"]').attr('content');

    console.log('Extracted og:title:', title);
    console.log('Extracted og:image:', image);
    console.log('Extracted og:price:amount:', price);
    console.log('Extracted og:site_name:', siteName);

    // Twitter Card fallback
    if (!title) title = $('meta[name="twitter:title"]').attr('content') || $('meta[property="twitter:title"]').attr('content');
    if (!image) image = $('meta[name="twitter:image"]').attr('content') || $('meta[property="twitter:image"]').attr('content');

    // oEmbed fallback (assume no oEmbed endpoint call for simplicity)
    if (!title) title = $('link[type="application/json+oembed"]').attr('title');

    // Additional fallbacks for common sites
    if (!title) title = $('h1').first().text() || $('[data-cy="title-recipe"]').text();
    if (!image) image = $('img').attr('src') || $('[data-image-index]').attr('src');

    // Fallback
    if (!title) {
      title = $('title').text() || 'N/A';
      console.log('Fallback title from <title>:', title);
    }
    if (!image) {
      image = $('img').first().attr('src') || '';
      console.log('Fallback image from <img>:', image);
    }
    if (!siteName) siteName = new URL(sourceUrl).hostname;
    if (!price) {
      // Try multiple price selectors, including Amazon-specific
      price = $('[itemprop="price"]').text() ||
               $('[data-cy="price-recipe"]').text() ||
               $('[class*="price"]').first().text() ||
               $('#priceblock_ourprice').text() ||
               $('#priceblock_dealprice').text() ||
               $('#priceblock_saleprice').text() ||
               $('.a-price .a-offscreen').first().text() ||
               $('.a-color-price').first().text() ||
               '';
      console.log('Price from selectors:', price);
      if (!price) {
        const priceRegex = /[\$€£]\s*[\d,]+\.?\d{0,2}/g;
        price = html.match(priceRegex)?.[0] || 'N/A';
        console.log('Price from regex:', price);
      }
    }

    return { title, image, price, currency, siteName, sourceUrl };
  } catch (error) {
    console.error('Error parsing HTML with cheerio:', error);
    return { title: 'N/A', image: '', price: 'N/A', currency: 'USD', siteName: new URL(sourceUrl).hostname, sourceUrl };
  }
};