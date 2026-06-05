// Extracted scripts from index.html - home page behaviors
(function () {
  'use strict';

  // IntersectionObserver for fade-in sections
  function initFadeInSections() {
    const sections = document.querySelectorAll('.fade-in-section');
    if (!('IntersectionObserver' in window) || sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    sections.forEach(section => observer.observe(section));
  }

  // Feedback modal logic (if present)
  function initFeedbackModal() {
    const openBtn =
      document.getElementById('feedback-btn') ||
      document.getElementById('openFeedbackModal');
    const closeBtn =
      document.getElementById('close-feedback') ||
      document.getElementById('closeFeedbackModal');
    const modal =
      document.getElementById('feedback-modal') ||
      document.getElementById('feedbackModal');

    if (!modal) return; // Modal not present on this page

    function open() {
      modal.classList.remove('hidden');
      document.body.classList.add('overflow-hidden');
      modal.classList.add('opacity-100');
    }

    function close() {
      modal.classList.remove('opacity-100');
      modal.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
    }

    openBtn && openBtn.addEventListener('click', open);
    closeBtn && closeBtn.addEventListener('click', close);
    modal.addEventListener('click', e => {
      if (e.target === modal) close();
    });
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape') close();
    });
  }

  // Simple audio player UI for hero recitation (if present)
  function initHeroAudio() {
    const audio = document.querySelector('#heroRecitation');
    const playBtn = document.querySelector('#heroPlayButton');
    const progress = document.querySelector('#heroProgress');
    const timeLabel = document.querySelector('#heroTime');

    if (!audio || !playBtn) return;

    playBtn.addEventListener('click', () => {
      if (audio.paused) {
        audio.play();
      } else {
        audio.pause();
      }
    });

    audio.addEventListener('play', () =>
      playBtn.setAttribute('data-state', 'playing')
    );
    audio.addEventListener('pause', () =>
      playBtn.setAttribute('data-state', 'paused')
    );

    audio.addEventListener('timeupdate', () => {
      if (progress) {
        const pct = (audio.currentTime / (audio.duration || 1)) * 100;
        progress.style.width = pct + '%';
      }
      if (timeLabel) {
        const m = Math.floor(audio.currentTime / 60);
        const s = Math.floor(audio.currentTime % 60)
          .toString()
          .padStart(2, '0');
        timeLabel.textContent = `${m}:${s}`;
      }
    });

    audio.addEventListener('ended', () => {
      if (progress) progress.style.width = '0%';
      if (timeLabel) timeLabel.textContent = '0:00';
      playBtn.setAttribute('data-state', 'paused');
    });
  }

  // Page-specific i18n hook used by core site.js to apply translations on Home
  window._pageSetLanguage = function (lang, dir) {
    // Apply detailed translations as previously defined inline in index.html
    if (lang === 'fa' || lang === 'ar' || lang === 'ps') {
      const t = Object.assign({}, window.pageTranslations || {});
      if (t.title) document.title = t.title;
      // Hero Section
      const heroH1 = document.querySelector('.hero-bg h1');
      if (heroH1 && t.heroTitle) heroH1.textContent = t.heroTitle;
      const heroP = document.querySelector('.hero-bg p');
      if (heroP && t.heroSubtitle) heroP.textContent = t.heroSubtitle;
      // About Section
      const aboutH2 = document.querySelector('#about h2');
      if (aboutH2 && t.missionTitle) aboutH2.textContent = t.missionTitle;
      const aboutP = document.querySelector('#about p');
      if (aboutP && t.missionText) aboutP.textContent = t.missionText;
      // Services Section
      const servicesH2 = document.querySelector('#services h2');
      if (servicesH2 && t.servicesTitle)
        servicesH2.textContent = t.servicesTitle;
      const serviceCards = document.querySelectorAll('#services .glass-card');
      if (serviceCards[0]) {
        const h3 = serviceCards[0].querySelector('h3');
        if (h3 && t.quranhub_Title) h3.textContent = t.quranhub_Title;
        const p = serviceCards[0].querySelector('p');
        if (p && t.quranhub_Description) p.textContent = t.quranhub_Description;
        const quranhubFeatures = serviceCards[0].querySelectorAll('li');
        if (quranhubFeatures[0] && t.quranhub_Feature1)
          quranhubFeatures[0].textContent = t.quranhub_Feature1;
        if (quranhubFeatures[1] && t.quranhub_Feature2)
          quranhubFeatures[1].textContent = t.quranhub_Feature2;
        if (quranhubFeatures[2] && t.quranhub_Feature3)
          quranhubFeatures[2].textContent = t.quranhub_Feature3;
        if (quranhubFeatures[3] && t.quranhub_Feature4)
          quranhubFeatures[3].textContent = t.quranhub_Feature4;
      }
      if (serviceCards[1]) {
        const h3 = serviceCards[1].querySelector('h3');
        if (h3 && t.libraryTitle) h3.textContent = t.libraryTitle;
        const p = serviceCards[1].querySelector('p');
        if (p && t.libraryDescription) p.textContent = t.libraryDescription;
        const libraryFeatures = serviceCards[1].querySelectorAll('li');
        if (libraryFeatures[0] && t.libraryFeature1)
          libraryFeatures[0].textContent = t.libraryFeature1;
        if (libraryFeatures[1] && t.libraryFeature2)
          libraryFeatures[1].textContent = t.libraryFeature2;
        if (libraryFeatures[2] && t.libraryFeature3)
          libraryFeatures[2].textContent = t.libraryFeature3;
      }
      if (serviceCards[2]) {
        const h3 = serviceCards[2].querySelector('h3');
        if (h3 && t.customAppsTitle) h3.textContent = t.customAppsTitle;
        const p = serviceCards[2].querySelector('p');
        if (p && t.customAppsDescription)
          p.textContent = t.customAppsDescription;
      }
      // Support Section
      const supportH2 = document.querySelector('#support h2');
      if (supportH2 && t.supportTitle) supportH2.textContent = t.supportTitle;
      const supportP = document.querySelector('#support p');
      if (supportP && t.supportText) supportP.textContent = t.supportText;
      const supportA = document.querySelector('#support a');
      if (supportA && t.supportButton)
        supportA.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 21C12 21 7 16.5 7 12.5C7 9.5 9.5 7 12 7C14.5 7 17 9.5 17 12.5C17 16.5 12 21 12 21Z" /></svg>${t.supportButton}`;
      // Footer
      const footerTitle = document.querySelector('footer h3');
      if (footerTitle && t.footerTitle) footerTitle.textContent = t.footerTitle;
      const footerSlogan = document.querySelector('footer p.mt-2');
      if (footerSlogan && t.footerSlogan)
        footerSlogan.textContent = t.footerSlogan;
      // Feedback Button and Modal
      const feedbackBtn = document.getElementById('feedback-btn');
      if (feedbackBtn && t.feedbackButton)
        feedbackBtn.textContent = t.feedbackButton;
      const feedbackModalTitle = document
        .getElementById('feedback-modal')
        ?.querySelector('h2');
      if (feedbackModalTitle && t.feedbackModalTitle)
        feedbackModalTitle.textContent = t.feedbackModalTitle;
      const formInputs = document.getElementById('contact-form')?.elements;
      if (formInputs) {
        if (formInputs.Name && t.feedbackNamePlaceholder)
          formInputs.Name.placeholder = t.feedbackNamePlaceholder;
        if (formInputs.Email && t.feedbackEmailPlaceholder)
          formInputs.Email.placeholder = t.feedbackEmailPlaceholder;
        if (formInputs.Message && t.feedbackMessagePlaceholder)
          formInputs.Message.placeholder = t.feedbackMessagePlaceholder;
        if (formInputs[3] && t.feedbackSendButton)
          formInputs[3].textContent = t.feedbackSendButton;
      }
    }

    // Also toggle RTL-specific classes on key containers if needed
    document.querySelectorAll('[data-rtl-aware]').forEach(el => {
      if (dir === 'rtl') el.classList.add('text-right');
      else el.classList.remove('text-right');
    });
  };

  // Init on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    initFadeInSections();
    initFeedbackModal();
    initHeroAudio();
  });
})();
