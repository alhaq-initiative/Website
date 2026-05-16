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
  'amn-site/index.html',
  'amn-site/faq/index.html',
  'amn-site/download/index.html',
  'amn-site/support/index.html',
  'legal/docs.html',
  'legal/privacy_hub.html',
  'legal/terms_hub.html',
];

const PAGE_META = {
  'index.html':            { url: '/',                       title: 'Home' },
  'about.html':            { url: '/about.html',             title: 'About' },
  'services.html':         { url: '/services.html',          title: 'Projects' },
  'products.html':         { url: '/products.html',          title: 'Products & Services' },
  'library.html':          { url: '/library.html',           title: 'Library' },
  'media.html':            { url: '/media.html',             title: 'Media' },
  'quran.html':            { url: '/quran.html',             title: 'Quran Hub (web app)' },
  'deenhub.html':          { url: '/deenhub.html',           title: 'DeenHub' },
  'deenhub_join_beta.html':{ url: '/deenhub_join_beta.html', title: 'DeenHub Beta Signup' },
  'quranhub.html':         { url: '/quranhub.html',          title: 'Quran Hub (DeenHub feature)' },
  'help.html':             { url: '/help.html',              title: 'Help & FAQ' },
  'contact.html':          { url: '/contact.html',           title: 'Contact' },
  'donate.html':           { url: '/donate.html',            title: 'Donate / Sponsor' },
  'support_hub.html':      { url: '/support_hub.html',       title: 'Support Hub' },
  'docs.html':             { url: '/docs.html',              title: 'Docs' },
  'golden-speech.html':    { url: '/golden-speech.html',     title: 'Golden Speech' },
  'amn-site/index.html':           { url: '/amn-site/',                 title: 'AmnShield' },
  'amn-site/faq/index.html':       { url: '/amn-site/faq/',             title: 'AmnShield FAQ' },
  'amn-site/download/index.html':  { url: '/amn-site/download/',        title: 'AmnShield Download' },
  'amn-site/support/index.html':   { url: '/amn-site/support/',         title: 'AmnShield Support' },
  'legal/docs.html':       { url: '/legal/docs.html',        title: 'Legal & Docs' },
  'legal/privacy_hub.html':{ url: '/legal/privacy_hub.html', title: 'Privacy Hub' },
  'legal/terms_hub.html':  { url: '/legal/terms_hub.html',   title: 'Terms Hub' },
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
        text: c,
      });
    });
    console.log(`[ok]   ${rel} -> ${chunks.length} chunk(s)`);
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
