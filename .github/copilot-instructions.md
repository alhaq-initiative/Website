# Copilot instructions for this repo

These notes help AI agents work productively in this codebase. Keep guidance concrete and project-specific.

## Big picture

- Static multi-page site in root HTML files with shared assets under `assets/`. No bundler; vanilla JS and CSS.
- A tiny optional Express API for local/demo endpoints (`api/server.js`, port 3001). Not required to serve the site.
- PWA: `sw.js` caches core routes and serves `offline.html` on navigation failure. The service worker is registered in `assets/js/site.js`. Note: current hosting config redirects to the canonical domain; the SW mainly benefits local/offline preview.
- i18n is client-side and file-based. For non-English (ar/fa/ps), per-page JSON is loaded from `assets/Translations/<pageKey>/<lang>.json` by `assets/js/site.js`. English is the static DOM and does not use JSON.

## Key conventions and patterns

- Every HTML page must include the global script `assets/js/site.js` (Cypress and smoke checks require it) and at least one stylesheet link.
- Global behaviors live in `assets/js/site.js`: service worker registration, canonical `<link rel="canonical">` injection (CANON_HOST `https://alhaq-initiative.org`), global theme toggle, floating language switcher, lazy images, nav active-state, and mobile menu toggle.
- Page-specific scripts (when needed) live in `assets/js/<page>.js` (e.g., `home.js`, `quran.js`).
- i18n mapping uses a per-page "pageKey" derived in `site.js` (see `getPageKey()`):
	- Examples: `services.html → services`, `about.html → about`, `quran.html → quran`.
	- DeenShield legacy spelling: `deenshield*` pages map to `deensheild` (and `deenshield-extension → deensheild-extension`) to match existing translation folder names.
- Page-specific i18n hook: if a page defines `window._pageSetLanguage = (lang) => { ... }`, `site.js` calls it after core translations apply. Do not overwrite `window.setLanguage` directly—`site.js` virtualizes it.
- RTL handling: switching to ar/fa/ps sets `<html dir="rtl" lang="…">` and toggles `body.rtl`.
- Logic App forms: any `form[action*='workflows/2a3b358e4c614e2aaeb81efadcf9fa42']` is intercepted and submitted as JSON `{Name, Email, Message, Source}` with a `website` honeypot field.

## File layout highlights

- Global JS: `assets/js/site.js` (core), plus optional page scripts like `assets/js/home.js`, `assets/js/quran.js`.
- Translations: `assets/Translations/<pageKey>/{ar,fa,ps}.json`. A Jest test (`tests/i18n-integrity.test.js`) enforces presence and minimal keys (must include `title`).
- Quran reader: `assets/js/quran.js` consumes `assets/Quran_Data/Metadata.js` and `Quran.txt`, and streams audio from EveryAyah. It expects specific element IDs in `quran.html` (e.g., `surah-dropdown`, `quran-unified-list`, `translation-dropdown`).
- DeenShield pages live under `/deenshield/` with their own assets and localized policy folders.
- **Legal documents**: Organized under `/legal/` with two main subdirectories:
  - `/legal/deenshield_docs/` - All DeenShield product legal documents (privacy policies, terms, support)
    - `privacy-policies/` - Privacy policies for all DeenShield products (mobile, desktop, extension, manager) with multilingual versions (ar, fa, ps, en)
    - `terms/` - Terms of service documents for all products with multilingual versions
    - `support/` - Support documentation with multilingual versions
  - `/legal/deenhub_docs/` - DeenHub product legal documents (privacy policy, terms)
  - Legacy hub files in `/legal/` root: `privacy_hub.html`, `terms_hub.html`, `support_hub.html`, `docs.html` (central navigation pages)

## Developer workflows

- Serve the site locally (required for Cypress and PWA): use `npm run dev` (live-server on port 8080) or `npm run serve` (Python http.server on 8080). Cypress assumes `http://localhost:8080` (`cypress.config.js`).
- Unit tests (Jest + jsdom): `npm test`. Setup is in `tests/setup.js`; coverage excludes DeenShield web-app paths.
- Lightweight smoke check (Node HTTP pinger): `npm run smoke`. It verifies HTML pages reference `assets/js/site.js` and at least one stylesheet. Tests 30 key pages.
- **Comprehensive tests (auto-discovery)**: `npm run test:comprehensive`. Automatically discovers all HTML files and tests:
  - Required global scripts and stylesheets
  - HTML structure and meta tags
  - Accessibility basics (alt tags, semantic HTML, heading hierarchy)
  - Performance hints (inline styles, script defer/async)
  - i18n support (lang attributes, RTL)
  - Internal link validation (checks all links are not broken)
  - Runs on all ~52 HTML pages automatically
  - Use `npm run test:comprehensive:verbose` for detailed info output
  - Use `npm run test:all` to run Jest, smoke, and comprehensive tests in sequence
- Cypress smoke tests: run via `npx cypress run --browser chrome --headless` or the workspace task "Run Cypress smoke tests". Ensure the local server is running first.
- Optional API server for placeholders/demos: `npm run api` (or `npm run api:dev` for nodemon).

## Deployment

- Firebase Hosting: serves static files from the repo root. `sw.js` is sent with `no-store` and assets under `/assets/**` with long-lived caching headers. If you need domain-level redirects to the canonical host, implement them at DNS/edge (not via a blanket Firebase redirect to avoid loops).
- IIS on Azure VM (for subdomains): see `deploy/iis/README.md` for folder layout and bindings. Copy root site to `C:\inetpub\main`; DeenShield variants go to their respective folders.

## Gotchas and tips

- Adding a new page with translations: create the page HTML, ensure it includes `assets/js/site.js`, add `assets/Translations/<pageKey>/{ar,fa,ps}.json` with at least `{"title": "..."}`, and update `getPageKey()` in `assets/js/site.js` if your filename isn't auto-detected.
- English is the default content; switching from a non-English language back to English triggers a one-time reload to restore static DOM content.
- Service worker will cache aggressively; when editing PWA-related files locally, hard-reload or unregister the SW, or bump `CACHE_NAME` in `sw.js` to invalidate.
- DeenShield translation folders intentionally use the legacy `deensheild` spelling—don't rename without updating the mapping and existing files.
- If the canonical domain changes, update the CANON_HOST logic in `assets/js/site.js` so the injected `<link rel="canonical">` stays correct.
- **Legal document navigation paths** (as of October 2025 restructuring):
  - DeenShield privacy policies: `/legal/deenshield_docs/privacy-policies/{product}/index.html` (where product = mobile, desktop, extension, manager)
  - DeenShield terms: `/legal/deenshield_docs/terms/{lang}/index.html` (where lang = en, ar, fa, ps)
  - DeenShield support: `/legal/deenshield_docs/support/{lang}/index.html`
  - Main privacy hub (all products): `/legal/deenshield_docs/privacy-policies/en/main-privacy.html`
  - When updating legal documents, verify all internal navigation links use these canonical paths.
  - Each product-specific privacy policy should include a comprehensive table of contents with anchor links to all major sections.

## Examples (from this repo)

- `assets/js/site.js` injects the global stylesheet last to preserve theme overrides and installs the floating language switcher that the Cypress test uses.
- `tests/i18n-integrity.test.js` enforces that each page folder under `assets/Translations/` has `ar.json`, `fa.json`, and `ps.json`, each with a non-empty `title`.
- `tests/e2e-smoke.mjs` fetches `/, /about.html, /services.html, /library.html, …` and asserts a `<script src="assets/js/site.js">` tag exists.
- Legal document structure example: `/legal/deenshield_docs/privacy-policies/mobile/index.html` includes:
  - Blue-bordered table of contents linking to all sections via anchor IDs
  - Green-highlighted User Data Protection Policy section with visual prominence
  - Navigation header linking to terms, support, and main privacy hub using canonical paths
  - Last updated date in format: `YYYY-MM-DD` (e.g., 2025-10-30)

If anything above is unclear or incomplete (e.g., missing pageKey mappings or new pages not covered), tell me which page or area you’re updating and I’ll refine these rules.

