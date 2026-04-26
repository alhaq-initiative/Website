# Copilot instructions for this repo

These notes help AI agents work productively in this codebase. Keep guidance concrete and project-specific.

## Big picture

- This is a static multi-page website served from the repo root. There is no bundler; pages are plain HTML with shared CSS and vanilla JS.
- The primary shared site shell lives under `assets/`. Most root pages load `assets/js/site.js` plus at least one stylesheet from `assets/css/`.
- The optional demo API lives in `api/server.js` and is not required for serving the site locally.
- The root PWA service worker is `sw.js`. It caches shared site assets and falls back to `offline.html` for failed navigations.
- Client-side i18n for the main site loads JSON from `assets/Translations/<pageKey>/<lang>.json` for non-English languages. English is authored directly in the HTML.

## Main areas

- Root pages: `index.html`, `about.html`, `services.html`, `products.html`, `library.html`, `help.html`, `contact.html`, `donate.html`, `quran.html`, `media.html`, and related pages in the repo root.
- Shared main-site assets:
  - JS: `assets/js/site.js` and page scripts like `assets/js/home.js`, `assets/js/quran.js`
  - CSS: `assets/css/*.css`
  - translations: `assets/Translations/**`
- Amn site: `amn-site/`
  - Canonical Amn landing page: `amn-site/index.html`
  - Canonical Amn service routes: `amn-site/download/index.html`, `amn-site/faq/index.html`, `amn-site/support/index.html`, `amn-site/docs/index.html`
  - Canonical Amn legal routes: `amn-site/legal/privacy/index.html`, `amn-site/legal/terms/index.html`
  - Amn assets are namespaced under `amn-site/assets/` and should be referenced with `/amn-site/assets/...`
- Legal hubs and long-form product legal docs live under `legal/`
  - `legal/docs.html`, `legal/privacy_hub.html`, `legal/terms_hub.html`, `legal/support_hub.html`
  - `legal/deenhub_docs/` for DeenHub legal pages
  - `legal/deenshield_docs/` and `legal/shield_docs/` both exist in the repo; treat `legal/deenshield_docs/` as the maintained structure and `legal/shield_docs/` as compatibility/legacy unless the current page links require otherwise.

## Current Amn conventions

- Keep Amn site pages contained inside `amn-site/`.
- Do not reintroduce `/shield/main.html` references.
- Do not create new root-level Amn compatibility pages unless the user explicitly asks for them.
- For Amn pages, prefer links like `/amn-site/...`.
- For Amn assets, prefer:
  - CSS: `/amn-site/assets/css/...`
  - images: `/amn-site/assets/images/...`
- The Amn site has its own service worker at `amn-site/sw.js`.
- If you add or remove Amn assets, update `amn-site/sw.js` cache entries so they match the actual files on disk.

## Shared JS conventions

- Every HTML page should include a global script reference to `assets/js/site.js` unless there is a very strong reason not to. Existing smoke checks expect it.
- Global behavior for root pages lives in `assets/js/site.js`: service worker registration, canonical link injection, theme toggle, language switcher, lazy images, nav active state, and mobile menu behavior.
- Main-site page-specific scripts live in `assets/js/<page>.js`.
- Do not overwrite `window.setLanguage` directly. The shared script virtualizes language switching.
- RTL languages (`ar`, `fa`, `ps`) should set `dir="rtl"` and update body/document state consistently.

## i18n notes

- Page keys are derived in `assets/js/site.js`.
- Example mappings: `services.html -> services`, `about.html -> about`, `quran.html -> quran`.
- Legacy spelling still matters for some translation folders: `deenshield*` routes/pages can map to `deensheild*` translation folders. Do not rename those translation directories unless you also update the mapping logic.
- When adding a new translated page, add `ar.json`, `fa.json`, and `ps.json` with at least a non-empty `title` key.

## Tests and workflows

- Local dev server: `npm run dev` on port 8080.
- Optional simple server: `npm run serve`.
- Jest tests: `npm test`.
- Smoke checks: `npm run smoke`
  - Verifies a curated set of important pages return HTML that includes `assets/js/site.js` and at least one stylesheet.
  - Keep the smoke page list aligned with current canonical routes, especially for `amn-site/`.
- Comprehensive checks: `npm run test:comprehensive`
  - Auto-discovers HTML files and validates structure, stylesheets, scripts, accessibility basics, and internal links.
  - If you change how directories are served, ensure the built-in test server still resolves directory URLs to `index.html`.
- Full test pass: `npm run test:all`

## Practical gotchas

- Root pages and Amn pages use different asset namespaces. Do not mix them accidentally.
- When fixing Amn styling issues, check for broken absolute paths first. `/assets/...` is usually wrong for Amn-specific CSS/images; `/amn-site/assets/...` is usually correct.
- When removing files from `amn-site/`, verify they are not still listed in `amn-site/sw.js`.
- The repo contains historical Amn/Shield artifacts. Before deleting anything, confirm the target is not referenced by smoke tests, legal hub pages, or service worker cache lists.
- Service workers cache aggressively. After PWA-related changes, bump `CACHE_NAME` and hard-refresh the browser.

## What to preserve

- Keep changes minimal and scoped to the area being updated.
- Preserve existing page structure and legal navigation unless the user asked for a structural cleanup.
- Prefer canonical Amn routes under `amn-site/` over legacy shield-era paths.

## Examples

- A correct Amn stylesheet reference looks like: `/amn-site/assets/css/amn-redesign.css?v=20260426`
- A correct Amn logo reference looks like: `/amn-site/assets/images/logo.png`
- A correct Amn home link looks like: `/amn-site/`
- A root-page global script reference looks like: `assets/js/site.js`

If any of this becomes stale, update this file together with the affected tests so repo guidance and automation stay aligned.
