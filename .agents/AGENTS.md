# Al-Haq Initiative — Workspace Rules

## Project Identity

- **Name:** Al-Haq Initiative (مبادرة الحق)
- **Type:** Static multi-page website with Islamic digital tools
- **Domain:** alhaq-initiative.org
- **Firebase Project:** alhaq-initiative
- **Hosting Target:** initiative (site ID: alhaq-initiative)
- **Branch:** `master` is the production branch
- **License:** MIT — Copyright (c) 2026 Al-Haq Studio & Habib Mukhlis

## Branding — Hard Rules

- The Islamic productivity app is called **Al-Haq Hub**, NOT "DeenHub".
- The protection app is called **AmniShield**, NOT "DeenShield", "DeenSheild", or "AmniSheild".
- The studio entity is **Al-Haq Studio** (Al-Haq Digital Services & Solutions — UK sole trader).
- Al-Haq Initiative is **NOT** a charity, non-profit, NGO, CIC, or 501(c). It is a personal initiative.
- Software / products / services attribution: "Developed by Al-Haq Studio" (Lead Architect: Habib Mukhlis).
- Academic / literary work attribution: "by Habibur Rahman Mukhlis (Habib Mukhlis)."
- The Hugging Face Space is at `Alhaq-HF/alhaq-website-chatbot` (NOT `Habib-HF`).
- The chatbot iframe URL is `https://alhaq-hf-alhaq-website-chatbot.hf.space`.

## Repository Ecosystem

This workspace is the **primary repository** for the Al-Haq Initiative. Related repositories:

| Repo | Path | Firebase Target | Site ID | Branch |
| --- | --- | --- | --- | --- |
| Initiative (this) | `d:\PROJECTS\Initiative-site` | `hosting:initiative` | `alhaq-initiative` | `master` |
| Studio / Main Site | `d:\PROJECTS\Studio-site` | `hosting:main` | `alhaq-site` | `main` |
| AmnShield Site | `d:\PROJECTS\Amnshield-site` | `hosting:amnshield` | `amnshield` | `main` |
| Portfolio | `d:\habibmukhlis.io` | GitHub Pages | — | `main` |
| Org Profile | `d:\PROJECTS\org.github` | — | — | `main` |

## Tech Stack

- **Frontend:** Static HTML, vanilla CSS, vanilla JavaScript
- **Styling:** Tailwind CSS (via CDN)
- **Hosting:** Firebase Hosting (multi-site under one project)
- **CI/CD:** GitHub Actions (Firebase deploy on push to production branch)
- **Chatbot:** Gradio on Hugging Face Spaces, embedded via iframe
- **Linting:** ESLint + Prettier + Husky pre-commit hooks
- **Testing:** Custom Node.js test scripts (`npm test`)
- **Package Manager:** npm

## Architecture

### Global Navigation

All pages share a single-source-of-truth navigation injected at runtime by `assets/js/site.js`. Individual pages must **NOT** contain static nav markup. They only need:

```html
<header id="global-header"></header>
<script src="assets/js/site.js"></script>
```

### Translation System

- Translation JSON files live in `assets/Translations/<pageKey>/{ar,fa,ps}.json`.
- `site.js` handles language detection (URL path → query param → browser pref).
- Pages that need per-page language adjustments define `window._pageSetLanguage = (lang) => { ... }`.

### Content Pipeline

- `npm run chatbot:index` → builds `hf-space-chatbot/site_index.json` for the RAG chatbot.
- `npm run content:index` → builds `assets/library/content-index.json` for the library viewer.
- `npm run library:import:docs` → converts source files (PDF, Word, etc.) into chapter Markdown.

### Firebase Configuration

- `firebase.json` contains hosting config, redirects, security headers, and CSP.
- `.firebaserc` maps deploy targets to Firebase site IDs.
- Deployment: `npm run deploy` or automatic via GitHub Actions on push to `master`.

## Security Standards

All Firebase Hosting sites must include these HTTP headers in `firebase.json`:

- **Strict-Transport-Security:** `max-age=31536000; includeSubDomains; preload`
- **X-Content-Type-Options:** `nosniff`
- **X-Frame-Options:** `SAMEORIGIN`
- **Referrer-Policy:** `strict-origin-when-cross-origin`
- **Content-Security-Policy:** Must whitelist only `alhaq-hf-alhaq-website-chatbot.hf.space` for `frame-src`.

## Testing

Before committing, run:

```sh
npm test                    # Comprehensive tests (link integrity, indexing)
npm run integrity           # Ensures all pages include site.js + stylesheet
node tests/e2e-smoke.mjs    # Smoke test all pages
npm run test:translations   # Validate translation JSON files
```

## Do NOT

- Use "DeenHub" anywhere — it is trademarked. Always use "Al-Haq Hub".
- Add static nav markup to individual pages (use the `site.js` injection).
- Add separate mobile menu handlers in page scripts.
- Override `window.setLanguage` directly (use `_pageSetLanguage`).
- Describe donations as tax-deductible or charitable.
- Claim Al-Haq Initiative is a registered organization.
- Use `habib-hf` or `Habib-HF` for HF Space references.
