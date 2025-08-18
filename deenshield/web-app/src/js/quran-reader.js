// @ts-nocheck
// Quran Reader JS for Deen Shield App
// © Alhaq Digital Services

class QuranReader {
    constructor() {
        this.quranData = null;
        this.currentSurah = 1;
        this.currentLayout = 'hifz';
        this.currentTranslation = 'en';
        this.quranText = {};
        this.translations = {
            en: {},
            ps: {}
        };
        this.audioPlayer = null;
        this.init();
    }

    async init() {
        await this.loadQuranData();
        this.setupEventListeners();
        this.populateSurahDropdown();
        this.loadTodaysVerse();
    }

    setupEventListeners() {
        // Button references
        const toggleBtn = document.getElementById('toggleFullQuranBtn');
        const todaysVerseBtn = document.getElementById('todaysVerseBtn');
        const randomVerseBtn = document.getElementById('randomVerseBtn');
        const dailySection = document.getElementById('dailyVerseSection');
        const fullSection = document.getElementById('fullQuranSection');

        // Show Full Quran
        if (toggleBtn && dailySection && fullSection) {
            toggleBtn.addEventListener('click', () => {
                fullSection.style.display = 'block';
                fullSection.style.opacity = '1';
                dailySection.style.display = 'none';
                dailySection.style.opacity = '0';
            });
        }
        // Show Today's Verse
        if (todaysVerseBtn && dailySection && fullSection) {
            todaysVerseBtn.addEventListener('click', () => {
                this.loadTodaysVerse();
                dailySection.style.display = 'block';
                dailySection.style.opacity = '1';
                fullSection.style.display = 'none';
                fullSection.style.opacity = '0';
            });
        }
        // Show Random Verse
        if (randomVerseBtn && dailySection && fullSection) {
            randomVerseBtn.addEventListener('click', () => {
                this.loadRandomVerse();
                dailySection.style.display = 'block';
                dailySection.style.opacity = '1';
                fullSection.style.display = 'none';
                fullSection.style.opacity = '0';
            });
        }

        // Layout switcher buttons  
        const hifzBtn = document.getElementById('hifzLayoutBtn');
        const madinahBtn = document.getElementById('madinahLayoutBtn');
        
        if (hifzBtn && madinahBtn) {
            hifzBtn.addEventListener('click', () => {
                this.setLayout('hifz');
                hifzBtn.classList.add('active');
                madinahBtn.classList.remove('active');
            });
            
            madinahBtn.addEventListener('click', () => {
                this.setLayout('madinah');
                madinahBtn.classList.add('active');
                hifzBtn.classList.remove('active');
            });
        }

        // Translation dropdown
        const translationSelect = document.getElementById('translationSelect');
        if (translationSelect) {
            translationSelect.addEventListener('change', (e) => {
                this.currentTranslation = e.target.value;
                if (this.currentSurah) {
                    this.loadSurah(this.currentSurah);
                }
            });
        }

        // Surah dropdown
        const surahSelect = document.getElementById('surahSelect');
        if (surahSelect) {
            surahSelect.addEventListener('change', (e) => {
                const surahNum = parseInt(e.target.value);
                if (surahNum) {
                    this.loadSurah(surahNum);
                }
            });
        }

        // Audio controls
        const playBtn = document.getElementById('playAudioBtn');
        if (playBtn) {
            playBtn.addEventListener('click', () => {
                this.playSurahAudio();
            });
        }
    }

    // @ts-ignore
    loadTodaysVerse() {
        // Use a deterministic method for today's verse (e.g., based on date)
        const totalVerses = 6236;
        const today = new Date();
        const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
        const verseNum = (dayOfYear % totalVerses) + 1;
        this.displayVerseByNumber(verseNum);
    }

    loadRandomVerse() {
        const totalVerses = 6236;
        const verseNum = Math.floor(Math.random() * totalVerses) + 1;
        this.displayVerseByNumber(verseNum);
    }

    displayVerseByNumber(verseNum) {
        // Find the surah and ayah for the given verse number
        let count = 0;
        for (let surah = 1; surah <= 114; surah++) {
            const ayahs = Object.keys(this.quranText[surah] || {});
            for (let i = 0; i < ayahs.length; i++) {
                count++;
                if (count === verseNum) {
                    const ayahNum = ayahs[i];
                    const arabic = this.quranText[surah][ayahNum];
                    let translation = '';
                    if (this.currentTranslation && this.translations[this.currentTranslation]) {
                        const key = `${surah}:${ayahNum}`;
                        translation = this.translations[this.currentTranslation][key] || '';
                    }
                    const surahName = window.QuranData && window.QuranData.Sura && window.QuranData.Sura[surah] ? window.QuranData.Sura[surah][0] : `Surah ${surah}`;
                    document.getElementById('arabicVerse').textContent = arabic;
                    document.getElementById('verseTranslation').textContent = translation;
                    document.getElementById('verseReference').textContent = `${surahName} ${surah}:${ayahNum}`;
                    // Update label to Today's Verse or Random Verse
                    const label = document.getElementById('todaysVerseLabel');
                    if (label) {
                        label.innerHTML = verseNum === ((Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24) % totalVerses) + 1) ? '<i class="fas fa-star"></i> Today\'s Verse' : '<i class="fas fa-random"></i> Random Verse';
                    }
                    return;
                }
            }
        }
    }

    setupEventListeners() {
        // Layout buttons
        const hifzBtn = document.getElementById('hifzLayoutBtn');
        const madinahBtn = document.getElementById('madinahLayoutBtn');
        
        if (hifzBtn && madinahBtn) {
            hifzBtn.addEventListener('click', () => this.setLayout('hifz'));
            madinahBtn.addEventListener('click', () => this.setLayout('madinah'));
        }

        // Surah selection
        const surahSelect = document.getElementById('surahSelect');
        if (surahSelect) {
            surahSelect.addEventListener('change', (e) => {
                this.loadSurah(parseInt(e.target.value));
            });
        }

        // Translation selection
        const translationSelect = document.getElementById('translationSelect');
        if (translationSelect) {
            translationSelect.addEventListener('change', (e) => {
                this.currentTranslation = e.target.value;
                this.loadSurah(this.currentSurah);
            });
        }

        // Audio button
        const audioBtn = document.getElementById('audioBtn');
        if (audioBtn) {
            audioBtn.addEventListener('click', () => this.playSurahAudio());
        }
    }

    loadTodaysVerse() {
        // Use a deterministic method for today's verse (e.g., based on date)
        const totalVerses = 6236;
        const today = new Date();
        const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
        const verseNum = (dayOfYear % totalVerses) + 1;
        this.displayVerseByNumber(verseNum);
    }

    loadRandomVerse() {
        const totalVerses = 6236;
        const verseNum = Math.floor(Math.random() * totalVerses) + 1;
        this.displayVerseByNumber(verseNum);
    }

    displayVerseByNumber(verseNum) {
        // Find the surah and ayah for the given verse number
        let count = 0;
        const totalVerses = 6236;
        for (let surah = 1; surah <= 114; surah++) {
            const ayahs = Object.keys(this.quranText[surah] || {});
            for (let i = 0; i < ayahs.length; i++) {
                count++;
                if (count === verseNum) {
                    const ayahNum = ayahs[i];
                    const arabic = this.quranText[surah][ayahNum];
                    let translation = '';
                    if (this.currentTranslation && this.translations[this.currentTranslation]) {
                        const key = `${surah}:${ayahNum}`;
                        translation = this.translations[this.currentTranslation][key] || '';
                    }
                    const surahName = window.QuranData && window.QuranData.Sura && window.QuranData.Sura[surah] ? window.QuranData.Sura[surah][0] : `Surah ${surah}`;
                    document.getElementById('arabicVerse').textContent = arabic;
                    document.getElementById('verseTranslation').textContent = translation;
                    document.getElementById('verseReference').textContent = `${surahName} ${surah}:${ayahNum}`;
                    // Update label to Today's Verse or Random Verse
                    const label = document.getElementById('todaysVerseLabel');
                    if (label) {
                        const today = new Date();
                        const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
                        const todaysVerseNum = (dayOfYear % totalVerses) + 1;
                        label.innerHTML = verseNum === todaysVerseNum ? '<i class="fas fa-star"></i> Today\'s Verse' : '<i class="fas fa-random"></i> Random Verse';
                    }
                    return;
                }
            }
        }
    }

    async loadQuranData() {
        try {
            // Load Quran metadata
            const metadataResponse = await fetch('assets/Quran_Data/Metadata.js');
            const metadataText = await metadataResponse.text();
            // Execute the metadata script
            eval(metadataText);
            
            // Load Quran text
            const quranResponse = await fetch('assets/Quran_Data/Quran.txt');
            const quranText = await quranResponse.text();
            this.parseQuranText(quranText);

            // Load English translation
            const enResponse = await fetch('assets/Translations/en-maulana-wahiduddin-khan-inline-footnotes.json');
            this.translations.en = await enResponse.json();
            
            // Load Pashto translation
            const psResponse = await fetch('assets/Translations/pashto-sarfaraz-simple.json');
            this.translations.ps = await psResponse.json();

            console.log('Quran data loaded successfully');
            return true;
        } catch (error) {
            console.error('Error loading Quran data:', error);
            return false;
        }
    }

    parseQuranText(text) {
        const lines = text.split('\n');
        let currentSurah = 1;
        let currentAyah = 0;
        
        this.quranText = {};

        for (const line of lines) {
            if (line.trim() === '') continue;
            
            // Format is surah|ayah|text
            const parts = line.split('|');
            if (parts.length !== 3) continue;
            
            const surahNum = parseInt(parts[0]);
            const ayahNum = parseInt(parts[1]);
            const ayahText = parts[2];
            
            if (!this.quranText[surahNum]) {
                this.quranText[surahNum] = {};
            }
            
            this.quranText[surahNum][ayahNum] = ayahText;
            
            currentSurah = surahNum;
            currentAyah = ayahNum;
        }
    }

    populateSurahDropdown() {
        const dropdown = document.getElementById('surahSelect');
        if (!dropdown || !window.QuranData) return;
        
        dropdown.innerHTML = '';
        
        for (let i = 1; i < QuranData.Sura.length; i++) {
            const surah = QuranData.Sura[i];
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `${i}. ${surah[5]} (${surah[6]})`;
            dropdown.appendChild(option);
        }
    }

    loadSurah(surahNum) {
        if (!this.quranText[surahNum]) {
            console.error(`Surah ${surahNum} not found in Quran text`);
            return;
        }
        
        this.currentSurah = surahNum;
        const contentDiv = document.getElementById('quranContent');
        if (!contentDiv) return;
        
        // Clear previous content
        contentDiv.innerHTML = '';
        
        // Add Bismillah except for Surah 9
        if (surahNum !== 9) {
            contentDiv.innerHTML += '<div class="bismillah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>';
        }
        
        // Add surah name as header
        const surahName = QuranData.Sura[surahNum][5];
        contentDiv.innerHTML += `<h3 class="surah-title">${surahName}</h3>`;
        
        // Set layout class
        contentDiv.className = `quran-content-text quran-text-${this.currentLayout}`;
        
        // Add each verse
        const ayahCount = QuranData.Sura[surahNum][1];
        for (let i = 1; i <= ayahCount; i++) {
            const ayahText = this.quranText[surahNum][i];
            const verseDiv = document.createElement('div');
            verseDiv.className = 'verse';
            
            // Add Arabic text
            verseDiv.innerHTML = `${ayahText} <span class="verse-number">${i}</span>`;
            
            // Add translation if selected
            if (this.currentTranslation && this.translations[this.currentTranslation]) {
                const translationKey = `${surahNum}:${i}`;
                const translation = this.translations[this.currentTranslation][translationKey];
                
                if (translation) {
                    const translationDiv = document.createElement('div');
                    translationDiv.className = 'verse-translation';
                    translationDiv.textContent = translation;
                    verseDiv.appendChild(translationDiv);
                }
            }
            
            contentDiv.appendChild(verseDiv);
        }
    }

    setLayout(layout) {
        this.currentLayout = layout;
        
        // Update active button styling
        const hifzBtn = document.getElementById('hifzLayoutBtn');
        const madinahBtn = document.getElementById('madinahLayoutBtn');
        
        if (hifzBtn && madinahBtn) {
            if (layout === 'hifz') {
                hifzBtn.classList.add('active');
                madinahBtn.classList.remove('active');
            } else {
                hifzBtn.classList.remove('active');
                madinahBtn.classList.add('active');
            }
        }
        
        // Reload the current surah with new layout
        this.loadSurah(this.currentSurah);
    }

    playSurahAudio() {
        const reciter = 'mishary-rashid-alafasy';
        const surahNum = this.currentSurah.toString().padStart(3, '0');
        const audioURL = `https://server8.mp3quran.net/${reciter}/${surahNum}.mp3`;
        
        if (!this.audioPlayer) {
            this.audioPlayer = new Audio();
        }
        
        // Stop current audio if playing
        this.audioPlayer.pause();
        this.audioPlayer.src = audioURL;
        
        // Play new audio
        this.audioPlayer.play()
            .catch(error => {
                console.error('Error playing audio:', error);
                alert('Unable to play audio. Please try again later.');
            });
        
        // Update button
        const audioBtn = document.getElementById('audioBtn');
        if (audioBtn) {
            audioBtn.innerHTML = '<i class="fas fa-pause"></i> Pause Audio';
            
            const updateButton = () => {
                audioBtn.innerHTML = '<i class="fas fa-volume-up"></i> Play Audio';
            };
            
            this.audioPlayer.onended = updateButton;
            this.audioPlayer.onerror = updateButton;
            
            // Toggle play/pause
            audioBtn.onclick = () => {
                if (this.audioPlayer.paused) {
                    this.audioPlayer.play();
                    audioBtn.innerHTML = '<i class="fas fa-pause"></i> Pause Audio';
                } else {
                    this.audioPlayer.pause();
                    audioBtn.innerHTML = '<i class="fas fa-volume-up"></i> Play Audio';
                }
            };
        }
    }
}

// Initialize when the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.quranReader = new QuranReader();
});
