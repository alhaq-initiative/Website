#!/usr/bin/env node
/**
 * Translation verification tool (Node.js version)
 * Scans assets/Translations/[folders]/*.json for:
 * - Missing keys across languages in the same folder
 * - Empty translation values
 * - Untranslated English values in non-English translation files
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const baseDir = path.join(ROOT, 'assets', 'Translations');

function walkDir(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(filePath));
    } else {
      results.push(filePath);
    }
  });
  return results;
}

function run() {
  if (!fs.existsSync(baseDir)) {
    console.error("Base translation directory not found:", baseDir);
    process.exit(1);
  }

  const allFiles = walkDir(baseDir);
  const groups = {};

  allFiles.forEach(file => {
    if (!file.endsWith('.json')) return;
    const dir = path.dirname(file);
    if (!groups[dir]) groups[dir] = [];
    groups[dir].push(file);
  });

  let failures = 0;
  let warnings = 0;

  for (const [dir, files] of Object.entries(groups)) {
    const allKeys = new Set();
    const fileData = {};

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const data = JSON.parse(content);
        const relativeName = path.relative(baseDir, file);
        fileData[relativeName] = data;
        Object.keys(data).forEach(k => allKeys.add(k));
      } catch (e) {
        console.error(`FAIL: Error parsing JSON in ${path.relative(ROOT, file)}: ${e.message}`);
        failures++;
      }
    }

    // Check for missing keys
    for (const [relName, data] of Object.entries(fileData)) {
      const missing = [...allKeys].filter(k => !(k in data));
      if (missing.length > 0) {
        console.error(`FAIL: ${relName} is missing keys: ${JSON.stringify(missing)}`);
        failures++;
      }
    }

    // Check for empty values or untranslated values
    for (const [relName, data] of Object.entries(fileData)) {
      const isEnglishFile = relName.endsWith('en.json') || relName.includes('/en/') || relName.includes('\\en\\');
      for (const [k, v] of Object.entries(data)) {
        if (v === null || v === undefined || v === '') {
          console.error(`FAIL: ${relName} has empty value for key: "${k}"`);
          failures++;
        } else if (typeof v === 'string') {
          // Check if string is entirely English characters/punctuation but file is non-English
          if (!isEnglishFile) {
            const hasOnlyEnglish = /^[a-zA-Z\s\.,!\?#'"()-]+$/.test(v);
            // Some keys are brand names or untranslatable, we can relax this, but log it as warning
            if (hasOnlyEnglish && v.trim().length > 3) {
              console.log(`WARN: ${relName} has English value for key "${k}": "${v}"`);
              warnings++;
            }
          }
        }
      }
    }
  }

  console.log(`\n=== Translation Check Summary ===`);
  console.log(`Failures: ${failures}`);
  console.log(`Warnings: ${warnings}`);

  if (failures > 0) {
    console.error('Translation checks FAILED');
    process.exit(1);
  } else {
    console.log('Translation checks PASSED');
    process.exit(0);
  }
}

run();
