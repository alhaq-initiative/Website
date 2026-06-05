(function () {
  'use strict';
  // Global site version (bump on big deploys)
  const SITE_VERSION = '20250927';

  // Register service worker for offline/PWA capabilities
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      // Pass version as query to ensure fresh SW fetch even with proxies
      navigator.serviceWorker
        .register('/sw.js?v=' + SITE_VERSION)
        .catch(function (err) {
          console.debug('SW registration failed:', err);
        });
    });
  }

  // Harden external links opened in new tabs
  function hardenExternalLinks() {
    document.querySelectorAll('a[target="_blank"]').forEach(function (a) {
      const rel = (a.getAttribute('rel') || '').toLowerCase();
      if (!rel.includes('noopener'))
        a.setAttribute('rel', (rel + ' noopener').trim());
      if (!rel.includes('noreferrer'))
        a.setAttribute('rel', (a.getAttribute('rel') + ' noreferrer').trim());
    });
  }

  // Opportunistic lazy-loading for images
  function enableLazyImages() {
    document.querySelectorAll('img').forEach(function (img) {
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }
      // Decoding hint for better UX
      if (!img.hasAttribute('decoding')) {
        img.setAttribute('decoding', 'async');
      }
    });
  }

  // Prefetch internal pages on hover for snappier navigation
  const prefetched = new Set();
  function prefetchOnHover() {
    document.querySelectorAll('a[href]').forEach(function (a) {
      const href = a.getAttribute('href');
      try {
        const url = new URL(href, location.href);
        const sameOrigin = url.origin === location.origin;
        const isFile = /\.(png|jpe?g|webp|svg|gif|css|js|json|pdf)$/i.test(
          url.pathname
        );
        if (sameOrigin && url.pathname.endsWith('.html') && !isFile) {
          a.addEventListener(
            'mouseover',
            function () {
              const key = url.pathname + url.search;
              if (prefetched.has(key)) return;
              prefetched.add(key);
              const link = document.createElement('link');
              link.rel = 'prefetch';
              link.href = url.href;
              link.as = 'document';
              document.head.appendChild(link);
            },
            { once: true }
          );
        }
      } catch (_) {
        /* noop */
      }
    });
  }

  // Init on DOM ready
  document.addEventListener('DOMContentLoaded', function () {
    // Inject unified navigation only on non-AmnShield paths.
    // AmnShield pages manage their own complex header/SPA tabs and should not receive the global site nav.
    const pathLower = location.pathname.toLowerCase();
    const hostLower = location.hostname.toLowerCase();
    const isAmnHost =
      hostLower === 'amn.alhaq-initiative.org' ||
      hostLower.endsWith('.amn.alhaq-initiative.org');
    const isAmnExperience =
      isAmnHost ||
      pathLower.startsWith('/amn-site') ||
      !!document.querySelector('.amn-topbar');
    const skipGlobalNav =
      pathLower.startsWith('/shield/') ||
      pathLower.startsWith('/amn-site') ||
      pathLower.startsWith('/legal/shield_docs/');
    if (!skipGlobalNav) {
      try {
        const NAV_HTML = `\n<header id="site-global-header" class="islamic-header bg-white/80 backdrop-blur-nav fixed top-0 left-0 right-0 z-50 shadow-md border-b border-gray-200 transition-all duration-300" style="position:fixed;top:0;left:0;right:0;z-index:1000;background:rgba(255,255,255,0.92);border-bottom:1px solid rgba(229,231,235,0.9);">\n  <div class="container mx-auto px-4 py-3 flex flex-wrap justify-between items-center">\n    <a href="index.html" class="flex items-center space-x-2" aria-label="Al-Haq Initiative Home">\n      <div class="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center bg-white border border-gray-200">\n        <img src="assets/images/Al-Haq_Logo.png" alt="Al-Haq Initiative Logo" class="h-full w-full object-cover" />\n      </div>\n      <span class="text-lg md:text-xl font-bold text-brand-blue">Al-Haq Initiative</span>\n    </a>\n    <button id="mobile-menu-button" class="md:hidden p-2 rounded-md text-gray-600 hover:text-brand-blue focus:outline-none" aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="mobile-menu">\n      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">\n        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />\n      </svg>\n    </button>\n    <nav class="hidden md:flex items-center justify-between flex-1 pl-6" aria-label="Primary">\n      <ul class="flex space-x-1" role="menubar">\n        <li role="none"><a role="menuitem" href="index.html" class="nav-link px-3 py-2 text-gray-800 font-medium hover:text-brand-gold transition rounded-md">Home</a></li>\n        <li role="none"><a role="menuitem" href="about.html" class="nav-link px-3 py-2 text-gray-800 font-medium hover:text-brand-gold transition rounded-md">About</a></li>\n        <li role="none"><a role="menuitem" href="services.html" class="nav-link px-3 py-2 text-gray-800 font-medium hover:text-brand-gold transition rounded-md">Projects</a></li>\n        <li role="none"><a role="menuitem" href="library.html" class="nav-link px-3 py-2 text-gray-800 font-medium hover:text-brand-gold transition rounded-md">Library</a></li>\n        <li role="none"><a role="menuitem" href="quran.html" class="nav-link px-3 py-2 text-gray-800 font-medium hover:text-brand-gold transition rounded-md">Quran Hub</a></li>\n        <li role="none"><a role="menuitem" href="help.html" class="nav-link px-3 py-2 text-gray-800 font-medium hover:text-brand-gold transition rounded-md">Help & FAQ</a></li>\n      </ul>\n      <div class="flex items-center space-x-2 ml-4">\n        <a href="contact.html" class="bg-brand-gold text-brand-blue font-medium py-2 px-4 rounded-lg hover:bg-yellow-400 transition shadow-sm text-sm">Contact</a>\n        <a href="donate.html" class="bg-green-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-green-600 transition shadow-sm text-sm">Donate</a>\n      </div>\n    </nav>\n    <div id="mobile-menu" class="hidden w-full md:hidden mt-3 py-2" aria-label="Mobile Primary Navigation" style="display:none;">\n      <nav>\n        <ul class="flex flex-col space-y-1">\n          <li><a href="index.html" class="px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-md">Home</a></li>\n          <li><a href="about.html" class="px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-md">About</a></li>\n          <li><a href="services.html" class="px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-md">Projects</a></li>\n          <li><a href="library.html" class="px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-md">Library</a></li>\n          <li><a href="quran.html" class="px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-md">Quran Hub</a></li>\n          <li><a href="help.html" class="px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-md">Help & FAQ</a></li>\n          <li><a href="contact.html" class="px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-md">Contact</a></li>\n          <li><a href="donate.html" class="px-4 py-2 text-green-600 font-medium hover:bg-gray-100 rounded-md">Donate</a></li>\n        </ul>\n      </nav>\n    </div>\n  </div>\n</header>`;
        const already = document.getElementById('site-global-header');
        if (!already) {
          const placeholder = document.getElementById('global-header');
          if (placeholder) {
            placeholder.outerHTML = NAV_HTML;
          } else {
            const temp = document.createElement('div');
            temp.innerHTML = NAV_HTML;
            const headerEl = temp.firstElementChild;
            if (document.body.firstChild) {
              document.body.insertBefore(headerEl, document.body.firstChild);
            } else {
              document.body.appendChild(headerEl);
            }
          }
          // Ensure header is above any absolute hero images even if utility CSS fails to load
          try {
            const hdr = document.getElementById('site-global-header');
            if (hdr) {
              hdr.style.position = 'fixed';
              hdr.style.top = '0';
              hdr.style.left = '0';
              hdr.style.right = '0';
              hdr.style.zIndex = hdr.style.zIndex || '1000';
              // Defensive: if page forgot to add top padding, add a body class marker
              document.body.classList.add('has-global-header');
            }
            const mm = document.getElementById('mobile-menu');
            if (mm) {
              mm.style.display = 'none';
            }
          } catch (_) {}
        }
      } catch (_) {
        /* nav injection failure should not break page */
      }
    }
    // Accessibility: inject skip link (non-AmnShield) & ensure main landmarks
    try {
      if (!skipGlobalNav) {
        const existingSkip = document.querySelector('.skip-link');
        if (!existingSkip) {
          const skip = document.createElement('a');
          skip.href = '#main-content';
          skip.className = 'skip-link';
          skip.textContent = 'Skip to main content';
          document.body.insertBefore(skip, document.body.firstChild);
        }
      }
      const mainEl = document.querySelector('main');
      if (mainEl) {
        if (!mainEl.id) mainEl.id = 'main-content';
        mainEl.setAttribute('role', 'main');
        if (!mainEl.hasAttribute('tabindex'))
          mainEl.setAttribute('tabindex', '-1');
      }
    } catch (_) {}
    // Ensure a canonical link pointing to the primary domain for SEO
    try {
      const CANON_HOST = 'https://alhaq-initiative.org';
      const existing = document.querySelector('link[rel="canonical"]');
      const url = new URL(location.href);
      // Build canonical path: drop hash, keep pathname (including language prefixes), keep no query
      let canonicalPath = url.pathname || '/';
      // Normalize default index.html to '/'
      if (canonicalPath.toLowerCase().endsWith('/index.html')) {
        canonicalPath = canonicalPath.slice(0, -'/index.html'.length) || '/';
      }
      const canonicalHref =
        CANON_HOST +
        (canonicalPath.startsWith('/') ? canonicalPath : '/' + canonicalPath);
      if (existing) {
        if (existing.getAttribute('href') !== canonicalHref)
          existing.setAttribute('href', canonicalHref);
      } else {
        const link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        link.setAttribute('href', canonicalHref);
        document.head.appendChild(link);
      }
    } catch (_) {}
    // Ensure global stylesheet is last in head so overrides (including dark mode) take precedence
    try {
      const links = Array.from(
        document.querySelectorAll('link[rel="stylesheet"]')
      );
      let globalLink = links.find(
        l =>
          (l.getAttribute('href') || '').includes('/assets/css/styles.css') ||
          (l.getAttribute('href') || '').includes('assets/css/styles.css')
      );
      if (!globalLink) {
        // Inject if missing so site-wide dark theme is available on all pages
        globalLink = document.createElement('link');
        globalLink.rel = 'stylesheet';
        globalLink.href = location.pathname.startsWith('/shield/')
          ? '/assets/css/styles.css'
          : 'assets/css/styles.css';
        globalLink.setAttribute('data-injected-styles', 'true');
        document.head.appendChild(globalLink);
      } else if (globalLink.parentElement) {
        // Move to end of head
        document.head.appendChild(globalLink);
      }
    } catch (_) {}
    // Remove header language switcher completely (floating dock replaces it)
    try {
      // delete elements if present
      const btn = document.getElementById('langSwitcherBtn');
      const dd = document.getElementById('langDropdown');
      if (btn) btn.remove();
      if (dd) dd.remove();
      // hide by CSS at any viewport as a safeguard
      const style = document.createElement('style');
      style.setAttribute('data-lang-switcher-hide-all', 'true');
      style.textContent =
        '#langSwitcherBtn, #langDropdown { display:none !important; }';
      document.head.appendChild(style);
    } catch (_) {}

    // Minimal dark-mode helpers for floating preferences UI only (main palette is in styles.css)
    try {
      const darkStyle = document.createElement('style');
      darkStyle.setAttribute('data-global-dark-styles', 'true');
      darkStyle.textContent = `
        html.dark #global-preferences-dock #global-theme-btn,
        html.dark #global-lang-switcher #global-lang-btn { background:rgba(17,34,64,0.9) !important; color:#ffffff !important; border-color:rgba(212,175,55,0.6) !important; }
        html.dark #global-lang-switcher #global-lang-menu { background:rgba(23,53,83,0.98) !important; border-color:rgba(212,175,55,0.5) !important; }
        html.dark #global-lang-switcher #global-lang-menu button { color:#f8fafc !important; }
      `;
      document.head.appendChild(darkStyle);
    } catch (_) {}
    // 1) Apply saved theme or system preference and add bottom-left toggle
    if (!isAmnExperience) {
      (function initGlobalTheme() {
        try {
          const STORAGE_KEY = 'siteTheme';
          const root = document.documentElement;
          const saved =
            localStorage.getItem(STORAGE_KEY) ||
            localStorage.getItem('ds-theme'); // unify with AmnShield legacy
          // Default to light unless user has explicitly chosen
          const initial =
            saved === 'dark' || saved === 'light' ? saved : 'light';

          function applyTheme(mode) {
            const isDark = mode === 'dark';
            root.classList.toggle('dark', isDark);
            if (document.body) document.body.classList.toggle('dark', isDark);
            // Update browser UI theme color to match background
            try {
              const meta =
                document.querySelector('meta[name="theme-color"]') ||
                (function () {
                  const m = document.createElement('meta');
                  m.name = 'theme-color';
                  document.head.appendChild(m);
                  return m;
                })();
              meta.setAttribute('content', isDark ? '#0b1220' : '#ffffff');
            } catch (_) {}
            try {
              localStorage.setItem(STORAGE_KEY, mode);
              localStorage.setItem('ds-theme', mode);
            } catch (_) {}
          }

          applyTheme(initial);

          // Build bottom-left preferences dock with Theme + Language shortcuts
          if (!document.getElementById('global-preferences-dock')) {
            const dock = document.createElement('div');
            dock.id = 'global-preferences-dock';
            Object.assign(dock.style, {
              position: 'fixed',
              left: '1rem',
              bottom: '1rem',
              zIndex: '9999',
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
            });

            // Theme button
            const themeBtn = document.createElement('button');
            themeBtn.id = 'global-theme-btn';
            themeBtn.type = 'button';
            themeBtn.title = 'Toggle theme';
            themeBtn.setAttribute('aria-label', 'Toggle color theme');
            themeBtn.setAttribute(
              'aria-pressed',
              initial === 'dark' ? 'true' : 'false'
            );
            Object.assign(themeBtn.style, {
              width: '44px',
              height: '44px',
              borderRadius: '9999px',
              cursor: 'pointer',
              border: '1px solid rgba(212,175,55,0.5)',
              background: 'rgba(255,255,255,0.9)',
              color: '#0A2540',
              fontWeight: '700',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
            });
            const updateThemeBtnIcon = () => {
              const dark = root.classList.contains('dark');
              themeBtn.textContent = dark ? '\u2600\uFE0F' : '\uD83C\uDF19';
              themeBtn.setAttribute('aria-pressed', dark ? 'true' : 'false');
            };
            updateThemeBtnIcon();
            themeBtn.addEventListener('click', e => {
              e.preventDefault();
              const nowDark = !root.classList.contains('dark');
              applyTheme(nowDark ? 'dark' : 'light');
              updateThemeBtnIcon();
            });

            dock.appendChild(themeBtn);
            document.body.appendChild(dock);
          }
        } catch (_) {}
      })();
    }
    hardenExternalLinks();
    enableLazyImages();
    prefetchOnHover();

    // Universal nav highlighting across pages (works with clean URLs and locale prefixes)
    (function setupActiveNav() {
      function normalizePathname() {
        try {
          const parts = location.pathname.split('/').filter(Boolean);
          // Drop locale prefix if present
          const first = parts[0];
          const rest = ['ar', 'fa', 'ps', 'ur'].includes(first)
            ? parts.slice(1)
            : parts;
          const name = (rest[rest.length - 1] || '').toLowerCase();
          if (!name || name === 'index' || name === 'index.html')
            return 'index.html';
          return name.endsWith('.html') ? name : name + '.html';
        } catch (_) {
          return 'index.html';
        }
      }
      function applyActive() {
        const current = normalizePathname();
        const navLinks = document.querySelectorAll('nav a[href]');
        const mobileLinks = document.querySelectorAll('#mobile-menu a[href]');
        // Determine active hash/section for homepage
        const hash = (location.hash || '').toLowerCase();
        let activeSection = '';
        try {
          if (current === 'index.html') {
            const sectionIds = ['about', 'services'];
            sectionIds.forEach(id => {
              const el = document.getElementById(id);
              if (!el) return;
              const rect = el.getBoundingClientRect();
              if (rect.top <= 80 && rect.bottom > 80) activeSection = '#' + id;
            });
          }
        } catch (_) {}
        function mark(list) {
          list.forEach(link => {
            const hrefRaw = link.getAttribute('href') || '';
            const href = hrefRaw.toLowerCase();
            const file = href.split('#')[0];
            const anchor = href.includes('#') ? '#' + href.split('#')[1] : '';
            let match = false;
            // Section/hash match (home)
            if (
              current === 'index.html' &&
              anchor &&
              (anchor === hash || anchor === activeSection)
            ) {
              match = true;
            } else {
              // File match
              match =
                !file || file === ''
                  ? current === 'index.html'
                  : file === current;
            }
            link.classList.toggle('active-tab', !!match);
            if (match) {
              link.classList.remove('text-gray-800');
              link.classList.add('text-brand-gold');
            } else {
              link.classList.remove('text-brand-gold');
            }
          });
        }
        mark(navLinks);
        mark(mobileLinks);
      }
      applyActive();
      window.addEventListener('popstate', applyActive);
      window.addEventListener('hashchange', applyActive);
      window.addEventListener(
        'scroll',
        () => {
          requestAnimationFrame(applyActive);
        },
        { passive: true }
      );
    })();

    // Universal mobile menu toggle (works across all pages)
    try {
      const btn = document.getElementById('mobile-menu-button');
      const menu = document.getElementById('mobile-menu');
      if (btn && menu && !btn.dataset.bound) {
        const closeMenu = () => {
          if (!menu.classList.contains('hidden')) {
            menu.classList.add('hidden');
            btn.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('overflow-hidden');
          }
          // Fallback if Tailwind classes are missing: ensure inline display is off
          menu.style.display = 'none';
        };
        const toggleMenu = e => {
          e?.preventDefault?.();
          const isHidden = menu.classList.toggle('hidden');
          btn.setAttribute('aria-expanded', (!isHidden).toString());
          document.body.classList.toggle('overflow-hidden', !isHidden);
          // Fallback inline display toggling
          menu.style.display = isHidden ? 'none' : 'block';
        };

        // Use capture so this runs before any bubbling handlers added inline;
        // then stop propagation to prevent double toggles.
        btn.addEventListener(
          'click',
          e => {
            e.preventDefault();
            e.stopPropagation();
            // Some browsers support stopImmediatePropagation for extra safety
            if (typeof e.stopImmediatePropagation === 'function')
              e.stopImmediatePropagation();
            toggleMenu(e);
          },
          { capture: true }
        );
        btn.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') {
            toggleMenu(e);
          }
        });

        // Close on Escape
        document.addEventListener('keydown', e => {
          if (e.key === 'Escape') closeMenu();
        });

        // Close when clicking a link inside the menu
        menu.addEventListener('click', e => {
          const a = e.target.closest('a');
          if (a) closeMenu();
        });

        // Click-outside to close
        document.addEventListener('click', e => {
          const clickedInsideMenu = menu.contains(e.target);
          const clickedButton = btn.contains(e.target);
          if (!clickedInsideMenu && !clickedButton) closeMenu();
        });

        // Auto-close when resizing to desktop
        window.addEventListener('resize', () => {
          // Tailwind md breakpoint ~768px
          if (window.innerWidth >= 768) closeMenu();
        });

        // Mark as bound to avoid duplicate listeners if page also has inline scripts
        btn.dataset.bound = 'true';
      }
    } catch (_) {
      // no-op: do not break other enhancements if menu setup fails
    }

    // Modern, floating language selector (English / Arabic / Dari / Pashto / Urdu)
    if (!isAmnExperience) {
      (function setupLanguageSelector() {
        const LANGS = [
          { code: 'en', label: 'English', short: 'EN', rtl: false },
          {
            code: 'ar',
            label: '\u0627\u0644\u0639\u0631\u0628\u064A\u0629',
            short: 'AR',
            rtl: true,
          },
          { code: 'fa', label: '\u062F\u0631\u06CC', short: 'FA', rtl: true },
          {
            code: 'ps',
            label: '\u067E\u069A\u062A\u0648',
            short: 'PS',
            rtl: true,
          },
          {
            code: 'ur',
            label: '\u0627\u0631\u062F\u0648',
            short: 'UR',
            rtl: true,
          },
        ];
        function getLangFromPath() {
          try {
            const p = location.pathname.toLowerCase();
            const amnLegalMatch = p.match(
              /^\/amn-site\/legal\/(privacy|terms)\/(en|ar|fa|ps)\/(index\.html|main-privacy\.html)$/
            );
            if (amnLegalMatch) return amnLegalMatch[2];

            const parts = p.split('/').filter(Boolean);
            const first = parts[0];
            if (first && ['ar', 'fa', 'ps', 'ur'].includes(first)) return first;
            return null;
          } catch (_) {
            return null;
          }
        }
        const getLangFromUrl = () => {
          // Prefer path segment (/ar/, /fa/, /ps, /ur), fallback to ?lang
          const fromPath = getLangFromPath();
          if (fromPath) return fromPath;
          try {
            const qp = new URLSearchParams(location.search).get('lang');
            if (qp && ['ar', 'fa', 'ps', 'ur'].includes(qp)) return qp;
          } catch (_) {}
          return null;
        };
        function getPathWithoutLang() {
          const parts = location.pathname.split('/');
          // Keep leading '' for root when splitting
          const filtered = parts.filter((p, idx) => {
            if (idx === 0) return true; // leading ''
            return !['ar', 'fa', 'ps', 'ur'].includes(p) && p !== '';
          });
          // Ensure we at least have '/'
          let path = filtered.join('/');
          if (!path.startsWith('/')) path = '/' + path;
          // Normalize to clean URLs: use '/' for home instead of '/index.html'
          if (path === '/index.html' || path === '/') return '/';
          return path;
        }
        function ensureBaseForLangPrefix(lang) {
          try {
            const existing = document.querySelector(
              'head base[data-i18n-base]'
            );
            if (lang && lang !== 'en') {
              if (!existing) {
                const base = document.createElement('base');
                base.setAttribute('href', '/');
                base.setAttribute('data-i18n-base', 'true');
                document.head.insertBefore(base, document.head.firstChild);
              }
            } else if (existing) {
              existing.remove();
            }
          } catch (_) {}
        }
        function rewriteInternalLinks(langCode) {
          try {
            const here = location.pathname.toLowerCase();
            const onAmnLegal = /^\/amn-site\/legal\/(privacy|terms)(\/|$)/.test(
              here
            );

            document.querySelectorAll('a[href]').forEach(link => {
              const rawHref = link.getAttribute('href');
              if (
                !rawHref ||
                rawHref.startsWith('#') ||
                /^(mailto:|tel:|javascript:)/i.test(rawHref)
              )
                return;

              let url;
              try {
                url = new URL(rawHref, location.href);
              } catch (_) {
                return;
              }

              if (url.origin !== location.origin) return;
              if (
                /\.(png|jpe?g|webp|svg|gif|css|js|json|pdf|xml|txt|zip|webmanifest)$/i.test(
                  url.pathname
                )
              )
                return;

              if (onAmnLegal) {
                const target = url.pathname.toLowerCase();
                const toPrivacy = /^\/amn-site\/legal\/privacy(\/|$)/.test(
                  target
                );
                const toTerms = /^\/amn-site\/legal\/terms(\/|$)/.test(target);
                const supportedPathLang = ['ar', 'fa', 'ps'].includes(langCode);
                if (toPrivacy || toTerms) {
                  if (toPrivacy) {
                    url.pathname = supportedPathLang
                      ? `/amn-site/legal/privacy/${langCode}/index.html`
                      : '/amn-site/legal/privacy/index.html';
                  } else {
                    url.pathname = supportedPathLang
                      ? `/amn-site/legal/terms/${langCode}/index.html`
                      : '/amn-site/legal/terms/index.html';
                  }
                  if (langCode && langCode !== 'en' && !supportedPathLang) {
                    url.searchParams.set('lang', langCode);
                  } else {
                    url.searchParams.delete('lang');
                  }
                  const rewritten = url.pathname + url.search + url.hash;
                  if (rawHref !== rewritten)
                    link.setAttribute('href', rewritten);
                  return;
                }
              }

              if (langCode && langCode !== 'en') {
                url.searchParams.set('lang', langCode);
              } else {
                url.searchParams.delete('lang');
              }

              const normalized = url.pathname + url.search + url.hash;
              if (rawHref !== normalized) {
                link.setAttribute('href', normalized);
              }
            });
          } catch (_) {}
        }
        const setLangInUrl = code => {
          try {
            const url = new URL(location.href);
            const path = url.pathname.toLowerCase();
            const onPrivacy = /^\/amn-site\/legal\/privacy(\/|$)/.test(path);
            const onTerms = /^\/amn-site\/legal\/terms(\/|$)/.test(path);
            const supportedPathLang = ['ar', 'fa', 'ps'].includes(code);

            if (onPrivacy || onTerms) {
              url.pathname = onPrivacy
                ? supportedPathLang
                  ? `/amn-site/legal/privacy/${code}/index.html`
                  : '/amn-site/legal/privacy/index.html'
                : supportedPathLang
                  ? `/amn-site/legal/terms/${code}/index.html`
                  : '/amn-site/legal/terms/index.html';

              if (code && code !== 'en' && !supportedPathLang) {
                url.searchParams.set('lang', code);
              } else {
                url.searchParams.delete('lang');
              }
              history.replaceState(null, '', url.toString());
              return;
            }

            const pathWithout = getPathWithoutLang();
            url.pathname = pathWithout;
            if (code && code !== 'en') {
              url.searchParams.set('lang', code);
            } else {
              url.searchParams.delete('lang');
            }
            history.replaceState(null, '', url.toString());
          } catch (_) {}
        };

        const getLang = () => getLangFromUrl() || 'en';
        const findLang = code => LANGS.find(l => l.code === code) || LANGS[0];

        function reflectCurrentLangLabel(langCode) {
          try {
            const el = document.getElementById('currentLang');
            if (el) {
              const lang = findLang(langCode);
              el.textContent = lang.short || lang.label;
            }
          } catch (_) {}
        }

        const cache = {};
        function getPageKey() {
          try {
            const path = location.pathname.toLowerCase();
            if (path.startsWith('/amn-site/')) return null;
          } catch (_) {}
          const name = (
            location.pathname.split('/').pop() || 'index.html'
          ).toLowerCase();
          if (name === '' || name === 'index.html') return 'home';
          if (name.includes('library')) return 'library';
          if (name.includes('help')) return 'help';
          if (name.includes('donate')) return 'donate';
          if (name.includes('contact')) return 'contact';
          if (name.includes('all-infographics')) return 'all-infographics';
          if (name.includes('about')) return 'about';
          if (name.includes('services')) return 'services';
          if (name.includes('quranhub')) return 'quranhub';
          if (name.includes('quran')) return 'quran';
          if (name.includes('media')) return 'media';
          if (name.includes('deenhub_join_beta')) return 'deenhub_join_beta';
          if (name.includes('deenhub')) return 'deenhub';
          if (name.includes('golden-speech')) return 'golden-speech';
          if (name === 'docs.html') return 'docs';
          if (name.includes('introduction')) return 'introduction';
          if (name.includes('privacy')) return 'privacy';
          if (name.includes('terms')) return 'terms';
          if (name.includes('support')) return 'support';
          // AmnShield pages: handle both correct and legacy misspelling used in assets/Translations
          // Deprecated: historic 'deenshield-app' (standalone web app) removed â€“ keep only legacy misspelling mapping below.
          // If path uses correct spelling, map to legacy folder name to avoid 404
          if (name.includes('deenshield-extension'))
            return 'deensheild-extension';
          if (name.includes('deenshield')) return 'deensheild';
          return null;
        }
        async function fetchPageTranslations(pageKey, langCode) {
          if (!pageKey) return null;
          const key = `${pageKey}:${langCode}`;
          if (cache[key]) return cache[key];
          try {
            let res = await fetch(
              `/assets/Translations/${pageKey}/${langCode}.json`,
              { cache: 'no-cache' }
            );
            // Fallback for legacy/corrected folder name mismatches (deensheild <-> deenshield)
            if (!res.ok) {
              const alt =
                pageKey === 'deensheild'
                  ? 'deenshield'
                  : pageKey === 'deensheild-extension'
                    ? 'deenshield-extension'
                    : pageKey === 'products'
                      ? 'projects'
                      : pageKey === 'quranhub'
                        ? 'taleem-ai'
                        : null;
              if (alt) {
                try {
                  const r2 = await fetch(
                    `/assets/Translations/${alt}/${langCode}.json`,
                    { cache: 'no-cache' }
                  );
                  if (r2.ok) res = r2;
                } catch (_) {}
              }
            }
            if (!res.ok) return null;
            const data = await res.json();
            cache[key] = data;
            try {
              console.debug(
                '[i18n] loaded',
                pageKey,
                langCode,
                data ? 'ok' : 'empty'
              );
            } catch (_) {}
            return data;
          } catch (e) {
            try {
              console.warn('[i18n] failed to load', pageKey, langCode, e);
            } catch (_) {}
            return null;
          }
        }

        function applyGenericTranslations(t) {
          if (!t) return;
          try {
            // Document title
            if (t.title) document.title = t.title;
            // Primary H1
            const h1 = document.querySelector('h1');
            if (h1 && t.mainHeading) h1.textContent = t.mainHeading;
            // Hero subtitle: try a few common selectors used across pages
            let sub = document.querySelector('p.text-lg');
            if (!sub) sub = document.querySelector('.hero-bg p');
            if (!sub) sub = document.querySelector('main p');
            if (sub && t.mainSub) sub.textContent = t.mainSub;
            // Desktop nav
            const navMap = [
              { href: 'index.html', key: 'navHome' },
              { href: 'about.html', key: 'navAbout' },
              { href: 'services.html', key: 'navServices' },
              { href: 'library.html', key: 'navLibrary' },
              { href: 'quran.html', key: 'navQuranHub' },
              { href: 'help.html', key: 'navHelp' },
              { href: 'contact.html', key: 'navContact' },
              { href: 'donate.html', key: 'navDonate' },
            ];
            navMap.forEach(item => {
              const link = document.querySelector(`nav a[href='${item.href}']`);
              if (link && t[item.key]) link.textContent = t[item.key];
            });
            // Mobile nav (if present)
            navMap.forEach(item => {
              const link = document.querySelector(
                `#mobile-menu a[href='${item.href}']`
              );
              if (link && t[item.key]) link.textContent = t[item.key];
            });
            // Footer slogan, if selector exists
            const footerSlogan = document.querySelector('footer p.mt-2');
            if (footerSlogan && t.footerSlogan)
              footerSlogan.textContent = t.footerSlogan;
          } catch (_) {}
        }

        async function applyLang(langCode) {
          // Capture previous language to avoid reload loops on EN
          const prevLang = (function () {
            try {
              return getLangFromUrl() || 'en';
            } catch (_) {
              return 'en';
            }
          })();
          const lang = findLang(langCode);
          try {
            localStorage.setItem('siteLang', lang.code);
          } catch (_) {}
          try {
            document.documentElement.setAttribute('lang', lang.code);
            document.documentElement.setAttribute(
              'dir',
              lang.rtl ? 'rtl' : 'ltr'
            );
            document.body && document.body.classList.toggle('rtl', !!lang.rtl);
          } catch (_) {}
          // Only fetch translation files for non-English supported languages
          const pageKey = getPageKey();
          if (
            pageKey &&
            (lang.code === 'ar' ||
              lang.code === 'fa' ||
              lang.code === 'ps' ||
              lang.code === 'ur')
          ) {
            const t = await fetchPageTranslations(pageKey, lang.code);
            // Map common home keys to generic ones for consistent application
            let mapped = t ? { ...t } : {};
            if (pageKey === 'home') {
              if (!mapped.mainHeading && mapped.heroTitle)
                mapped.mainHeading = mapped.heroTitle;
              if (!mapped.mainSub && mapped.heroSubtitle)
                mapped.mainSub = mapped.heroSubtitle;
            }
            try {
              window.pageTranslations = mapped;
            } catch (_) {}
            // Apply generic translations across header/footer and simple headings
            applyGenericTranslations(window.pageTranslations);
            try {
              // Invoke preserved page-specific setLanguage (if any) after core i18n applies
              if (typeof window._pageSetLanguage === 'function') {
                window._pageSetLanguage(lang.code);
              }
            } catch (_) {}
          } else {
            // For English, do NOT fetch translation file, just clear translations
            try {
              window.pageTranslations = {};
            } catch (_) {}
            applyGenericTranslations(window.pageTranslations);
          }
          reflectCurrentLangLabel(lang.code);
          // Update floating button label if present
          const gbtn = document.getElementById('global-lang-btn');
          if (gbtn) gbtn.textContent = findLang(lang.code).short;
          // Ensure base and internal links match the selected language
          ensureBaseForLangPrefix(lang.code);
          rewriteInternalLinks(lang.code);
          setLangInUrl(lang.code);
          // If switching to English, reload once to restore original default content immediately
          // (pages only ship non-EN JSON; EN relies on static DOM)
          if (lang.code === 'en' && prevLang !== 'en') {
            try {
              location.reload();
            } catch (_) {}
            return; // stop further processing
          }
        }

        try {
          // Preserve any already-defined page-specific handler
          const existing =
            typeof window.setLanguage === 'function'
              ? window.setLanguage
              : null;
          if (existing && existing !== applyLang) {
            window._pageSetLanguage = existing;
          }
          window.applySiteLanguage = applyLang;
          // Intercept future assignments: getter always returns core applyLang; setter stores page-specific in _pageSetLanguage
          Object.defineProperty(window, 'setLanguage', {
            configurable: true,
            get() {
              return applyLang;
            },
            set(fn) {
              if (typeof fn === 'function' && fn !== applyLang)
                window._pageSetLanguage = fn;
            },
          });
        } catch (_) {}

        // Determine initial language: honor explicit URL (/ar|/fa|/ps|/ur or ?lang=ar|fa|ps|ur).
        // Do NOT auto-switch to a stored preference when landing at root â€” English is default.
        const explicit = getLangFromUrl();
        const storedPref = (function () {
          try {
            return localStorage.getItem('siteLang');
          } catch (_) {
            return null;
          }
        })();
        const initialLang = explicit || storedPref || 'en';
        // Ensure base and links are correct for initial load before applying
        ensureBaseForLangPrefix(initialLang);
        rewriteInternalLinks(initialLang);
        if (initialLang !== 'en') {
          // Apply and normalize visible URL to path-prefix style
          applyLang(initialLang);
          setLangInUrl(initialLang);
        } else {
          // Keep default English at '/'
          reflectCurrentLangLabel('en');
          setLangInUrl('en');
        }

        // Inject floating language switcher (bottom-left) for consistency across pages
        if (!document.getElementById('global-lang-switcher')) {
          const wrap = document.createElement('div');
          wrap.id = 'global-lang-switcher';
          wrap.setAttribute('aria-live', 'polite');
          wrap.style.position = 'fixed';
          wrap.style.left = '1.0rem';
          wrap.style.bottom = '4.5rem';
          wrap.style.zIndex = '9999';

          const btn = document.createElement('button');
          btn.id = 'global-lang-btn';
          btn.setAttribute('aria-haspopup', 'true');
          btn.setAttribute('aria-expanded', 'false');
          btn.title = 'Change language';
          Object.assign(btn.style, {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '44px',
            height: '44px',
            borderRadius: '9999px',
            cursor: 'pointer',
            border: '1px solid rgba(212, 175, 55, 0.5)',
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
            color: '#0A2540',
            fontWeight: '700',
          });
          btn.textContent = findLang(initialLang).short;

          const menu = document.createElement('div');
          menu.id = 'global-lang-menu';
          menu.setAttribute('role', 'menu');
          Object.assign(menu.style, {
            position: 'absolute',
            bottom: '56px',
            left: '0',
            minWidth: '160px',
            padding: '6px',
            borderRadius: '12px',
            border: '1px solid rgba(212,175,55,0.4)',
            background: 'rgba(255,255,255,0.98)',
            boxShadow: '0 12px 24px rgba(0,0,0,0.12)',
            display: 'none',
          });

          LANGS.forEach(l => {
            const item = document.createElement('button');
            item.type = 'button';
            item.setAttribute('role', 'menuitem');
            item.dataset.lang = l.code;
            Object.assign(item.style, {
              display: 'flex',
              width: '100%',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: '#0A2540',
              fontWeight: '600',
            });
            item.innerHTML = `<span>${l.label}</span><span style="opacity:.7;font-size:12px;">${l.short}</span>`;
            item.addEventListener('click', e => {
              e.preventDefault();
              applyLang(l.code);
              menu.style.display = 'none';
              btn.setAttribute('aria-expanded', 'false');
            });
            item.addEventListener('keydown', e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                item.click();
              }
            });
            item.addEventListener('mouseenter', () => {
              item.style.background = 'rgba(212,175,55,0.08)';
            });
            item.addEventListener('mouseleave', () => {
              item.style.background = 'transparent';
            });
            menu.appendChild(item);
          });

          function toggleMenu(show) {
            const want =
              typeof show === 'boolean' ? show : menu.style.display === 'none';
            menu.style.display = want ? 'block' : 'none';
            btn.setAttribute('aria-expanded', want ? 'true' : 'false');
          }

          btn.addEventListener(
            'click',
            e => {
              e.preventDefault();
              e.stopPropagation();
              toggleMenu();
            },
            { capture: true }
          );
          document.addEventListener('click', e => {
            if (!wrap.contains(e.target)) toggleMenu(false);
          });
          document.addEventListener('keydown', e => {
            if (e.key === 'Escape') toggleMenu(false);
          });

          wrap.appendChild(btn);
          wrap.appendChild(menu);
          document.body.appendChild(wrap);
        }
      })();
    }

    // Header language dropdown removed; no binding necessary

    // Inject global footer email contacts + legal/docs hub + baseline privacy/terms (excluding contact page which has its own section)
    try {
      const path = location.pathname.toLowerCase();
      const isContactPage =
        path.endsWith('/contact.html') ||
        path.endsWith('contact.html') ||
        path === '/contact' ||
        path.endsWith('/contact');
      if (!isContactPage) {
        const footer = document.querySelector('footer');
        if (footer) {
          // Emails block
          if (!footer.querySelector('[data-global-email-contacts]')) {
            const block = document.createElement('div');
            block.setAttribute('data-global-email-contacts', 'true');
            block.style.marginTop = '1.5rem';
            block.style.fontSize = '0.875rem';
            block.style.lineHeight = '1.4';
            block.innerHTML = `
              <div style="max-width:860px;margin:0 auto;display:flex;flex-wrap:wrap;gap:0.75rem;justify-content:center;color:#d1d5db;">
                <div><strong style=\"color:#fef08a;\">Info:</strong> <a href=\"mailto:info@alhaq-initiative.org\" style=\"color:#93c5fd;\">info@alhaq-initiative.org</a></div>
                <div><strong style=\"color:#fef08a;\">Contact:</strong> <a href=\"mailto:contact@alhaq-initiative.org\" style=\"color:#93c5fd;\">contact@alhaq-initiative.org</a></div>
                <div><strong style=\"color:#fef08a;\">Support:</strong> <a href=\"mailto:support@alhaq-initiative.org\" style=\"color:#93c5fd;\">support@alhaq-initiative.org</a></div>
              </div>`;
            const insertionPoint = footer.querySelector(
              'p.mt-8, p.text-sm, p.text-xs'
            );
            if (insertionPoint && insertionPoint.parentElement) {
              insertionPoint.parentElement.insertBefore(block, insertionPoint);
            } else {
              footer.appendChild(block);
            }
          }
          // Legal/Docs hub link (avoid duplicates)
          if (!footer.querySelector('[data-global-legal]')) {
            const legal = document.createElement('div');
            legal.setAttribute('data-global-legal', 'true');
            legal.style.marginTop = '0.75rem';
            legal.style.fontSize = '0.75rem';
            legal.style.textAlign = 'center';
            legal.innerHTML = `<a href="/legal/docs.html" style="color:#e5e7eb;text-decoration:underline;">Legal / Docs Hub</a> &middot; <a href="/legal/privacy_hub.html" style="color:#e5e7eb;text-decoration:underline;">Privacy Hub</a> &middot; <a href="/legal/terms_hub.html" style="color:#e5e7eb;text-decoration:underline;">Terms Hub</a> &middot; <a href="/support_hub.html" style="color:#e5e7eb;text-decoration:underline;">Support Hub</a>`;
            footer.appendChild(legal);
          }
          // Baseline privacy/terms if the footer does not already contain obvious links (skip AmnShield which has its own detailed set)
          const isAmnShield = path.startsWith('/shield/');
          if (
            !isAmnShield &&
            !footer.querySelector('[data-global-privacy-terms]')
          ) {
            const hasPrivacy = /privacy/i.test(footer.innerHTML);
            const hasTerms = /terms/i.test(footer.innerHTML);
            if (!hasPrivacy || !hasTerms) {
              const pt = document.createElement('div');
              pt.setAttribute('data-global-privacy-terms', 'true');
              pt.style.marginTop = '0.5rem';
              pt.style.fontSize = '0.7rem';
              pt.style.opacity = '0.85';
              pt.style.textAlign = 'center';
              pt.innerHTML = `<a href="/legal/privacy_hub.html" style="color:#d1d5db;">Privacy</a> &middot; <a href="/legal/terms_hub.html" style="color:#d1d5db;">Terms</a>`;
              footer.appendChild(pt);
            }
          }
        }
      }
    } catch (_) {}
  });
})();

// --- Unified Logic App form submission handler (Name/Email/Message) ---
// Some pages include lightweight feedback/contact forms that were submitting
// as urlencoded with inconsistent field casing, resulting in empty values in
// the Azure Logic App (JSON schema mismatch). We intercept and send clean JSON.
(function initLogicAppForms() {
  const LOGIC_APP_SIGNATURE = 'workflows/2a3b358e4c614e2aaeb81efadcf9fa42';
  function extractValue(map, keys) {
    for (const k of keys) {
      if (map.has(k)) return map.get(k).value.trim();
    }
    return '';
  }
  function bindForm(form) {
    if (form.dataset.logicBound) return; // already processed
    form.dataset.logicBound = 'true';
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const inputs = Array.from(form.querySelectorAll('input,textarea'));
      const byName = new Map();
      inputs.forEach(el => {
        if (el.name) byName.set(el.name.toLowerCase(), el);
      });
      // Honeypot (spam) field named 'website' (common pattern) â€“ abort silently if filled
      if (byName.get('website') && byName.get('website').value.trim() !== '') {
        return;
      }
      const name = extractValue(byName, ['name', 'fullname']);
      const email = extractValue(byName, ['email', 'e-mail']);
      const message = extractValue(byName, ['message', 'msg', 'feedback']);
      const source = form.getAttribute('data-source') || location.pathname;
      // Visual feedback elements
      let statusEl = form.querySelector('.form-status');
      if (!statusEl) {
        statusEl = document.createElement('div');
        statusEl.className = 'form-status text-sm mt-1';
        form.appendChild(statusEl);
      }
      const submitBtn = form.querySelector(
        'button[type="submit"],input[type="submit"]'
      );
      const origBtnText = submitBtn
        ? submitBtn.textContent || submitBtn.value
        : '';
      function setState(txt, color) {
        if (statusEl) {
          statusEl.textContent = txt;
          statusEl.style.color = color || 'inherit';
        }
      }
      try {
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.classList.add('opacity-60', 'pointer-events-none');
          if (submitBtn.textContent) submitBtn.textContent = 'Sending...';
        }
        setState('Sending...', 'gray');
        const payload = {
          Name: name,
          Email: email,
          Message: message,
          Source: source,
          Agent: navigator.userAgent,
        };
        const res = await fetch(form.action, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        setState('Submitted successfully. JazakAllahu khairan.', 'green');
        form.reset();
      } catch (err) {
        console.error('Form submit failed', err);
        setState('Submission failed. Please retry later.', 'red');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.classList.remove('opacity-60', 'pointer-events-none');
          if (submitBtn.textContent) submitBtn.textContent = origBtnText;
        }
      }
    });
  }
  document.addEventListener('DOMContentLoaded', () => {
    document
      .querySelectorAll(`form[action*='${LOGIC_APP_SIGNATURE}']`)
      .forEach(bindForm);
  });
})();

/* ============================================================
   Al-Haq Initiative AI Chatbot — floating launcher + iframe
   Embeds the Hugging Face Space Habib-HF/alhaq-website-chatbot.
   Skipped on AmnShield/legacy shield surfaces (they have their
   own shells). Configurable via window.ALHAQ_CHATBOT_URL.
   ============================================================ */
(function () {
  'use strict';
  try {
    const path = (location.pathname || '').toLowerCase();
    if (
      path.startsWith('/amn-site') ||
      path.startsWith('/shield/') ||
      path.startsWith('/legal/shield_docs/')
    )
      return;
    if (window.__alhaqChatbotInjected) return;
    window.__alhaqChatbotInjected = true;

    const CHATBOT_URL =
      window.ALHAQ_CHATBOT_URL ||
      'https://habib-hf-alhaq-website-chatbot.hf.space';
    const CHATBOT_SRC =
      CHATBOT_URL +
      (CHATBOT_URL.indexOf('?') === -1 ? '?' : '&') +
      '__theme=light&context=alhaq-initiative';

    function inject() {
      if (document.getElementById('alhaq-chatbot-launcher')) return;

      // If the page already has a fixed bottom-right action (e.g. #feedback-btn),
      // stack the chat launcher above it instead of overlapping.
      const stacked = !!document.querySelector('#feedback-btn');

      const style = document.createElement('style');
      style.id = 'alhaq-chatbot-styles';
      style.textContent = `
        #alhaq-chatbot-launcher{position:fixed;bottom:${stacked ? '92px' : '24px'};right:24px;z-index:9998;border:none;border-radius:9999px;width:60px;height:60px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#fff;background:linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 55%,#2563eb 100%);box-shadow:0 10px 28px rgba(29,78,216,.45),0 2px 6px rgba(15,23,42,.18);transition:transform .25s ease,box-shadow .25s ease,filter .25s ease;}
        #alhaq-chatbot-launcher:hover{transform:translateY(-3px) scale(1.04);box-shadow:0 16px 36px rgba(29,78,216,.55),0 4px 10px rgba(15,23,42,.2);filter:brightness(1.05);}
        #alhaq-chatbot-launcher:focus-visible{outline:3px solid #facc15;outline-offset:3px;}
        #alhaq-chatbot-launcher svg{width:26px;height:26px;}
        #alhaq-chatbot-launcher::after{content:"";position:absolute;inset:-4px;border-radius:9999px;border:2px solid rgba(37,99,235,.45);animation:alhaq-pulse 2.4s ease-out infinite;pointer-events:none;}
        #alhaq-chatbot-launcher.open::after{display:none;}
        @keyframes alhaq-pulse{0%{transform:scale(1);opacity:.7}80%{transform:scale(1.35);opacity:0}100%{transform:scale(1.35);opacity:0}}
        #alhaq-chatbot-tip{position:fixed;bottom:${stacked ? '108px' : '40px'};right:96px;z-index:9997;background:#0f172a;color:#fff;font:500 12px/1.2 'Inter',sans-serif;padding:8px 12px;border-radius:8px;box-shadow:0 6px 18px rgba(15,23,42,.25);opacity:0;transform:translateX(6px);pointer-events:none;transition:opacity .2s ease,transform .2s ease;white-space:nowrap;}
        #alhaq-chatbot-tip::after{content:"";position:absolute;top:50%;right:-5px;transform:translateY(-50%) rotate(45deg);width:10px;height:10px;background:#0f172a;}
        #alhaq-chatbot-launcher:hover + #alhaq-chatbot-tip,#alhaq-chatbot-launcher:focus-visible + #alhaq-chatbot-tip{opacity:1;transform:translateX(0);}
        #alhaq-chatbot-launcher.open + #alhaq-chatbot-tip{display:none;}

        #alhaq-chatbot-panel{position:fixed;bottom:${stacked ? '164px' : '96px'};right:20px;width:460px;max-width:calc(100vw - 20px);height:min(640px, calc(100vh - ${stacked ? '184px' : '116px'}));max-height:calc(100vh - ${stacked ? '184px' : '116px'});z-index:9999;background:#fff;border-radius:18px;box-shadow:0 28px 60px rgba(15,23,42,.32),0 4px 14px rgba(15,23,42,.14);overflow:hidden;display:none;flex-direction:column;border:1px solid rgba(15,23,42,.08);transform:translateY(16px) scale(.98);opacity:0;transition:transform .25s cubic-bezier(.2,.8,.2,1),opacity .2s ease;}
        #alhaq-chatbot-panel.open{display:flex;transform:translateY(0) scale(1);opacity:1;}

        #alhaq-chatbot-header{display:flex;align-items:center;gap:12px;padding:16px 18px;background:linear-gradient(135deg,#1e3a8a,#1d4ed8 60%,#2563eb);color:#fff;}
        #alhaq-chatbot-header .alhaq-avatar{flex:0 0 auto;width:40px;height:40px;border-radius:9999px;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;border:1px solid rgba(255,255,255,.25);position:relative;}
        #alhaq-chatbot-header .alhaq-avatar svg{width:20px;height:20px;}
        #alhaq-chatbot-header .alhaq-avatar::after{content:"";position:absolute;right:-1px;bottom:-1px;width:11px;height:11px;border-radius:9999px;background:#22c55e;border:2px solid #1d4ed8;}
        #alhaq-chatbot-header .alhaq-meta{display:flex;flex-direction:column;line-height:1.25;flex:1;min-width:0;}
        #alhaq-chatbot-header .alhaq-title{font:700 16px/1.2 'Inter',sans-serif;letter-spacing:.1px;}
        #alhaq-chatbot-header .alhaq-sub{font:600 13px/1.35 'Inter',sans-serif;opacity:.96;display:flex;align-items:center;gap:7px;}
        #alhaq-chatbot-header .alhaq-sub::before{content:"";width:6px;height:6px;border-radius:9999px;background:#22c55e;box-shadow:0 0 0 0 rgba(34,197,94,.7);animation:alhaq-dot 1.8s ease-out infinite;}
        @keyframes alhaq-dot{0%{box-shadow:0 0 0 0 rgba(34,197,94,.7)}70%{box-shadow:0 0 0 6px rgba(34,197,94,0)}100%{box-shadow:0 0 0 0 rgba(34,197,94,0)}}
        #alhaq-chatbot-header .alhaq-actions{display:flex;gap:6px;}
        #alhaq-chatbot-header .alhaq-actions button{background:transparent;border:none;color:#fff;cursor:pointer;padding:7px;border-radius:8px;display:flex;align-items:center;justify-content:center;transition:background .15s ease;}
        #alhaq-chatbot-header .alhaq-actions button:hover{background:rgba(255,255,255,.18);}
        #alhaq-chatbot-header .alhaq-actions svg{width:18px;height:18px;}

        #alhaq-chatbot-body{flex:1;position:relative;background:#ffffff;}
        #alhaq-chatbot-frame{position:absolute;inset:0;width:100%;height:100%;border:0;background:#ffffff;}
        #alhaq-chatbot-loading{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;color:#475569;font:500 13px/1.4 'Inter',sans-serif;background:#f8fafc;text-align:center;padding:24px;}
        #alhaq-chatbot-loading.hidden{display:none;}
        #alhaq-chatbot-loading .alhaq-spinner{width:36px;height:36px;border-radius:9999px;border:3px solid rgba(29,78,216,.18);border-top-color:#1d4ed8;animation:alhaq-spin 1s linear infinite;}
        @keyframes alhaq-spin{to{transform:rotate(360deg);}}

        #alhaq-chatbot-footer{padding:10px 14px;border-top:1px solid rgba(15,23,42,.08);background:#fff;color:#475569;font:500 12px/1.4 'Inter',sans-serif;display:flex;align-items:center;justify-content:space-between;gap:8px;}
        #alhaq-chatbot-footer a{color:#1d4ed8;text-decoration:none;font-weight:600;}
        #alhaq-chatbot-footer a:hover{text-decoration:underline;}

        #alhaq-chatbot-panel.expanded{width:min(1020px,calc(100vw - 36px));height:min(82vh,860px);}

        @media (max-width:480px){
          #alhaq-chatbot-launcher{bottom:${stacked ? '88px' : '20px'};right:16px;width:56px;height:56px;}
          #alhaq-chatbot-tip{display:none;}
          #alhaq-chatbot-panel{bottom:0;right:0;left:0;width:auto;max-width:none;height:92vh;max-height:92vh;border-radius:18px 18px 0 0;}
          #alhaq-chatbot-panel.expanded{height:97vh;max-height:97vh;width:auto;}
        }
        [dir="rtl"] #alhaq-chatbot-launcher{right:auto;left:24px;}
        [dir="rtl"] #alhaq-chatbot-tip{right:auto;left:96px;transform:translateX(-6px);}
        [dir="rtl"] #alhaq-chatbot-tip::after{right:auto;left:-5px;}
        [dir="rtl"] #alhaq-chatbot-launcher:hover + #alhaq-chatbot-tip,[dir="rtl"] #alhaq-chatbot-launcher:focus-visible + #alhaq-chatbot-tip{transform:translateX(0);}
        [dir="rtl"] #alhaq-chatbot-panel{right:auto;left:20px;}
        @media (max-width:480px){
          [dir="rtl"] #alhaq-chatbot-launcher{left:16px;right:auto;}
          [dir="rtl"] #alhaq-chatbot-panel{left:0;right:0;}
        }
      `;
      document.head.appendChild(style);

      const btn = document.createElement('button');
      btn.id = 'alhaq-chatbot-launcher';
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Open Al-Haq Assistant chatbot');
      btn.setAttribute('aria-expanded', 'false');
      const ICON_CHAT =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
      const ICON_CLOSE =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
      btn.innerHTML = ICON_CHAT;

      const tip = document.createElement('div');
      tip.id = 'alhaq-chatbot-tip';
      tip.textContent = 'Ask the Al-Haq Assistant';

      const panel = document.createElement('div');
      panel.id = 'alhaq-chatbot-panel';
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-label', 'Al-Haq Initiative Assistant');
      panel.innerHTML = `
        <div id="alhaq-chatbot-header">
          <div class="alhaq-avatar" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div class="alhaq-meta">
            <span class="alhaq-title">Al-Haq Assistant</span>
            <span class="alhaq-sub">Online &middot; Multilingual</span>
          </div>
          <div class="alhaq-actions">
            <button type="button" id="alhaq-chatbot-expand" aria-label="Expand or shrink chatbot" title="Expand">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
            </button>
            <button type="button" id="alhaq-chatbot-close" aria-label="Close chatbot" title="Close">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>
        <div id="alhaq-chatbot-body">
          <div id="alhaq-chatbot-loading">
            <div class="alhaq-spinner" aria-hidden="true"></div>
            <div>Loading the Al-Haq Assistant&hellip;</div>
          </div>
          <iframe id="alhaq-chatbot-frame" title="Al-Haq Initiative Assistant" loading="lazy" referrerpolicy="no-referrer" allow="clipboard-write"></iframe>
        </div>
        <div id="alhaq-chatbot-footer">
          <span>Powered by Al-Haq Studio</span>
          <a href="/contact.html">Need a human?</a>
        </div>
      `;

      document.body.appendChild(btn);
      document.body.appendChild(tip);
      document.body.appendChild(panel);

      const frame = panel.querySelector('#alhaq-chatbot-frame');
      const loading = panel.querySelector('#alhaq-chatbot-loading');
      const expandBtn = panel.querySelector('#alhaq-chatbot-expand');
      let loaded = false;

      frame.addEventListener('load', function () {
        if (loaded) loading.classList.add('hidden');
      });

      function open() {
        if (!loaded) {
          frame.src = CHATBOT_SRC;
          loaded = true;
        }
        panel.classList.add('open');
        btn.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        btn.setAttribute('aria-label', 'Close Al-Haq Assistant chatbot');
        btn.innerHTML = ICON_CLOSE;
      }
      function close() {
        panel.classList.remove('open');
        btn.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-label', 'Open Al-Haq Assistant chatbot');
        btn.innerHTML = ICON_CHAT;
      }
      btn.addEventListener('click', function () {
        if (panel.classList.contains('open')) close();
        else open();
      });
      panel
        .querySelector('#alhaq-chatbot-close')
        .addEventListener('click', close);
      expandBtn.addEventListener('click', function () {
        panel.classList.toggle('expanded');
        expandBtn.setAttribute(
          'title',
          panel.classList.contains('expanded') ? 'Shrink' : 'Expand'
        );
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && panel.classList.contains('open')) close();
      });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', inject);
    } else {
      inject();
    }
  } catch (err) {
    console.debug('Chatbot widget init failed', err);
  }
})();
