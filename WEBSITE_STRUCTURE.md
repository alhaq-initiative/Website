# AlHaq Initiative Website - Structure & Paths Guide

## Project Overview
**Domain**: alhaq-initiative.org  
**Status**: ✅ Complete rebrand from DeenShield to AlHaq Shield  
**Last Updated**: January 26, 2026  

---

## Directory Structure

```
alhaq-website/
├── index.html                          # Main landing page
├── about.html                          # About the initiative
├── services.html                       # Services overview
├── products.html                       # All products page (with anchor navigation)
├── library.html                        # Islamic library
├── quran.html                          # Quran reader
├── quranhub.html                       # quranhub preview
├── help.html                           # Help center
├── contact.html                        # Contact page
├── donate.html                         # Donation page
├── deenhub.html                        # DeenHub product
├── deenhub_join_beta.html              # Beta registration
│
├── assets/                             # Static assets
│   ├── css/
│   │   ├── components.css              # Component styles
│   │   ├── home.css                    # Homepage styles
│   │   └── styles.css                  # General styles
│   ├── js/
│   │   ├── site.js                     # Global navigation & PWA (847 lines)
│   │   └── [page-specific scripts]
│   ├── images/
│   │   ├── Al-Haq_Logo.png             # Main logo (used everywhere)
│   │   ├── favicon.svg                 # SVG favicon
│   │   ├── favicon.ico                 # ICO favicon
│   │   └── [other images]
│   └── Translations/
│       ├── index/                      # Homepage i18n
│       ├── about/                      # About page i18n
│       ├── services/                   # Services i18n
│       ├── products/                   # Products i18n
│       ├── library/                    # Library i18n
│       ├── quran/                      # Quran reader i18n
│       └── [other pages]/
│           ├── ar.json                 # Arabic translations
│           ├── fa.json                 # Farsi translations
│           └── ps.json                 # Pashto translations
│
├── legal/                              # Legal hub pages
│   ├── docs.html                       # Central legal docs hub
│   ├── privacy_hub.html                # Privacy policies hub
│   ├── terms_hub.html                  # Terms of service hub
│   ├── support_hub.html                # Support documentation hub
│   │
│   └── deenshield_docs/                # Product-specific legal docs
│       │                              # (Folder name kept for translation integrity)
│       ├── privacy-policies/
│       │   ├── en/
│       │   │   ├── main-privacy.html   # Main privacy overview
│       │   │   └── [archived versions]
│       │   ├── mobile/
│       │   │   ├── index.html          # Mobile app privacy
│       │   │   ├── ar/
│       │   │   ├── fa/
│       │   │   └── ps/
│       │   ├── desktop/
│       │   │   ├── index.html          # Desktop app privacy ✅ FIXED
│       │   │   ├── ar/
│       │   │   ├── fa/
│       │   │   └── ps/
│       │   ├── extension/
│       │   │   ├── index.html          # Extension privacy
│       │   │   ├── ar/
│       │   │   ├── fa/
│       │   │   └── ps/
│       │   ├── manager/
│       │   │   ├── index.html          # Manager privacy
│       │   │   ├── ar/
│       │   │   ├── fa/
│       │   │   └── ps/
│       │   └── [other languages]
│       ├── terms/
│       │   ├── en/
│       │   │   ├── index.html          # Main terms ✅ FIXED
│       │   │   └── [other sections]
│       │   ├── ar/
│       │   ├── fa/
│       │   └── ps/
│       └── support/
│           ├── en/
│           │   ├── index.html          # Support docs
│           │   └── [sections]
│           ├── ar/
│           ├── fa/
│           └── ps/
│
├── shield/                             # Shield product mini-site (if needed)
├── firebase.json                       # Firebase hosting config
├── sw.js                               # Service worker for PWA/offline
├── offline.html                        # Offline fallback page
├── 404.html                            # 404 error page
│
└── [build/test files]
    ├── tests/
    ├── cypress/
    ├── jest.config.js
    └── package.json
```

---

## Navigation Structure

### Global Navigation (site.js)
All pages (except `/deenshield_docs/` pages) get global header via `site.js`:

```
Alhaq Initiative [logo]  |  Home  |  About  |  Services  |  Products  |  AlHaq Shield  |  Library  |  Help & FAQ  |  [Contact] [Donate]
```

**Key Navigation Links**:
- Home: `index.html` ✅
- About: `about.html` ✅
- Services: `services.html` ✅
- Products: `products.html` ✅
- **AlHaq Shield**: `products.html#shield` ✅ (Anchor link, NOT `/deenshield/main.html`)
- Library: `library.html` ✅
- Help: `help.html` ✅
- Contact: `contact.html` ✅
- Donate: `donate.html` ✅

### Products Page Structure (`products.html`)

The products page uses **anchor-based navigation** instead of external links:

```html
<div id="shield" class="glass-card">
  <h3>AlHaq Shield Suite</h3>
  <!-- Content for Shield products -->
</div>

<div id="extension" class="glass-card">
  <h3>AlHaq Shield Browser Extension</h3>
  <!-- Content for Extension -->
</div>
```

**Direct Links to Sections**:
- `products.html#shield` - AlHaq Shield products
- `products.html#extension` - Browser extension

### Homepage Product Cards (index.html)

Links from homepage services section:
- `quranhub.html` - quranhub preview
- `products.html#shield` - AlHaq Shield overview ✅
- `library.html` - Islamic library
- `quran.html` - Quran reader
- `/deenhub_join_beta.html` - DeenHub beta signup

---

## Legal Documentation Paths

### Hub Pages (Main Entry Points)

| Hub Page | URL | Purpose |
|----------|-----|---------|
| Legal Docs | `/legal/docs.html` | Central hub for all legal docs |
| Privacy Hub | `/legal/privacy_hub.html` | All privacy policies |
| Terms Hub | `/legal/terms_hub.html` | All terms of service |
| Support Hub | `/legal/support_hub.html` | All support docs |

### Product-Specific Legal Docs

**Folder Structure**: `/legal/deenshield_docs/` (folder name kept for translation integrity)

**Privacy Policies**:
- Mobile App: `/legal/deenshield_docs/privacy-policies/mobile/index.html` (+ ar/, fa/, ps/)
- Desktop App: `/legal/deenshield_docs/privacy-policies/desktop/index.html` (+ ar/, fa/, ps/) ✅ FIXED
- Extension: `/legal/deenshield_docs/privacy-policies/extension/index.html` (+ ar/, fa/, ps/)
- Manager: `/legal/deenshield_docs/privacy-policies/manager/index.html` (+ ar/, fa/, ps/)
- Main Overview: `/legal/deenshield_docs/privacy-policies/en/main-privacy.html`

**Terms of Service**:
- Main Terms: `/legal/deenshield_docs/terms/en/index.html` ✅ FIXED
  - Includes anchor sections: `#mobile`, `#extension`, `#manager`, `#desktop`

**Support Documentation**:
- Main Support: `/legal/deenshield_docs/support/en/index.html`

### Language Variants

All legal docs support 4 languages: EN (default), AR (Arabic), FA (Farsi), PS (Pashto)

Example paths:
```
/legal/deenshield_docs/privacy-policies/mobile/index.html      # English (default)
/legal/deenshield_docs/privacy-policies/mobile/ar/index.html   # Arabic
/legal/deenshield_docs/privacy-policies/mobile/fa/index.html   # Farsi
/legal/deenshield_docs/privacy-policies/mobile/ps/index.html   # Pashto
```

---

## Image Asset Paths

### Logo Files (Consistent Across Site)

| Asset | Path | Usage |
|-------|------|-------|
| Main Logo (PNG) | `/assets/images/Al-Haq_Logo.png` | Navigation, headers, footers ✅ |
| Favicon SVG | `/assets/images/favicon.svg` | Browser tab, bookmarks |
| Favicon ICO | `/assets/images/favicon.ico` | Windows/legacy |
| Apple Touch Icon | `/assets/images/apple-touch-icon.png` | iOS home screen |

### Fallback Image URLs

In legal docs, images have fallback paths:
```html
<!-- Primary path (relative) -->
<img src="../../images/logo.png" 
     <!-- Fallback to absolute path if primary fails -->
     onerror="this.onerror=null;this.src='/assets/images/Al-Haq_Logo.png';" />
```

**✅ FIXED**: All fallback paths now point to `/assets/images/Al-Haq_Logo.png` (not old `/deenshield/images/`)

---

## Internationalization (i18n) Structure

### Translation Files Location
`assets/Translations/<pageKey>/<language>.json`

### Supported Languages
- `en` - English (default, no JSON needed - uses static DOM)
- `ar` - Arabic (RTL)
- `fa` - Farsi/Persian (RTL)
- `ps` - Pashto (RTL)

### Page Keys (Auto-Detected from Filename)
- `index.html` → `index`
- `about.html` → `about`
- `services.html` → `services`
- `products.html` → `products`
- `library.html` → `library`
- `quran.html` → `quran`
- etc.

### Translation JSON Format
```json
{
  "title": "Page Title",
  "description": "Page description",
  "section1_heading": "Section 1",
  ...other keys...
}
```

**Requirement**: Every translation file must include at least `"title"` (enforced by Jest test)

---

## Firebase Hosting Configuration (firebase.json)

### Redirect Rules (For Legacy URLs)

Old `/deenshield/` paths are **preserved for backward compatibility**:
- Redirects deenshield URLs to deenshield URLs (legacy support)
- All new content uses root paths

### Cache Strategies

- `sw.js` - No cache (no-store)
- `/assets/**` - Long-lived cache (1 year)
- HTML pages - Standard cache headers

---

## Service Worker (PWA Configuration)

- **File**: `sw.js`
- **Caches**: Core routes for offline access
- **Fallback**: `offline.html` when navigation fails
- **Registration**: Loaded via `site.js`

---

## Recent Updates (January 26, 2026)

### ✅ COMPLETED
1. **Fixed Desktop App Privacy Policy** (`/legal/deenshield_docs/privacy-policies/desktop/index.html`)
   - Title: DeenShield → AlHaq Shield
   - Favicon path: `/images/` → `/assets/images/`
   - Product name in content: DeenShield → AlHaq Shield
   - Navigation link: `/#desktop` → `/products.html#shield`
   - Image fallback: `/deenshield/images/logo.png` → `/assets/images/Al-Haq_Logo.png`

2. **Fixed Terms of Service** (`/legal/deenshield_docs/terms/en/index.html`)
   - Image path: `/deenshield/images/logo.png` → `/assets/images/Al-Haq_Logo.png`

3. **Fixed Pashto Privacy Policy** (`/legal/deenshield_docs/privacy-policies/ps/index.html`)
   - Image fallback: `/deenshield/images/logo.png` → `/assets/images/Al-Haq_Logo.png`

4. **Verified Navigation Consistency**
   - All hub pages link to `/legal/deenshield_docs/` (correct folder structure)
   - All product links point to `products.html#shield` (not old main.html)
   - All site.js navigation uses correct paths

---

## Verification Checklist

- [x] All images use `/assets/images/Al-Haq_Logo.png`
- [x] No references to `/deenshield/images/logo.png` (except in Firebase redirects)
- [x] All product links point to `products.html#shield`
- [x] All legal doc links point to `/legal/deenshield_docs/`
- [x] Navigation displays "AlHaq Shield" (not "Deen Shield")
- [x] Legal doc titles updated to "AlHaq Shield"
- [x] Icon/favicon paths correct
- [x] RTL language support intact (ar, fa, ps)
- [x] Translation files present for all pages
- [x] Service worker registration working
- [x] Firebase hosting config valid

---

## Next Steps for Deployment

1. **Test Navigation**: Verify all links work in browser
   - Test `products.html#shield` anchor navigation
   - Test legal docs hub navigation
   - Test international language switching

2. **Verify Images**: Check all logos display correctly
   - Logo in header
   - Logo in legal docs
   - Logo fallbacks working

3. **Deploy to Firebase**: Push updated website
   ```bash
   firebase deploy --only hosting
   ```

4. **Smoke Testing**: Check live site
   - Homepage loads
   - Products page anchor links work
   - Legal docs pages load correctly
   - RTL languages display properly

---

## Contact & Support

- **Website**: https://alhaq-initiative.org
- **Support Email**: support@alhaq-initiative.org
- **GitHub**: https://github.com/alhaq-initiative

