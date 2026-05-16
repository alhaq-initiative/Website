#!/usr/bin/env node
/**
 * build-content-index.mjs
 *
 * Scans assets/library/books/<book-dir>/01_Chapters/*.md (or legacy chapters/),
 * loads assets/library/books/<book-dir>/series.json for series metadata, and
 * writes assets/data/library-books.json.
 *
 * Books are grouped by the `type` field in series.json rather than by folder hierarchy.
 *
 * Run:  node scripts/build-content-index.mjs
 *   or: npm run content:index
 *
 * Commit the resulting assets/data/library-books.json so the site works
 * without re-running this script on every deployment.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';

const REPO_ROOT  = process.cwd();
const BOOKS_ROOT = path.join(REPO_ROOT, 'assets', 'library', 'books');
const OUT_PATH   = path.join(REPO_ROOT, 'assets', 'data', 'library-books.json');

// Display metadata for each type value declared in series.json
const TYPE_META = {
  translation: {
    key: 'translation',
    title: 'Translations',
    description: 'Chapter-by-chapter translations validated against primary Arabic sources.',
    order: 1,
  },
  independent_book: {
    key: 'independent_book',
    title: 'Independent Books',
    description: 'Original authored books and research booklets published independently.',
    order: 2,
  },
  research: {
    key: 'research',
    title: 'Research',
    description: 'Research-heavy works and primary-source studies.',
    order: 3,
  },
  booklet: {
    key: 'booklet',
    title: 'Booklets',
    description: 'Short-form educational booklets and concise guides.',
    order: 4,
  },
};

// ── YAML frontmatter parser (no external deps) ──────────────────────────────
function parseFrontmatter(content) {
  const noBom = content.replace(/^\uFEFF/, '');
  const match = noBom.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) return { meta: {}, body: noBom };

  const fmBlock = match[1];
  const meta = {};
  let currentArrayKey = null;

  for (const rawLine of fmBlock.split(/\r?\n/)) {
    // Array item
    const arrMatch = rawLine.match(/^[ \t]+-[ \t]+(.+)$/);
    if (arrMatch && currentArrayKey) {
      meta[currentArrayKey].push(arrMatch[1].trim());
      continue;
    }
    // Key: value
    const kvMatch = rawLine.match(/^([a-zA-Z_][a-zA-Z0-9_]*):\s*(.*)$/);
    if (!kvMatch) { currentArrayKey = null; continue; }

    currentArrayKey = null;
    const key = kvMatch[1];
    let val = kvMatch[2].trim();

    if (val === '' || val === '~' || val === 'null') {
      // could be start of a YAML array
      meta[key] = [];
      currentArrayKey = key;
    } else {
      val = val.replace(/^["']|["']$/g, ''); // strip quotes
      const num = Number(val);
      meta[key] = (val !== '' && !isNaN(num)) ? num : val;
    }
  }

  const body = noBom.slice(match[0].length);
  return { meta, body };
}

// ── excerpt extraction ───────────────────────────────────────────────────────
function extractExcerpt(body, maxLen = 220) {
  for (const line of body.split(/\r?\n/)) {
    const t = line.trim();
    if (!t) continue;
    if (/^[#>\-*!`|]/.test(t)) continue; // headings, blockquotes, lists, code, images, tables
    if (/^\[/.test(t)) continue;          // reference links
    const clean = t.replace(/\*\*/g, '').replace(/\*/g, '').replace(/_/g, '')
                    .replace(/`[^`]+`/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    if (clean.length < 30) continue;
    return clean.length > maxLen ? clean.slice(0, maxLen) + '\u2026' : clean;
  }
  return '';
}

// ── main ─────────────────────────────────────────────────────────────────────
async function main() {
  // Discover book directories directly under BOOKS_ROOT (flat structure)
  let bookDirs;
  try {
    bookDirs = await fs.readdir(BOOKS_ROOT, { withFileTypes: true });
    bookDirs.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  } catch {
    console.error('ERROR: books directory not found:', BOOKS_ROOT);
    process.exit(1);
  }

  const books = {};
  const types = {};

  for (const entry of bookDirs) {
    if (!entry.isDirectory()) continue;
    const folderName = entry.name;
    const seriesDir = path.join(BOOKS_ROOT, folderName);

    // Load series metadata
    let seriesMeta = {};
    try {
      const raw = await fs.readFile(path.join(seriesDir, 'series.json'), 'utf8');
      seriesMeta = JSON.parse(raw);
    } catch {
      console.warn(`  WARN: No series.json found for "${folderName}" — using defaults`);
      seriesMeta = { key: folderName, title: folderName, description: '', author: '', status: 'ongoing', type: 'translation' };
    }

    const seriesKey = String(seriesMeta.key || folderName);
    const typeKey = String(seriesMeta.type || 'translation');

    // Register type grouping (lazily)
    if (!types[typeKey]) {
      types[typeKey] = Object.assign(
        { key: typeKey, title: typeKey, description: '', order: 999 },
        TYPE_META[typeKey] || {},
        { books: [] },
      );
    }

    const chapterDirCandidates = [
      path.join(seriesDir, '01_Chapters'),
      path.join(seriesDir, 'chapters'),
    ];
    let chaptersDir = null;
    for (const candidate of chapterDirCandidates) {
      try {
        const stat = await fs.stat(candidate);
        if (stat.isDirectory()) { chaptersDir = candidate; break; }
      } catch { /* try next */ }
    }

    // Read chapter files
    let chapterFiles = [];
    try {
      if (!chaptersDir) throw new Error('No chapters directory found');
      const entries = await fs.readdir(chaptersDir, { withFileTypes: true });
      chapterFiles = entries
        .filter(e => e.isFile() && e.name.endsWith('.md') && !e.name.startsWith('.'))
        .map(e => e.name)
        .sort();
    } catch {
      console.warn(`  WARN: No chapter directory for "${seriesKey}"`);
    }

    const episodes = [];
    for (const filename of chapterFiles) {
      const filePath = path.join(chaptersDir, filename);
      const raw = await fs.readFile(filePath, 'utf8');
      const { meta, body } = parseFrontmatter(raw);

      if (!meta.title || !meta.slug) {
        console.warn(`  WARN: Skipping ${filename} — missing title or slug in frontmatter`);
        continue;
      }

      const chapterFolderName = path.basename(chaptersDir);
      const webPath = 'assets/library/books/' + folderName + '/' + chapterFolderName + '/' + filename;

      episodes.push({
        title:                  String(meta.title),
        slug:                   String(meta.slug),
        story_number:           meta.story_number != null ? Number(meta.story_number) : null,
        status:                 String(meta.status || 'draft'),
        historical_confidence:  meta.historical_confidence ? String(meta.historical_confidence) : null,
        source_type:            meta.source_type ? String(meta.source_type) : null,
        tags:                   Array.isArray(meta.tags) ? meta.tags.map(String) : [],
        last_imported:          meta.last_imported ? String(meta.last_imported) : null,
        excerpt:                extractExcerpt(body),
        path:                   webPath,
      });
    }

    episodes.sort((a, b) => {
      if (a.story_number != null && b.story_number != null) return a.story_number - b.story_number;
      if (a.story_number != null) return -1;
      if (b.story_number != null) return  1;
      return 0;
    });

    books[seriesKey] = Object.assign({}, seriesMeta, { folder: folderName, episodes });
    types[typeKey].books.push(seriesKey);
    console.log(`  [${typeKey}] ${seriesKey}: ${episodes.length} episode(s)`);
  }

  // Sort books within each type group by book_number
  Object.values(types).forEach((t) => {
    t.books.sort((a, b) => Number((books[a] || {}).book_number || 999) - Number((books[b] || {}).book_number || 999));
  });

  const output = {
    generated: new Date().toISOString().slice(0, 10),
    types,
    books,
  };

  await fs.mkdir(path.dirname(OUT_PATH), { recursive: true });
  await fs.writeFile(OUT_PATH, JSON.stringify(output, null, 2) + '\n', 'utf8');
  console.log('OK: wrote', path.relative(REPO_ROOT, OUT_PATH));
}

main().catch(err => {
  console.error('FAILED:', err && err.stack ? err.stack : err);
  process.exit(1);
});
