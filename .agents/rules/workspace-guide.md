---
trigger: always_on
glob:
description: Workspace context and coding standards for the Al-Haq Initiative website
---

# Al-Haq Initiative — Workspace Guide

## Quick Reference

| Key | Value |
|---|---|
| Project | Al-Haq Initiative (مبادرة الحق) |
| Domain | alhaq-initiative.org |
| Firebase Project | alhaq-initiative |
| Hosting Target | initiative |
| Production Branch | master |
| Default Language | English (with ar, fa, ps, ur translations) |

## File Structure

```
├── .agents/              ← Agent rules and workspace guide (this file)
├── .github/workflows/    ← CI/CD (Firebase deploy, HF Space deploy)
├── assets/
│   ├── css/              ← Stylesheets
│   ├── js/               ← site.js (global), page-specific scripts
│   ├── images/           ← Static images and icons
│   ├── library/          ← Library book content and indexes
│   └── Translations/     ← i18n JSON files per page
├── hf-space-chatbot/     ← Gradio chatbot (deployed to HF Spaces)
├── legal/                ← Legal pages (privacy, terms, docs hub)
├── scripts/              ← Build scripts (indexers, importers)
├── tests/                ← Test scripts (integrity, smoke, translations)
├── firebase.json         ← Hosting config, redirects, security headers
├── .firebaserc           ← Firebase project and target mappings
└── *.html                ← Site pages (index, about, services, etc.)
```

## Coding Standards

### HTML Pages
- Every page must include `<header id="global-header"></header>` and load `assets/js/site.js`.
- Do NOT embed static navigation markup — `site.js` injects it at runtime.
- Use semantic HTML5 elements. One `<h1>` per page.
- All interactive elements must have unique, descriptive IDs.

### JavaScript
- Vanilla JS only — no frameworks.
- Global shared logic lives in `assets/js/site.js`.
- Page-specific logic lives in `assets/js/<pagename>.js`.
- Use `window._pageSetLanguage` for page-level i18n hooks.
- Avoid `eval()` and raw user input in `innerHTML` — sanitize when needed.

### CSS
- Tailwind CSS via CDN for utility classes.
- Custom styles in `assets/css/styles.css`.

### Firebase
- All changes to `firebase.json` must preserve the security headers block.
- CSP `frame-src` must only allow `https://alhaq-hf-alhaq-website-chatbot.hf.space`.
- Redirects in `firebase.json` handle legacy URL patterns (e.g., /deensheild → amnshield.com).

### Git
- Commit messages follow conventional commits: `feat:`, `fix:`, `chore:`, `security:`, `docs:`.
- Production branch is `master`. Create topic branches for large changes, merge back.
- Run `npm test` before pushing.

## Common Tasks

| Task | Command |
|---|---|
| Local dev server | `npm run dev` |
| Run all tests | `npm test` |
| Check page integrity | `npm run integrity` |
| Lint JS/HTML | `npm run lint` |
| Format code | `npm run format` |
| Build chatbot index | `npm run chatbot:index` |
| Build library index | `npm run content:index` |
| Deploy to Firebase | `npm run deploy` |
| Import library docs | `npm run library:import:docs -- --input "path" --series name` |
