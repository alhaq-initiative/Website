(function(){
  'use strict';
  document.addEventListener('DOMContentLoaded', function () {
    // Feedback modal logic
    const feedbackBtn = document.getElementById('feedback-btn');
    const feedbackModal = document.getElementById('feedback-modal');
    const closeFeedback = document.getElementById('close-feedback');
    if (feedbackBtn && feedbackModal) {
      feedbackBtn.addEventListener('click', () => feedbackModal.classList.remove('hidden'));
      if (closeFeedback) closeFeedback.addEventListener('click', () => feedbackModal.classList.add('hidden'));
      window.addEventListener('keydown', (e) => { if (e.key === 'Escape') feedbackModal.classList.add('hidden'); });
    }

    // (Removed duplicate mobile menu toggle – handled globally in site.js)
  });

  // Page-specific translations hook used by core site.js
  window._pageSetLanguage = function(lang) {
    if (lang !== 'ar' && lang !== 'fa' && lang !== 'ps') return;
    const t = Object.assign({}, window.pageTranslations || {});
    if (t.title) document.title = t.title;
    const h1 = document.querySelector('h1'); if (h1 && t.mainHeading) h1.textContent = t.mainHeading;
    const mainSub = document.querySelector('p.text-lg'); if (mainSub && t.mainSub) mainSub.textContent = t.mainSub;
    const footerSlogan = document.querySelector('footer p.mt-2'); if (footerSlogan && t.footerSlogan) footerSlogan.textContent = t.footerSlogan;
    const libHeading = document.querySelector('section.bg-white h2'); if (libHeading && t.visitLibrary) libHeading.textContent = t.visitLibrary;
    const stripeBtn = document.querySelector('a[href*="buy.stripe.com"]'); if (stripeBtn && t.navDonate) stripeBtn.textContent = t.navDonate;
  };
})();
