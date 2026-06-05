# Copilot instructions for this repo

These notes help AI agents work productively in this codebase. Keep guidance concrete and project-specific.

## Initiative strategy (canonical mission context)

The website represents the **Al-Haq Initiative (مبادرة الحق)** — a digital and literary movement for "Seeking the Truth" (البحث عن الحق). It operates at the intersection of historical preservation and modern digital wellbeing. Two mission pillars frame all content decisions:

1. **Truth in history** — validate historical narratives through primary-source research.
2. **Protection in the present** — tools that protect the mental and spiritual health of the community.

A third public-facing pillar — **Resilience (Community)** — is used in marketing copy alongside Truth and Protection.

Public hero line to prefer when copy is needed: _"Seeking Truth in History, Protecting Health in the Present."_

### Business & governance: Al-Haq Studio (UK sole trader)

- **Founder identity.** The sole owner of both Al-Haq Studio and the Al-Haq Initiative is **Afrasyaab Meranai** (legal name; _Afrasyaab_ is the legal first name, _Meranai_ is the legal surname). He is also known casually as **Habibur Rahman**. He is the founder, developer, and writer for all output across the site.
  - **Software, products, and services** are built and delivered under **Al-Haq Studio** (his sole-trader business).
  - **Academic and literary works** (historical research, translations, booklets like _Faith Sellers_, _Lessons from Islamic Civilization_, _The Caretaker's Guide_) are authored **personally by the founder**, not as a corporate output.
  - When attribution copy is needed, prefer "by Afrasyaab Meranai (Habibur Rahman)" for academic/literary work, and "delivered by Al-Haq Studio" for software/products/services.
- **Al-Haq Studio** is the only legal/financial entity. It is a **UK sole trader** owned by the founder. It is **not** a charity, **not** a non-profit, and **not** a registered company/organization. The full name behind the acronym is **Al-Haq Digital Services & Solutions** ("ADS"). Both forms are acceptable in copy; the short form **Al-Haq Studio** is preferred for headings and CTAs, and the expanded form **Al-Haq Digital Services & Solutions** should appear at least once on any page that introduces the business (typically in parentheses on first mention, or in an attribution line).
- **Attribution rule for apps, software, and digital services (hard rule).** Every page that promotes an app, software product, or digital service must include a visible attribution line such as: _"Developed by Al-Haq Studio (UK sole trader)."_ This applies to AmnShield, DeenHub, quranhub, Quran Hub, the Library/Media Hub web apps, and any future digital service. Academic/literary works keep their personal attribution to the founder (Afrasyaab Meranai / Habibur Rahman) instead.
- **DeenHub.** Islamic productivity mobile app (prayer times, Qibla, adhkaar, productivity tools) **plus the Quran Hub feature** (AI Quran recitation feedback and memorization practice). Currently in beta as an Android mobile app, with a companion **web app** planned. The previously-separate "quranhub" mobile-app project has been **merged into DeenHub** as the Quran Hub feature — do **not** describe `quranhub` as a standalone mobile app/project anywhere. **The Quran Hub feature is powered by the in-house AI engine "TaleemAI".** Naming rule: the _mobile app_ is always called **DeenHub**; the _feature inside DeenHub_ is **Quran Hub**; the _AI engine that powers Quran Hub_ is **TaleemAI**. Do not present TaleemAI as a separate product or app — it is the engine/technology brand. Public surfaces: `deenhub.html` (landing), `deenhub_join_beta.html` (beta signup), `quranhub.html` (now positioned as the Quran Hub feature deep-dive inside DeenHub), and entries on `products.html` (Available Products, beta) and `services.html` (Ongoing Projects, mobile app/beta). DeenHub must also be cross-linked from `quranhub.html` as the parent product. **Disambiguation:** `quran.html` is the website's standalone Quran reader web app (also branded "Quran Hub" on cards/nav) and is a separate static web app on this site — it is **not** the same thing as the DeenHub Quran Hub feature. Do not merge or rename `quran.html`.
- The **Al-Haq Initiative** is **not a separate legal entity**. It is the public-facing brand for the founder's personal effort plus a set of free/community-oriented projects hosted under Al-Haq Studio. Do **not** describe Al-Haq Initiative as a charity, non-profit, organization, NGO, or registered body anywhere on the site.
- All revenue — premium app plans, professional service fees, donations, and sponsorships (including GitHub Sponsors) — is **personal sole-trader income** of the founder under UK law. Do **not** frame donations as "going to the charity/organization," "funding the community," or "held in trust." Acceptable framing: donations and sponsorships support the founder's ongoing work on Al-Haq Initiative projects; the founder personally commits, as a Muslim, to spend donation income on the projects.
- AmnShield is offered with a **freemium** model: a free tier plus optional premium plans. Premium revenue is ordinary business income that the founder reinvests into the initiative's projects. Do **not** use the phrase "Charitable Premium" or any wording that implies registered-charity status.
- Future plan (do **not** describe as current state): the founder may later convert Al-Haq Initiative into a registered **organization** (still **not** a charity). Until that legal change actually happens, all copy must describe it as a personal initiative under Al-Haq Studio.
- Ethical rule (hard constraint): as a Muslim-led sole-trader business, content and features must avoid promoting immorality, abusive habits, or unethical behaviors. Do not generate, suggest, or scaffold features that contradict this — including in placeholder copy.

### Library taxonomy (used by `library.html` and related pages)

The Library is the central hub for all intellectual and creative output, split into two top-level categories:

- **A. Book Library (literary works)** — written projects, research papers, booklets. Anchor projects:
  - _Faith Sellers_ (بائعي القدر) — long-term translation and cross-referencing of Saladin's history against contemporary chroniclers (Ibn Shaddad, Ibn al-Athir).
  - _Lessons from Islamic Civilization_ — booklets on academic and moral contributions of the past.
  - _The Caretaker's Guide_ — survival guide / historical perspective for young people (14+) in high-tension environments.
- **B. Media Library (audio & video)** — multimedia output. Sub-streams:
  - Historical Media — video/audio series (Acapella / vocal-only) narrating verified stories. **No instrumental music.**
  - Documentary Snippets — visual breakdowns of primary-source manuscripts.
  - Educational Series — multimedia companions to the civilization booklets.

When adding Library UI, prefer a switchable view between "Bookshelf" (written) and "Media Center" (audio/video), and keep a Research Blog slot for cross-referencing updates. Do not rename existing `library.html` sections (`#quran`, `#hadith`, `#books`, `#media`, `#articles`, `#infographics`) without also updating in-page anchors.

### Projects & services portfolio

- **AmnShield** — digital protection app for habit management and spiritual wellbeing; offered as freemium (free tier + optional premium plans) under Al-Haq Studio. Canonical surface lives under `amn-site/` (see Amn conventions below).
- **Digital Solutions** — specialized web development, security, and infrastructure services delivered through Al-Haq Studio. Surfaced via `products.html` (Products & Services) alongside available products.

### Page roles for portfolio vs available

- `products.html` is the canonical **"Products & Services"** page. It lists everything **available today** — products (AmnShield, Quran Hub, Library, Media Hub) and professional services (Al-Haq Studio Digital Solutions). Title and H1 must use "Products & Services". Keep legacy anchors `#shield`, `#extension`, `#amnshield` for backwards compatibility; add `#available-products` and `#available-services` for the two sub-sections.
- `services.html` is the canonical **"Projects"** portfolio page. It lists work that is **not yet released** — academic Book Library projects (Faith Sellers, Lessons from Islamic Civilization, The Caretaker's Guide), ongoing software (quranhub preview, DeenHub beta), Documentary Snippets, plus a "Future Missions" section. Title and H1 must use "Projects" (or "Project Portfolio"). The file path stays `services.html` so existing inbound links and smoke tests keep working.
- The home page (`index.html`) previews this split: a Projects Portfolio preview section links to `services.html`, and a Products & Services preview section links to `products.html`.
- Global nav labels in `assets/js/site.js` (and the `amn-site/` mirror) are: **"Projects"** for `services.html` and **"Products & Services"** for `products.html`. Do not rename the hrefs.
- Do **not** create a new `projects.html` file. The Projects portfolio lives in `services.html` by design.

### Support & sponsorship surfaces

- GitHub Sponsors is the preferred sponsorship channel for backing the founder (developer/historian) under the open-source community model. When adding donate/sponsor CTAs, include GitHub Sponsors alongside the existing `donate.html` flow rather than replacing it.
- Donate / sponsor copy must be honest about the legal structure: it goes to the founder as a UK sole trader (Al-Haq Studio), and the founder commits to spend it on Al-Haq Initiative projects. Never write "tax-deductible," "registered charity," "non-profit," "501(c)", "CIC," or similar regulated-status language.

### Content generation prompt (use for any AI-written copy in this repo)

> "Using the context of the Al-Haq Initiative and the mission of Al-Haq Studio, generate a [Content Type] that focuses on [Topic]. Maintain academic rigor, prioritize primary sources, and ensure the tone reflects the values of Al-Haq (The Truth) without any reference to immoral or abusive behaviors."

Apply this prompt template when generating placeholder content, blog posts, hero copy, translations, or any new narrative text.

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
- **Do not invent new top-level pages** to express the strategy above. Express it by editing existing pages:
  - Mission / pillars / hero copy → `index.html`, `about.html`.
  - Library taxonomy (Books vs Media, anchor projects like _Faith Sellers_, _Lessons from Islamic Civilization_, _The Caretaker's Guide_) → `library.html` and `media.html`.
  - Projects & services portfolio (AmnShield + Al-Haq Studio Digital Solutions) → `products.html` is "Products & Services" (available today), and `services.html` is the "Projects" portfolio (ongoing + future missions). Do **not** create `projects.html`.
  - Support & sponsorship (GitHub Sponsors + sole-trader donate framing, AmnShield freemium) → `donate.html` and `support_hub.html`.
  - Strategy / governance references → `legal/docs.html` and the existing hub pages, not a new strategy page.
- Treat **Al-Haq Studio** and **Al-Haq Initiative** as distinct brands sharing one site: Al-Haq Studio = business/legal entity; Al-Haq Initiative = public-facing mission. Do not merge their identities in copy.
- Treat **AmnShield** as the protection-app product brand. Do not reintroduce older "Shield" or "DeenShield" naming in new copy; legacy translation folders (`deensheild*`) remain only for path-compatibility reasons.

## Examples

- A correct Amn stylesheet reference looks like: `/amn-site/assets/css/amn-redesign.css?v=20260426`
- A correct Amn logo reference looks like: `/amn-site/assets/images/logo.png`
- A correct Amn home link looks like: `/amn-site/`
- A root-page global script reference looks like: `assets/js/site.js`

If any of this becomes stale, update this file together with the affected tests so repo guidance and automation stay aligned.
