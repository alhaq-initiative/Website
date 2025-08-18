const fs = require('fs');
const path = require('path');

describe('i18n integrity', () => {
  const base = path.resolve(__dirname, '..', 'assets', 'Translations');

  function isDir(p) {
    try { return fs.statSync(p).isDirectory(); } catch { return false; }
  }

  const folders = fs.readdirSync(base).filter((name) => isDir(path.join(base, name)));

  const REQUIRED = ['ar.json', 'fa.json', 'ps.json'];

  test.each(folders.map((f) => [f]))('folder %s has required locale files and minimal keys', (folder) => {
    const dir = path.join(base, folder);
    for (const file of REQUIRED) {
      const fp = path.join(dir, file);
      expect(fs.existsSync(fp)).toBe(true);
      const raw = fs.readFileSync(fp, 'utf8');
      let json;
      expect(() => { json = JSON.parse(raw); }).not.toThrow();
      expect(typeof json.title).toBe('string');
      expect(json.title.length).toBeGreaterThan(0);
    }
  });
});
