// Injects a compact product tab bar near the footer if an element with id product-tab-mount exists.
(function() {
  const PRODUCTS = [
    { key: 'home', label: 'Home', icon: 'fa-home', href: '/deenshield/main.html' },
    { key: 'webapp', label: 'Web App', icon: 'fa-desktop', href: '/deenshield/main.html#webapp' },
    { key: 'mobile', label: 'Mobile', icon: 'fa-mobile-alt', href: '/deenshield/main.html#mobile' },
    { key: 'extension', label: 'Extension', icon: 'fa-shield-alt', href: '/deenshield/main.html#extension' },
    { key: 'manager', label: 'Manager', icon: 'fa-window-maximize', href: '/deenshield/main.html#manager' },
    { key: 'desktop', label: 'Desktop', icon: 'fa-laptop', href: '/deenshield/main.html#desktop' }
  ];
  function buildTabs(activeKey){
    const wrap=document.createElement('div');
    wrap.className='top-product-tabs mt-10';
    wrap.setAttribute('role','tablist');
    PRODUCTS.forEach(p=>{
      const btn=document.createElement('a');
      btn.href=p.href;
      btn.className='top-tab inline-flex items-center product-nav-btn'+(p.key===activeKey?' border-brand-gold':'');
      btn.innerHTML=`<i class="fas ${p.icon}" aria-hidden="true"></i><span>${p.label}</span>`;
      wrap.appendChild(btn);
    });
    return wrap;
  }
  function inject(){
    const mount=document.getElementById('product-tab-mount');
    if(!mount) return; // silent
    // ensure minimal styling present (if main page CSS not loaded)
    if(!document.querySelector('style[data-product-tab-style]')){
      const style=document.createElement('style');
      style.dataset.productTabStyle='1';
      style.textContent=`.top-product-tabs{display:flex;gap:.55rem;flex-wrap:wrap;justify-content:center}`+
        `.top-tab{background:#f1f5f9;border:1px solid transparent;color:#0A2540;font-weight:600;font-size:.7rem;letter-spacing:.5px;padding:.55rem .85rem;border-radius:999px;text-transform:uppercase;display:inline-flex;align-items:center;gap:.35rem;transition:.25s;text-decoration:none}`+
        `.top-tab:hover{background:#e2e8f0}`+
        `.top-tab.border-brand-gold{border-color:#D4AF37;box-shadow:0 0 0 1px rgba(212,175,55,.4)}`+
        `.top-tab i{font-size:.85rem}`;
      document.head.appendChild(style);
    }
  const urlHash=(location.hash||'').replace('#','');
  const active = PRODUCTS.some(p=>p.key===urlHash) ? urlHash : 'home';
  mount.appendChild(buildTabs(active));
  }
  inject();
})();
