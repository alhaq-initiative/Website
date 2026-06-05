'use strict';
// Library page JS: dropdowns, mobile menu, and page-specific i18n hook
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    // Infographics dropdown toggle
    const infBtn = document.getElementById('infographicsDropdownBtn');
    const infMenu = document.getElementById('infographicsDropdownMenu');
    if (infBtn && infMenu) {
      const close = () => infMenu.classList.add('hidden');
      infBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        const isHidden = infMenu.classList.toggle('hidden');
        infBtn.setAttribute('aria-expanded', (!isHidden).toString());
      });
      document.addEventListener('click', function (e) {
        if (!infBtn.contains(e.target)) close();
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') close();
      });
    }

    // (Removed duplicate mobile menu logic – handled globally in site.js)
  });

  // Page-specific language hook used by core site.js
  window._pageSetLanguage = function (lang) {
    if (lang !== 'ar' && lang !== 'fa' && lang !== 'ps') return;
    const t = Object.assign({}, window.pageTranslations || {});
    if (t.title) document.title = t.title;

    // Main heading and sub
    const h1 = document.querySelector('h1');
    if (h1 && t.mainHeading) h1.textContent = t.mainHeading;
    const mainSub = document.querySelector('p.text-lg');
    if (mainSub && t.mainSub) mainSub.textContent = t.mainSub;

    // Cards (Quran, Hadith, Articles, Books, Infographics)
    const cardTitles = [t.quran, t.hadith, t.articles, t.books, t.infographics];
    const cardDescs = [
      t.quranDesc,
      t.hadithDesc,
      t.articlesDesc,
      t.booksDesc,
      t.infographicsDesc,
    ];
    const cardLinks = [t.view, t.view, t.view, t.view, t.view];
    document.querySelectorAll('.grid .bg-white h2').forEach((el, i) => {
      if (cardTitles[i]) el.textContent = cardTitles[i];
    });
    document.querySelectorAll('.grid .bg-white p').forEach((el, i) => {
      if (cardDescs[i]) el.textContent = cardDescs[i];
    });
    document.querySelectorAll('.grid .bg-white a').forEach((el, i) => {
      if (cardLinks[i]) el.textContent = cardLinks[i];
    });

    // Infographics dropdown button label
    const ib = document.getElementById('infographicsDropdownBtn');
    if (ib && t.infographics) {
      try {
        ib.childNodes[0].nodeValue = t.infographics;
      } catch (_) {}
    }

    // Footer slogan
    const footerSlogan = document.querySelector('footer p.mt-2');
    if (footerSlogan && t.footerSlogan)
      footerSlogan.textContent = t.footerSlogan;
  };
})();
