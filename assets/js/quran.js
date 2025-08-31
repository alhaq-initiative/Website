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

  // Mobile menu toggle
  document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('mobile-menu-button');
    const menu = document.getElementById('mobile-menu');
    if (btn && menu) {
      btn.addEventListener('click', function () {
        const isHidden = menu.classList.toggle('hidden');
        btn.setAttribute('aria-expanded', (!isHidden).toString());
      });
    }
  });

  // Quran reader logic
  let currentLayout = 'hifz';
  let QuranText = {};
  let translations = {};

  function getSurahOptions(layout, search = '') {
    let options = '';
    search = search.trim().toLowerCase();
    for (let i = 1; i < QuranData.Sura.length; i++) {
      const s = QuranData.Sura[i];
      let label = layout === 'hifz'
        ? `${i}. ${s[5]} (Ayahs: ${s[1]})`
        : `${s[5]} (${s[6]}) - ${s[7]}`;
      if (
        label.toLowerCase().includes(search) ||
        s[5].toLowerCase().includes(search) ||
        s[6].toLowerCase().includes(search) ||
        s[7].toLowerCase().includes(search) ||
        i.toString() === search
      ) {
        options += `<option value='${i}'>${label}</option>`;
      }
    }
    return options;
  }

  function renderDropdown(layout) {
    currentLayout = layout;
    const dropdown = document.getElementById('surah-dropdown');
    if (!dropdown) return;
    dropdown.innerHTML = getSurahOptions(layout, document.getElementById('surah-search').value);
    const newDropdown = dropdown.cloneNode(true);
    dropdown.parentNode.replaceChild(newDropdown, dropdown);
    newDropdown.addEventListener('change', function() {
      const surahNum = this.value;
      if (surahNum) loadSurah(surahNum);
    });
  }

  function loadSurah(surahNum) {
    const surahData = QuranData.Sura[surahNum];
    const surahName = surahData[5];
    const ayahs = QuranText[surahNum] || [];
    let html = `<div class="text-center mb-4"><h4 class="font-bold text-brand-blue">${surahName}</h4></div>`;
    html += ayahs.length ? ayahs.map((a, i) => `<p class='mb-2'>${a} <span class="text-brand-gold">(${i+1})</span></p>`).join('') : '<p class="text-center text-gray-500">No text found.</p>';
    const arabic = document.getElementById('arabic-text');
    if (arabic) arabic.innerHTML = html;

    const translationDropdown = document.getElementById('translation-dropdown');
    const selectedTranslation = translationDropdown ? translationDropdown.value : '';
    const translationBox = document.getElementById('translation-text');
    if (selectedTranslation && translations[selectedTranslation]) {
      const translationAyahs = translations[selectedTranslation];
      let translationHtml = ayahs.map((a, i) => {
        const verseRef = `${surahNum}:${i + 1}`;
        const translationText = translationAyahs[verseRef] ? translationAyahs[verseRef].t : 'Translation not available.';
        return `<p class='mb-2'><strong>${i+1}.</strong> ${translationText}</p>`;
      }).join('');
      if (translationBox) translationBox.innerHTML = translationHtml;
    } else {
      if (translationBox) translationBox.innerHTML = '';
    }

    const arabicScroll = document.getElementById('arabic-scroll');
    if (arabicScroll) arabicScroll.scrollTop = 0;
  }

  function playRecitation(reciter) {
    const audio = document.getElementById('quran-audio');
    const dropdown = document.getElementById('surah-dropdown');
    const surahNum = dropdown ? dropdown.value : '';
    if (audio && surahNum) {
      const surahNumber = surahNum.toString().padStart(3, '0');
      const reciterUrls = {
        'mishary': `https://server8.mp3quran.net/afs/${surahNumber}.mp3`,
        'sudais': `https://server7.mp3quran.net/sds/${surahNumber}.mp3`,
        'ghamdi': `https://server7.mp3quran.net/s_gmd/${surahNumber}.mp3`
      };
      audio.src = reciterUrls[reciter] || reciterUrls['mishary'];
      audio.play();
    }
  }
  window.playRecitation = playRecitation; // expose for button onclicks

  // Initial data loading
  Promise.all([
    fetch('assets/Quran_Data/Quran.txt').then(r => r.text()),
    fetch('assets/Translations/en-maulana-wahiduddin-khan-inline-footnotes.json')
      .then(r => r.text())
      .then(text => { try { translations['en'] = JSON.parse(text); } catch (e) { console.error('Invalid JSON (EN):', e); } }),
    fetch('assets/Translations/pashto-sarfaraz-simple.json')
      .then(r => r.text())
      .then(text => { try { translations['ps'] = JSON.parse(text); } catch (e) { console.error('Invalid JSON (PS):', e); } })
  ]).then(([txt]) => {
    let lines = txt.split('\n');
    lines.forEach(line => {
      let m = line.match(/^(\d+)\|(\d+)\|(.*)$/);
      if (m) {
        let s = m[1], a = m[2], t = m[3];
        if (!QuranText[s]) QuranText[s] = [];
        QuranText[s][a - 1] = t;
      }
    });

    const hifzBtn = document.getElementById('hifzBtn');
    const madinahBtn = document.getElementById('madinahBtn');
    const search = document.getElementById('surah-search');
    const dropdown = document.getElementById('surah-dropdown');
    const translationDropdown = document.getElementById('translation-dropdown');

    if (hifzBtn) hifzBtn.onclick = function() { renderDropdown('hifz'); };
    if (madinahBtn) madinahBtn.onclick = function() { renderDropdown('madinah'); };
    if (search) search.addEventListener('input', function(){ renderDropdown(currentLayout); });
    if (dropdown) dropdown.addEventListener('change', function(){ if (this.value) loadSurah(this.value); });
    if (translationDropdown) translationDropdown.addEventListener('change', function(){ const s = dropdown && dropdown.value; if (s) loadSurah(s); });

    renderDropdown('hifz');
    let firstSurah = dropdown && dropdown.options[0] ? dropdown.options[0].value : '';
    if (firstSurah) loadSurah(firstSurah);
  });
})();
