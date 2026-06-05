#!/usr/bin/env node
/**
 * normalise-notion-md.mjs
 *
 * Convert a Notion "Export → Markdown & CSV" file into a clean, repo-friendly
 * Markdown file with proper YAML frontmatter.
 *
 * Usage:
 *   node scripts/normalise-notion-md.mjs <input.md> [--out <dir>] [--slug <slug>] [--series <series>] [--book-dir <dir>]
 *
 * Examples:
 *   npm run library:import -- "E:/Documents/.../Episode One.md"
 *   node scripts/normalise-notion-md.mjs "C:/path/to/Episode 2 ... 8729a07f....md" \
 *     --out assets/library/books/translations/02_Chronicles_of_the_Faith_Sellers/01_Chapters \
 *     --series faith-sellers
 *
 * What it does:
 *   - Reads the Notion-exported Markdown file.
 *   - Strips Notion's trailing 32-hex UUID from the filename.
 *   - Parses the H1 title and the immediately-following "Key: Value" property block
 *     and emits real YAML frontmatter (title, status, story_number, tags, …).
 *   - Converts <aside> ... </aside> blocks into Markdown blockquotes.
 *   - Copies any sibling asset folder (Notion bundles images alongside) into
 *     assets/library/books/translations/<book-dir>/assets/<slug>/ and rewrites image links.
 *   - Writes the cleaned file to <out>/<NN>-<slug>.md (NN = zero-padded story
 *     number when present, otherwise omitted).
 *
 * Safe-by-default: never overwrites an existing output file unless --force is set.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

// --------------------------- CLI -------------------------------------------

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--out') args.out = argv[++i];
    else if (a === '--slug') args.slug = argv[++i];
    else if (a === '--series') args.series = argv[++i];
    else if (a === '--book-dir') args.bookDir = argv[++i];
    else if (a === '--force') args.force = true;
    else if (a === '--help' || a === '-h') args.help = true;
    else args._.push(a);
  }
  return args;
}

function printHelp() {
  console.log(
    [
      'Usage: node scripts/normalise-notion-md.mjs <input.md> [options]',
      '',
      'Options:',
      '  --series <name>   Library series key (default: faith-sellers)',
      '  --book-dir <dir>  Book directory under assets/library/books/ (default: mapped from series)',
      '  --out <dir>       Output directory (default: assets/library/books/<book-dir>/01_Chapters)',
      '  --slug <slug>     Override generated slug for the output filename',
      '  --force           Overwrite existing output file',
      '  -h, --help        Show this help',
    ].join('\n')
  );
}

// --------------------------- helpers ---------------------------------------

const NOTION_UUID_RE = /\s+[0-9a-f]{32}(?=\.[^.]+$|$)/i;

function slugify(text) {
  return String(text)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip combining diacritics
    .replace(/[''`"]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function stripNotionUuidFromName(name) {
  return name.replace(NOTION_UUID_RE, '');
}

function pad2(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return null;
  return String(v).padStart(2, '0');
}

function bookNumberFromDir(bookDir) {
  const match = String(bookDir || '').match(/^(\d{2})_/);
  return match ? match[1] : '00';
}

function yamlEscape(value) {
  if (value == null) return '""';
  const s = String(value);
  // quote if contains anything potentially confusing
  if (
    /^[\w .,\-\u00C0-\uFFFF]+$/.test(s) &&
    !/^(true|false|null|yes|no)$/i.test(s)
  ) {
    return s;
  }
  return '"' + s.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
}

function toYamlFrontmatter(meta) {
  const lines = ['---'];
  for (const [k, v] of Object.entries(meta)) {
    if (v == null || v === '') continue;
    if (Array.isArray(v)) {
      if (v.length === 0) continue;
      lines.push(`${k}:`);
      for (const item of v) lines.push(`  - ${yamlEscape(item)}`);
    } else {
      lines.push(`${k}: ${yamlEscape(v)}`);
    }
  }
  lines.push('---', '');
  return lines.join('\n');
}

function splitTopBlock(body) {
  // After the H1, Notion writes the page properties as a contiguous block of
  // `Key: value` lines (one per property), then a blank line, then the body.
  const lines = body.split(/\r?\n/);
  const props = {};
  let i = 0;
  // skip leading blank lines
  while (i < lines.length && lines[i].trim() === '') i++;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '') break;
    const m = line.match(/^([A-Z][A-Za-z0-9 _\-/]*?):\s+(.+?)\s*$/);
    if (!m) break;
    const key = m[1].trim();
    const value = m[2].trim();
    props[key] = value;
    i++;
  }
  // if we consumed at least one property, drop the trailing blank line
  if (
    Object.keys(props).length > 0 &&
    lines[i] !== undefined &&
    lines[i].trim() === ''
  ) {
    i++;
  }
  const rest = lines.slice(i).join('\n');
  return { props, rest };
}

function convertAsides(md) {
  // Notion exports callouts as:
  //   <aside>
  //   <emoji>
  //   content...
  //   </aside>
  // Convert to a Markdown blockquote with a "> [!note]" prefix.
  return md.replace(/<aside>\s*([\s\S]*?)\s*<\/aside>/g, (_match, inner) => {
    const innerLines = inner
      .split(/\r?\n/)
      .map(l => l.replace(/^\s+|\s+$/g, ''));
    // Drop a leading emoji-only line if present
    while (innerLines.length && innerLines[0] === '') innerLines.shift();
    if (
      innerLines.length &&
      /^[\p{Extended_Pictographic}\u200d\uFE0F]+$/u.test(innerLines[0])
    ) {
      innerLines.shift();
    }
    while (innerLines.length && innerLines[innerLines.length - 1] === '')
      innerLines.pop();
    const quoted = ['> [!note]', ...innerLines.map(l => (l ? `> ${l}` : '>'))];
    return quoted.join('\n');
  });
}

function collapseBlankLines(md) {
  return md
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s+/, '')
    .replace(/\s+$/, '\n');
}

function parseTags(raw) {
  return String(raw)
    .split(',')
    .map(t => t.trim())
    .filter(Boolean);
}

function buildMeta(props, { title, slug, series }) {
  const status = (props['Status'] || 'Draft').toLowerCase();
  const meta = {
    title,
    slug,
    series,
    story_number: props['Story Number'] ? Number(props['Story Number']) : null,
    status,
    historical_confidence:
      (props['Historical Confidence'] || '').toLowerCase() || null,
    source_type: props['Source Type'] || null,
    tags: props['Tags'] ? parseTags(props['Tags']) : [],
    source: 'notion-export',
    last_imported: new Date().toISOString().slice(0, 10),
  };
  // strip nulls/empties handled by toYamlFrontmatter
  return meta;
}

async function copyAssetFolderIfPresent({
  inputDir,
  inputBase,
  bookDir,
  slug,
  repoRoot,
}) {
  const folderName = stripNotionUuidFromName(inputBase.replace(/\.md$/i, ''));
  const candidateDirs = [
    inputBase.replace(/\.md$/i, ''), // exact match (with UUID)
    folderName, // without UUID
  ];
  for (const candidate of candidateDirs) {
    const candidatePath = path.join(inputDir, candidate);
    try {
      const stat = await fs.stat(candidatePath);
      if (stat.isDirectory()) {
        const target = path.join(
          repoRoot,
          'assets',
          'library',
          'books',
          bookDir,
          'assets',
          slug
        );
        await fs.mkdir(target, { recursive: true });
        await copyDir(candidatePath, target);
        return { copied: true, fromBaseName: candidate, target };
      }
    } catch {
      // not found, try next
    }
  }
  return { copied: false };
}

function resolveBookDir(series) {
  const map = {
    'al-nawadir-al-sultaniyya': '01_Al_Nawadir_al_Sultaniyya',
    'faith-sellers': '02_Chronicles_of_the_Faith_Sellers',
  };
  return map[series] || series;
}

async function copyDir(src, dest) {
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await fs.mkdir(d, { recursive: true });
      await copyDir(s, d);
    } else {
      await fs.copyFile(s, d);
    }
  }
}

function rewriteAssetLinks(md, { fromBaseName, bookDir, slug }) {
  if (!fromBaseName) return md;
  // Notion image links look like: ![alt](Episode%201%20.../image.png)
  // We rewrite the leading folder segment to our new stable path.
  const enc = encodeURIComponent(fromBaseName)
    .replace(/%20/g, ' ')
    .replace(/ /g, '%20');
  const re = new RegExp(
    '(\\!\\[[^\\]]*\\]\\()(' +
      enc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
      '\\/)([^)]+)(\\))',
    'g'
  );
  return md.replace(re, (_m, p1, _p2, file, p4) => {
    return `${p1}/assets/library/books/${bookDir}/assets/${slug}/${file}${p4}`;
  });
}

// --------------------------- main ------------------------------------------

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || args._.length === 0) {
    printHelp();
    process.exit(args.help ? 0 : 1);
  }

  const repoRoot = process.cwd();
  const inputPath = path.resolve(args._[0]);
  const series = args.series || 'faith-sellers';
  const bookDir = args.bookDir || resolveBookDir(series);
  const outDir = path.resolve(
    args.out || path.join('assets', 'library', 'books', bookDir, '01_Chapters')
  );

  const raw = await fs.readFile(inputPath, 'utf8');
  const inputDir = path.dirname(inputPath);
  const inputBase = path.basename(inputPath);

  // Strip BOM if present
  const noBom = raw.replace(/^\uFEFF/, '');

  // Find H1
  const h1Match = noBom.match(/^#\s+(.+?)\s*$/m);
  if (!h1Match) {
    console.error(
      'ERROR: could not find an H1 (# Title) line in the input file.'
    );
    process.exit(2);
  }
  const title = h1Match[1].trim();

  // Body after H1
  const afterH1 = noBom
    .slice(h1Match.index + h1Match[0].length)
    .replace(/^\r?\n/, '');
  const { props, rest } = splitTopBlock(afterH1);

  const storyNumber = props['Story Number']
    ? pad2(props['Story Number'])
    : null;
  // Strip series/episode prefixes so the slug captures the *subtitle* only.
  const titleForSlug = title
    .replace(/^The Chronicles of the Faith Sellers:?\s*/i, '')
    .replace(
      /^Episode\s+(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s*[:\-—]?\s*/i,
      ''
    )
    .replace(
      /\s+Part\s+\d+\s+from\s+The Chronicles of the Faith Sellers\s*$/i,
      ''
    )
    .trim();
  // If the title is just "Episode N" with no subtitle, fall back to the first H2.
  const firstH2 = (rest.match(/^##\s+(.+?)\s*$/m) || [])[1] || '';
  const slugBasis = titleForSlug || firstH2;
  const titleSlug = args.slug || slugify(slugBasis) || 'untitled';
  const bookNumber = bookNumberFromDir(bookDir);
  const strictName = storyNumber
    ? `${bookNumber}_${storyNumber}_${titleSlug.replace(/-/g, '_')}`
    : `${bookNumber}_${titleSlug.replace(/-/g, '_')}`;
  const fileSlug = storyNumber
    ? `episode-${storyNumber}-${titleSlug}`
    : titleSlug;
  const outPath = path.join(outDir, `${strictName}.md`);

  // Copy sibling asset folder (if any) and rewrite links
  const assetResult = await copyAssetFolderIfPresent({
    inputDir,
    inputBase,
    series,
    bookDir,
    slug: fileSlug,
    repoRoot,
  });

  let body = rest;
  body = convertAsides(body);
  body = rewriteAssetLinks(body, {
    fromBaseName: assetResult.fromBaseName,
    bookDir,
    slug: fileSlug,
  });
  body = collapseBlankLines(body);

  const meta = buildMeta(props, { title, slug: fileSlug, series });
  const frontmatter = toYamlFrontmatter(meta);
  const output = `${frontmatter}# ${title}\n\n${body}\n`;

  await fs.mkdir(outDir, { recursive: true });

  // safety: don't overwrite unless --force
  try {
    await fs.access(outPath);
    if (!args.force) {
      console.error(
        `ERROR: output file already exists: ${path.relative(repoRoot, outPath)}\n` +
          '       Re-run with --force to overwrite.'
      );
      process.exit(3);
    }
  } catch {
    // file doesn't exist, fine
  }

  await fs.writeFile(outPath, output, 'utf8');

  console.log('OK: imported Notion export');
  console.log('  input :', path.relative(repoRoot, inputPath) || inputPath);
  console.log('  output:', path.relative(repoRoot, outPath));
  if (assetResult.copied) {
    console.log('  assets:', path.relative(repoRoot, assetResult.target));
  }
}

main().catch(err => {
  console.error('FAILED:', err && err.stack ? err.stack : err);
  process.exit(1);
});
