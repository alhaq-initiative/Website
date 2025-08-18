// Extracted About page behavior: mobile menu toggle
(function(){
  'use strict';
  document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('mobile-menu-button');
    const menu = document.getElementById('mobile-menu');
    if (btn && menu) {
      btn.addEventListener('click', function () {
        const isHidden = menu.classList.toggle('hidden');
        btn.setAttribute('aria-expanded', (!isHidden).toString());
      });
    }
  });

  // Page-specific i18n hook (optional minimal mapping)
  window._pageSetLanguage = window._pageSetLanguage || function(lang) {
    if (lang !== 'ar' && lang !== 'fa' && lang !== 'ps') return;
    const t = Object.assign({}, window.pageTranslations || {});
    if (t.title) document.title = t.title;
  };
})();
