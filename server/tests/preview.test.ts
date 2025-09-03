import request from 'supertest';
import express from 'express';
import { preview } from '../src/preview';
import fs from 'fs';

const app = express();
app.use(express.json());
app.post('/preview', preview);

describe(' /preview', () => {
  it('parses fixture correctly', async () => {
    const html = fs.readFileSync(__dirname + '/fixtures/amazon.html', 'utf8');
    const res = await request(app).post('/preview').send({ url: 'https://amazon.com', raw_html: html });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('AirPods Max');
    expect(res.body.price).toContain('$499.99');
  });

  it('enforces rate limit', async () => {
    for (let i = 0; i < 10; i++) {
      await request(app).post('/preview').send({ url: 'https://example.com' });
    }
    const res = await request(app).post('/preview').send({ url: 'https://example.com' });
    expect(res.status).toBe(429);
  });

  it('blocks private IP (SSRF)', async () => {
    const res = await request(app).post('/preview').send({ url: 'http://127.0.0.1' });
    expect(res.status).toBe(403);
  });

  it('caps redirects', async () => {
    // Mock fetch for redirects
    const fetchSpy = jest.spyOn(global, 'fetch');
    fetchSpy.mockImplementationOnce(() => Promise.resolve({
      status: 301,
      headers: new Map([['location', 'https://redirect1.com']]),
      buffer: () => Buffer.from(''),
    } as any));
    fetchSpy.mockImplementationOnce(() => Promise.resolve({
      status: 301,
      headers: new Map([['location', 'https://redirect2.com']]),
      buffer: () => Buffer.from(''),
    } as any));
    fetchSpy.mockImplementationOnce(() => Promise.resolve({
      status: 301,
      headers: new Map([['location', 'https://redirect3.com']]),
      buffer: () => Buffer.from(''),
    } as any));
    fetchSpy.mockImplementationOnce(() => Promise.resolve({
      status: 301,
      headers: new Map([['location', 'https://redirect4.com']]),
      buffer: () => Buffer.from(''),
    } as any));
    const res = await request(app).post('/preview').send({ url: 'https://redirect.com' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Too many redirects');
  });

  it('caps HTML size', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      headers: new Map([['content-type', 'text/html']]),
      buffer: () => Buffer.alloc(513 * 1024),
      status: 200
    } as any);
    const res = await request(app).post('/preview').send({ url: 'https://large.com' });
    expect(res.status).toBe(413);
  });

  it('times out', async () => {
    jest.spyOn(global, 'fetch').mockImplementation(() => new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 6000)));
    const res = await request(app).post('/preview').send({ url: 'https://slow.com' });
    expect(res.status).toBe(500);
  });

  it('invalid content type', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      headers: new Map([['content-type', 'image/png']]),
      buffer: () => Buffer.from(''),
      status: 200
    } as any);
    const res = await request(app).post('/preview').send({ url: 'https://image.com' });
    expect(res.status).toBe(400);
  });

  it('invalid URL', async () => {
    const res = await request(app).post('/preview').send({ });
    expect(res.status).toBe(400);
  });
});