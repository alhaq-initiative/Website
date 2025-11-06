#!/usr/bin/env node
const base = process.env.BASE_URL || 'http://localhost:8080';
const pages = [
  // Main pages
  '/',
  '/about.html',
  '/contact.html',
  '/donate.html',
  '/help.html',
  
  // Services & Sub-services
  '/services.html',
  '/library.html',
  '/quran.html',
  '/media.html',
  '/all-infographics.html',
  '/golden-speech.html',
  
  // Products & Sub-products
  '/products.html',
  '/deenshield/main.html',
  '/deenhub.html',
  '/deenhub_join_beta.html',
  '/quranhub.html',
  
  // Legal & docs hubs
  '/legal/docs.html',
  '/legal/privacy_hub.html',
  '/legal/terms_hub.html',
  '/legal/support_hub.html',
  
  // DeenHub legal docs
  '/legal/deenhub_docs/deenhub_privacy_policy.html',
  '/legal/deenhub_docs/deenhub_terms.html',
  
  // DeenShield legal docs (English main pages)
  '/legal/deenshield_docs/privacy-policies/mobile/index.html',
  '/legal/deenshield_docs/privacy-policies/desktop/index.html',
  '/legal/deenshield_docs/privacy-policies/extension/index.html',
  '/legal/deenshield_docs/privacy-policies/manager/index.html',
  '/legal/deenshield_docs/privacy-policies/en/main-privacy.html',
  '/legal/deenshield_docs/terms/en/index.html',
  '/legal/deenshield_docs/support/en/index.html'
];

import http from 'node:http';
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';

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
  // Attempt to ensure a server is available; if not, start a minimal static server.
  let startedServer = null;
  async function probeRoot() {
    try {
      const res = await fetchWithRetry(new URL('/', base).toString(), 1, 0);
      return res.ok;
    } catch { return false; }
  }
  async function ensureServer() {
    const ok = await probeRoot();
    if (ok) return; // Existing server running.
    const rootDir = process.cwd();
    startedServer = http.createServer((req, res) => {
      // Normalize URL -> file path
      const urlPath = decodeURIComponent(req.url.split('?')[0]);
      let filePath = urlPath === '/' ? 'index.html' : urlPath.replace(/^\//, '');
      // Prevent directory traversal
      if (filePath.includes('..')) { res.writeHead(400); return res.end('Bad Request'); }
      const abs = path.join(rootDir, filePath);
      fs.readFile(abs, (err, data) => {
        if (err) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          return res.end('Not found');
        }
        const ext = path.extname(abs).toLowerCase();
        const type = ({
          '.html': 'text/html; charset=utf-8',
          '.js': 'application/javascript; charset=utf-8',
          '.css': 'text/css; charset=utf-8',
          '.json': 'application/json; charset=utf-8',
          '.png': 'image/png',
          '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml',
          '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8'
        })[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': type });
        res.end(data);
      });
    }).listen(8080);
    await wait(200); // brief settle
  }

  await ensureServer();
  let failures = 0;
  for (const p of pages) {
    const url = new URL(p, base).toString();
    try {
      const res = await fetchWithRetry(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      // Check that global site.js is referenced (relative or absolute path)
      const hasSiteJs = /<script[^>]+src=["'][^"']*\/?assets\/js\/site\.js[^"']*["'][^>]*><\/script>/i.test(html);
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
  if (startedServer) {
    startedServer.close();
  }
  if (failures > 0) {
    console.error(`Smoke check failed: ${failures} page(s) had issues`);
    process.exit(1);
  }
  console.log('Smoke check passed');
})();
