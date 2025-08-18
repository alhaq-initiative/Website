// Extracted SPA navigation logic from deenshield/main.html inline script
// SPA navigation logic with URL hash support + ARIA states
(function() {
  const sections = document.querySelectorAll('#product-sections > section');
  const buttons = document.querySelectorAll('.product-nav-btn');
  const productKeys = new Set(['webapp','mobile','extension','manager','desktop']);
  // Map tabs to their controlled sections for accessibility
  buttons.forEach(btn => {
    const product = btn.getAttribute('data-product');
    const controlsId = product === 'home' ? 'ecosystem-overview' : `${product}-section`;
    btn.setAttribute('aria-controls', controlsId);
  });

  function showSection(key) {
    sections.forEach(sec => sec.classList.add('hidden-section'));
    const target = document.getElementById(key + '-section');
    if (target) target.classList.remove('hidden-section');
    buttons.forEach(b => b.classList.remove('border-brand-gold'));
    const activeBtn = document.querySelector(`.product-nav-btn[data-product="${key}"]`);
    if (activeBtn) {
      activeBtn.classList.add('border-brand-gold');
    }
    // Update ARIA state
    buttons.forEach(b => b.setAttribute('aria-selected', 'false'));
    if (activeBtn) activeBtn.setAttribute('aria-selected', 'true');
  }

  function showFromHash() {
    const hash = (window.location.hash || '').replace('#','').toLowerCase();
    const overview = document.getElementById('ecosystem-overview');
    const homeBtns = document.querySelectorAll('.product-nav-btn[data-product="home"]');
    if (hash && hash !== 'home' && productKeys.has(hash)) {
      // show product section
      if (overview) overview.style.display = 'none';
      showSection(hash);
      homeBtns.forEach(b => b.classList.remove('border-brand-gold'));
      homeBtns.forEach(b => b.setAttribute('aria-selected', 'false'));
    } else {
      // show overview as home
      if (overview) overview.style.display = '';
      sections.forEach(sec => sec.classList.add('hidden-section'));
      buttons.forEach(b => { b.classList.remove('border-brand-gold'); b.setAttribute('aria-selected','false'); });
      homeBtns.forEach(b => { b.classList.add('border-brand-gold'); b.setAttribute('aria-selected','true'); });
    }
  }

  // Wire up clicks: update URL hash and show section
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const product = btn.getAttribute('data-product');
      if (product === 'home') {
        // Clear hash to represent home
        if (window.location.hash) {
          history.pushState('', document.title, window.location.pathname + window.location.search);
        }
        showFromHash();
        return;
      }
      if (!productKeys.has(product)) return;
      if (window.location.hash !== '#' + product) {
        window.location.hash = product; // triggers hashchange
      } else {
        // Immediate feedback if same hash
        showFromHash();
      }
    });
  });

  // React to back/forward navigation
  window.addEventListener('hashchange', showFromHash);

  // Initial state from URL (fallback to webapp)
  showFromHash();
})();
