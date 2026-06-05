#!/usr/bin/env node
// Offline integrity checker: scans HTML files for references and verifies assets exist
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

// Pages to scan (top-level .html and selected subfolders)
function listHtmlFiles(baseDir) {
  const entries = fs.readdirSync(baseDir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    if (e.isFile() && e.name.toLowerCase().endsWith('.html')) {
      files.push(path.join(baseDir, e.name));
    } else if (e.isDirectory()) {
      // opt-in scan subdirs with html pages (legal)
      if (["legal"].includes(e.name)) {
        files.push(...listHtmlFiles(path.join(baseDir, e.name)));
      }
    }
  }
  return files;
}

function extractRefs(html, dir) {
  const refs = [];
  // <script src="...">
  for (const m of html.matchAll(/<script[^>]+src=["']([^"']+)["'][^>]*>/gi)) {
    refs.push(m[1]);
  }
  // <link rel="stylesheet" href="...">
  for (const m of html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi)) {
    refs.push(m[1]);
  }
  // <img src="...">
  for (const m of html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)) {
    refs.push(m[1]);
  }
  // <source src="..."> (video/audio)
  for (const m of html.matchAll(/<source[^>]+src=["']([^"']+)["'][^>]*>/gi)) {
    refs.push(m[1]);
  }
  // resolve paths relative to page dir
  const resolved = refs
    .map((r) => r.split('#')[0])
    .map((r) => r.split('?')[0])
    .filter((r) => !/^https?:\/\//i.test(r) && !/^data:/i.test(r))
    .map((r) => (r.startsWith('/') ? path.join(ROOT, r) : path.join(dir, r)))
    .map((p) => path.normalize(p));
  return resolved;
}

function fileExistsCaseSensitive(fp) {
  // On Windows, emulate case sensitivity by checking directory entries
  const parts = path.relative(ROOT, fp).split(/\\|\//);
  let cur = ROOT;
  for (const part of parts) {
    const list = fs.readdirSync(cur);
    const found = list.find((name) => name === part);
    if (!found) return false;
    cur = path.join(cur, found);
  }
  return fs.existsSync(cur);
}

function run() {
  const pages = listHtmlFiles(ROOT);
  let failures = 0;
  for (const fp of pages) {
    const dir = path.dirname(fp);
    const html = fs.readFileSync(fp, 'utf8');
    const refs = extractRefs(html, dir);
    const missing = refs.filter((r) => !fileExistsCaseSensitive(r));
  const hasSiteJs = /assets\/js\/site\.js(\b|[?#])/i.test(html);
    const hasCss = /<link[^>]+rel=["']stylesheet["'][^>]*>/i.test(html);
    const issues = [];
    if (!hasSiteJs) issues.push('Missing assets/js/site.js include');
    if (!hasCss) issues.push('No stylesheet link found');
    if (missing.length) issues.push(`Missing files: ${missing.map((p) => path.relative(ROOT, p)).join(', ')}`);
    if (issues.length) {
      failures++;
      console.error(`FAIL ${path.relative(ROOT, fp)}\n  - ${issues.join('\n  - ')}`);
    } else {
      console.log(`PASS ${path.relative(ROOT, fp)}`);
    }
  }
  if (failures) {
    console.error(`Integrity check failed: ${failures} file(s) with issues`);
    process.exit(1);
  } else {
    console.log('Integrity check passed');
  }
}

run();
