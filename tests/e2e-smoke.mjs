#!/usr/bin/env node
const base = process.env.BASE_URL || 'http://localhost:8080';
const pages = ['/', '/about.html', '/services.html', '/library.html', '/donate.html', '/quran.html', '/media.html', '/products.html', '/legal/docs.html'];

import http from 'node:http';
import https from 'node:https';

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

function request(url) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const mod = u.protocol === 'https:' ? https : http;
    const req = mod.request(u, res => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode || 0, ok: (res.statusCode || 0) >= 200 && (res.statusCode || 0) < 400, text: () => Promise.resolve(data) }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function fetchWithRetry(url, tries = 10, delayMs = 500) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await request(url);
      return res;
    } catch (e) {
      lastErr = e;
      await wait(delayMs);
    }
  }
  throw lastErr;
}

(async () => {
  let failures = 0;
  for (const p of pages) {
    const url = new URL(p, base).toString();
    try {
      const res = await fetchWithRetry(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      // Check that global site.js is referenced
      const hasSiteJs = /<script[^>]+src=["']([^"']*assets\/js\/site\.js)["'][^>]*><\/script>/i.test(html);
      if (!hasSiteJs) throw new Error('Missing global script assets/js/site.js');
      // At least one stylesheet link
      const hasCss = /<link[^>]+rel=["']stylesheet["'][^>]*>/i.test(html);
      if (!hasCss) throw new Error('No stylesheet link found');
      console.log(`PASS ${p}`);
    } catch (e) {
      failures++;
      console.error(`FAIL ${p}: ${e.message}`);
    }
  }
  if (failures > 0) {
    console.error(`Smoke check failed: ${failures} page(s) had issues`);
    process.exit(1);
  }
  console.log('Smoke check passed');
})();
