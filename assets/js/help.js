// Extracted behaviors from help.html
(function () {
  'use strict';

  // (Removed duplicate mobile menu logic – handled globally in site.js)

  // Page-specific translations hook used by core site.js
  window._pageSetLanguage = function (lang) {
    if (lang !== 'ar' && lang !== 'fa' && lang !== 'ps') return;
    const t = Object.assign({}, window.pageTranslations || {});
    if (t.title) document.title = t.title;
    const h1 = document.querySelector('h1');
    if (h1 && t.mainHeading) h1.textContent = t.mainHeading;
    const mainSub = document.querySelector('p.text-lg');
    if (mainSub && t.mainSub) mainSub.textContent = t.mainSub;
    const footerSlogan = document.querySelector('footer p.mt-2');
    if (footerSlogan && t.footerSlogan)
      footerSlogan.textContent = t.footerSlogan;
    const contactCta = document.querySelector("header a[href='contact.html']");
    if (contactCta && t.navContact) contactCta.textContent = t.navContact;
    const donateCta = document.querySelector("header a[href='donate.html']");
    if (donateCta && t.navDonate) donateCta.textContent = t.navDonate;

    // Rebuild FAQ list if structured data provided
    if (Array.isArray(t.faqCategories)) {
      const card = document.querySelector('.glass-card');
      if (card) {
        card.innerHTML = '';
        const h2 = document.createElement('h2');
        h2.id = 'faqHeading';
        h2.className = 'text-2xl font-bold text-brand-blue mb-4';
        h2.textContent = t.mainHeading || 'FAQ';
        card.appendChild(h2);
        t.faqCategories.forEach(cat => {
          const h3 = document.createElement('h3');
          h3.className = 'text-xl font-bold text-brand-blue mt-6 mb-2';
          h3.textContent = cat.category;
          card.appendChild(h3);
          (cat.items || []).forEach(it => {
            const wrap = document.createElement('div');
            wrap.className = 'mb-4 faq-item';
            const q = document.createElement('h4');
            q.className = 'font-semibold text-brand-blue faq-q';
            q.textContent = it.q;
            const a = document.createElement('p');
            a.className = 'text-gray-700 faq-a';
            a.innerHTML = it.a;
            wrap.appendChild(q);
            wrap.appendChild(a);
            card.appendChild(wrap);
          });
        });
        const sb = document.createElement('div');
        sb.className =
          'mt-8 p-4 bg-yellow-50 border-l-4 border-brand-gold rounded-lg flex flex-col items-start';
        const sbh = document.createElement('h3');
        sbh.className = 'text-lg font-bold text-brand-blue mb-2';
        sbh.textContent = t.supportNotFound || "Haven't found your answer?";
        const sbp = document.createElement('p');
        sbp.className = 'text-gray-700 mb-2';
        sbp.textContent =
          t.supportStillNeed ||
          'Still need help? Find answers to your questions here and get help if needed.';
        const sba = document.createElement('a');
        sba.href = 'contact.html';
        sba.className =
          'inline-block bg-brand-gold text-white font-bold py-2 px-4 rounded hover:bg-yellow-600 transition';
        sba.textContent = t.supportContact || 'Contact Us for Support';
        sb.appendChild(sbh);
        sb.appendChild(sbp);
        sb.appendChild(sba);
        card.appendChild(sb);
      }
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    /* global nav handles menu */
  });
})();
