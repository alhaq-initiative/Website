// Extracted behaviors from contact.html
(function(){
  'use strict';

  function initMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if (!mobileMenuButton || !mobileMenu) return;
    mobileMenuButton.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
  }

  function initFeedbackModal() {
    const feedbackBtn = document.getElementById('feedback-btn');
    const feedbackModal = document.getElementById('feedback-modal');
    const closeFeedback = document.getElementById('close-feedback');
    if (!feedbackBtn || !feedbackModal || !closeFeedback) return;
    feedbackBtn.addEventListener('click', () => feedbackModal.classList.remove('hidden'));
    closeFeedback.addEventListener('click', () => feedbackModal.classList.add('hidden'));
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') feedbackModal.classList.add('hidden'); });
  }

  function initContactForm() {
    const form = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    if (!form) return;
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (formStatus) { formStatus.textContent = 'Sending...'; formStatus.style.color = 'gray'; }
      const name = document.getElementById('name')?.value || '';
      const email = document.getElementById('email')?.value || '';
      const message = document.getElementById('message')?.value || '';
      const logicAppUrl = "https://prod-10.ukwest.logic.azure.com/workflows/2a3b358e4c614e2aaeb81efadcf9fa42/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=wvDTY-sb321VZ3q7R88UL5zGCYkJMBpU-X_MfNnnEqg";
      try {
        const response = await fetch(logicAppUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, message }),
        });
        if (response.ok) {
          if (formStatus) { formStatus.textContent = 'Feedback submitted successfully.'; formStatus.style.color = 'green'; }
          form.reset();
        } else {
          if (formStatus) { formStatus.textContent = 'Submission failed. Please check your Logic App configuration.'; formStatus.style.color = 'red'; }
        }
      } catch (error) {
        console.error('Error:', error);
        if (formStatus) { formStatus.textContent = 'An unexpected error occurred. Please try again later.'; formStatus.style.color = 'red'; }
      }
    });
  }

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
    initMobileMenu();
    initFeedbackModal();
    initContactForm();
  });
})();
