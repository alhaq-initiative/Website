(function() {
  'use strict';

  // Register service worker for offline/PWA capabilities
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/sw.js').catch(function(err) {
        console.debug('SW registration failed:', err);
      });
    });
  }

  // Harden external links opened in new tabs
  function hardenExternalLinks() {
    document.querySelectorAll('a[target="_blank"]').forEach(function(a) {
      const rel = (a.getAttribute('rel') || '').toLowerCase();
      if (!rel.includes('noopener')) a.setAttribute('rel', (rel + ' noopener').trim());
      if (!rel.includes('noreferrer')) a.setAttribute('rel', (a.getAttribute('rel') + ' noreferrer').trim());
    });
  }

  // Opportunistic lazy-loading for images
  function enableLazyImages() {
    document.querySelectorAll('img').forEach(function(img) {
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
    document.querySelectorAll('a[href]').forEach(function(a) {
      const href = a.getAttribute('href');
      try {
        const url = new URL(href, location.href);
        const sameOrigin = url.origin === location.origin;
        const isFile = /\.(png|jpe?g|webp|svg|gif|css|js|json|pdf)$/i.test(url.pathname);
        if (sameOrigin && url.pathname.endsWith('.html') && !isFile) {
          a.addEventListener('mouseover', function() {
            const key = url.pathname + url.search;
            if (prefetched.has(key)) return;
            prefetched.add(key);
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = url.href;
            link.as = 'document';
            document.head.appendChild(link);
          }, { once: true });
        }
      } catch (_) { /* noop */ }
    });
  }

  // Init on DOM ready
  document.addEventListener('DOMContentLoaded', function() {
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
          const rest = ['ar','fa','ps'].includes(first) ? parts.slice(1) : parts;
          const name = (rest[rest.length - 1] || '').toLowerCase();
          if (!name || name === 'index' || name === 'index.html') return 'index.html';
          return name.endsWith('.html') ? name : name + '.html';
        } catch(_) { return 'index.html'; }
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
        } catch(_) {}
        function mark(list) {
          list.forEach(link => {
            const hrefRaw = (link.getAttribute('href') || '');
            const href = hrefRaw.toLowerCase();
            const file = href.split('#')[0];
            const anchor = href.includes('#') ? '#' + href.split('#')[1] : '';
            let match = false;
            // Section/hash match (home)
            if (current === 'index.html' && (anchor && (anchor === hash || anchor === activeSection))) {
              match = true;
            } else {
              // File match
              match = !file || file === '' ? (current === 'index.html') : (file === current);
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
      window.addEventListener('scroll', () => { requestAnimationFrame(applyActive); }, { passive: true });
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
        };
        const toggleMenu = (e) => {
          e?.preventDefault?.();
          const isHidden = menu.classList.toggle('hidden');
          btn.setAttribute('aria-expanded', (!isHidden).toString());
          document.body.classList.toggle('overflow-hidden', !isHidden);
        };

        // Use capture so this runs before any bubbling handlers added inline;
        // then stop propagation to prevent double toggles.
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          // Some browsers support stopImmediatePropagation for extra safety
          if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
          toggleMenu(e);
        }, { capture: true });
        btn.addEventListener('keydown', (e) => {
          if ((e.key === 'Enter' || e.key === ' ') ) {
            toggleMenu(e);
          }
        });

        // Close on Escape
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') closeMenu();
        });

        // Close when clicking a link inside the menu
        menu.addEventListener('click', (e) => {
          const a = e.target.closest('a');
          if (a) closeMenu();
        });

        // Click-outside to close
        document.addEventListener('click', (e) => {
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

    // Modern, floating language selector (English / العربية / دری / پښتو)
  (function setupLanguageSelector() {
      const LANGS = [
        { code: 'en', label: 'English', short: 'EN', rtl: false },
        { code: 'ar', label: 'العربية', short: 'AR', rtl: true },
        { code: 'fa', label: 'دری', short: 'FA', rtl: true },
        { code: 'ps', label: 'پښتو', short: 'PS', rtl: true }
      ];
      function getLangFromPath() {
        try {
          const parts = location.pathname.split('/').filter(Boolean);
          const first = parts[0];
          if (first && ['ar','fa','ps'].includes(first)) return first;
          return null;
        } catch (_) { return null; }
      }
      const getLangFromUrl = () => {
        // Prefer path segment (/ar/, /fa/, /ps), fallback to ?lang
        const fromPath = getLangFromPath();
        if (fromPath) return fromPath;
        try { return new URLSearchParams(location.search).get('lang'); } catch (_) { return null; }
      };
      function getPathWithoutLang() {
        const parts = location.pathname.split('/');
        // Keep leading '' for root when splitting
        const filtered = parts.filter((p, idx) => {
          if (idx === 0) return true; // leading ''
          return !['ar','fa','ps'].includes(p) && p !== '';
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
          const existing = document.querySelector('head base[data-i18n-base]');
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
      function rewriteInternalLinks(_) {
        // No-op: we only decorate the visible URL via history API to avoid breaking static hosting
      }
      const setLangInUrl = (code) => {
        try {
          const pathWithout = getPathWithoutLang();
          const targetPath = (code && code !== 'en') ? `/${code}${pathWithout === '/index.html' ? '/' : pathWithout}` : pathWithout;
          const url = new URL(location.href);
          url.search = '';
          url.pathname = targetPath;
          history.replaceState(null, '', url.toString());
        } catch (_) {}
      };

  const getLang = () => getLangFromUrl() || localStorage.getItem('siteLang') || 'en';
      const findLang = (code) => LANGS.find(l => l.code === code) || LANGS[0];

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
        const name = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
        if (name === '' || name === 'index.html') return 'home';
        if (name.includes('library')) return 'library';
        if (name.includes('help')) return 'help';
        if (name.includes('donate')) return 'donate';
        if (name.includes('contact')) return 'contact';
        if (name.includes('all-infographics')) return 'all-infographics';
        if (name.includes('about')) return 'about';
        if (name.includes('services')) return 'services';
        if (name.includes('quran')) return 'quran';
        if (name.includes('media')) return 'media';
        if (name.includes('projects')) return 'projects';
        if (name.includes('introduction')) return 'introduction';
        if (name.includes('taleem-ai')) return 'taleem-ai';
        if (name.includes('deenshield-app')) return 'deenshield-app';
        if (name.includes('deensheild-extension')) return 'deensheild-extension';
        if (name.includes('deensheild')) return 'deensheild';
        return null;
      }
      async function fetchPageTranslations(pageKey, langCode) {
        if (!pageKey) return null;
        const key = `${pageKey}:${langCode}`;
        if (cache[key]) return cache[key];
        try {
      const res = await fetch(`/assets/Translations/${pageKey}/${langCode}.json`, { cache: 'no-cache' });
          if (!res.ok) return null;
          const data = await res.json();
          cache[key] = data;
          try { console.debug('[i18n] loaded', pageKey, langCode, data ? 'ok' : 'empty'); } catch (_) {}
          return data;
        } catch (e) { try { console.warn('[i18n] failed to load', pageKey, langCode, e); } catch(_){} return null; }
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
            { href: 'help.html', key: 'navHelp' },
            { href: 'contact.html', key: 'navContact' },
            { href: 'donate.html', key: 'navDonate' },
            { href: 'projects.html', key: 'navProjects' }
          ];
          navMap.forEach(item => {
            const link = document.querySelector(`nav a[href='${item.href}']`);
            if (link && t[item.key]) link.textContent = t[item.key];
          });
          // Mobile nav (if present)
          navMap.forEach(item => {
            const link = document.querySelector(`#mobile-menu a[href='${item.href}']`);
            if (link && t[item.key]) link.textContent = t[item.key];
          });
          // Footer slogan, if selector exists
          const footerSlogan = document.querySelector('footer p.mt-2');
          if (footerSlogan && t.footerSlogan) footerSlogan.textContent = t.footerSlogan;
        } catch (_) {}
      }

      async function applyLang(langCode) {
        const lang = findLang(langCode);
        try { localStorage.setItem('siteLang', lang.code); } catch (_) {}
        try {
          document.documentElement.setAttribute('lang', lang.code);
          document.documentElement.setAttribute('dir', lang.rtl ? 'rtl' : 'ltr');
          document.body && document.body.classList.toggle('rtl', !!lang.rtl);
        } catch (_) {}
        // Only fetch translation files for ar, fa, ps
        const pageKey = getPageKey();
        if (pageKey && (lang.code === 'ar' || lang.code === 'fa' || lang.code === 'ps')) {
          const t = await fetchPageTranslations(pageKey, lang.code);
          // Map common home keys to generic ones for consistent application
          let mapped = t ? { ...t } : {};
          if (pageKey === 'home') {
            if (!mapped.mainHeading && mapped.heroTitle) mapped.mainHeading = mapped.heroTitle;
            if (!mapped.mainSub && mapped.heroSubtitle) mapped.mainSub = mapped.heroSubtitle;
          }
          try { window.pageTranslations = mapped; } catch (_) {}
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
          try { window.pageTranslations = {}; } catch (_) {}
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
      }

      try {
        // Preserve any already-defined page-specific handler
        const existing = (typeof window.setLanguage === 'function') ? window.setLanguage : null;
        if (existing && existing !== applyLang) {
          window._pageSetLanguage = existing;
        }
        window.applySiteLanguage = applyLang;
        // Intercept future assignments: getter always returns core applyLang; setter stores page-specific in _pageSetLanguage
        Object.defineProperty(window, 'setLanguage', {
          configurable: true,
          get() { return applyLang; },
          set(fn) { if (typeof fn === 'function' && fn !== applyLang) window._pageSetLanguage = fn; }
        });
      } catch (_) {}

      // Determine initial language: honor explicit URL (/ar, /fa, /ps or ?lang) only.
      // Do NOT auto-switch to a stored preference when landing at root — English is default.
      const explicit = getLangFromUrl();
      const initialLang = explicit || 'en';
      // Ensure base and links are correct for initial load before applying
      ensureBaseForLangPrefix(initialLang);
      rewriteInternalLinks(initialLang);
      if (explicit && initialLang !== 'en') {
        // Only apply and rewrite URL when language is explicitly requested
        applyLang(initialLang);
      } else {
        // Keep default English at '/'
        reflectCurrentLangLabel(initialLang);
        // Do not rewrite URL to '/index.html' for English
      }

  // Inject floating button only if no page-level switcher is present
  const hasPageLangControl = !!document.getElementById('currentLang');
  // Disable floating language switcher for consistency across pages
  if (false && !hasPageLangControl && !document.getElementById('global-lang-switcher')) {
        const wrap = document.createElement('div');
        wrap.id = 'global-lang-switcher';
        wrap.setAttribute('aria-live', 'polite');
        wrap.style.position = 'fixed';
        wrap.style.top = '1.0rem';
        wrap.style.right = '1.0rem';
        wrap.style.zIndex = '9999';

        const btn = document.createElement('button');
        btn.id = 'global-lang-btn';
        btn.setAttribute('aria-haspopup', 'true');
        btn.setAttribute('aria-expanded', 'false');
        btn.title = 'Change language';
        Object.assign(btn.style, {
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '44px', height: '44px', borderRadius: '9999px', cursor: 'pointer',
          border: '1px solid rgba(212, 175, 55, 0.5)', background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(8px)', boxShadow: '0 6px 16px rgba(0,0,0,0.12)', color: '#0A2540', fontWeight: '700'
        });
  btn.textContent = findLang(initialLang).short;

        const menu = document.createElement('div');
        menu.id = 'global-lang-menu';
        menu.setAttribute('role', 'menu');
        Object.assign(menu.style, {
          position: 'absolute', top: '56px', right: '0', minWidth: '160px', padding: '6px',
          borderRadius: '12px', border: '1px solid rgba(212,175,55,0.4)', background: 'rgba(255,255,255,0.98)',
          boxShadow: '0 12px 24px rgba(0,0,0,0.12)', display: 'none'
        });

        LANGS.forEach(l => {
          const item = document.createElement('button');
          item.type = 'button';
          item.setAttribute('role', 'menuitem');
          item.dataset.lang = l.code;
          Object.assign(item.style, {
            display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between',
            gap: '8px', padding: '8px 10px', borderRadius: '8px', border: 'none', background: 'transparent',
            cursor: 'pointer', color: '#0A2540', fontWeight: '600'
          });
          item.innerHTML = `<span>${l.label}</span><span style="opacity:.7;font-size:12px;">${l.short}</span>`;
          item.addEventListener('click', (e) => {
            e.preventDefault();
            applyLang(l.code);
            menu.style.display = 'none';
            btn.setAttribute('aria-expanded', 'false');
          });
          item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              item.click();
            }
          });
          item.addEventListener('mouseenter', () => { item.style.background = 'rgba(212,175,55,0.08)'; });
          item.addEventListener('mouseleave', () => { item.style.background = 'transparent'; });
          menu.appendChild(item);
        });

        function toggleMenu(show) {
          const want = typeof show === 'boolean' ? show : (menu.style.display === 'none');
          menu.style.display = want ? 'block' : 'none';
          btn.setAttribute('aria-expanded', want ? 'true' : 'false');
        }

        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleMenu();
        }, { capture: true });
        document.addEventListener('click', (e) => { if (!wrap.contains(e.target)) toggleMenu(false); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') toggleMenu(false); });

        wrap.appendChild(btn);
        wrap.appendChild(menu);
        document.body.appendChild(wrap);
      }
    })();

    // Universal header language dropdown toggle (binds once; coexists with differing class patterns)
    try {
      const langBtn = document.getElementById('langSwitcherBtn');
      const langDropdown = document.getElementById('langDropdown');
      if (langBtn && langDropdown && !langBtn.dataset.bound) {
        const toggle = (e) => {
          e?.stopPropagation?.();
          // Support two patterns: hidden vs. opacity/pointer-events
          if (langDropdown.classList.contains('hidden')) {
            langDropdown.classList.toggle('hidden');
          } else {
            const expanded = langDropdown.classList.contains('opacity-100');
            langDropdown.classList.toggle('opacity-0');
            langDropdown.classList.toggle('pointer-events-none');
            langDropdown.classList.toggle('opacity-100');
            langDropdown.classList.toggle('pointer-events-auto');
            langBtn.setAttribute('aria-expanded', (!expanded).toString());
          }
        };
        langBtn.addEventListener('click', toggle, { capture: true });
        document.addEventListener('click', (e) => {
          if (!langBtn.contains(e.target)) {
            if (langDropdown.classList.contains('hidden')) return;
            langDropdown.classList.add('opacity-0');
            langDropdown.classList.add('pointer-events-none');
            langDropdown.classList.remove('opacity-100');
            langDropdown.classList.remove('pointer-events-auto');
            langDropdown.classList.add('hidden');
            langBtn.setAttribute('aria-expanded', 'false');
          }
        });
        langBtn.dataset.bound = 'true';
      }
    } catch(_) {}

  });
})();
