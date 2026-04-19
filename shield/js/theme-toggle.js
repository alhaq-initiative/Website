// DeenShield Theme Toggle (light default)
(function(){
  const STORAGE_KEY = 'ds-theme';
  const root = document.documentElement;
  const saved = localStorage.getItem(STORAGE_KEY);
  if(saved === 'dark') root.classList.add('dark');
  if(saved === 'light') root.classList.remove('dark');
  function label(dark){ return dark ? '☀️' : '🌙'; }
  function apply(btn){
    const dark = root.classList.contains('dark');
    btn.textContent = label(dark);
    btn.setAttribute('aria-pressed', dark ? 'true':'false');
  }
  function init(){
    let btn = document.getElementById('dsThemeToggle');
    if(!btn){
      btn = document.createElement('button');
      btn.id='dsThemeToggle';
      btn.type='button';
      btn.className='fixed bottom-4 right-4 z-50 p-3 rounded-full bg-gray-900 text-white dark:bg-gray-200 dark:text-gray-900 shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition border border-gray-700 dark:border-gray-300 text-lg';
      btn.setAttribute('aria-label','Toggle color theme');
      btn.setAttribute('aria-pressed','false');
      document.body.appendChild(btn);
    }
    apply(btn);
    btn.addEventListener('click',()=>{
      root.classList.toggle('dark');
      const dark = root.classList.contains('dark');
      localStorage.setItem(STORAGE_KEY, dark? 'dark':'light');
      apply(btn);
    });
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
