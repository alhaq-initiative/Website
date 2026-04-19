# Alhaq Initiative Website

This is the official website for Alhaq Initiative.

## Features

- Modern, responsive design using Tailwind CSS
- Main pages: Home, About, Services, Library, Help & FAQ, Contact, Donate, Media, Quran, quranhub
- Consistent navigation bar across all pages
- "Explore Our Library" section at the bottom of main pages
- Language switcher (English, Arabic, Dari, Pashto)
- Donation and contact forms

## Development Workflow

- Single-branch workflow: `master` is the default and production branch.
- Create short-lived topic branches from `master` if needed, then merge back to `master`.
- The old `main` and `copilot/*` branches have been removed.

## How to Contribute

1. Fork the repository or create a new branch from `master`.
2. Make your changes and test locally.
3. Commit and push to your branch.
4. Open a pull request and merge into `master` for production.

## Local Development

1. Clone the repository:
   ```sh
   git clone https://github.com/HabibGHub/alhaq-website.git
   ```
2. Open the project folder in your code editor.
3. Use a local server (e.g., Live Server extension for VS Code) to preview changes.

## License

This project is licensed under the MIT License.

---

For questions or support, contact the Alhaq Initiative team.

## Unified Global Navigation (October 2025)

The site now uses a single source‑of‑truth navigation template injected at runtime by `assets/js/site.js`.

### How it works
* Each HTML page contains only a lightweight placeholder: `<header id="global-header"></header>` placed near the top of `<body>`.
* On `DOMContentLoaded`, `site.js` injects the HTML defined in the constant (e.g. `NAV_HTML`) and wires up:
   - Active link highlighting (based on normalized pathname)
   - Mobile menu toggle & accessibility attributes
   - Language switcher / RTL handling (global + per‑page hook `_pageSetLanguage`)
   - Theme toggle, canonical link injection, lazy images, footer email/contact triad injection
* Page scripts should NOT duplicate navigation or mobile menu logic anymore.

### Editing the navigation
1. Open `assets/js/site.js` and find the `NAV_HTML` (or similarly named) template string.
2. Modify or add `<a>` links inside the desktop and mobile sections in that one place.
3. Keep ARIA roles / `aria-label` attributes for accessibility.
4. Run `node tests/e2e-smoke.mjs` to confirm pages still load the global script & at least one stylesheet (all pages must include `site.js`).

### Adding a new page
1. Create `yourpage.html` with `<header id="global-header"></header>` and include at minimum:
    ```html
    <link rel="stylesheet" href="assets/css/styles.css">
    <script src="assets/js/site.js"></script>
    ```
2. If the page needs translations for non‑English languages, add JSON files under `assets/Translations/<pageKey>/{ar,fa,ps}.json` with at least a `title` key.
3. If special per‑page language adjustments are required (dynamic DOM), define `window._pageSetLanguage = (lang)=>{ ... }` in a page script; `site.js` will invoke it after core translation application.

### Rationale / Benefits
* Eliminates drift: previously each page had a slightly different nav markup / ordering / classes.
* Reduces duplicate JavaScript: mobile menu toggling logic is now centralized.
* Simplifies future changes: one edit updates every page instantly.
* Improves accessibility and testing consistency.

### Do NOT
* Reintroduce static full nav markup into individual pages.
* Add separate mobile menu handlers in page scripts.
* Override `window.setLanguage` directly (use `_pageSetLanguage`).

If the canonical domain changes, also update the `CANON_HOST` logic in `site.js` so the injected `<link rel="canonical">` remains correct.

## AlHaq Shield Suite Notes (September 2025 Cleanup)

The legacy "web app" surface for AlHaq Shield has been deprecated. The ecosystem now explicitly consists of:

- Browser Extension
- Mobile Apps (planned)
- Desktop Manager / Launcher (planned)
- Desktop App (planned)

Key cleanup actions applied:

1. Removed obsolete references to a generic "web app"; meta descriptions standardized to say "AlHaq Shield suite: Browser Extension, Mobile Apps, Desktop Manager & Desktop App".
2. Standardized official contact emails across all AlHaq Shield pages:
   - info@alhaq-initiative.org (general information)
   - contact@alhaq-initiative.org (general inquiries)
   - support@alhaq-initiative.org (technical/support)
3. Replaced all instances of the legacy domain `support@alhaqds.software`.
4. Injected the global `/assets/js/site.js` script into AlHaq Shield privacy/support/terms & product privacy pages for consistent:
   - Canonical link handling
   - Lazy image & theme behaviors
   - Future global footer/email injection
5. Added Contact + Donate quick links to AlHaq Shield footers for parity with the main site.
6. Added Info / Contact / Support triad sections (or localized variants) to all privacy/support pages.

If adding new AlHaq Shield product pages:

- Always include: `<script src="/assets/js/site.js" defer></script>` before other product scripts.
- Use suite-consistent meta description pattern.
- Provide localized contact blocks where translations exist; default to English content otherwise.

Testing:

- `npm test` for unit/i18n integrity.
- `node tests/local-integrity.mjs` ensures each HTML page includes the global script & at least one stylesheet.

Future follow-ups:

- Add automated smoke tests for AlHaq Shield localized pages (currently only core site pages covered).
- Introduce a shared partial/template system if duplication grows.
