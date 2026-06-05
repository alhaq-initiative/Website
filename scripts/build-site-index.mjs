#!/usr/bin/env node
/**
 * build-site-index.mjs
 *
 * Crawls top-level HTML pages of the website and produces a compact JSON
 * index that the HF Space chatbot loads at runtime for retrieval-augmented
 * answers. Output: hf-space-chatbot/site_index.json
 *
 * Run: node scripts/build-site-index.mjs
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';

const REPO_ROOT = process.cwd();
const OUT_PATH = path.join(REPO_ROOT, 'hf-space-chatbot', 'site_index.json');
const SITE_BASE = 'https://alhaq-initiative.org';

// Pages to include (relative to repo root). amn-site/ subpages and deep
// legal docs are excluded to keep the index small; the bot already has
// canonical descriptions for those in the system prompt.
const PAGES = [
  'index.html',
  'about.html',
  'services.html',
  'products.html',
  'library.html',
  'all-infographics.html',
  'media.html',
  'quran.html',
  'deenhub.html',
  'deenhub_join_beta.html',
  'quranhub.html',
  'help.html',
  'contact.html',
  'donate.html',
  'support_hub.html',
  'docs.html',
  'golden-speech.html',
  'amnshield_join_beta.html',
  'legal/docs.html',
  'legal/privacy_hub.html',
  'legal/terms_hub.html',
];

const PAGE_META = {
  'index.html':              { url: '/',                         title: 'Home' },
  'about.html':              { url: '/about.html',               title: 'About' },
  'services.html':           { url: '/services.html',            title: 'Projects' },
  'products.html':           { url: '/products.html',            title: 'Products & Services' },
  'library.html':            { url: '/library.html',             title: 'Library' },
  'all-infographics.html':   { url: '/all-infographics.html',    title: 'Infographics' },
  'media.html':              { url: '/media.html',               title: 'Media' },
  'quran.html':              { url: '/quran.html',               title: 'Quran Hub (web app)' },
  'deenhub.html':            { url: '/deenhub.html',             title: 'DeenHub' },
  'deenhub_join_beta.html':  { url: '/deenhub_join_beta.html',   title: 'DeenHub Beta Signup' },
  'quranhub.html':           { url: '/quranhub.html',            title: 'Quran Hub (DeenHub feature)' },
  'help.html':               { url: '/help.html',                title: 'Help & FAQ' },
  'contact.html':            { url: '/contact.html',             title: 'Contact' },
  'donate.html':             { url: '/donate.html',              title: 'Donate / Sponsor' },
  'support_hub.html':        { url: '/support_hub.html',         title: 'Support Hub' },
  'docs.html':               { url: '/docs.html',                title: 'Docs' },
  'golden-speech.html':      { url: '/golden-speech.html',       title: 'Golden Speech' },
  'amnshield_join_beta.html':{ url: '/amnshield_join_beta.html', title: 'AmnShield Beta Signup' },
  'legal/docs.html':         { url: '/legal/docs.html',          title: 'Legal & Docs' },
  'legal/privacy_hub.html':  { url: '/legal/privacy_hub.html',   title: 'Privacy Hub' },
  'legal/terms_hub.html':    { url: '/legal/terms_hub.html',     title: 'Terms Hub' },
};

// Translation folder (under assets/Translations) -> matching page meta
const TRANSLATION_PAGE_MAP = {
  home:               { url: '/',                       title: 'Home' },
  about:              { url: '/about.html',             title: 'About' },
  services:           { url: '/services.html',          title: 'Projects' },
  projects:           { url: '/services.html',          title: 'Projects' },
  library:            { url: '/library.html',           title: 'Library' },
  media:              { url: '/media.html',             title: 'Media' },
  quran:              { url: '/quran.html',             title: 'Quran Hub (web app)' },
  quranhub:           { url: '/quranhub.html',          title: 'Quran Hub (DeenHub feature)' },
  deenhub:            { url: '/deenhub.html',           title: 'DeenHub' },
  deenhub_join_beta:  { url: '/deenhub_join_beta.html', title: 'DeenHub Beta Signup' },
  help:               { url: '/help.html',              title: 'Help & FAQ' },
  contact:            { url: '/contact.html',           title: 'Contact' },
  donate:             { url: '/donate.html',            title: 'Donate / Sponsor' },
  support:            { url: '/support_hub.html',       title: 'Support Hub' },
  docs:               { url: '/docs.html',              title: 'Docs' },
  'golden-speech':    { url: '/golden-speech.html',     title: 'Golden Speech' },
  privacy:            { url: '/legal/privacy_hub.html', title: 'Privacy Hub' },
  terms:              { url: '/legal/terms_hub.html',   title: 'Terms Hub' },
  introduction:       { url: '/',                       title: 'Home (Introduction)' },
  'all-infographics': { url: '/all-infographics.html',  title: 'All Infographics' },
};

const CHUNK_SIZE = 600;   // chars per chunk
const CHUNK_STRIDE = 480; // overlap so phrases at boundaries are still retrievable

function stripHtmlToText(html) {
  return html
    // remove script/style/template blocks entirely
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<template[\s\S]*?<\/template>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<!--([\s\S]*?)-->/g, ' ')
    // collapse tags
    .replace(/<\/?[^>]+>/g, ' ')
    // decode a handful of common entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;|&lsquo;/g, "'")
    .replace(/&rdquo;|&ldquo;/g, '"')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&hellip;/g, '…')
    .replace(/&[a-z]+;/gi, ' ')
    // normalise whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

function chunkText(text, size = CHUNK_SIZE, stride = CHUNK_STRIDE) {
  const chunks = [];
  if (!text) return chunks;
  for (let i = 0; i < text.length; i += stride) {
    const slice = text.slice(i, i + size).trim();
    if (slice.length >= 80) chunks.push(slice);
    if (i + size >= text.length) break;
  }
  return chunks;
}

async function main() {
  const records = [];
  for (const rel of PAGES) {
    const abs = path.join(REPO_ROOT, rel);
    let html;
    try {
      html = await fs.readFile(abs, 'utf8');
    } catch (err) {
      console.warn(`[skip] ${rel}: ${err.message}`);
      continue;
    }
    const meta = PAGE_META[rel] || { url: '/' + rel, title: rel };
    const text = stripHtmlToText(html);
    const chunks = chunkText(text);
    chunks.forEach((c, idx) => {
      records.push({
        id: `${rel}#${idx}`,
        page: meta.title,
        url: SITE_BASE + meta.url,
        lang: 'en',
        text: c,
      });
    });
    console.log(`[ok]   ${rel} -> ${chunks.length} chunk(s)`);
  }

  // Translations: walk assets/Translations/<folder>/<lang>.json and add chunks.
  const T_ROOT = path.join(REPO_ROOT, 'assets', 'Translations');
  let folders = [];
  try {
    folders = await fs.readdir(T_ROOT, { withFileTypes: true });
  } catch {
    folders = [];
  }
  for (const ent of folders) {
    if (!ent.isDirectory()) continue;
    const folder = ent.name;
    const meta = TRANSLATION_PAGE_MAP[folder];
    if (!meta) continue; // skip unmapped folders (e.g. legacy deensheild*)
    let files = [];
    try {
      files = await fs.readdir(path.join(T_ROOT, folder));
    } catch {
      continue;
    }
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      const lang = file.replace(/\.json$/, '');
      if (lang === 'en') continue; // English is already covered by the HTML pages
      let data;
      try {
        const raw = await fs.readFile(path.join(T_ROOT, folder, file), 'utf8');
        data = JSON.parse(raw);
      } catch (err) {
        console.warn(`[skip] ${folder}/${file}: ${err.message}`);
        continue;
      }
      const values = [];
      const walk = (node) => {
        if (node == null) return;
        if (typeof node === 'string') {
          const s = node.replace(/\s+/g, ' ').trim();
          if (s.length >= 2) values.push(s);
        } else if (Array.isArray(node)) {
          node.forEach(walk);
        } else if (typeof node === 'object') {
          Object.values(node).forEach(walk);
        }
      };
      walk(data);
      const joined = values.join(' \u2022 ');
      const chunks = chunkText(joined, 700, 560);
      chunks.forEach((c, idx) => {
        records.push({
          id: `${folder}/${file}#${idx}`,
          page: meta.title,
          url: SITE_BASE + meta.url,
          lang,
          text: c,
        });
      });
      console.log(`[i18n] ${folder}/${file} -> ${chunks.length} chunk(s) [${lang}]`);
    }
  }

  const payload = {
    generated_at: new Date().toISOString(),
    site_base: SITE_BASE,
    chunk_count: records.length,
    chunks: records,
  };

  await fs.mkdir(path.dirname(OUT_PATH), { recursive: true });
  await fs.writeFile(OUT_PATH, JSON.stringify(payload), 'utf8');
  console.log(`\nWrote ${records.length} chunks to ${path.relative(REPO_ROOT, OUT_PATH)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
