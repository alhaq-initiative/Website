#!/usr/bin/env node
/**
 * Comprehensive Website Testing Suite
 * Tests all HTML pages for:
 * - Valid HTML structure
 * - Required scripts and styles
 * - Working internal/external links
 * - Accessibility basics
 * - Performance hints
 */

import http from 'node:http';
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const base = process.env.BASE_URL || 'http://localhost:8080';

// Color output for terminal
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, ...args) {
  console.log(color + args.join(' ') + colors.reset);
}

function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// HTTP request wrapper
function request(url) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const mod = u.protocol === 'https:' ? https : http;
    const req = mod.request(u, res => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => (data += chunk));
      res.on('end', () =>
        resolve({
          status: res.statusCode || 0,
          ok: (res.statusCode || 0) >= 200 && (res.statusCode || 0) < 400,
          text: () => Promise.resolve(data),
          headers: res.headers,
        })
      );
    });
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.end();
  });
}

async function fetchWithRetry(url, tries = 3, delayMs = 500) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await request(url);
      return res;
    } catch (e) {
      lastErr = e;
      if (i < tries - 1) await wait(delayMs);
    }
  }
  throw lastErr;
}

// Recursively discover all HTML files
function discoverHtmlFiles(dir, baseDir = dir, exclude = []) {
  const files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    const relativePath = path.relative(baseDir, fullPath);

    // Skip excluded directories
    if (exclude.some(ex => relativePath.startsWith(ex))) continue;

    if (item.isDirectory()) {
      files.push(...discoverHtmlFiles(fullPath, baseDir, exclude));
    } else if (item.isFile() && item.name.endsWith('.html')) {
      // Convert to URL path
      let urlPath = '/' + relativePath.replace(/\\/g, '/');
      // Keep index.html in the path for subdirectories, but not for root
      if (urlPath === '/index.html') {
        urlPath = '/';
      }
      files.push(urlPath);
    }
  }

  return files;
}

// Test suite functions
class PageTester {
  constructor(url, html) {
    this.url = url;
    this.html = html;
    this.errors = [];
    this.warnings = [];
    this.info = [];
  }

  // Check for required global script
  testGlobalScript() {
    const hasSiteJs =
      /<script[^>]+src=["'][^"']*\/?assets\/js\/site\.js[^"']*["'][^>]*><\/script>/i.test(
        this.html
      );
    if (!hasSiteJs) {
      this.errors.push('Missing global script assets/js/site.js');
    }
  }

  // Check for stylesheet
  testStylesheets() {
    const stylesheetMatches = this.html.match(
      /<link[^>]+rel=["']stylesheet["'][^>]*>/gi
    );
    if (!stylesheetMatches || stylesheetMatches.length === 0) {
      this.errors.push('No stylesheet links found');
    } else {
      this.info.push(`Found ${stylesheetMatches.length} stylesheet(s)`);

      // Check if stylesheets reference valid paths
      stylesheetMatches.forEach(link => {
        const hrefMatch = link.match(/href=["']([^"']+)["']/i);
        if (hrefMatch && hrefMatch[1]) {
          const href = hrefMatch[1];
          // Check if it's a local file (not CDN)
          if (!href.startsWith('http') && !href.startsWith('//')) {
            this.info.push(`Local stylesheet: ${href}`);
          }
        }
      });
    }
  }

  // Check for basic HTML structure
  testHtmlStructure() {
    if (!/<html[^>]*>/i.test(this.html)) {
      this.errors.push('Missing <html> tag');
    }
    if (!/<head[^>]*>/i.test(this.html)) {
      this.errors.push('Missing <head> tag');
    }
    if (!/<body[^>]*>/i.test(this.html)) {
      this.errors.push('Missing <body> tag');
    }

    const titleMatch = this.html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (!titleMatch) {
      this.warnings.push('Missing <title> tag');
    } else if (titleMatch[1].trim().length < 10) {
      this.warnings.push('Title is too short');
    }
  }

  // Check meta tags
  testMetaTags() {
    if (!/<meta[^>]+charset=/i.test(this.html)) {
      this.warnings.push('Missing charset meta tag');
    }
    if (!/<meta[^>]+name=["']viewport["']/i.test(this.html)) {
      this.warnings.push('Missing viewport meta tag');
    }
    if (/<meta[^>]+name=["']description["']/i.test(this.html)) {
      this.info.push('Has meta description');
    }
  }

  // Find all internal links
  findInternalLinks() {
    const links = [];
    const linkRegex = /<a[^>]+href=["']([^"']+)["']/gi;
    let match;

    while ((match = linkRegex.exec(this.html)) !== null) {
      const href = match[1];
      // Only include internal links (not external URLs, not anchors only, not mailto/tel)
      if (
        !href.startsWith('http') &&
        !href.startsWith('//') &&
        !href.startsWith('mailto:') &&
        !href.startsWith('tel:') &&
        !href.startsWith('#') &&
        href !== ''
      ) {
        links.push(href);
      }
    }

    return [...new Set(links)]; // Remove duplicates
  }

  // Check for accessibility basics
  testAccessibility() {
    // Check for alt attributes on images
    const imgTags = this.html.match(/<img[^>]*>/gi) || [];
    const imgsWithoutAlt = imgTags.filter(
      img => !/alt=["'][^"']*["']/i.test(img)
    );

    if (imgsWithoutAlt.length > 0) {
      this.warnings.push(
        `${imgsWithoutAlt.length} image(s) without alt attribute`
      );
    }

    // Check for semantic HTML5 elements
    const hasHeader = /<header[^>]*>/i.test(this.html);
    const hasMain = /<main[^>]*>/i.test(this.html);
    const hasFooter = /<footer[^>]*>/i.test(this.html);

    if (!hasHeader) this.warnings.push('No <header> element found');
    if (!hasMain) this.warnings.push('No <main> element found');
    if (!hasFooter) this.warnings.push('No <footer> element found');

    // Check for heading hierarchy
    const h1Count = (this.html.match(/<h1[^>]*>/gi) || []).length;
    if (h1Count === 0) {
      this.warnings.push('No <h1> heading found');
    } else if (h1Count > 1) {
      this.warnings.push(`Multiple <h1> headings found (${h1Count})`);
    }
  }

  // Check for common performance issues
  testPerformance() {
    // Check for inline styles (potential performance issue)
    const inlineStyleCount = (this.html.match(/style=["'][^"']+["']/gi) || [])
      .length;
    if (inlineStyleCount > 20) {
      this.warnings.push(`Many inline styles detected (${inlineStyleCount})`);
    }

    // Check for large inline scripts
    const scriptTags =
      this.html.match(/<script(?![^>]*src=)[^>]*>[\s\S]*?<\/script>/gi) || [];
    scriptTags.forEach((script, idx) => {
      if (script.length > 5000) {
        this.warnings.push(
          `Large inline script #${idx + 1} (${script.length} chars)`
        );
      }
    });

    // Check for defer/async on external scripts
    const externalScripts = this.html.match(/<script[^>]+src=[^>]*>/gi) || [];
    const scriptsWithoutDeferAsync = externalScripts.filter(
      script => !/defer|async/i.test(script)
    );
    if (scriptsWithoutDeferAsync.length > 0) {
      this.info.push(
        `${scriptsWithoutDeferAsync.length} script(s) without defer/async`
      );
    }
  }

  // Check for i18n support
  testI18n() {
    const langAttr = this.html.match(/<html[^>]+lang=["']([^"']+)["']/i);
    if (!langAttr) {
      this.warnings.push('No lang attribute on <html> tag');
    } else {
      this.info.push(`Language: ${langAttr[1]}`);
    }

    const dirAttr = this.html.match(/<html[^>]+dir=["']([^"']+)["']/i);
    if (dirAttr) {
      this.info.push(`Text direction: ${dirAttr[1]}`);
    }
  }

  runAllTests() {
    if (/<meta[^>]+http-equiv=["']refresh["']/i.test(this.html)) {
      this.info.push('Redirect page detected');
      return;
    }
    this.testGlobalScript();
    this.testStylesheets();
    this.testHtmlStructure();
    this.testMetaTags();
    this.testAccessibility();
    this.testPerformance();
    this.testI18n();
  }

  hasErrors() {
    return this.errors.length > 0;
  }

  report() {
    if (this.errors.length > 0) {
      log(colors.red, `  [X] ERRORS (${this.errors.length}):`);
      this.errors.forEach(err => log(colors.red, `    - ${err}`));
    }
    if (this.warnings.length > 0) {
      log(colors.yellow, `  [!] WARNINGS (${this.warnings.length}):`);
      this.warnings.forEach(warn => log(colors.yellow, `    - ${warn}`));
    }
    if (this.info.length > 0 && process.env.VERBOSE) {
      log(colors.cyan, `  [i] INFO (${this.info.length}):`);
      this.info.forEach(info => log(colors.cyan, `    - ${info}`));
    }
  }
}

// Start local server if needed
async function ensureServer() {
  try {
    const res = await fetchWithRetry(new URL('/', base).toString(), 1, 0);
    if (res.ok) return null; // Server already running
  } catch {
    /* Server not running */
  }

  log(colors.yellow, 'Starting local server on port 8080...');
  const server = http
    .createServer((req, res) => {
      const urlPath = decodeURIComponent(req.url.split('?')[0]);
      let filePath =
        urlPath === '/' ? 'index.html' : urlPath.replace(/^\//, '');
      if (filePath.endsWith('/')) {
        filePath += 'index.html';
      }

      if (filePath.includes('..')) {
        res.writeHead(400);
        return res.end('Bad Request');
      }

      let abs = path.join(rootDir, filePath);
      let resolved = abs;
      if (fs.existsSync(abs) && fs.statSync(abs).isDirectory()) {
        resolved = path.join(abs, 'index.html');
      }
      if (!fs.existsSync(resolved) && !path.extname(resolved)) {
        const htmlCandidate = resolved + '.html';
        const dirCandidate = path.join(resolved, 'index.html');
        if (fs.existsSync(htmlCandidate)) {
          resolved = htmlCandidate;
        } else if (fs.existsSync(dirCandidate)) {
          resolved = dirCandidate;
        }
      }

      fs.readFile(resolved, (err, data) => {
        if (err) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          return res.end('Not found');
        }

        const ext = path.extname(resolved).toLowerCase();
        const type =
          {
            '.html': 'text/html; charset=utf-8',
            '.js': 'application/javascript; charset=utf-8',
            '.css': 'text/css; charset=utf-8',
            '.json': 'application/json; charset=utf-8',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.svg': 'image/svg+xml',
            '.webp': 'image/webp',
            '.ico': 'image/x-icon',
            '.txt': 'text/plain; charset=utf-8',
            '.webmanifest': 'application/manifest+json',
          }[ext] || 'application/octet-stream';

        res.writeHead(200, { 'Content-Type': type });
        res.end(data);
      });
    })
    .listen(8080);

  await wait(300);
  return server;
}

// Main test execution
(async () => {
  log(colors.blue, '\n=== Comprehensive Website Testing Suite ===\n');

  // Start server if needed
  const startedServer = await ensureServer();

  // Discover all HTML files
  log(colors.cyan, 'Discovering HTML files...');
  const excludeDirs = [
    'node_modules',
    '.git',
    'tests',
    'cypress',
    'deploy',
    'AmnShield-Desktop-Manager',
  ];
  const allPages = discoverHtmlFiles(rootDir, rootDir, excludeDirs);

  log(colors.green, `Found ${allPages.length} HTML pages\n`);

  // Test each page
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
  };

  const allInternalLinks = new Set();
  const failedPages = [];

  for (const page of allPages) {
    results.total++;
    const url = new URL(page, base).toString();

    try {
      const res = await fetchWithRetry(url, 2, 500);

      if (!res.ok) {
        log(colors.red, `[FAIL] ${page} - HTTP ${res.status}`);
        results.failed++;
        failedPages.push({ page, error: `HTTP ${res.status}` });
        continue;
      }

      const html = await res.text();
      const tester = new PageTester(page, html);
      tester.runAllTests();

      // Collect internal links for link validation
      const links = tester.findInternalLinks();
      links.forEach(link => allInternalLinks.add(link));

      if (tester.hasErrors()) {
        log(colors.red, `[FAIL] ${page}`);
        tester.report();
        results.failed++;
        failedPages.push({ page, tester });
      } else if (tester.warnings.length > 0) {
        log(colors.yellow, `[WARN] ${page}`);
        tester.report();
        results.warnings++;
        results.passed++;
      } else {
        log(colors.green, `[PASS] ${page}`);
        if (process.env.VERBOSE) tester.report();
        results.passed++;
      }
    } catch (err) {
      log(colors.red, `[FAIL] ${page} - ${err.message}`);
      results.failed++;
      failedPages.push({ page, error: err.message });
    }
  }

  // Link validation phase
  log(
    colors.cyan,
    `\n=== Validating ${allInternalLinks.size} unique internal links ===\n`
  );
  const brokenLinks = [];

  for (const link of allInternalLinks) {
    try {
      // Normalize link (remove hash, handle relative paths)
      let testUrl = link.split('#')[0];
      if (!testUrl.startsWith('/')) {
        testUrl = '/' + testUrl;
      }

      const url = new URL(testUrl, base).toString();
      const res = await fetchWithRetry(url, 1, 200);

      if (!res.ok) {
        brokenLinks.push({ link, status: res.status });
        log(colors.red, `[FAIL] ${link} - HTTP ${res.status}`);
      } else if (process.env.VERBOSE) {
        log(colors.green, `[PASS] ${link}`);
      }
    } catch (err) {
      brokenLinks.push({ link, error: err.message });
      log(colors.red, `[FAIL] ${link} - ${err.message}`);
    }
  }

  // Final report
  log(colors.blue, '\n=== Test Summary ===\n');
  log(colors.green, `Total pages tested: ${results.total}`);
  log(colors.green, `Passed: ${results.passed}`);
  if (results.warnings > 0) {
    log(colors.yellow, `With warnings: ${results.warnings}`);
  }
  if (results.failed > 0) {
    log(colors.red, `Failed: ${results.failed}`);
  }

  if (brokenLinks.length > 0) {
    log(colors.red, `Broken links: ${brokenLinks.length}`);
  } else {
    log(
      colors.green,
      `All ${allInternalLinks.size} internal links valid [PASS]`
    );
  }

  // Cleanup
  if (startedServer) {
    startedServer.close();
  }

  // Exit with error if tests failed
  if (results.failed > 0 || brokenLinks.length > 0) {
    log(colors.red, '\nTests FAILED [X]');
    process.exit(1);
  } else {
    log(colors.green, '\nAll tests PASSED [PASS]');
    process.exit(0);
  }
})();
