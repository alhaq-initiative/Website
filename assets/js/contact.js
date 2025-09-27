// Extracted behaviors from contact.html
(function(){
  'use strict';

  // (Removed duplicate mobile menu logic – handled globally in site.js)

  function initFeedbackModal() {
    const feedbackBtn = document.getElementById('feedback-btn');
    const feedbackModal = document.getElementById('feedback-modal');
    const closeFeedback = document.getElementById('close-feedback');
    if (!feedbackBtn || !feedbackModal || !closeFeedback) return;
    feedbackBtn.addEventListener('click', () => feedbackModal.classList.remove('hidden'));
    closeFeedback.addEventListener('click', () => feedbackModal.classList.add('hidden'));
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') feedbackModal.classList.add('hidden'); });
  }

  // Contact form submission handled globally in site.js (unified Logic App handler).
  function initContactForm() { /* no-op: legacy hook retained for backward compatibility */ }

  // Page-specific translations hook used by core site.js
  window._pageSetLanguage = function(lang) {
    if (lang !== 'ar' && lang !== 'fa' && lang !== 'ps') return;
    const t = Object.assign({}, window.pageTranslations || {});
    if (t.title) document.title = t.title;
    const h1 = document.querySelector('h1'); if (h1 && t.mainHeading) h1.textContent = t.mainHeading;
    const mainSub = document.querySelector('p.text-lg'); if (mainSub && t.mainSub) mainSub.textContent = t.mainSub;
    const nameLabel = document.querySelector("label[for='name']"); if (nameLabel && t.formName) nameLabel.textContent = t.formName;
    const emailLabel = document.querySelector("label[for='email']"); if (emailLabel && t.formEmail) emailLabel.textContent = t.formEmail;
    const messageLabel = document.querySelector("label[for='message']"); if (messageLabel && t.formMessage) messageLabel.textContent = t.formMessage;
    const submitBtn = document.querySelector("button[type='submit']"); if (submitBtn && t.formSubmit) submitBtn.textContent = t.formSubmit;
    const footerSlogan = document.querySelector('footer p.mt-2'); if (footerSlogan && t.footerSlogan) footerSlogan.textContent = t.footerSlogan;
    const donateCta = document.querySelector("header a[href='donate.html']"); if (donateCta && t.navDonate) donateCta.textContent = t.navDonate;
    const librarySection = document.querySelector('footer section.bg-white');
    if (librarySection) {
      const libHeading = librarySection.querySelector('h2'); if (libHeading && t.exploreLibraryTitle) libHeading.textContent = t.exploreLibraryTitle;
      const quranLink = librarySection.querySelector("a[href='quran.html']"); if (quranLink && t.linkQuranHub) quranLink.textContent = t.linkQuranHub;
      const linksHash = librarySection.querySelectorAll("a[href='#']");
      if (linksHash[0] && t.linkHadith) linksHash[0].textContent = t.linkHadith;
      const mediaLink = librarySection.querySelector("a[href='media.html']"); if (mediaLink && t.linkMedia) mediaLink.textContent = t.linkMedia;
      if (linksHash[1] && t.linkArticles) linksHash[1].textContent = t.linkArticles;
      if (linksHash[2] && t.linkBooks) linksHash[2].textContent = t.linkBooks;
      const infoLink = librarySection.querySelector("a[href='all-infographics.html']"); if (infoLink && t.linkInfographics) infoLink.textContent = t.linkInfographics;
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
  // mobile menu handled globally
    initFeedbackModal();
  initContactForm(); // intentionally empty – unified handler in site.js
  });
})();
