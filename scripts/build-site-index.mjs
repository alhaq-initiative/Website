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
  'alhaq-hub.html',
  'alhaq-hub-join-beta.html',
  'quranhub.html',
  'help.html',
  'contact.html',
  'donate.html',
  'support_hub.html',
  'docs.html',
  'golden-speech.html',
  'amnshield_join_beta.html',
  'publications.html',
  'legal/docs.html',
  'legal/privacy_hub.html',
  'legal/terms_hub.html',
];

const PAGE_META = {
  'index.html': { url: '/', title: 'Home' },
  'about.html': { url: '/about.html', title: 'About' },
  'services.html': { url: '/services.html', title: 'Projects' },
  'products.html': { url: '/products.html', title: 'Products & Services' },
  'library.html': { url: '/library.html', title: 'Library' },
  'all-infographics.html': {
    url: '/all-infographics.html',
    title: 'Infographics',
  },
  'media.html': { url: '/media.html', title: 'Media' },
  'quran.html': { url: '/quran.html', title: 'Quran Hub (web app)' },
  'alhaq-hub.html': { url: '/alhaq-hub.html', title: 'Al-Haq Hub' },
  'alhaq-hub-join-beta.html': {
    url: '/alhaq-hub-join-beta.html',
    title: 'Al-Haq Hub Beta Signup',
  },
  'quranhub.html': {
    url: '/quranhub.html',
    title: 'Quran Hub (Al-Haq Hub feature)',
  },
  'help.html': { url: '/help.html', title: 'Help & Support' },
  'contact.html': { url: '/contact.html', title: 'Contact' },
  'donate.html': { url: '/donate.html', title: 'Donate / Sponsor' },
  'support_hub.html': { url: '/help.html', title: 'Help & Support' },
  'docs.html': { url: '/docs.html', title: 'Docs' },
  'golden-speech.html': { url: '/golden-speech.html', title: 'Golden Speech' },
  'amnshield_join_beta.html': {
    url: '/amnshield_join_beta.html',
    title: 'AmnShield Beta Signup',
  },
  'publications.html': {
    url: '/publications.html',
    title: 'Publications',
  },
  'legal/docs.html': { url: '/legal/docs.html', title: 'Legal & Docs' },
  'legal/privacy_hub.html': {
    url: '/legal/privacy_hub.html',
    title: 'Privacy Hub',
  },
  'legal/terms_hub.html': { url: '/legal/terms_hub.html', title: 'Terms Hub' },
};

// Translation folder (under assets/Translations) -> matching page meta
const TRANSLATION_PAGE_MAP = {
  home: { url: '/', title: 'Home' },
  about: { url: '/about.html', title: 'About' },
  services: { url: '/services.html', title: 'Projects' },
  projects: { url: '/services.html', title: 'Projects' },
  library: { url: '/library.html', title: 'Library' },
  media: { url: '/media.html', title: 'Media' },
  quran: { url: '/quran.html', title: 'Quran Hub (web app)' },
  quranhub: { url: '/quranhub.html', title: 'Quran Hub (Al-Haq Hub feature)' },
  'alhaq-hub': { url: '/alhaq-hub.html', title: 'Al-Haq Hub' },
  'alhaq-hub-join-beta': {
    url: '/alhaq-hub-join-beta.html',
    title: 'Al-Haq Hub Beta Signup',
  },
  help: { url: '/help.html', title: 'Help & Support' },
  contact: { url: '/contact.html', title: 'Contact' },
  donate: { url: '/donate.html', title: 'Donate / Sponsor' },
  support: { url: '/help.html', title: 'Help & Support' },
  docs: { url: '/docs.html', title: 'Docs' },
  'golden-speech': { url: '/golden-speech.html', title: 'Golden Speech' },
  privacy: { url: '/legal/privacy_hub.html', title: 'Privacy Hub' },
  terms: { url: '/legal/terms_hub.html', title: 'Terms Hub' },
  introduction: { url: '/', title: 'Home (Introduction)' },
  'all-infographics': {
    url: '/all-infographics.html',
    title: 'All Infographics',
  },
};

const CHUNK_SIZE = 600; // chars per chunk
const CHUNK_STRIDE = 480; // overlap so phrases at boundaries are still retrievable

function stripHtmlToText(html) {
  return (
    html
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
      .trim()
  );
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

  // Index Library Books metadata if available
  const LIB_DATA_PATH = path.join(REPO_ROOT, 'assets', 'data', 'library-books.json');
  try {
    const libRaw = await fs.readFile(LIB_DATA_PATH, 'utf8');
    const libData = JSON.parse(libRaw);
    if (libData && libData.books) {
      let bookCount = 0;
      for (const [key, b] of Object.entries(libData.books)) {
        const text = `Book: ${b.title || key} (${b.subtitle || ''}). Author: ${b.author || ''}. ${b.description || ''} ${b.attribution || ''}`;
        const chunks = chunkText(text, 600, 480);
        chunks.forEach((c, idx) => {
          records.push({
            id: `library-book/${key}#${idx}`,
            page: `Library — ${b.title || key}`,
            url: `${SITE_BASE}/library.html`,
            lang: 'en',
            text: c,
          });
        });
        bookCount++;
      }
      console.log(`[lib]  Indexed ${bookCount} book entry(s) into site index.`);
    }
  } catch (err) {
    console.warn(`[skip] library-books.json: ${err.message}`);
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
      const walk = node => {
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
      console.log(
        `[i18n] ${folder}/${file} -> ${chunks.length} chunk(s) [${lang}]`
      );
    }
  }

  // Canonical list of valid site URLs for link sanitization and validation
  const valid_urls = Array.from(new Set([
    `${SITE_BASE}/`,
    ...Object.values(PAGE_META).map(m => `${SITE_BASE}${m.url}`),
    'https://amnishield.com',
    'https://amnishield.com/download/',
    'https://amnishield.com/faq/',
    'https://amnishield.com/support/',
    'https://amnishield.com/docs/',
  ]));

  const payload = {
    generated_at: new Date().toISOString(),
    site_base: SITE_BASE,
    valid_urls,
    chunk_count: records.length,
    chunks: records,
  };

  // ── Multi-Repo Crawling: Studio & AmnShield ───────────────────────────────
  // 1. Studio Site (sibling directory at ../Studio-site)
  const STUDIO_ROOT = path.resolve(REPO_ROOT, '..', 'Studio-site');
  const STUDIO_BASE = 'https://alhaq.uk';
  const STUDIO_PAGES = [
    { rel: 'index.html', url: '/', title: 'Al-Haq Studio — Home' },
    { rel: 'amnshield_join_beta.html', url: '/amnshield_join_beta.html', title: 'Al-Haq Studio — AmnShield Beta Signup' }
  ];

  for (const p of STUDIO_PAGES) {
    const abs = path.join(STUDIO_ROOT, p.rel);
    try {
      const html = await fs.readFile(abs, 'utf8');
      const text = stripHtmlToText(html);
      const chunks = chunkText(text);
      chunks.forEach((c, idx) => {
        records.push({
          id: `studio/${p.rel}#${idx}`,
          page: p.title,
          url: STUDIO_BASE + p.url,
          lang: 'en',
          text: c,
        });
      });
      console.log(`[studio] ${p.rel} -> ${chunks.length} chunk(s)`);
    } catch (err) {
      console.warn(`[skip studio] ${p.rel}: ${err.message}`);
    }
  }

  // 2. AmnShield Site (sibling directory at ../../AmnShield/Amnshield-site or ../Amnshield-site)
  let AMNSHIELD_ROOT = path.resolve(REPO_ROOT, '..', '..', 'AmnShield', 'Amnshield-site');
  try {
    await fs.access(AMNSHIELD_ROOT);
  } catch {
    AMNSHIELD_ROOT = path.resolve(REPO_ROOT, '..', 'Amnshield-site');
  }
  const AMNSHIELD_BASE = 'https://amnishield.com';
  const AMNSHIELD_PAGES = [
    { rel: 'index.html', url: '/', title: 'AmnShield — Home' },
    { rel: 'download/index.html', url: '/download/', title: 'AmnShield — Download' },
    { rel: 'faq/index.html', url: '/faq/', title: 'AmnShield — FAQ' },
    { rel: 'support/index.html', url: '/support/', title: 'AmnShield — Support' },
    { rel: 'docs/index.html', url: '/docs/', title: 'AmnShield — Documentation' },
    { rel: 'legal/privacy/index.html', url: '/legal/privacy/', title: 'AmnShield — Privacy Policy' },
    { rel: 'legal/terms/index.html', url: '/legal/terms/', title: 'AmnShield — Terms of Service' },
  ];

  for (const p of AMNSHIELD_PAGES) {
    const abs = path.join(AMNSHIELD_ROOT, p.rel);
    try {
      const html = await fs.readFile(abs, 'utf8');
      const text = stripHtmlToText(html);
      const chunks = chunkText(text);
      chunks.forEach((c, idx) => {
        records.push({
          id: `amnshield/${p.rel}#${idx}`,
          page: p.title,
          url: AMNSHIELD_BASE + p.url,
          lang: 'en',
          text: c,
        });
      });
      console.log(`[amnshield] ${p.rel} -> ${chunks.length} chunk(s)`);
    } catch (err) {
      console.warn(`[skip amnshield] ${p.rel}: ${err.message}`);
    }
  }

  // Write site_index.json to current repo and sync to sibling repos
  const TARGET_OUT_PATHS = [
    OUT_PATH,
    path.join(STUDIO_ROOT, 'hf-space-chatbot', 'site_index.json'),
    path.join(AMNSHIELD_ROOT, 'hf-space-chatbot', 'site_index.json'),
  ];

  payload.chunk_count = records.length;

  for (const targetPath of TARGET_OUT_PATHS) {
    try {
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.writeFile(targetPath, JSON.stringify(payload), 'utf8');
      console.log(`[out] Wrote ${records.length} chunks to ${path.relative(REPO_ROOT, targetPath)}`);
    } catch (err) {
      console.warn(`[out] skip ${targetPath}: ${err.message}`);
    }
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
