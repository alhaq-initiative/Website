/* Alhaq Digital Services - Main JavaScript */

// Mobile menu functionality
function initializeMobileMenu() {
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
      const isHidden = mobileMenu.classList.contains('hidden');
      mobileMenu.classList.toggle('hidden');
      
      // Update aria-expanded for accessibility
      mobileMenuButton.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
      
      // Update button title for screen readers
      mobileMenuButton.setAttribute('title', isHidden ? 'Close mobile menu' : 'Open mobile menu');
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!mobileMenuButton.contains(e.target) && !mobileMenu.contains(e.target)) {
        mobileMenu.classList.add('hidden');
        mobileMenuButton.setAttribute('aria-expanded', 'false');
        mobileMenuButton.setAttribute('title', 'Open mobile menu');
      }
    });

    // Close mobile menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
        mobileMenuButton.setAttribute('aria-expanded', 'false');
        mobileMenuButton.setAttribute('title', 'Open mobile menu');
        mobileMenuButton.focus(); // Return focus to button
      }
    });
  }
}

// Fade-in animations on scroll
function initializeFadeInAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, {
    threshold: 0.1
  });

  const sections = document.querySelectorAll('.fade-in-section');
  sections.forEach(section => {
    observer.observe(section);
  });
}

// Feedback modal functionality
function initializeFeedbackModal() {
  const feedbackBtn = document.getElementById('feedback-btn');
  const feedbackModal = document.getElementById('feedback-modal');
  const closeFeedback = document.getElementById('close-feedback');

  if (feedbackBtn && feedbackModal && closeFeedback) {
    feedbackBtn.addEventListener('click', () => feedbackModal.classList.remove('hidden'));
    closeFeedback.addEventListener('click', () => feedbackModal.classList.add('hidden'));
    
    // Close modal on escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        feedbackModal.classList.add('hidden');
      }
    });

    // Close modal when clicking outside
    feedbackModal.addEventListener('click', (e) => {
      if (e.target === feedbackModal) {
        feedbackModal.classList.add('hidden');
      }
    });
  }
}

// Dynamic tab highlighting for navigation
function highlightTabs() {
  const navLinks = document.querySelectorAll('nav a');
  const mobileLinks = document.querySelectorAll('#mobile-menu a');
  const currentPath = window.location.pathname.split('/').pop();
  const hash = window.location.hash.replace('#', '');
  
  // Section IDs for scroll-based highlighting
  const sectionIds = ['about', 'services'];
  let activeSection = null;
  
  // Check if a section is in view
  sectionIds.forEach(id => {
    const section = document.getElementById(id);
    if (section) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 80 && rect.bottom > 80) {
        activeSection = id;
      }
    }
  });

  // Helper function to update link highlighting
  function updateLinkHighlighting(links) {
    links.forEach(link => {
      link.classList.remove('active-tab', 'text-brand-gold');
      
      // Highlight by section scroll
      if (activeSection && link.getAttribute('href') === `#${activeSection}`) {
        link.classList.add('active-tab', 'text-brand-gold');
      }
      // Highlight by hash navigation
      else if (hash && link.getAttribute('href') === `#${hash}`) {
        link.classList.add('active-tab', 'text-brand-gold');
      }
      // Highlight by page navigation
      else if (!activeSection && !hash && (
        link.getAttribute('href') === currentPath || 
        (link.getAttribute('href') === 'index.html' && (currentPath === '' || currentPath === 'index.html'))
      )) {
        link.classList.add('active-tab', 'text-brand-gold');
      }
    });
  }

  updateLinkHighlighting(navLinks);
  updateLinkHighlighting(mobileLinks);
}

// Language switcher functionality
function initializeLanguageSwitcher() {
  const langBtn = document.getElementById('langSwitcherBtn');
  const langDropdown = document.getElementById('langDropdown');
  
  if (langBtn && langDropdown) {
    langBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      langDropdown.classList.toggle('hidden');
      langBtn.setAttribute('aria-expanded', langDropdown.classList.contains('hidden') ? 'false' : 'true');
    });
    
    document.addEventListener('click', function(e) {
      if (!langBtn.contains(e.target)) {
        langDropdown.classList.add('hidden');
        langBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }
}

// Multi-language translations
const translations = {
  fa: {
    title: 'خدمات دیجیتال الحق',
    navHome: 'صفحه اصلی',
    navAbout: 'درباره ما',
    navServices: 'خدمات',
    navTaleemAI: 'تعلیم AI',
    navLibrary: 'کتابخانه',
    navHelp: 'راهنما و سوالات متداول',
    navContact: 'تماس با ما',
    navDonate: 'حمایت مالی',
    heroTitle: 'ساختن آینده دیجیتال، ریشه در ایمان',
    heroSubtitle: 'خدمات دیجیتال الحق (ADS) از فناوری برای ایجاد ابزارهای معناداری استفاده می‌کند که ارتباط ما را با دین غنی می‌سازد.',
    missionTitle: 'ماموریت ما',
    missionText: 'در خدمات دیجیتال الحق (ADS)، ماموریت ما ادغام فناوری پیشرفته با حکمت بی‌پایان دین ماست. ما به توسعه راه‌حل‌های دیجیتال نوآورانه متعهد هستیم که نه تنها از نظر فناوری پیشرفته، بلکه از نظر معنوی نیز غنی‌کننده باشند و به کاربران در تعمیق دانش و عمل به اسلام در دنیای مدرن کمک کنند.',
    currentLang: 'دری'
  },
  ar: {
    title: 'خدمات الحق الرقمية',
    navHome: 'الرئيسية',
    navAbout: 'من نحن',
    navServices: 'الخدمات',
    navTaleemAI: 'تعليم AI',
    navLibrary: 'المكتبة',
    navHelp: 'المساعدة والأسئلة الشائعة',
    navContact: 'اتصل بنا',
    navDonate: 'تبرع',
    heroTitle: 'نبني مستقبلاً رقمياً متجذراً في الإيمان',
    heroSubtitle: 'تستخدم خدمات الحق الرقمية (ADS) التكنولوجيا لإنشاء أدوات هادفة تعزز ارتباطنا بالدين.',
    missionTitle: 'مهمتنا',
    missionText: 'في خدمات الحق الرقمية (ADS)، مهمتنا هي دمج التكنولوجيا المتقدمة مع الحكمة الدينية الخالدة. نحن ملتزمون بتطوير حلول رقمية مبتكرة تثري المستخدمين روحياً وتقنياً وتساعدهم على تعميق معرفتهم وممارستهم للإسلام في العصر الحديث.',
    currentLang: 'العربية'
  }
};

// Set language function
function setLanguage(lang) {
  const currentLang = document.getElementById('currentLang');
  if (currentLang) {
    if (lang === 'fa') {currentLang.textContent = 'دری';}
    else if (lang === 'ar') {currentLang.textContent = 'العربية';}
    else {currentLang.textContent = 'English';}
  }

  if (lang === 'fa' || lang === 'ar') {
    const t = translations[lang];
    if (!t) {return;}

    // Update page title
    if (t.title) {document.title = t.title;}

    // Update navigation links
    const navLinks = [
      { href: 'index.html', key: 'navHome' },
      { href: '#about', key: 'navAbout' },
      { href: 'taleem-ai.html', key: 'navTaleemAI' },
      { href: 'library.html', key: 'navLibrary' },
      { href: 'help.html', key: 'navHelp' },
      { href: 'contact.html', key: 'navContact' },
      { href: 'donate.html', key: 'navDonate' }
    ];

    navLinks.forEach(item => {
      // Desktop navigation
      let link = document.querySelector(`nav a[href='${item.href}']`);
      if (link && t[item.key]) {link.textContent = t[item.key];}
      
      // Mobile navigation
      link = document.querySelector(`#mobile-menu a[href='${item.href}']`);
      if (link && t[item.key]) {link.textContent = t[item.key];}
    });

    // Update hero section
    const heroH1 = document.querySelector('.hero-bg h1');
    if (heroH1 && t.heroTitle) {heroH1.textContent = t.heroTitle;}
    
    const heroP = document.querySelector('.hero-bg p');
    if (heroP && t.heroSubtitle) {heroP.textContent = t.heroSubtitle;}

    // Update about section
    const aboutH2 = document.querySelector('#about h2');
    if (aboutH2 && t.missionTitle) {aboutH2.textContent = t.missionTitle;}
    
    const aboutP = document.querySelector('#about p');
    if (aboutP && t.missionText) {aboutP.textContent = t.missionText;}
  } else {
    // Reload for English
    location.reload();
  }
}

// Initialize all functionality when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  initializeMobileMenu();
  initializeFadeInAnimations();
  initializeFeedbackModal();
  initializeLanguageSwitcher();
  highlightTabs();
});

// Update tab highlighting on scroll and navigation
window.addEventListener('scroll', highlightTabs);
window.addEventListener('hashchange', highlightTabs);
window.addEventListener('popstate', highlightTabs);

// Make setLanguage available globally for onclick handlers
window.setLanguage = setLanguage;