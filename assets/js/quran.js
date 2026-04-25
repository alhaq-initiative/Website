    // Highlight ayah in view
    function highlightAyah(ayahNum){
      // Remove previous highlights
      document.querySelectorAll('.ayah-highlight').forEach(el=>el.classList.remove('ayah-highlight'));
      // Find ayah element
      const ayahEl = document.querySelector(`[data-ayah="${ayahNum}"]`);
      if(ayahEl){
        ayahEl.classList.add('ayah-highlight');
        // Scroll into view (centered)
        ayahEl.scrollIntoView({behavior:'smooth', block:'center'});
      }
    }
    function clearAyahHighlight(){
      document.querySelectorAll('.ayah-highlight').forEach(el=>el.classList.remove('ayah-highlight'));
    }
(function(){
  'use strict';
  // Ensure fade-in sections appear even if IntersectionObserver isn't used here
  document.querySelectorAll('.fade-in-section').forEach(function(section) {
    section.classList.add('is-visible');
  });

  // Smooth scroll to hash with header offset
  document.addEventListener('DOMContentLoaded', function () {
    if (location.hash) {
      try {
        const el = document.querySelector(location.hash);
        if (el) {
          setTimeout(function () {
            const y = el.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top: y, behavior: 'smooth' });
            el.setAttribute('tabindex', '-1');
            el.focus({ preventScroll: true });
          }, 50);
        }
      } catch (_) { /* noop */ }
    }
  });

  // Mobile menu handled globally in site.js now (removed duplicate logic)

  // Quran reader logic (simplified - single layout)
  let QuranText = {}; // { surahNumber: [ verses ] }
  let translations = {}; // { code: { 'surah:ayah': { t: 'text' } } }
  let currentSurah = null;
  let currentPage = 0;
  let VERSES_PER_PAGE = 20; // adjustable page size (can be overridden by data attribute)
  const LS_KEY = 'quranReaderState';
  const LS_FONT = 'quranFontScale';
  const LS_TRANSLATION = 'quranTranslation';
  // Reciters config (id, display, base URL pattern where {surah} is 3-digit surah number)
  const RECITERS = [
    { id: 'Alafasy_64kbps', name: 'Mishary Rashid Alafasy', surah: true, ayah: true },
    { id: 'Husary_128kbps_Mujawwad', name: 'Mahmoud Khalil Al-Husary (Mujawwad)', surah: true, ayah: true },
    { id: 'Minshawy_Murattal_128kbps', name: 'Mohamed Siddiq Al-Minshawi (Murattal)', surah: true, ayah: true },
    { id: 'Saad_Al-Ghamdi_64kbps', name: 'Saad Al-Ghamdi', surah: true, ayah: true },
    { id: 'Abdurrahmaan_As-Sudais_192kbps', name: 'Abdur-Rahman As-Sudais', surah: true, ayah: true },
    { id: 'Saood_ash-Shuraym_128kbps', name: 'Saud Al-Shuraim', surah: true, ayah: true },
    { id: 'Ahmed_ibn_Ali_al-Ajamy_128kbps', name: 'Ahmed Al-Ajmy', surah: true, ayah: true },
    { id: 'Abu_Bakr_Ash-Shaatree_128kbps', name: 'Abu Bakr Al-Bukhatir', surah: true, ayah: true },
    { id: 'Alafasy_32kbps', name: 'Alafasy (32kbps)', surah: true, ayah: true },
    { id: 'Alafasy_Mjwd_192kbps', name: 'Alafasy Kids (Ikhwa)', surah: false, ayah: true }
  ];
  const RECITER_LS_KEY = 'quranReciter';
  function saveState(){
    try{ if(currentSurah) localStorage.setItem(LS_KEY, JSON.stringify({ s: currentSurah, p: currentPage, v: VERSES_PER_PAGE })); }catch(_){ }
  }
  function loadState(){
    try{ const raw = localStorage.getItem(LS_KEY); if(!raw) return null; const obj = JSON.parse(raw); return obj && obj.s ? obj : null; }catch(_){ return null; }
  }
  document.addEventListener('DOMContentLoaded', function(){
    const wrap = document.getElementById('arabic-text');
    const attr = wrap && wrap.getAttribute('data-verses-per-page');
    const n = attr ? parseInt(attr,10) : NaN;
    if(!isNaN(n) && n>0 && n<300){ VERSES_PER_PAGE = n; }
  });

  // Apply font scale from localStorage
  function applyFontScale(scale){
    const s = (typeof scale === 'number') ? scale : parseFloat(scale);
    if(!isNaN(s) && s>0 && s<3){
      document.documentElement.style.setProperty('--quran-font-scale', s.toString());
      try{ localStorage.setItem(LS_FONT, s.toString()); }catch(_){ }
    }
  }
  document.addEventListener('DOMContentLoaded', function(){
    try{ const v = parseFloat(localStorage.getItem(LS_FONT)); if(!isNaN(v)) applyFontScale(v); }catch(_){ }
    const fs = document.getElementById('font-scale');
    if(fs){
      const v = (function(){ try{ return localStorage.getItem(LS_FONT) || '1'; }catch(_){ return '1'; }})();
      fs.value = v;
      fs.addEventListener('change', ()=> applyFontScale(fs.value));
    }
  });

  // Resume reading helper (uses LS state or #resume=1)
  function resumeReading(){
    const st = loadState();
    const dropdown = document.getElementById('surah-dropdown');
    if(st && QuranText[st.s]){
      if(dropdown) dropdown.value = st.s.toString();
      currentSurah = st.s.toString();
      currentPage = Math.min(st.p||0, totalPagesFor(st.s)-1);
      renderCurrentPage();
      return true;
    }
    return false;
  }
  document.addEventListener('DOMContentLoaded', function(){
    const resumeBtn = document.getElementById('resume-reading');
    if(resumeBtn){ resumeBtn.addEventListener('click', ()=> resumeReading()); }
  });

  // Precompute structural index maps (Juz, Hizb Quarter, Ruku) once Metadata is available
  const juzStarts = {}; // key surah:ayah => Juz number
  if(Array.isArray(QuranData.Juz)){
    for(let i=1;i<QuranData.Juz.length;i++){ const ent = QuranData.Juz[i]; if(ent && ent.length>=2){ juzStarts[ ent[0]+':'+ent[1] ] = i; } }
  }
  const hizbStarts = {}; // key surah:ayah => Hizb quarter number (1..240?) index in array
  if(Array.isArray(QuranData.HizbQaurter)){
    for(let i=1;i<QuranData.HizbQaurter.length;i++){ const ent = QuranData.HizbQaurter[i]; if(ent && ent.length>=2){ hizbStarts[ ent[0]+':'+ent[1] ] = i; } }
  }
  const rukuStarts = {}; // key surah:ayah => Ruku index
  if(Array.isArray(QuranData.Ruku)){
    for(let i=1;i<QuranData.Ruku.length;i++){ const ent = QuranData.Ruku[i]; if(ent && ent.length>=2){ rukuStarts[ ent[0]+':'+ent[1] ] = i; } }
  }

  function buildSurahOptions(search = '') {
    let options = '';
    const term = search.trim().toLowerCase();
    for (let i = 1; i < QuranData.Sura.length; i++) {
      const s = QuranData.Sura[i];
      const label = `${i}. ${s[5]} (${s[6]}) - Ayahs: ${s[1]}`;
      if (
        !term ||
        label.toLowerCase().includes(term) ||
        s[5].toLowerCase().includes(term) ||
        s[6].toLowerCase().includes(term) ||
        s[7].toLowerCase().includes(term) ||
        i.toString() === term
      ) {
        options += `<option value='${i}'>${label}</option>`;
      }
    }
    return options;
  }

  function renderSurahDropdown() {
    const dropdown = document.getElementById('surah-dropdown');
    if (!dropdown) return;
  dropdown.innerHTML = buildSurahOptions('');
    const search = document.getElementById('surah-search');
    if(search && !search.dataset.bound){
      search.addEventListener('input', ()=>{ dropdown.innerHTML = buildSurahOptions(search.value || ''); });
      search.dataset.bound = '1';
    }
  }

  function paginateAyahs(all, page){
    const start = page * VERSES_PER_PAGE;
    return all.slice(start, start + VERSES_PER_PAGE);
  }
  function totalPagesFor(surahNum){
    const arr = QuranText[surahNum] || [];
    return Math.max(1, Math.ceil(arr.length / VERSES_PER_PAGE));
  }
  function buildAyahNav(){
    const nav = document.getElementById('ayah-nav');
    if(!nav || !currentSurah) return;
    const verses = QuranText[currentSurah] || [];
    const start = currentPage * VERSES_PER_PAGE + 1;
    const end = Math.min(start + VERSES_PER_PAGE -1, verses.length);
    let html='';
    for(let v=start; v<=end; v++){
      html += `<button data-jump="${v}" class="w-full text-xs py-1 rounded hover:bg-brand-gold/20 focus:bg-brand-gold/30 ${ (v===start)?'mt-1':'' }">${v}</button>`;
    }
    nav.innerHTML = html;
    nav.querySelectorAll('button[data-jump]').forEach(btn => {
      btn.addEventListener('click', () => { jumpToVerse(parseInt(btn.getAttribute('data-jump'),10)); });
    });
  }
  function updatePager(){
    const info = document.getElementById('pager-info');
    const prevBtn = document.getElementById('pager-prev');
    const nextBtn = document.getElementById('pager-next');
    if(!currentSurah) return;
    const total = totalPagesFor(currentSurah);
    if(info) info.textContent = `Page ${currentPage+1} / ${total}`;
    if(prevBtn) prevBtn.disabled = currentPage===0;
    if(nextBtn) nextBtn.disabled = currentPage >= total-1;
    buildAyahNav();
    saveState();
  }
  function loadSurah(surahNum) {
    currentSurah = surahNum.toString();
    currentPage = 0; // reset page when surah changes
    renderCurrentPage();
  }
  function renderCurrentPage(){
    const surahNum = currentSurah;
    if(!surahNum) return;
    console.debug('[Quran] render page', surahNum, currentPage);
    const surahData = QuranData.Sura[surahNum];
    const surahName = surahData[5];
  const surahEnglish = surahData[6];
  const surahType = surahData[7];
  // Set titles
  const arabicTitleEl = document.getElementById('arabic-surah-title');
  const arabicMetaEl = document.getElementById('arabic-surah-meta');
  const transTitleEl = document.getElementById('translation-surah-title');
  const transMetaEl = document.getElementById('translation-surah-meta');
  const versesTotal = surahData[1];
    const pageStart = currentPage*VERSES_PER_PAGE+1;
    const pageEnd = Math.min((currentPage+1)*VERSES_PER_PAGE, versesTotal);
  if(arabicTitleEl){ arabicTitleEl.innerHTML = `<span class=\"text-brand-gold\">${surahNum}.</span> ${surahName}`; }
    if(arabicMetaEl){ arabicMetaEl.textContent = `${surahEnglish} • ${surahType} • Ayahs ${pageStart}-${pageEnd} of ${versesTotal}`; }
    if(transTitleEl){ transTitleEl.innerHTML = `<span class=\"text-brand-gold\">${surahNum}.</span> ${surahEnglish}`; }
    if(transMetaEl){ transMetaEl.textContent = `${surahType} • Ayahs ${pageStart}-${pageEnd} of ${versesTotal} • Page ${currentPage+1}/${totalPagesFor(surahNum)}`; }
    const ayahs = QuranText[surahNum] || [];
    const pageAyahs = paginateAyahs(ayahs, currentPage);
    let html = '';
    const unified = document.getElementById('quran-unified-list');
    let unifiedHtml = '';
    if(pageAyahs.length){
      const showTranslation = document.getElementById('toggle-translation')?.checked;
      const transCode = document.getElementById('translation-dropdown')?.value;
      pageAyahs.forEach((a, i) => {
        const globalIndex = currentPage*VERSES_PER_PAGE + i + 1;
        let translation = '';
        if(transCode && translations[transCode]){
          const key = surahNum+':'+globalIndex;
          translation = translations[transCode][key]?.t || '';
        }
        unifiedHtml += `<div class=\"ayah group py-3 border-b border-gray-100 last:border-none\" data-ayah=\"${globalIndex}\">\
            <div class=\"flex items-start gap-3\">\
              <span class=\"ayah-num flex-none w-8 h-8 leading-8 text-center rounded-full bg-brand-blue text-white text-sm font-semibold shadow\" title=\"Ayah ${globalIndex}\">${globalIndex}</span>\
              <span class=\"ayah-text flex-1 text-xl leading-loose\" data-ayah-arabic=\"${globalIndex}\" dir=\"rtl\" lang=\"ar\">${a}</span>\
              <div class=\"flex flex-col items-end gap-1 ml-2\">\
                <button class=\"play-ayah-btn px-2 py-1 rounded bg-green-500 text-white text-xs hover:bg-green-600 transition\" data-play-ayah=\"${globalIndex}\" title=\"Play Ayah ${globalIndex}\"><svg xmlns=\"http://www.w3.org/2000/svg\" class=\"inline w-4 h-4\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M5 3v18l15-9-15-9z\" /></svg></button>\
                <div class=\"flex items-center gap-1\">\
                  <button class=\"copy-ayah-btn px-2 py-1 rounded bg-gray-200 text-gray-800 text-[11px] hover:bg-gray-300 transition\" data-copy-ayah=\"${globalIndex}\" title=\"Copy Ayah ${globalIndex}\">Copy</button>\
                  <button class=\"share-ayah-btn px-2 py-1 rounded bg-gray-200 text-gray-800 text-[11px] hover:bg-gray-300 transition\" data-share-ayah=\"${globalIndex}\" title=\"Share Ayah ${globalIndex}\">Share</button>\
                </div>\
              </div>\
            </div>\
            ${showTranslation && translation !== '' ? `<div class=\"ayah-translation text-base text-gray-700 mt-2\" data-ayah-translation=\"${globalIndex}\">${translation}</div>` : ''}
          </div>`;
      });
    } else {
      unifiedHtml += '<p class="text-center text-gray-500">No text found.</p>';
    }
    if(unified) unified.innerHTML = unifiedHtml;
    // Bind play-ayah buttons
    if (unified) {
      unified.querySelectorAll('.play-ayah-btn').forEach(btn => {
        btn.addEventListener('click', (function(){
          // Ensure stopAyahPlayback is in scope
          return function(e){
            const ayahNum = parseInt(btn.getAttribute('data-play-ayah'),10);
            if(isNaN(ayahNum)) return;
            if(typeof stopAyahPlayback === 'function') stopAyahPlayback();
            // Play single ayah
            ayahPlaybackQueue = [ayahNum];
            ayahPlaybackActive = true;
            ayahPlaybackIndex = 0;
            playAyahQueue();
          };
        })());
      });
      // Tooltip on hover for ayah text
      // Use event delegation for tooltip hover
      unified.addEventListener('mouseover', function(e) {
        const span = e.target.closest('.ayah-text');
        if(!span || !unified.contains(span)) return;
        if(span._ayahTip) return; // Prevent duplicate tooltips
        const ayahNum = parseInt(span.getAttribute('data-ayah-arabic'),10);
        const transCode = document.getElementById('translation-dropdown')?.value;
        if(isNaN(ayahNum) || !transCode || !translations[transCode]) return;
        const key = surahNum+':'+ayahNum;
        let translation = translations[transCode][key]?.t;
        if(typeof translation !== 'string' || translation.trim() === '') return;
        translation = translation.replace(/\[\[.*?\]\]/g, '').trim();
        if(!translation) return;
        let tip = document.createElement('div');
        tip.className = 'ayah-tooltip fixed z-50 px-3 py-2 rounded bg-brand-blue text-white text-sm shadow-lg';
        tip.textContent = translation;
        document.body.appendChild(tip);
        // Position tooltip near mouse cursor
        tip.style.left = (e.clientX + 12) + 'px';
        tip.style.top = (e.clientY + 12) + 'px';
        span._ayahTip = tip;
        // Update position on mousemove
        span._moveTip = function(ev){
          tip.style.left = (ev.clientX + 12) + 'px';
          tip.style.top = (ev.clientY + 12) + 'px';
        };
        span.addEventListener('mousemove', span._moveTip);
      });
      unified.addEventListener('mouseout', function(e) {
        const span = e.target.closest('.ayah-text');
        if(!span || !unified.contains(span)) return;
        if(span._ayahTip){
          document.body.removeChild(span._ayahTip);
          span._ayahTip = null;
        }
        if(span._moveTip){
          span.removeEventListener('mousemove', span._moveTip);
          span._moveTip = null;
        }
      });
      // One-time bind for ayah Copy/Share actions using event delegation
      if(!unified.dataset.actionsBound){
        unified.addEventListener('click', async function(e){
          const copyBtn = e.target.closest('[data-copy-ayah]');
          const shareBtn = e.target.closest('[data-share-ayah]');
          if(!copyBtn && !shareBtn) return;
          const ayahNum = parseInt((copyBtn||shareBtn).getAttribute('data-copy-ayah') || (copyBtn||shareBtn).getAttribute('data-share-ayah'),10);
          if(isNaN(ayahNum)) return;
          // Gather text for this ayah
          const ar = unified.querySelector(`[data-ayah-arabic="${ayahNum}"]`);
          const tr = unified.querySelector(`[data-ayah-translation="${ayahNum}"]`);
          const arTxt = ar ? ar.innerText.trim() : '';
          const trTxt = tr ? tr.innerText.trim() : '';
          const surahData = QuranData.Sura[currentSurah];
          const surahName = surahData ? surahData[5] : currentSurah;
          const ref = `${surahName} ${currentSurah}:${ayahNum}`;
          const baseUrl = location.href.split('#')[0];
          const url = `${baseUrl}#s=${currentSurah}&p=${(Math.floor((ayahNum-1)/VERSES_PER_PAGE)+1)}&a=${ayahNum}`;
          const text = `${arTxt}${trTxt ? `\n\n${trTxt}` : ''}\n\n(${ref})\n${url}`.trim();
          if(copyBtn){
            try{ await navigator.clipboard.writeText(text); copyBtn.textContent='Copied'; setTimeout(()=> copyBtn.textContent='Copy', 1400); }catch(_){ copyBtn.textContent='Error'; setTimeout(()=> copyBtn.textContent='Copy', 1400); }
          } else if(shareBtn){
            if(navigator.share){
              try{ await navigator.share({ title: ref, text, url }); shareBtn.textContent='Shared'; setTimeout(()=> shareBtn.textContent='Share', 1400);}catch(_){ /* user cancelled */ }
            } else {
              try{ await navigator.clipboard.writeText(text); shareBtn.textContent='Copied'; setTimeout(()=> shareBtn.textContent='Share', 1400);}catch(_){ shareBtn.textContent='Error'; setTimeout(()=> shareBtn.textContent='Share', 1400);}            
            }
          }
        });
        unified.dataset.actionsBound = '1';
      }
    }
    // Populate index badges in title bar (first ayah of current page determines which markers appear)
    (function(){
      const badgesWrap = document.getElementById('arabic-index-badges');
      if(!badgesWrap){ return; }
      badgesWrap.innerHTML='';
      if(pageAyahs.length){
        const firstAyahNum = currentPage*VERSES_PER_PAGE + 1;
        const verseKey = surahNum+':'+firstAyahNum;
        const frag = document.createDocumentFragment();
        const addBadge = (label, cls) => { const el = document.createElement('span'); el.className='inline-block text-[10px] font-semibold px-2 py-0.5 rounded '+cls+' text-white'; el.textContent = label; frag.appendChild(el); };
        if(juzStarts[verseKey]) addBadge('Juz '+juzStarts[verseKey], 'bg-emerald-600');
        if(hizbStarts[verseKey]) addBadge('Hizb '+hizbStarts[verseKey], 'bg-purple-600');
        if(rukuStarts[verseKey]) addBadge('Ruku '+rukuStarts[verseKey], 'bg-indigo-600');
        badgesWrap.appendChild(frag);
      }
    })();
    // Translation index badges (mirroring Arabic markers for context)
    (function(){
      const tWrap = document.getElementById('translation-index-badges');
      if(!tWrap) return;
      tWrap.innerHTML='';
      if(pageAyahs.length){
        const firstAyahNum = currentPage*VERSES_PER_PAGE + 1;
        const verseKey = surahNum+':'+firstAyahNum;
        const frag = document.createDocumentFragment();
        const addBadge = (label, cls) => { const el = document.createElement('span'); el.className='inline-block text-[10px] font-semibold px-2 py-0.5 rounded '+cls+' text-white'; el.textContent = label; frag.appendChild(el); };
        if(juzStarts[verseKey]) addBadge('Juz '+juzStarts[verseKey], 'bg-emerald-600');
        if(hizbStarts[verseKey]) addBadge('Hizb '+hizbStarts[verseKey], 'bg-purple-600');
        if(rukuStarts[verseKey]) addBadge('Ruku '+rukuStarts[verseKey], 'bg-indigo-600');
        tWrap.appendChild(frag);
      }
    })();
    // Translation render for current page
    const translationDropdown = document.getElementById('translation-dropdown');
    const selectedTranslation = translationDropdown ? translationDropdown.value : '';
    const translationBox = document.getElementById('translation-text');
    if (selectedTranslation && translations[selectedTranslation]) {
      const translationAyahs = translations[selectedTranslation];
      let footnotes = [];
  let translationHtml = pageAyahs.map((a, i) => {
        const globalIndex = currentPage*VERSES_PER_PAGE + i + 1;
        const verseRef = `${surahNum}:${globalIndex}`;
        let val = translationAyahs[verseRef];
        let translationText = val ? (typeof val === 'string' ? val : val.t) : 'Translation not available.';
        if(translationText){
          translationText = translationText.replace(/\[\[(.+?)]]/g, function(_, note){
            const n = footnotes.length + 1;
    footnotes.push({ n, verse: globalIndex, text: note.trim() });
    return `<sup class=\"footnote-ref cursor-pointer text-brand-gold\" data-fn=\"${n}\" data-fn-text=\"${encodeURIComponent(note.trim())}\" title=\"Footnote ${n}\">${n}</sup>`;
          });
        }
        return `<div class='mb-4 border-b border-gray-100 pb-3 last:border-none'><span class=\"inline-block text-xs font-semibold bg-brand-blue text-white rounded px-2 py-0.5 mr-2\" title=\"Ayah ${globalIndex}\">${globalIndex}</span> ${translationText}</div>`;
      }).join('');
      if(footnotes.length){
    translationHtml += `<div id=\"footnotes\" class=\"mt-6 pt-4 border-t border-gray-200 text-sm\">`+
      `<div class=\"expand-controls mb-2\"><button id=\"expand-all-footnotes\" class=\"px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300\">Show All</button><button id=\"collapse-all-footnotes\" class=\"px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300\">Hide All</button></div>`+
      `<h4 class=\"font-semibold mb-2 text-brand-blue\">Footnotes</h4>`+
          `<ol class=\"space-y-2 list-decimal list-inside\">`+
          footnotes.map(fn => `<li id=\"fn-${fn.n}\" class=\"footnote-item hidden\" data-fn=\"${fn.n}\"><span class=\"text-gray-700\">${fn.text}</span> <a href=\"#\" class=\"text-xs text-brand-blue footnote-back\" data-fn=\"${fn.n}\">[hide]</a></li>`).join('')+
          `</ol>`+
      `<p class=\"mt-2 text-xs text-gray-500\">Click / hover a number for note. Use Show All / Hide All.</p>`+
        `</div>`;
      }
      if (translationBox) {
        translationBox.innerHTML = translationHtml;
        if(!translationBox.dataset.fnBound){
          translationBox.addEventListener('click', function(e){
            const ref = e.target.closest('.footnote-ref');
            if(ref){
              e.preventDefault();
              const idx = ref.getAttribute('data-fn');
              const item = translationBox.querySelector('#fn-'+idx);
              if(item){ item.classList.toggle('hidden'); }
            }
            const hide = e.target.closest('.footnote-back');
            if(hide){
              e.preventDefault();
              const idx = hide.getAttribute('data-fn');
              const item = translationBox.querySelector('#fn-'+idx);
              if(item){ item.classList.add('hidden'); }
            }
            if(e.target && e.target.id === 'expand-all-footnotes'){
              e.preventDefault();
              translationBox.querySelectorAll('.footnote-item').forEach(li => li.classList.remove('hidden'));
            }
            if(e.target && e.target.id === 'collapse-all-footnotes'){
              e.preventDefault();
              translationBox.querySelectorAll('.footnote-item').forEach(li => li.classList.add('hidden'));
            }
          });
          translationBox.addEventListener('mouseover', function(e){
            const ref = e.target.closest('.footnote-ref');
            if(!ref) return;
            let tip = document.getElementById('fn-hover-tip');
            if(!tip){
              tip = document.createElement('div'); tip.id='fn-hover-tip';
              Object.assign(tip.style,{position:'fixed',maxWidth:'260px',background:'#0A2540',color:'#fff',padding:'8px 10px',fontSize:'12px',lineHeight:'1.4',borderRadius:'6px',boxShadow:'0 4px 14px rgba(0,0,0,0.25)',zIndex:99999,opacity:'0',transition:'opacity .15s'});
              document.body.appendChild(tip);
            }
            const text = decodeURIComponent(ref.getAttribute('data-fn-text')||'');
            tip.textContent = text;
            const move = (ev)=>{ tip.style.left = (ev.clientX + 12)+'px'; tip.style.top = (ev.clientY + 12)+'px'; };
            move(e);
            requestAnimationFrame(()=> tip.style.opacity='1');
            ref.addEventListener('mousemove', move);
            ref.addEventListener('mouseleave', function cleanup(){
              ref.removeEventListener('mousemove', move);
              if(tip){ tip.style.opacity='0'; setTimeout(()=>{ if(tip && tip.parentNode) tip.parentNode.removeChild(tip); },150); }
            }, { once:true });
          });
          translationBox.dataset.fnBound = '1';
        }
      }
    } else if(translationBox) {
      translationBox.innerHTML = '';
    }
    const arabicScroll = document.getElementById('arabic-scroll');
    if (arabicScroll) arabicScroll.scrollTop = 0;
    updatePager();
  }
  // Pager button handlers once DOM ready
  function jumpToVerse(val){
    if(!currentSurah) return;
    const totalVerses = (QuranText[currentSurah]||[]).length;
    if(val<1 || val>totalVerses) return;
    currentPage = Math.floor((val-1)/VERSES_PER_PAGE);
    renderCurrentPage();
    setTimeout(()=>{
      const arabic = document.getElementById('arabic-text');
      if(!arabic) return;
      const target = arabic.querySelectorAll('.ayah')[ (val-1)%VERSES_PER_PAGE ];
      if(target){ target.classList.add('ring','ring-brand-gold'); setTimeout(()=>target.classList.remove('ring','ring-brand-gold'),1800); target.scrollIntoView({block:'center',behavior:'smooth'}); }
    },50);
  }
  document.addEventListener('DOMContentLoaded', function(){
    const prevBtn = document.getElementById('pager-prev');
    const nextBtn = document.getElementById('pager-next');
    if(prevBtn) prevBtn.addEventListener('click', function(){ if(currentSurah && currentPage>0){ currentPage--; renderCurrentPage(); }});
    if(nextBtn) nextBtn.addEventListener('click', function(){
      if(currentSurah){
        const total = totalPagesFor(currentSurah);
        if(currentPage < total-1){
          currentPage++;
          renderCurrentPage();
        } else {
          // At last page of current surah, go to next surah if available
          const nextSurahNum = parseInt(currentSurah, 10) + 1;
          if(QuranData.Sura[nextSurahNum]){
            currentSurah = nextSurahNum.toString();
            currentPage = 0;
            renderCurrentPage();
          }
        }
      }
    });
    // Keyboard navigation (left/right arrows)
    document.addEventListener('keydown', function(e){
      if(!currentSurah) return;
      if(e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.isContentEditable)) return;
      if(e.key === 'ArrowRight'){ const total = totalPagesFor(currentSurah); if(currentPage < total-1){ currentPage++; renderCurrentPage(); } }
      if(e.key === 'ArrowLeft'){ if(currentPage>0){ currentPage--; renderCurrentPage(); } }
    });
    // Go to verse input
    const goInput = document.getElementById('go-to-verse');
    const goBtn = document.getElementById('go-to-btn');
    function go(){ const v = parseInt(goInput.value,10); if(!isNaN(v)) jumpToVerse(v); }
    if(goBtn) goBtn.addEventListener('click', go);
    if(goInput) goInput.addEventListener('keydown', e=>{ if(e.key==='Enter') go(); });
    function flashButtonLabel(btn, text){
      if(!btn) return;
      const original = btn.dataset.originalLabel || btn.textContent;
      btn.dataset.originalLabel = original;
      btn.textContent = text;
      setTimeout(()=>{ btn.textContent = original; }, 1400);
    }
    function getReaderShareUrl(){
      const base = location.href.split('#')[0];
      if(!currentSurah) return base;
      return `${base}#s=${currentSurah}&p=${currentPage+1}`;
    }
    async function copyTextWithFeedback(text, btn){
      try{
        if(navigator.clipboard && navigator.clipboard.writeText){
          await navigator.clipboard.writeText(text);
        } else {
          const helper = document.createElement('textarea');
          helper.value = text;
          helper.setAttribute('readonly', '');
          helper.style.position = 'fixed';
          helper.style.opacity = '0';
          document.body.appendChild(helper);
          helper.select();
          document.execCommand('copy');
          document.body.removeChild(helper);
        }
        flashButtonLabel(btn, 'Copied');
        return true;
      }catch(_){
        flashButtonLabel(btn, 'Error');
        return false;
      }
    }
    // Print & Share
    const printBtn = document.getElementById('print-page');
    if(printBtn) printBtn.addEventListener('click', ()=>window.print());
    const shareBtn = document.getElementById('share-page');
    const copyLinkBtn = document.getElementById('copy-quran-link');
    if(copyLinkBtn){
      copyLinkBtn.addEventListener('click', async ()=>{
        await copyTextWithFeedback(getReaderShareUrl(), copyLinkBtn);
      });
    }
    if(shareBtn){
      shareBtn.addEventListener('click', async ()=>{
        const shareUrl = getReaderShareUrl();
        const shareTitle = currentSurah ? `Quran Surah ${currentSurah} Page ${currentPage+1}` : 'Quran Hub';
        if(navigator.share){
          try{
            await navigator.share({ title: shareTitle, text: 'Continue reading in Quran Hub.', url: shareUrl });
            flashButtonLabel(shareBtn, 'Shared');
            return;
          }catch(_){ /* user cancelled or unsupported path */ }
        }
        await copyTextWithFeedback(shareUrl, shareBtn);
      });
      shareBtn.title = 'Share or copy current reading page';
    }

    // Translation show/hide toggle
    const toggle = document.getElementById('toggle-translation');
    const grid = document.getElementById('quran-grid');
    const TOGGLE_KEY = 'quranShowTranslation';
    function applyToggle(v){
      if(!grid) return;
      if(v){ grid.classList.remove('translation-hidden'); }
      else { grid.classList.add('translation-hidden'); }
      try{ localStorage.setItem(TOGGLE_KEY, v? '1':'0'); }catch(_){ }
    }
    if(toggle){
      const stored = (()=>{ try{return localStorage.getItem(TOGGLE_KEY);}catch(_){return null;} })();
      if(stored === '1') { toggle.checked = true; }
      applyToggle(toggle.checked);
      toggle.addEventListener('change', ()=> applyToggle(toggle.checked));
      // If translation hidden, ensure dropdown is not forcing fetch logic repeatedly
      const td = document.getElementById('translation-dropdown');
      if(td){ td.addEventListener('change', ()=>{ if(!toggle.checked){ /* loaded silently; user must show toggle */ } }); }
    }

    // Reciter selector setup
    const reciterSelect = document.getElementById('reciter-select');
  const playBtn = document.getElementById('play-surah');
  const playAyahsBtn = document.getElementById('play-ayahs');
  const stopAudioBtn = document.getElementById('stop-audio');
  const reloadBtn = document.getElementById('reload-audio');
  const audioEl = document.getElementById('quran-audio');
  const audioStatus = document.getElementById('audio-status');
    // Ayah-by-ayah playback state
    let ayahPlaybackActive = false;
    let ayahPlaybackQueue = [];
    let ayahPlaybackIndex = 0;
    function pad3(n){ return n.toString().padStart(3,'0'); }
    function buildAyahAudioUrl(reciterId, surah, ayah){
      return `https://everyayah.com/data/${reciterId}/${pad3(surah)}${pad3(ayah)}.mp3`;
    }
    function getCurrentAyahs(){
      // Returns array of ayah numbers for current page
      if(!currentSurah || !QuranData.Sura[currentSurah]) return [];
      const suraMeta = QuranData.Sura[currentSurah];
      const startAyah = currentPage * VERSES_PER_PAGE + 1;
      const endAyah = Math.min(startAyah + VERSES_PER_PAGE - 1, suraMeta[1]);
      let ayahs = [];
      for(let i=startAyah; i<=endAyah; ++i) ayahs.push(i);
      return ayahs;
    }
    function playAyahQueue(){
      if(!ayahPlaybackActive || ayahPlaybackIndex >= ayahPlaybackQueue.length){
        setAudioStatus('Ayah playback ended');
        ayahPlaybackActive = false;
        ayahPlaybackQueue = [];
        ayahPlaybackIndex = 0;
        clearAyahHighlight();
        return;
      }
      // Prevent double playback
      audioEl.pause();
      audioEl.currentTime = 0;
      while(audioEl.firstChild){ audioEl.removeChild(audioEl.firstChild); }
      const reciterId = reciterSelect ? reciterSelect.value : RECITERS[0].id;
      const surah = currentSurah;
      const ayah = ayahPlaybackQueue[ayahPlaybackIndex];
      const url = buildAyahAudioUrl(reciterId, surah, ayah);
      const source = document.createElement('source');
      source.src = url;
      source.type = 'audio/mpeg';
      audioEl.appendChild(source);
      audioEl.load();
      setAudioStatus(`Playing Ayah ${ayah} (${ayahPlaybackIndex+1}/${ayahPlaybackQueue.length})`);
      highlightAyah(ayah);
      audioEl.play().catch(()=>setAudioStatus('Autoplay blocked. Press play.', false));
    }
    function startAyahPlayback(){
      stopAyahPlayback(); // Always reset before starting
      ayahPlaybackQueue = getCurrentAyahs();
      if(ayahPlaybackQueue.length === 0){ setAudioStatus('No ayahs to play', false); return; }
      ayahPlaybackActive = true;
      ayahPlaybackIndex = 0;
      playAyahQueue();
    }
    function stopAyahPlayback(){
      ayahPlaybackActive = false;
      ayahPlaybackQueue = [];
      ayahPlaybackIndex = 0;
      audioEl.pause();
      audioEl.currentTime = 0;
      while(audioEl.firstChild){ audioEl.removeChild(audioEl.firstChild); }
      clearAyahHighlight();
      setAudioStatus('Ayah playback stopped', true);
    }
    function setAudioStatus(msg, ok=true){ if(audioStatus){ audioStatus.textContent = msg; audioStatus.style.color = ok? '#0A2540':'#b91c1c'; } }
    function pad3(n){ return n.toString().padStart(3,'0'); }
    function buildAudioUrl(reciterId, surah){
      // EveryAyah surah audio: https://www.everyayah.com/data/{reciterId}/{sura:3d}.mp3
      return `https://everyayah.com/data/${reciterId}/${pad3(surah)}.mp3`;
    }
    function populateReciters(){ if(!reciterSelect) return; reciterSelect.innerHTML = RECITERS.map(r=>`<option value="${r.id}">${r.name}</option>`).join(''); }
    function loadReciterPreference(){ try{ const v = localStorage.getItem(RECITER_LS_KEY); if(v && RECITERS.some(r=>r.id===v)) return v; }catch(_){ } return RECITERS[0].id; }
    function saveReciterPreference(id){ try{ localStorage.setItem(RECITER_LS_KEY, id); }catch(_){ } }
    function refreshAudio(autoPlay=false){
      if(!audioEl || !currentSurah) return;
      const reciterId = reciterSelect ? reciterSelect.value : RECITERS[0].id;
      const url = buildAudioUrl(reciterId, currentSurah);
      audioEl.pause();
      // Clear existing sources for clean reload
      while(audioEl.firstChild){ audioEl.removeChild(audioEl.firstChild); }
      const source = document.createElement('source');
      source.src = url;
      source.type = 'audio/mpeg';
      audioEl.appendChild(source);
      audioEl.load();
      setAudioStatus('Loading audio...');
      if(autoPlay){ audioEl.play().catch(()=>setAudioStatus('Autoplay blocked. Press play.', false)); }
    }
    if(reciterSelect && audioEl){
      // Wake Lock support
      let wakeLock = null;
      async function requestWakeLock(){
        try{
          if('wakeLock' in navigator && !wakeLock){
            wakeLock = await navigator.wakeLock.request('screen');
            wakeLock.addEventListener && wakeLock.addEventListener('release', ()=>{ /* no-op */ });
          }
        }catch(_){ /* ignore */ }
      }
      async function releaseWakeLock(){
        try{ if(wakeLock){ await wakeLock.release(); wakeLock = null; } }catch(_){ }
      }
      document.addEventListener('visibilitychange', ()=>{ if(document.visibilityState !== 'visible') releaseWakeLock(); });
      populateReciters();
      reciterSelect.value = loadReciterPreference();
      reciterSelect.addEventListener('change', ()=>{ saveReciterPreference(reciterSelect.value); refreshAudio(false); });
      if(playBtn) playBtn.addEventListener('click', ()=>{
        if(!currentSurah){ setAudioStatus('Select a surah first', false); return; }
        stopAyahPlayback(); // Always reset before starting
        // Always use ayah-by-ayah for full surah, continuous
        ayahPlaybackQueue = [];
        if(QuranData.Sura[currentSurah]){
          for(let i=1; i<=QuranData.Sura[currentSurah][1]; ++i) ayahPlaybackQueue.push(i);
        }
        ayahPlaybackActive = true;
        ayahPlaybackIndex = 0;
        playAyahQueue();
      });
      if(reloadBtn) reloadBtn.addEventListener('click', ()=> refreshAudio(false));
      if(playAyahsBtn) playAyahsBtn.addEventListener('click', ()=>{ if(!currentSurah){ setAudioStatus('Select a surah first', false); return;} startAyahPlayback(); });
      if(stopAudioBtn) stopAudioBtn.addEventListener('click', stopAyahPlayback);
  audioEl.addEventListener('canplay', ()=> setAudioStatus('Ready')); 
  audioEl.addEventListener('playing', ()=> { setAudioStatus('Playing'); requestWakeLock(); }); 
  audioEl.addEventListener('pause', ()=> { setAudioStatus('Paused'); releaseWakeLock(); });
  audioEl.addEventListener('ended', ()=> { setAudioStatus('Ended'); releaseWakeLock(); }); 
      audioEl.addEventListener('error', ()=> setAudioStatus('Audio error (try another reciter).', false));
      audioEl.addEventListener('ended', ()=>{
        if(ayahPlaybackActive){
          ayahPlaybackIndex++;
          setTimeout(playAyahQueue, 250); // Small delay for smoothness
        }
      });
    }
    // When surah changes, update audio if already had a source
    const origLoadSurah = loadSurah;
    loadSurah = function(surahNum){ origLoadSurah(surahNum); if(audioEl && audioEl.src){ refreshAudio(false); } };

    // Native Fullscreen handling (with graceful fallback to overlay if API unsupported)
    function getPaneContainer(pane){
      if(pane==='arabic') return document.getElementById('arabic-text');
      if(pane==='translation') return document.getElementById('translation-text');
      return null;
    }
    function requestPaneFullscreen(container){
      if(!container) return;
      const fsEl = container.requestFullscreen || container.webkitRequestFullscreen || container.msRequestFullscreen;
      if(fsEl){ fsEl.call(container); }
      else { // fallback: add overlay class (older browsers)
        container.classList.add('q-pane-fullscreen');
  // Fallback won't emit fullscreenchange, so manually create toolbar
  createFsToolbar();
      }
    }
    // Fullscreen toolbar management (surah + translation selects inside fullscreen)
    function createFsToolbar(){
      if(document.getElementById('fs-toolbar')) return; // already
      const originalSurah = document.getElementById('surah-dropdown');
      const originalTrans = document.getElementById('translation-dropdown');
      if(!originalSurah) return;
      const bar = document.createElement('div');
      bar.id = 'fs-toolbar';
      bar.style.position='fixed';
      bar.style.top='8px';
      bar.style.left='50%';
      bar.style.transform='translateX(-50%)';
      bar.style.zIndex='2147483647';
      bar.style.background='rgba(255,255,255,0.95)';
      bar.style.backdropFilter='blur(6px)';
      bar.style.boxShadow='0 4px 18px rgba(0,0,0,0.15)';
      bar.style.border='1px solid #d1d5db';
      bar.style.borderRadius='12px';
      bar.style.padding='6px 10px';
      bar.style.display='flex';
      bar.style.gap='8px';
      bar.style.alignItems='center';
      bar.style.fontSize='12px';
      bar.innerHTML = `<span style="font-weight:600;color:#0A2540">Quick Access:</span>`;
      // Surah select clone
      const sClone = originalSurah.cloneNode(true);
      sClone.id = 'fs-surah-select';
      sClone.className = originalSurah.className + ' !w-44';
      sClone.value = originalSurah.value;
      sClone.addEventListener('change', ()=>{ originalSurah.value = sClone.value; originalSurah.dispatchEvent(new Event('change')); });
      bar.appendChild(sClone);
      if(originalTrans){
        const tClone = originalTrans.cloneNode(true);
        tClone.id='fs-translation-select';
        tClone.className = originalTrans.className + ' !w-40';
        tClone.value = originalTrans.value;
        tClone.addEventListener('change', ()=>{ originalTrans.value = tClone.value; originalTrans.dispatchEvent(new Event('change')); });
        bar.appendChild(tClone);
      }
      const close = document.createElement('button');
      close.type='button';
      close.textContent='×';
      close.title='Close fullscreen';
      close.setAttribute('aria-label','Exit fullscreen');
      close.style.cssText='background:#0A2540;color:#fff;font-weight:600;border:none;width:28px;height:28px;line-height:28px;text-align:center;border-radius:8px;cursor:pointer';
      close.addEventListener('click', ()=> exitFullscreen());
      bar.appendChild(close);
      document.body.appendChild(bar);
      // Sync originals while in fullscreen
      const sync = ()=>{
        if(!document.fullscreenElement){ destroyFsToolbar(); return; }
        if(sClone.value !== originalSurah.value) sClone.value = originalSurah.value;
        if(originalTrans){
          const tClone = document.getElementById('fs-translation-select');
          if(tClone && tClone.value !== originalTrans.value) tClone.value = originalTrans.value;
        }
      };
      originalSurah.addEventListener('change', sync);
      if(originalTrans) originalTrans.addEventListener('change', sync);
      bar.dataset.bound='1';
    }
    function destroyFsToolbar(){
      const bar = document.getElementById('fs-toolbar');
      if(bar) bar.remove();
    }
    function exitFullscreen(){
      if(document.fullscreenElement){
        (document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen).call(document);
      } else {
        // fallback remove classes
        document.querySelectorAll('.q-pane-fullscreen').forEach(el=>el.classList.remove('q-pane-fullscreen'));
  destroyFsToolbar();
      }
    }
    function toggleFS(pane){
      const container = getPaneContainer(pane);
      if(!container) return;
      if(document.fullscreenElement){
        // If already in fullscreen and it's the same container, exit. Otherwise switch.
        if(document.fullscreenElement === container){
          exitFullscreen();
        } else {
          exitFullscreen();
          setTimeout(()=> requestPaneFullscreen(container), 60);
        }
      } else if(container.classList.contains('q-pane-fullscreen')) { // fallback active
        container.classList.remove('q-pane-fullscreen');
      } else {
        requestPaneFullscreen(container);
      }
    }
  const fsEvents = ['fullscreenchange','webkitfullscreenchange','mozfullscreenchange','MSFullscreenChange'];
  const handleFsChange = ()=>{
      const active = document.fullscreenElement;
      document.querySelectorAll('.fs-btn').forEach(btn=>{
        const pane = btn.getAttribute('data-pane');
        const container = getPaneContainer(pane);
        if(active && container && active.contains(container)){ // parent taken fullscreen
          btn.textContent='×';
          btn.setAttribute('aria-label','Exit full screen');
          btn.classList.add('bg-brand-blue','text-white');
        } else if(active && container===active){
          btn.textContent='×';
          btn.setAttribute('aria-label','Exit full screen');
          btn.classList.add('bg-brand-blue','text-white');
        } else {
          btn.textContent='[ ]';
          btn.setAttribute('aria-label','Full screen view');
          btn.classList.remove('bg-brand-blue','text-white');
        }
      });
      // Update combined button state
      const bothBtn = document.getElementById('fs-both');
      if(bothBtn){
        if(active && active.id === 'quran-grid'){
          bothBtn.textContent = 'Exit Full';
          bothBtn.classList.add('bg-brand-blue','text-white');
        } else {
          bothBtn.textContent = 'Full Both';
          bothBtn.classList.remove('bg-brand-blue','text-white');
        }
      }
      if(active){
        createFsToolbar();
      } else {
        destroyFsToolbar();
      }
  };
  fsEvents.forEach(ev => document.addEventListener(ev, handleFsChange));
    document.querySelectorAll('.fs-btn').forEach(btn=>{
      btn.addEventListener('click', ()=>{ toggleFS(btn.getAttribute('data-pane')); });
    });
    // Combined fullscreen button
    const bothBtn = document.getElementById('fs-both');
    if(bothBtn){
      bothBtn.addEventListener('click', ()=>{
        const grid = document.getElementById('quran-grid');
        if(!grid) return;
        if(document.fullscreenElement){
          if(document.fullscreenElement === grid){
            exitFullscreen();
          } else {
            exitFullscreen();
            setTimeout(()=> requestPaneFullscreen(grid), 60);
          }
        } else {
          requestPaneFullscreen(grid);
        }
      });
    }
    // Copy buttons
    document.querySelectorAll('.copy-btn').forEach(btn=>{
      btn.addEventListener('click', async ()=>{
        const pane = btn.getAttribute('data-pane');
        const container = getPaneContainer(pane);
        if(!container) return;
        // Extract text content (remove footnote controls if translation)
        let clone = container.cloneNode(true);
        // Remove footnote navigation elements
        clone.querySelectorAll('.footnote-ref, .footnote-back, #footnotes button').forEach(el=>{ /* keep supers as numbers only */ if(el.classList.contains('footnote-ref')){ el.outerHTML = '['+el.textContent+']'; } else { el.remove(); } });
        const text = clone.innerText.trim();
        try {
          await navigator.clipboard.writeText(text);
          btn.textContent='Copied';
          setTimeout(()=>{ btn.textContent='Copy'; },1500);
        } catch(_) {
          btn.textContent='Error';
          setTimeout(()=>{ btn.textContent='Copy'; },1500);
        }
      });
    });
    document.addEventListener('keydown', (e)=>{
      if(e.key==='Escape' && document.fullscreenElement){ exitFullscreen(); }
    });
  });
  // Initial data loading
  const statusEl = document.getElementById('quran-status');
  function setStatus(msg, ok=true){ if(statusEl){ statusEl.textContent = msg; statusEl.className = ok? 'text-xs text-green-600' : 'text-xs text-red-600'; } }
  setStatus('Loading Quran data...');

  function fetchQuranText(){
    // Primary path
    return fetch('assets/Quran_Data/Quran.txt').then(r => {
      if(r.ok) return r.text();
      // Fallbacks (different casing / path variants)
      return fetch('assets/quran_data/Quran.txt').then(r2 => {
        if(r2.ok) return r2.text();
        return fetch('assets/Quran_Data/quran.txt').then(r3 => {
          if(r3.ok) return r3.text();
          throw new Error('Quran text file not found in expected paths');
        });
      });
    });
  }

  Promise.all([
    fetchQuranText(),
    fetch('assets/Quran_Data/Quran-Translations/en-maulana-wahiduddin-khan-inline-footnotes.json').then(r => r.ok ? r.json() : null).catch(()=>null),
    fetch('assets/Quran_Data/Quran-Translations/pashto-sarfaraz-simple.json').then(r => r.ok ? r.json() : null).catch(()=>null)
  ]).then(([txt, enTrans, psTrans]) => {
    // Skeleton during first render
    (function(){
      const wrap = document.getElementById('quran-unified-list');
      if(!wrap) return;
      let s = '';
      for(let i=0;i<6;i++){ s += '<div class="skeleton-line mb-2"></div>'; }
      wrap.innerHTML = s;
    })();
    // BEGIN patched parsing block
    const rawLength = txt.length;
    let lines = txt.replace(/\r/g,'').split('\n');
    let parsedCount = 0;
    lines.forEach(line => {
      if(!line || line[0]==='#') return; // skip empty/comment
      let m = line.match(/^(\d+)\|(\d+)\|(.*)$/);
      if (m) {
        let s = m[1], a = m[2], t = m[3];
        if (!QuranText[s]) QuranText[s] = [];
        QuranText[s][a - 1] = t.trim();
        parsedCount++;
      }
    });
    console.debug('[Quran] Quran.txt chars:', rawLength, 'lines:', lines.length, 'parsed verses:', parsedCount);
    if(QuranText['1']) console.debug('[Quran] Surah 1 count:', QuranText['1'].length, 'first:', QuranText['1'][0]);
    // END patched parsing block

    // Map loaded translation JSONs if they are in verse-keyed structure; current files appear UI text-only so skip
    if(enTrans && enTrans['1:1']) translations['en'] = enTrans;
    if(psTrans && psTrans['1:1']) translations['ps'] = psTrans;
  const dropdown = document.getElementById('surah-dropdown');
    const translationDropdown = document.getElementById('translation-dropdown');
    if (dropdown) dropdown.addEventListener('change', function(){ if (this.value) loadSurah(this.value); });
    if (translationDropdown) {
      // Initialize from LS
      try { const stored = localStorage.getItem(LS_TRANSLATION); if(stored && translationDropdown.querySelector(`option[value="${stored}"]`)) translationDropdown.value = stored; } catch(_) { }
      translationDropdown.addEventListener('change', function(){
        try { localStorage.setItem(LS_TRANSLATION, translationDropdown.value || ''); } catch(_) { }
        renderCurrentPage();
      });
    }
  const translationToggle = document.getElementById('toggle-translation');
  if (translationToggle) translationToggle.addEventListener('change', function(){ renderCurrentPage(); });

    renderSurahDropdown();
    let diag = [];
    for(let i=1;i<=3;i++){ if(QuranText[i] && QuranText[i].length) diag.push(`${i}:${QuranText[i].length}`); }
    const firstSurah = dropdown && dropdown.options.length ? dropdown.options[0].value : '';
    if (firstSurah && dropdown) {
      const restored = loadState();
      const wantsResume = /resume=1/i.test(location.hash);
      if((wantsResume || restored) && restored && QuranText[restored.s]){
        dropdown.value = restored.s.toString();
        currentSurah = restored.s.toString();
        currentPage = Math.min(restored.p||0, totalPagesFor(restored.s)-1);
        renderCurrentPage();
      } else {
        dropdown.selectedIndex = 0;
        loadSurah(firstSurah);
      }
    }
    if(!firstSurah) {
      setStatus('No surahs populated. Check Metadata.js inclusion.', false);
    } else if(!(QuranText[firstSurah] && QuranText[firstSurah].length)) {
      setStatus('Surah list loaded but verses missing. Parsed 0 for '+firstSurah+'. If opened via file:// use a local server.', false);
    } else {
      const arabic = document.getElementById('arabic-text');
      if(arabic && arabic.textContent.includes('Select a surah')) {
        setStatus('Rendered attempt but container unchanged – retrying...', false);
        loadSurah(firstSurah);
      } else {
        setStatus('Quran text loaded ('+diag.join(', ')+')' + (Object.keys(translations).length ? ' + translations' : ' (no verse translations found)'));
      }
    }
  }).catch(err => {
    console.error(err);
    if(err && err.message && /Failed to fetch/i.test(err.message)) {
      setStatus('Failed to fetch Quran data (serve over HTTP, not file://).', false);
    } else {
      setStatus('Failed to load Quran data', false);
    }
  });
})();
