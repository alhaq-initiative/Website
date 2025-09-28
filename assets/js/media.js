(function(){
  'use strict';
  // Configuration
  const VERSION = '20250927'; // cache-busting for production assets
  const DATA_URL = `assets/data/media.json?v=${VERSION}`;
  const PAGE_SIZE = 6;

  // State
  let allItems = [];
  let filteredItems = [];
  let page = 1;

  // --- YouTube helpers ---
  const YT_ID_RE = /^[A-Za-z0-9_-]{11}$/;
  function extractYouTubeId(source){
    if(!source) return '';
    // Already an ID?
    if (YT_ID_RE.test(source)) return source;
    try {
      const url = new URL(source, location.href);
      // youtu.be/<id>
      if (url.hostname.includes('youtu.be')) {
        const id = (url.pathname || '').split('/').filter(Boolean)[0] || '';
        if (YT_ID_RE.test(id)) return id;
      }
      // youtube.com/watch?v=<id>
      if (url.searchParams.has('v')) {
        const id = url.searchParams.get('v') || '';
        if (YT_ID_RE.test(id)) return id;
      }
      // youtube.com/embed/<id>
      if ((url.pathname||'').includes('/embed/')){
        const id = (url.pathname.split('/').pop() || '').trim();
        if (YT_ID_RE.test(id)) return id;
      }
    } catch(_) {}
    return '';
  }

  function getYouTubeIdFromItem(item){
    return extractYouTubeId(item.youtubeId || item.youtubeURL || item.youtubeUrl || item.url || '');
  }

  function $(id){ return document.getElementById(id); }

  function uniqueSortedCategories(items){
    const set = new Set();
    items.forEach(it => Array.isArray(it.categories) ? it.categories.forEach(c => set.add(c)) : (it.category && set.add(it.category)));
    return ['All', ...Array.from(set).sort((a,b)=>a.localeCompare(b))];
  }

  function buildCategoryOptions(items){
    return uniqueSortedCategories(items).map(c => `<option value="${c}">${c}</option>`).join('');
  }

  function normalize(item){
    // Backward compatibility: if legacy 'category' exists, map it.
    if(!Array.isArray(item.categories)){
      item.categories = item.category ? [item.category] : [];
    }
    if(!Array.isArray(item.tags)) item.tags = [];
    // Normalize/validate YouTube ID
    const id = getYouTubeIdFromItem(item);
    item._yt = { id, valid: !!id };
    return item;
  }

  function card(item){
    const cats = (item.categories||[]).map(c => `<span class="inline-block text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 mr-1">${c}</span>`).join('');
    const tags = (item.tags||[]).map(t => `<span class="inline-block text-[10px] px-2 py-0.5 rounded bg-gray-50 text-gray-500 mr-1">#${t}</span>`).join('');
    const ytId = item._yt?.id || '';
    const thumbWebp = ytId ? `https://i.ytimg.com/vi_webp/${ytId}/hqdefault.webp` : '';
    const thumbJpg  = ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : '';
    const disabled = !ytId;
    return `
      <article class="media-card bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow" data-id="${item.id}">
        <button class="relative w-full aspect-video bg-gray-100 group focus:outline-none ${disabled ? 'cursor-not-allowed opacity-70' : ''}" ${disabled ? 'disabled' : `data-open-modal="${item.id}"`}>
          ${ytId ? `
            <picture>
              <source type="image/webp" srcset="${thumbWebp}">
              <img class="absolute inset-0 w-full h-full object-cover" src="${thumbJpg}" alt="${item.title}" loading="lazy" referrerpolicy="no-referrer" />
            </picture>
            <span class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition"></span>
            <span class="absolute inset-0 flex items-center justify-center">
              <span class="inline-flex items-center justify-center w-14 h-14 rounded-full bg-black/60 text-white shadow-lg">
                ▶
              </span>
            </span>
          ` : `
            <div class="absolute inset-0 grid place-items-center text-sm text-gray-500">Video unavailable</div>
          `}
        </button>
        <div class="p-4">
          <div class="flex items-start justify-between gap-2 mb-1">
            <h3 class="text-lg font-semibold text-brand-blue leading-snug">${item.title}</h3>
          </div>
          <p class="text-sm text-gray-600 mb-2">by ${item.author}</p>
          <div class="mb-2">${cats}</div>
          ${tags ? `<div class="mb-2">${tags}</div>` : ''}
          <p class="text-sm text-gray-700 line-clamp-3">${item.description}</p>
        </div>
      </article>`;
  }

  function renderPage(){
    const grid = $('media-grid');
    if(!grid) return;
    if(!filteredItems.length){
      grid.innerHTML = '<p class="text-center text-gray-500 col-span-full">No results found.</p>';
      $('media-load-more')?.classList.add('hidden');
      return;
    }
    const end = page * PAGE_SIZE;
    const slice = filteredItems.slice(0, end);
    grid.innerHTML = slice.map(card).join('');
    // Toggle Load More
    const btn = $('media-load-more');
    if(btn){
      if(end >= filteredItems.length){ btn.classList.add('hidden'); }
      else { btn.classList.remove('hidden'); }
    }
  }

  function applyFilter(){
    const q = ($('media-search').value || '').trim().toLowerCase();
    const cat = $('media-category').value || 'All';
    filteredItems = allItems.filter(it => {
      const inCat = (cat === 'All') || (it.categories||[]).some(c => (c||'').toLowerCase() === cat.toLowerCase());
      if(!inCat) return false;
      if(!q) return true;
      const hay = [it.title, it.author, ...(it.tags||[])].join(' ').toLowerCase();
      return hay.includes(q);
    });
    page = 1;
    renderPage();
  }

  // Modal/lightbox
  function openModal(item){
    const modal = $('media-modal');
    const body = $('media-modal-body');
    if(!modal || !body) return;
    const ytId = item._yt?.id || '';
    const origin = encodeURIComponent(location.origin);
  const embed = ytId ? `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&origin=${origin}` : '';
    const watch = ytId ? `https://www.youtube.com/watch?v=${ytId}` : '';
    body.innerHTML = `
      <div class="w-full max-w-4xl mx-auto">
        <div class="relative w-full aspect-video bg-black">
          ${ytId ? `
            <iframe class="absolute inset-0 w-full h-full" src="${embed}" title="${item.title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>
          ` : `
            <div class="absolute inset-0 grid place-items-center text-white">Video unavailable</div>
          `}
        </div>
        <div class="mt-4">
          <h3 class="text-xl font-semibold text-white">${item.title}</h3>
          <p class="text-sm text-gray-200">by ${item.author}</p>
          ${watch ? `<p class="mt-2 text-sm"><a class="underline text-blue-300" href="${watch}" target="_blank" rel="noopener">Open on YouTube</a></p>` : ''}
        </div>
      </div>`;
    modal.classList.remove('hidden');
    setTimeout(()=> modal.classList.remove('opacity-0'), 0);
  }
  function closeModal(){
    const modal = $('media-modal');
    const body = $('media-modal-body');
    if(!modal || !body) return;
    modal.classList.add('opacity-0');
    setTimeout(()=>{ modal.classList.add('hidden'); body.innerHTML = ''; }, 120);
  }

  document.addEventListener('click', function(e){
    const openBtn = e.target.closest('[data-open-modal]');
    if(openBtn){
      const id = parseInt(openBtn.getAttribute('data-open-modal'), 10);
      const item = (allItems||[]).find(x => x.id === id);
      if(item) openModal(item);
    }
    if(e.target.closest('#media-modal-close') || e.target.id === 'media-modal'){
      closeModal();
    }
  });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeModal(); });

  document.addEventListener('DOMContentLoaded', async function(){
    const catSel = $('media-category');
    const search = $('media-search');
    const loadMore = $('media-load-more');
    try{
      const res = await fetch(DATA_URL);
      const data = await res.json();
      allItems = (Array.isArray(data) ? data : []).map(normalize);
      if(catSel) catSel.innerHTML = buildCategoryOptions(allItems);
      if(catSel) catSel.addEventListener('change', applyFilter);
      if(search) search.addEventListener('input', applyFilter);
      if(loadMore) loadMore.addEventListener('click', function(){ page++; renderPage(); });
      filteredItems = allItems.slice();
      renderPage();
    } catch(_){
      const grid = $('media-grid');
      if(grid) grid.innerHTML = '<p class="text-center text-red-600 col-span-full">Failed to load media list.</p>';
    }
  });
})();
