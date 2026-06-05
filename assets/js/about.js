// About page: only retains page-specific i18n hook; global nav & mobile menu handled by site.js
(function () {
  'use strict';
  window._pageSetLanguage =
    window._pageSetLanguage ||
    function (lang) {
      if (lang !== 'ar' && lang !== 'fa' && lang !== 'ps') return;
      const t = Object.assign({}, window.pageTranslations || {});
      if (t.title) document.title = t.title;
    };
})();
