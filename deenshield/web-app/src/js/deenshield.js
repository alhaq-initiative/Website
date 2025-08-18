// @ts-nocheck
// Drawer open/close logic
document.addEventListener('DOMContentLoaded', function() {
    const drawerToggle = document.getElementById('drawerToggle');
    const sideDrawer = document.getElementById('sideDrawer');
    const drawerBackdrop = document.getElementById('drawerBackdrop');
    const drawerClose = document.getElementById('drawerClose');
    if (drawerToggle && sideDrawer && drawerBackdrop) {
        function openDrawer() {
            sideDrawer.classList.add('open');
            drawerBackdrop.classList.add('open');
        }
        function closeDrawer() {
            sideDrawer.classList.remove('open');
            drawerBackdrop.classList.remove('open');
        }
        drawerToggle.addEventListener('click', openDrawer);
        drawerBackdrop.addEventListener('click', closeDrawer);
        if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
        // Keyboard ESC closes drawer
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') closeDrawer();
        });
        // Drawer navigation logic for tab switching
        document.querySelectorAll('.drawer-link[data-tab]').forEach(btn => {
            btn.addEventListener('click', function() {
                const tab = btn.getAttribute('data-tab');
                console.log('Drawer navigation clicked:', tab); // Debug log
                if (tab) {
                    // Will be handled after app initialization
                    window.pendingTabSwitch = tab;
                    closeDrawer();
                }
            });
        });
        // Add more drawer item logic as needed
    }
});
// Deen Shield - Islamic Productivity Application
// Main JavaScript functionality for tab navigation, prayer times, Quran study, dhikr counter, and more
// © Alhaq Digital Services

class DeenShieldApp {
    constructor() {
        this.currentTab = 'dashboard';
        this.prayerTimes = {};
        this.location = null;
        this.settings = this.loadStoredSettings();
        this.dhikrCounter = 0;
        this.currentDhikr = 'subhan';
        this.currentAzkarCategory = 'basic';
        this.dhikrTarget = 33;
        this.dhikrInitialized = false;
        
        // Tasks and Prayer Management
        this.tasks = this.loadTasks();
        this.prayerNotifications = [];
        this.notificationTimer = null;
        this.geolocationWatcher = null;
        
        // Browser Extension Integration
        this.extensionConnected = false;
        this.extensionStatus = {
            installed: false,
            active: false,
            version: null,
            blockedToday: 0,
            lastSync: null
        };
        this.digitalWellnessData = this.loadDigitalWellnessData();
        
        // Initialize core functionality
        this.init();
        this.azkarDatabase = {
            basic: {
                title: 'Basic Dhikr',
                azkar: {
                    'subhan': { arabic: 'سُبْحَانَ اللّٰهِ', translation: 'SubhanAllah', target: 33 },
                    'alhamdulillah': { arabic: 'الْحَمْدُ لِلّٰهِ', translation: 'Alhamdulillah', target: 33 },
                    'allahu-akbar': { arabic: 'اللّٰهُ أَكْبَرُ', translation: 'Allahu Akbar', target: 34 },
                    'la-ilaha': { arabic: 'لَا إِلٰهَ إِلَّا اللّٰهُ', translation: 'La ilaha illa Allah', target: 100 }
                }
            },
            morning: {
                title: 'Morning Azkar',
                azkar: {
                    'astaghfirullah': { arabic: 'أَسْتَغْفِرُ اللّٰهَ الْعَظِيمَ الَّذِي لَا إِلٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ', translation: 'I seek forgiveness from Allah', target: 3 },
                    'ayatul-kursi': { arabic: 'اللّٰهُ لَا إِلٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ', translation: 'Allah - there is no deity except Him, the Ever-Living, the Sustainer', target: 1 },
                    'morning-protection': { arabic: 'أَعُوذُ بِاللّٰهِ مِنَ الشَّيْطَانِ الرَّجِيمِ', translation: 'I seek refuge in Allah from Satan the accursed', target: 3 },
                    'bismillah-morning': { arabic: 'بِسْمِ اللّٰهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ', translation: 'In the name of Allah with whose name nothing can harm', target: 3 },
                    'hasballahu': { arabic: 'حَسْبِيَ اللّٰهُ لَا إِلٰهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ', translation: 'Allah is sufficient for me', target: 7 },
                    'radeetu-billah': { arabic: 'رَضِيتُ بِاللّٰهِ رَبًّا وَبِالْإِسْلَامِ دِينًا وَبِمُحَمَّدٍ رَسُولًا', translation: 'I am pleased with Allah as my Lord, Islam as my religion, and Muhammad as my messenger', target: 3 },
                    'la-hawla': { arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللّٰهِ', translation: 'There is no power except with Allah', target: 10 },
                    'subhan-rabbi': { arabic: 'سُبْحَانَ رَبِّيَ الْعَظِيمِ وَبِحَمْدِهِ', translation: 'Glory be to my Lord, the Most Great, and praise be to Him', target: 10 }
                }
            },
            evening: {
                title: 'Evening Azkar',
                azkar: {
                    'astaghfirullah-evening': { arabic: 'أَسْتَغْفِرُ اللّٰهَ الْعَظِيمَ', translation: 'I seek forgiveness from Allah, the Most Great', target: 3 },
                    'evening-protection': { arabic: 'أَعُوذُ بِكَلِمَاتِ اللّٰهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ', translation: 'I seek refuge in the perfect words of Allah from the evil of what He created', target: 3 },
                    'evening-bismillah': { arabic: 'بِسْمِ اللّٰهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ', translation: 'In the name of Allah with whose name nothing can harm', target: 3 },
                    'amseena': { arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلّٰهِ وَالْحَمْدُ لِلّٰهِ', translation: 'We have reached the evening and the dominion belongs to Allah', target: 1 },
                    'allahumma-bika': { arabic: 'اللّٰهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ', translation: 'O Allah, by You we have reached the evening', target: 1 },
                    'evening-hasbi': { arabic: 'حَسْبِيَ اللّٰهُ لَا إِلٰهَ إِلَّا هُوَ', translation: 'Allah is sufficient for me, there is no deity except Him', target: 7 },
                    'qul-huwa': { arabic: 'قُلْ هُوَ اللّٰهُ أَحَدٌ', translation: 'Say: He is Allah, the One', target: 3 }
                }
            },
            'after-prayer': {
                title: 'After Prayer Azkar',
                azkar: {
                    'prayer-subhan': { arabic: 'سُبْحَانَ اللّٰهِ', translation: 'Glory be to Allah', target: 33 },
                    'prayer-alhamdulillah': { arabic: 'الْحَمْدُ لِلّٰهِ', translation: 'Praise be to Allah', target: 33 },
                    'prayer-allahu-akbar': { arabic: 'اللّٰهُ أَكْبَرُ', translation: 'Allah is the Greatest', target: 34 },
                    'post-prayer-dua': { arabic: 'اللّٰهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ', translation: 'O Allah, help me to remember You, thank You, and worship You well', target: 1 },
                    'ayatul-kursi-prayer': { arabic: 'اللّٰهُ لَا إِلٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ', translation: 'Allah - there is no deity except Him, the Ever-Living', target: 1 },
                    'rabbana-atina': { arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', translation: 'Our Lord, give us good in this world and good in the hereafter', target: 1 }
                }
            },
            'before-sleep': {
                title: 'Before Sleep Azkar',
                azkar: {
                    'bismika-rabbi': { arabic: 'بِاسْمِكَ رَبِّي وَضَعْتُ جَنبِي وَبِكَ أَرْفَعُهُ', translation: 'In Your name, my Lord, I lay down my side', target: 1 },
                    'allahumma-qini': { arabic: 'اللّٰهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ', translation: 'O Allah, protect me from Your punishment', target: 3 },
                    'sleep-astaghfir': { arabic: 'أَسْتَغْفِرُ اللّٰهَ الَّذِي لَا إِلٰهَ إِلَّا هُوَ', translation: 'I seek forgiveness from Allah', target: 3 },
                    'subhan-rabbi-ali': { arabic: 'سُبْحَانَ رَبِّيَ الْأَعْلَى', translation: 'Glory be to my Lord, the Most High', target: 3 },
                    'sleep-protection': { arabic: 'أَعُوذُ بِكَلِمَاتِ اللّٰهِ التَّامَّةِ مِنْ غَضَبِهِ وَعِقَابِهِ', translation: 'I seek refuge in the perfect words of Allah', target: 1 }
                }
            },
            istighfar: {
                title: 'Istighfar (Seeking Forgiveness)',
                azkar: {
                    'simple-astaghfir': { arabic: 'أَسْتَغْفِرُ اللّٰهَ', translation: 'I seek forgiveness from Allah', target: 100 },
                    'astaghfir-rabbi': { arabic: 'أَسْتَغْفِرُ اللّٰهَ رَبِّي مِنْ كُلِّ ذَنْبٍ وَأَتُوبُ إِلَيْهِ', translation: 'I seek forgiveness from Allah, my Lord, from every sin', target: 10 },
                    'sayyid-istighfar': { arabic: 'اللّٰهُمَّ أَنْتَ رَبِّي لَا إِلٰهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ', translation: 'O Allah, You are my Lord, there is no deity except You', target: 1 }
                }
            },
            salawat: {
                title: 'Salawat (Blessings on Prophet)',
                azkar: {
                    'simple-salawat': { arabic: 'اللّٰهُمَّ صَلِّ عَلَى مُحَمَّدٍ', translation: 'O Allah, send blessings upon Muhammad', target: 10 },
                    'ibrahim-salawat': { arabic: 'اللّٰهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ', translation: 'O Allah, send blessings upon Muhammad and his family', target: 3 },
                    'durood-sharif': { arabic: 'صَلَّى اللّٰهُ عَلَيْهِ وَسَلَّمَ', translation: 'May Allah bless him and grant him peace', target: 100 },
                    'comprehensive-salawat': { arabic: 'اللّٰهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ', translation: 'O Allah, send blessings, peace and barakah upon our Prophet Muhammad', target: 10 }
                }
            }
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupProfileMenu();
        this.setupDrawerNavigation(); // Setup drawer navigation
        this.updateCurrentTime();
        this.renderDashboardWidgets();
        this.loadProfilePicture();
        this.initTaskManager(); // Initialize task manager
        this.initExtensionIntegration(); // Initialize browser extension integration
        // Don't initialize dhikr immediately - wait for tab to be shown
        this.updateWidgetContent();
        this.setupWindowResizeHandler(); // Setup responsive scaling handler
        
        // Initialize page title
        this.updatePageTitle(this.currentTab);
        
        // Handle pending tab switch if any
        if (window.pendingTabSwitch) {
            this.showTab(window.pendingTabSwitch);
            window.pendingTabSwitch = null;
        }
        
        // Update time every second
        setInterval(() => this.updateCurrentTime(), 1000);
        // Update widget content every 30 seconds
        setInterval(() => this.updateWidgetContent(), 30000);
    }

    // Centralized updater for dashboard widgets and external consumers
    updateWidgetContent() {
        // Ensure objects exist
        const extensionStatus = this.extensionStatus || { active: false, version: null, blockedToday: 0 };
        const wellness = this.digitalWellnessData || { protectionPercentage: 0, blockedToday: 0, focusTime: 0 };

        // 1) Update built-in Extension Status widget
        try {
            const indicatorEl = document.getElementById('extensionIndicator');
            const statusTextEl = document.getElementById('statusText');
            const versionEl = document.getElementById('extVersion');
            const blockedEl = document.getElementById('blockedCount');

            if (indicatorEl) {
                indicatorEl.classList.toggle('active', !!extensionStatus.active);
                indicatorEl.classList.toggle('inactive', !extensionStatus.active);
            }
            if (statusTextEl) statusTextEl.textContent = extensionStatus.active ? 'Active & Protected' : 'Inactive';
            if (versionEl) versionEl.textContent = extensionStatus.version || '-';
            if (blockedEl) blockedEl.textContent = Number.isFinite(extensionStatus.blockedToday) ? extensionStatus.blockedToday : (Number.isFinite(wellness.blockedToday) ? wellness.blockedToday : 0);
        } catch (e) { /* no-op */ }

        // 2) Update Digital Wellness widget
        try {
            const percentageEl = document.querySelector('.wellness-widget .percentage');
            const todayBlockedEl = document.getElementById('todayBlocked');
            const focusTimeEl = document.getElementById('focusTime');

            const protectionPercentage = Number.isFinite(wellness.protectionPercentage) ? wellness.protectionPercentage : Math.min(100, Math.max(0, (extensionStatus.active ? 75 : 25)));
            const blockedToday = Number.isFinite(wellness.blockedToday) ? wellness.blockedToday : (Number.isFinite(extensionStatus.blockedToday) ? extensionStatus.blockedToday : 0);
            const focusTime = Number.isFinite(wellness.focusTime) ? wellness.focusTime : 0;

            if (percentageEl) percentageEl.textContent = `${protectionPercentage}%`;
            if (todayBlockedEl) todayBlockedEl.textContent = blockedToday;
            if (focusTimeEl) focusTimeEl.textContent = `${focusTime}h`;
            const circle = document.querySelector('.wellness-widget .circle-progress');
            if (circle) circle.setAttribute('data-percent', String(protectionPercentage));
        } catch (e) { /* no-op */ }

        // 3) Update Prayer Times widget list if any stored times
        try {
            const prayerTimes = this.prayerTimes && Object.keys(this.prayerTimes).length ? this.prayerTimes : (JSON.parse(localStorage.getItem('deenshield_prayerTimes') || 'null') || null);
            const listEl = document.getElementById('widgetPrayerTimes');
            if (listEl && prayerTimes) {
                listEl.innerHTML = Object.entries(prayerTimes).map(([name, time]) => `<div class="prayer-item"><span>${name}</span><span>${time}</span></div>`).join('');
            }
        } catch (e) { /* no-op */ }

        // 4) Update Protection Schedule widget from settings or defaults
        try {
            const schedule = (this.settings && this.settings.protectionSchedule) || {
                'Fajr - Sunrise': { mode: 'Enhanced' },
                'Work Hours': { mode: 'Standard' },
                'Maghrib+': { mode: 'Enhanced' }
            };
            const timeline = document.querySelector('.schedule-widget .protection-timeline');
            if (timeline) {
                timeline.innerHTML = Object.entries(schedule).map(([slot, cfg]) => `
                    <div class="timeline-item">
                        <span class="time">${slot}</span>
                        <span class="mode">${(cfg && cfg.mode) ? cfg.mode : '-'}</span>
                    </div>
                `).join('');
            }
        } catch (e) { /* no-op */ }

        // 5) Broadcast an update event for other modules (e.g., components/DashboardWidgets.js)
        try {
            const eventDetail = {
                stats: {
                    protectionPercentage: Number(document.querySelector('.wellness-widget .percentage')?.textContent?.replace('%', '')) || 0,
                    blockedToday: Number(document.getElementById('todayBlocked')?.textContent) || 0,
                    focusTime: parseFloat((document.getElementById('focusTime')?.textContent || '0').replace('h', '')) || 0
                },
                settings: {
                    protectionSchedule: (this.settings && this.settings.protectionSchedule) || null,
                    prayerTimes: this.prayerTimes || null
                },
                extensionStatus: this.extensionStatus || {}
            };
            window.dispatchEvent(new CustomEvent('deenshield-update', { detail: eventDetail }));
        } catch (e) { /* no-op */ }
    }
    // Widget definitions
    getAvailableWidgets() {
        return {
            prayerTimes: {
                id: 'prayerTimes',
                title: 'Prayer Times',
                html: `<div class="widget-header"><h4><i class="fas fa-pray"></i> Prayer Times</h4></div>
                       <div class="prayer-times-widget">
                           <div class="next-prayer"><span id="nextPrayerName">Asr</span> <strong id="nextPrayerTime">3:45 PM</strong></div>
                           <div class="prayer-list" id="widgetPrayerTimes">
                               <div class="prayer-item"><span>Fajr</span><span>5:30 AM</span></div>
                               <div class="prayer-item"><span>Dhuhr</span><span>1:15 PM</span></div>
                               <div class="prayer-item current"><span>Asr</span><span>3:45 PM</span></div>
                               <div class="prayer-item"><span>Maghrib</span><span>6:20 PM</span></div>
                               <div class="prayer-item"><span>Isha</span><span>8:00 PM</span></div>
                           </div>
                       </div>`,
                icon: 'fas fa-pray',
                closable: true,
                category: 'Prayer'
            },
            quranStudy: {
                id: 'quranStudy',
                title: 'Quran Study',
                html: `<div class="widget-header"><h4><i class="fas fa-quran"></i> Quran Study</h4></div>
                       <div class="quran-widget">
                           <div class="today-verse" id="todayVerseWidget">
                               <div class="arabic-text">بسم الله الرحمن الرحيم</div>
                               <div class="translation">"In the name of Allah, the Entirely Merciful, the Especially Merciful."</div>
                               <div class="reference">Al-Fatihah 1:1</div>
                           </div>
                           <div class="quran-actions">
                               <button onclick="window.deenShield.switchTab('quran')" class="widget-btn">Study Quran</button>
                               <button onclick="window.quranReader && window.quranReader.loadRandomVerse()" class="widget-btn">Random Verse</button>
                           </div>
                       </div>`,
                icon: 'fas fa-quran',
                closable: true,
                category: 'Quran'
            },
            dhikrCounter: {
                id: 'dhikrCounter',
                title: 'Dhikr Counter',
                html: `<div class="widget-header"><h4><i class="fas fa-dharmachakra"></i> Dhikr Counter</h4></div>
                       <div class="dhikr-widget">
                           <div class="dhikr-display">
                               <div class="dhikr-arabic" id="widgetDhikrArabic">سُبْحَانَ اللّٰهِ</div>
                               <div class="dhikr-translation" id="widgetDhikrTranslation">SubhanAllah</div>
                               <div class="dhikr-count"><span id="widgetDhikrCount">0</span> / <span id="widgetDhikrTarget">33</span></div>
                           </div>
                           <div class="dhikr-controls">
                               <button onclick="window.deenShield.incrementDhikr()" class="dhikr-btn">+1</button>
                               <button onclick="window.deenShield.switchTab('dhikr')" class="widget-btn">Open Dhikr</button>
                           </div>
                       </div>`,
                icon: 'fas fa-dharmachakra',
                closable: true,
                category: 'Dhikr'
            },
            library: {
                id: 'library',
                title: 'Islamic Library',
                html: `<div class="widget-header"><h4><i class="fas fa-book"></i> Islamic Library</h4></div>
                       <div class="library-widget">
                           <div class="library-stats">
                               <div class="stat-item"><span>Books</span><strong>150+</strong></div>
                               <div class="stat-item"><span>Articles</span><strong>500+</strong></div>
                               <div class="stat-item"><span>Media</span><strong>200+</strong></div>
                           </div>
                           <div class="library-actions">
                               <button onclick="window.deenShield.switchTab('library')" class="widget-btn">Browse Library</button>
                               <a href="https://www.alhaqds.software/library.html" target="_blank" class="widget-btn">Full Library</a>
                           </div>
                       </div>`,
                icon: 'fas fa-book',
                closable: true,
                category: 'Library'
            },
            tasks: {
                id: 'tasks',
                title: 'Tasks & Productivity',
                html: `<div class="widget-header"><h4><i class="fas fa-tasks"></i> Today's Tasks</h4></div>
                       <div class="tasks-widget">
                           <div class="task-summary">
                               <div class="task-progress"><span id="widgetTasksCompleted">3</span> / <span id="widgetTasksTotal">8</span> completed</div>
                               <div class="progress-bar"><div class="progress-fill" style="width: 37.5%"></div></div>
                           </div>
                           <div class="upcoming-tasks" id="widgetUpcomingTasks">
                               <div class="task-item-mini"><span class="task-time">8:00 AM</span><span class="task-name">Quran Reading</span></div>
                               <div class="task-item-mini"><span class="task-time">10:00 AM</span><span class="task-name">Team Meeting</span></div>
                               <div class="task-item-mini"><span class="task-time">2:00 PM</span><span class="task-name">Dhuhr Prayer</span></div>
                           </div>
                           <div class="task-actions">
                               <button onclick="window.deenShield.switchTab('productivity')" class="widget-btn">Manage Tasks</button>
                           </div>
                       </div>`,
                icon: 'fas fa-tasks',
                closable: true,
                category: 'Productivity'
            },
            greeting: {
                id: 'greeting',
                title: 'Welcome',
                html: `<div class="widget-header"><h4><i class="fas fa-sun"></i> <span id="greetingTime">Good Afternoon</span></h4></div>
                       <div class="greeting-widget">
                           <div class="greeting-message">
                               <p>السلام عليكم ورحمة الله وبركاته</p>
                               <p>May Allah bless your day with peace and productivity</p>
                           </div>
                           <div class="islamic-date" id="islamicDate">Loading Islamic date...</div>
                       </div>`,
                icon: 'fas fa-sun',
                closable: true,
                category: 'General'
            },
            quickActions: {
                id: 'quickActions',
                title: 'Quick Actions',
                html: `<div class="widget-header"><h4><i class="fas fa-bolt"></i> Quick Actions</h4></div>
                       <div class="quick-actions-widget">
                           <div class="action-grid">
                               <button onclick="window.deenShield.switchTab('quran')" class="action-btn"><i class="fas fa-quran"></i><span>Read Quran</span></button>
                               <button onclick="window.deenShield.switchTab('dhikr')" class="action-btn"><i class="fas fa-dharmachakra"></i><span>Dhikr</span></button>
                               <button onclick="window.deenShield.switchTab('prayer-times')" class="action-btn"><i class="fas fa-pray"></i><span>Prayer Times</span></button>
                               <button onclick="window.deenShield.switchTab('productivity')" class="action-btn"><i class="fas fa-tasks"></i><span>Tasks</span></button>
                           </div>
                       </div>`,
                icon: 'fas fa-bolt',
                closable: true,
                category: 'General'
            },
            islamicCalendar: {
                id: 'islamicCalendar',
                title: 'Islamic Calendar',
                html: `<div class="widget-header"><h4><i class="fas fa-calendar-alt"></i> Islamic Calendar</h4></div>
                       <div class="calendar-widget">
                           <div class="hijri-date" id="hijriDate">15 Rajab 1446</div>
                           <div class="gregorian-date" id="gregorianDate">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                           <div class="islamic-events" id="islamicEvents">
                               <div class="event-item">No special events today</div>
                           </div>
                       </div>`,
                icon: 'fas fa-calendar-alt',
                closable: true,
                category: 'General'
            },
            extensionStatus: {
                id: 'extensionStatus',
                title: 'Deen Shield Extension',
                html: `<div class="widget-header"><h4><i class="fas fa-shield-alt"></i> Extension Status</h4></div>
                       <div class="extension-widget">
                           <div class="extension-status" id="extensionStatusDisplay">
                               <div class="status-indicator" id="extensionIndicator">
                                   <i class="fas fa-circle" id="statusIcon"></i>
                                   <span id="statusText">Checking...</span>
                               </div>
                               <div class="extension-info" id="extensionInfo">
                                   <div class="info-item"><span>Version:</span><span id="extVersion">-</span></div>
                                   <div class="info-item"><span>Blocked Today:</span><span id="blockedCount">-</span></div>
                               </div>
                           </div>
                           <div class="extension-actions">
                               <button onclick="window.deenShield.checkExtension()" class="widget-btn">Refresh Status</button>
                               <button onclick="window.deenShield.openExtensionSettings()" class="widget-btn">Extension Settings</button>
                           </div>
                       </div>`,
                icon: 'fas fa-shield-alt',
                closable: true,
                category: 'Protection'
            },
            digitalWellness: {
                id: 'digitalWellness',
                title: 'Digital Wellness',
                html: `<div class="widget-header"><h4><i class="fas fa-heartbeat"></i> Digital Wellness</h4></div>
                       <div class="wellness-widget">
                           <div class="wellness-stats">
                               <div class="stat-circle">
                                   <div class="circle-progress" data-percent="75">
                                       <div class="circle-text">
                                           <span class="percentage">75%</span>
                                           <span class="label">Protected</span>
                                       </div>
                                   </div>
                               </div>
                               <div class="wellness-metrics">
                                   <div class="metric-item">
                                       <i class="fas fa-shield-alt"></i>
                                       <span class="metric-value" id="todayBlocked">23</span>
                                       <span class="metric-label">Blocked Today</span>
                                   </div>
                                   <div class="metric-item">
                                       <i class="fas fa-clock"></i>
                                       <span class="metric-value" id="focusTime">4.2h</span>
                                       <span class="metric-label">Focus Time</span>
                                   </div>
                               </div>
                           </div>
                           <div class="wellness-actions">
                               <button onclick="window.deenShield.toggleIslamicMode()" class="widget-btn" id="islamicModeBtn">Enable Islamic Mode</button>
                           </div>
                       </div>`,
                icon: 'fas fa-heartbeat',
                closable: true,
                category: 'Protection'
            },
            protectionSchedule: {
                id: 'protectionSchedule',
                title: 'Protection Schedule',
                html: `<div class="widget-header"><h4><i class="fas fa-calendar-check"></i> Protection Schedule</h4></div>
                       <div class="schedule-widget">
                           <div class="schedule-status">
                               <div class="current-mode" id="currentProtectionMode">
                                   <i class="fas fa-shield-alt"></i>
                                   <span>Standard Protection</span>
                               </div>
                               <div class="next-change" id="nextModeChange">
                                   Next: Enhanced mode at Maghrib (6:20 PM)
                               </div>
                           </div>
                           <div class="protection-timeline">
                               <div class="timeline-item active">
                                   <span class="time">Fajr - Sunrise</span>
                                   <span class="mode">Enhanced</span>
                               </div>
                               <div class="timeline-item">
                                   <span class="time">Work Hours</span>
                                   <span class="mode">Standard</span>
                               </div>
                               <div class="timeline-item">
                                   <span class="time">Maghrib+</span>
                                   <span class="mode">Enhanced</span>
                               </div>
                           </div>
                           <div class="schedule-actions">
                               <button onclick="window.deenShield.editProtectionSchedule()" class="widget-btn">Edit Schedule</button>
                           </div>
                       </div>`,
                icon: 'fas fa-calendar-check',
                closable: true,
                category: 'Protection'
            }
        };
    }

    getDefaultWidgetOrder() {
        return ['greeting', 'extensionStatus', 'prayerTimes', 'digitalWellness', 'quranStudy', 'dhikrCounter', 'tasks', 'protectionSchedule'];
    }

    renderDashboardWidgets() {
        const container = document.getElementById('dashboard-widgets');
        if (!container) return;
        
        // Load from localStorage or use default
        let widgetOrder = JSON.parse(localStorage.getItem('dashboardWidgetOrder') || 'null') || this.getDefaultWidgetOrder();
        let closedWidgets = JSON.parse(localStorage.getItem('dashboardClosedWidgets') || '[]');
        let widgetPositions = JSON.parse(localStorage.getItem('dashboardWidgetPositions') || '{}');
        let widgetZ = JSON.parse(localStorage.getItem('dashboardWidgetZ') || '{}');
        let maxZ = parseInt(localStorage.getItem('dashboardWidgetMaxZ') || '150');

        // Sanitize (ensure on-screen) saved positions if viewport changed
        let viewportChanged = false;
        Object.keys(widgetPositions).forEach(id => {
            const pos = widgetPositions[id];
            if (!pos) return;
            let changed = false;
            const minVisibleX = 40; // ensure at least 40px visible
            const minVisibleY = 40;
            const assumedWidth = 300; // fallback typical width
            const assumedHeight = 200; // fallback typical height
            if (pos.left > window.innerWidth - minVisibleX) { pos.left = window.innerWidth - minVisibleX; changed = true; }
            if (pos.top > window.innerHeight - minVisibleY) { pos.top = window.innerHeight - minVisibleY; changed = true; }
            if (pos.left + assumedWidth < minVisibleX) { pos.left = minVisibleX - Math.min(assumedWidth - 40, assumedWidth - 80); changed = true; }
            if (pos.top + assumedHeight < minVisibleY) { pos.top = minVisibleY; changed = true; }
            if (changed) viewportChanged = true;
        });
        if (viewportChanged) {
            localStorage.setItem('dashboardWidgetPositions', JSON.stringify(widgetPositions));
        }
        
        const widgets = this.getAvailableWidgets();
        container.innerHTML = '';
        
        let positionOffset = 0;
        
        widgetOrder.forEach((id, index) => {
            if (!closedWidgets.includes(id) && widgets[id]) {
                const w = widgets[id];
                const card = document.createElement('div');
                card.className = 'stat-card dashboard-widget';
                card.setAttribute('data-widget', id);
                card.innerHTML = `<div class='stat-icon'><i class='${w.icon}'></i></div><div class='stat-content'>${w.html}</div>`;
                
                // Set initial position (free floating)
                let position = widgetPositions[id] || {
                    left: 50 + (positionOffset * 320), // Stagger widgets horizontally
                    top: 100 + (Math.floor(positionOffset / 3) * 220) // Stack vertically after 3 widgets
                };
                
                // Ensure widgets stay within viewport bounds
                position.left = Math.max(0, Math.min(position.left, window.innerWidth - 300));
                position.top = Math.max(60, Math.min(position.top, window.innerHeight - 200));
                
                card.style.left = position.left + 'px';
                card.style.top = position.top + 'px';
                
                positionOffset++;
                
                // Restore widget size if set and apply content scaling
                let widgetSizes = JSON.parse(localStorage.getItem('dashboardWidgetSizes') || '{}');
                if (widgetSizes[id]) {
                    card.style.width = widgetSizes[id].width;
                    card.style.height = widgetSizes[id].height;
                    setTimeout(() => {
                        const width = parseFloat(widgetSizes[id].width);
                        const height = parseFloat(widgetSizes[id].height);
                        this.applyWidgetContentScaling(card, width, height);
                    }, 100);
                }
                
                // Add resize handle
                const resizeHandle = document.createElement('div');
                resizeHandle.className = 'resize-handle';
                card.appendChild(resizeHandle);
                
                // Resizing & dragging
                this.setupWidgetResizing(card, resizeHandle, id);
                this.setupWidgetDragging(card, id);
                
                // Initial responsive scaling
                this.updateWidgetSizeClass(card);
                setTimeout(() => {
                    const rect = card.getBoundingClientRect();
                    this.applyWidgetContentScaling(card, rect.width, rect.height);
                }, 50);
                
                if (w.closable) {
                    const closeBtn = document.createElement('button');
                    closeBtn.className = 'close-widget';
                    closeBtn.setAttribute('title', 'Close');
                    closeBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="9" fill="#ffffff" stroke="#e0e0e0"/><path d="M6 6L14 14M14 6L6 14" stroke="#D32F2F" stroke-width="2" stroke-linecap="round"/></svg>';
                    closeBtn.onclick = () => this.closeWidget(id);
                    card.style.position = 'absolute';
                    card.appendChild(closeBtn);
                }

                // z-index assign/apply
                if (!widgetZ[id]) {
                    widgetZ[id] = 100 + index;
                    maxZ = Math.max(maxZ, widgetZ[id]);
                }
                card.style.zIndex = widgetZ[id];
                card.addEventListener('mousedown', (e) => {
                    if (e.target.closest('.close-widget,.resize-handle,button')) return;
                    this.bringWidgetToFront(card, id);
                });

                // Highlight newly added
                if (this.lastAddedWidget && this.lastAddedWidget === id) {
                    card.classList.add('widget-added-pulse');
                    setTimeout(() => card.classList.remove('widget-added-pulse'), 1500);
                    this.lastAddedWidget = null;
                }
                
                container.appendChild(card);
            }
        });

        // Persist z-index state
        localStorage.setItem('dashboardWidgetZ', JSON.stringify(widgetZ));
        localStorage.setItem('dashboardWidgetMaxZ', maxZ.toString());
        
        if (localStorage.getItem('contentBlockActive') === 'true') {
            this.showContentBlockOverlay();
        } else {
            this.hideContentBlockOverlay();
        }
        const blockBtn = document.getElementById('toggleBlockBtn');
        if (blockBtn) blockBtn.onclick = () => this.toggleContentBlock();
    }

    closeWidget(id) {
        let closed = JSON.parse(localStorage.getItem('dashboardClosedWidgets') || '[]');
        if (!closed.includes(id)) closed.push(id);
        localStorage.setItem('dashboardClosedWidgets', JSON.stringify(closed));
        this.renderDashboardWidgets();
    }

    setupWidgetDragging(card, id) {
        let isDragging = false;
        let dragStartX, dragStartY;
        let widgetStartX, widgetStartY;
        const dragHandle = card.querySelector('.widget-header') || card;
        dragHandle.addEventListener('mousedown', (e) => {
            if (e.target.closest('button, .resize-handle')) return;
            isDragging = true;
            card.classList.add('dragging');
            document.body.classList.add('dragging-widget');
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            const rect = card.getBoundingClientRect();
            widgetStartX = rect.left;
            widgetStartY = rect.top;
            document.body.style.userSelect = 'none';
            e.preventDefault();
        });
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const deltaX = e.clientX - dragStartX;
            const deltaY = e.clientY - dragStartY;
            let newX = widgetStartX + deltaX;
            let newY = widgetStartY + deltaY;
            const cardRect = card.getBoundingClientRect();
            const maxX = window.innerWidth - 50;
            const maxY = window.innerHeight - 50;
            newX = Math.max(-cardRect.width + 100, Math.min(newX, maxX));
            newY = Math.max(-20, Math.min(newY, maxY));
            card.style.left = newX + 'px';
            card.style.top = newY + 'px';
        });
        document.addEventListener('mouseup', () => {
            if (!isDragging) return;
            isDragging = false;
            card.classList.remove('dragging');
            document.body.classList.remove('dragging-widget');
            document.body.style.userSelect = '';
            const snapEnabled = localStorage.getItem('dashboardSnapToGrid') === 'true';
            if (snapEnabled) {
                const grid = 40;
                let left = parseInt(card.style.left);
                let top = parseInt(card.style.top);
                left = Math.round(left / grid) * grid;
                top = Math.round(top / grid) * grid;
                card.style.left = left + 'px';
                card.style.top = top + 'px';
            }
            this.saveWidgetPosition(id, {
                left: parseInt(card.style.left),
                top: parseInt(card.style.top)
            });
        });
    }
    
    setupWidgetResizing(card, resizeHandle, id) {
        let isResizing = false;
        let startX, startY, startW, startH;
        
        resizeHandle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            isResizing = true;
            card.classList.add('resizing');
            
            startX = e.clientX;
            startY = e.clientY;
            startW = card.offsetWidth;
            startH = card.offsetHeight;
            
            document.body.style.userSelect = 'none';
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            
            // iOS-style size limits - wider range for better flexibility
            let newW = Math.max(200, Math.min(800, startW + (e.clientX - startX)));
            let newH = Math.max(150, Math.min(800, startH + (e.clientY - startY)));
            
            card.style.width = newW + 'px';
            card.style.height = newH + 'px';
            
            // Apply responsive content scaling
            this.applyWidgetContentScaling(card, newW, newH);
        });
        
        document.addEventListener('mouseup', () => {
            if (!isResizing) return;
            
            isResizing = false;
            card.classList.remove('resizing');
            document.body.style.userSelect = '';
            
            // Update size class after resize
            this.updateWidgetSizeClass(card);
            
            // Save size
            let widgetSizes = JSON.parse(localStorage.getItem('dashboardWidgetSizes') || '{}');
            widgetSizes[id] = { 
                width: card.style.width, 
                height: card.style.height 
            };
            localStorage.setItem('dashboardWidgetSizes', JSON.stringify(widgetSizes));
        });
    }
    
    saveWidgetPosition(id, position) {
        let positions = JSON.parse(localStorage.getItem('dashboardWidgetPositions') || '{}');
        positions[id] = position;
        localStorage.setItem('dashboardWidgetPositions', JSON.stringify(positions));
    }

    bringWidgetToFront(card, id) {
        let widgetZ = JSON.parse(localStorage.getItem('dashboardWidgetZ') || '{}');
        let maxZ = parseInt(localStorage.getItem('dashboardWidgetMaxZ') || '150');
        maxZ += 1;
        widgetZ[id] = maxZ;
        card.style.zIndex = maxZ;
        localStorage.setItem('dashboardWidgetZ', JSON.stringify(widgetZ));
        localStorage.setItem('dashboardWidgetMaxZ', maxZ.toString());
    }

    // iOS-style responsive content scaling
    updateWidgetSizeClass(card) {
        const width = card.offsetWidth;
        const height = card.offsetHeight;
        
        // Remove existing size classes
        card.classList.remove('small', 'medium', 'large');
        
        // Apply size-based class for responsive scaling
        if (width < 300 || height < 250) {
            card.classList.add('small');
        } else if (width > 500 || height > 400) {
            card.classList.add('large');
        } else {
            card.classList.add('medium');
        }
    }

    applyWidgetContentScaling(card, width, height) {
        // Update size class during resize
        this.updateWidgetSizeClass(card);
        
        // Dynamic content scaling based on actual dimensions
        const content = card.querySelector('.widget-content');
        if (content) {
            // Calculate scale factors
            const baseWidth = 300;
            const baseHeight = 200;
            const widthRatio = width / baseWidth;
            const heightRatio = height / baseHeight;
            const scaleFactor = Math.min(widthRatio, heightRatio);
            
            // Apply dynamic CSS custom properties for consistent scaling
            card.style.setProperty('--widget-width', width + 'px');
            card.style.setProperty('--widget-height', height + 'px');
            card.style.setProperty('--scale-factor', Math.max(0.6, Math.min(1.4, scaleFactor)));
            
            // Force layout recalculation
            this.adjustContentLayout(content, width, height);
        }
    }

    adjustContentLayout(content, width, height) {
        // Adjust content layout for optimal fit
        const isSmall = width < 280 || height < 220;
        const isLarge = width > 500 || height > 350;
        
        // Reset any previous adjustments
        content.style.fontSize = '';
        content.style.padding = '';
        content.style.gap = '';
        
        if (isSmall) {
            // Ultra-compact mode for small widgets
            content.style.fontSize = Math.max(10, width / 25) + 'px';
            content.style.padding = Math.max(4, width / 50) + 'px';
            content.style.gap = Math.max(2, width / 100) + 'px';
            
            // Adjust all child elements
            const elements = content.querySelectorAll('*');
            elements.forEach(el => {
                el.style.fontSize = 'inherit';
                el.style.lineHeight = '1.1';
                el.style.margin = '1px 0';
                el.style.padding = '1px';
                el.style.overflow = 'hidden';
                el.style.textOverflow = 'ellipsis';
                el.style.whiteSpace = 'nowrap';
            });
        } else if (isLarge) {
            // Expanded mode for large widgets
            content.style.fontSize = Math.min(18, width / 20) + 'px';
            content.style.padding = Math.min(20, width / 25) + 'px';
            content.style.gap = Math.min(12, width / 40) + 'px';
        } else {
            // Medium size - use responsive defaults
            content.style.fontSize = Math.min(16, width / 22) + 'px';
            content.style.padding = Math.min(16, width / 30) + 'px';
            content.style.gap = Math.min(8, width / 50) + 'px';
        }
        
        // Handle specific widget content types
        this.adjustSpecificWidgetContent(content, width, height);
    }

    adjustSpecificWidgetContent(content, width, height) {
        // Handle prayer lists
        const prayerItems = content.querySelectorAll('.prayer-item');
        prayerItems.forEach(item => {
            if (width < 250) {
                item.style.flexDirection = 'column';
                item.style.alignItems = 'flex-start';
                item.style.fontSize = Math.max(9, width / 30) + 'px';
            } else {
                item.style.flexDirection = 'row';
                item.style.alignItems = 'center';
            }
        });
        
        // Handle action grids
        const actionGrids = content.querySelectorAll('.action-grid');
        actionGrids.forEach(grid => {
            const columns = Math.max(1, Math.floor(width / 80));
            grid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
            grid.style.gap = Math.max(3, width / 80) + 'px';
        });
        
        // Handle icons
        const icons = content.querySelectorAll('i, .stat-icon');
        icons.forEach(icon => {
            const iconSize = Math.max(12, Math.min(32, width / 15));
            icon.style.fontSize = iconSize + 'px';
        });
        
        // Handle text elements
        const headings = content.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headings.forEach(heading => {
            heading.style.fontSize = Math.max(11, Math.min(20, width / 18)) + 'px';
            heading.style.lineHeight = '1.2';
            heading.style.margin = Math.max(2, width / 100) + 'px 0';
        });
        
        const paragraphs = content.querySelectorAll('p, span, div');
        paragraphs.forEach(p => {
            if (!p.querySelector('i') && !p.classList.contains('prayer-item')) {
                p.style.fontSize = Math.max(9, Math.min(16, width / 25)) + 'px';
                p.style.lineHeight = '1.3';
            }
        });
    }

    reorderWidget(draggedId, targetId) {
        // Not needed for free-floating widgets
        // Position is saved automatically during drag
        console.log('Widget reordering not needed for free-floating layout');
    }

    showAddWidgetModal() {
        const widgets = this.getAvailableWidgets();
        const closed = JSON.parse(localStorage.getItem('dashboardClosedWidgets') || '[]');
        const snapEnabled = localStorage.getItem('dashboardSnapToGrid') === 'true';

        let html = '<div class="add-widget-modal">';
        html += '<div class="modal-header"><h3><i class="fas fa-plus-circle"></i> Manage Widgets</h3><button class="close-modal-btn" id="closeModal"><i class="fas fa-times"></i></button></div>';
        html += '<p class="modal-subtext">Click + to add or – to remove. Drag & resize on the dashboard.</p>';
        html += `<div class="layout-controls"><label class="switch-container small"><div class="switch small"><input type="checkbox" id="snapToGridToggle" ${snapEnabled ? 'checked' : ''}><span class="slider"></span></div><span>Snap to grid</span></label><button class="reset-layout-btn" id="resetLayoutBtn" title="Reset layout"><i class="fas fa-border-all"></i><span> Reset Layout</span></button></div>`;

        const categories = {};
        Object.keys(widgets).forEach(id => {
            const widget = widgets[id];
            const category = widget.category || 'Other';
            if (!categories[category]) categories[category] = [];
            categories[category].push({ id, widget });
        });

        Object.keys(categories).forEach(category => {
            const list = categories[category];
            if (!list.length) return;
            html += `<div class="widget-category">`;
            html += `<h4 class="category-title"><i class="fas fa-folder"></i> ${category}</h4>`;
            html += `<div class="widget-grid">`;
            list.forEach(({id, widget}) => {
                const isAdded = !closed.includes(id);
                html += `<div class="widget-option ${isAdded ? 'added' : ''}" data-widget="${id}">
                    <div class="widget-icon"><i class="${widget.icon}"></i></div>
                    <div class="widget-info">
                        <h5>${widget.title} ${isAdded ? '<span class="status-tag">Added</span>' : ''}</h5>
                        <p>${this.getWidgetDescription(id)}</p>
                    </div>
                    <button class="add-widget-btn" data-action="${isAdded ? 'remove' : 'add'}" data-widget="${id}" title="${isAdded ? 'Remove widget' : 'Add widget'}">
                        <i class="fas fa-${isAdded ? 'minus' : 'plus'}"></i>
                    </button>
                </div>`;
            });
            html += `</div></div>`;
        });
        html += '</div>';

        const modal = document.getElementById('widgetsModal');
        const modalContent = modal.querySelector('.modal-content');
        if (modal && modalContent) {
            modalContent.innerHTML = html;
            modal.style.display = 'flex';
            modalContent.querySelectorAll('.add-widget-btn').forEach(btn => {
                btn.onclick = () => {
                    const widgetId = btn.getAttribute('data-widget');
                    const action = btn.getAttribute('data-action');
                    if (action === 'add') {
                        this.addWidget(widgetId);
                        this.showNotification(`${this.getWidgetTitle(widgetId)} added`, 'success');
                    } else {
                        this.closeWidget(widgetId);
                        this.showNotification(`${this.getWidgetTitle(widgetId)} removed`, 'info');
                    }
                    this.showAddWidgetModal();
                };
            });
            const closeBtn = modalContent.querySelector('#closeModal');
            if (closeBtn) closeBtn.onclick = () => modal.style.display = 'none';
            const snapToggle = modalContent.querySelector('#snapToGridToggle');
            if (snapToggle) {
                snapToggle.onchange = () => {
                    localStorage.setItem('dashboardSnapToGrid', snapToggle.checked.toString());
                    this.showNotification(`Snap to grid ${snapToggle.checked ? 'enabled' : 'disabled'}`, 'info');
                };
            }
            const resetBtn = modalContent.querySelector('#resetLayoutBtn');
            if (resetBtn) {
                resetBtn.onclick = () => {
                    this.resetWidgetLayout();
                    this.showNotification('Layout reset', 'success');
                    this.showAddWidgetModal();
                };
            }
        } else {
            // Fallback to old method if modal structure doesn't exist
            let modalElement = document.createElement('div');
            modalElement.className = 'modal-overlay add-widget-overlay';
            modalElement.innerHTML = html;
            document.body.appendChild(modalElement);
            
            // Event listeners
            modalElement.querySelectorAll('.add-widget-btn').forEach(btn => {
                btn.onclick = () => {
                    const widgetId = btn.getAttribute('data-widget');
                    const action = btn.getAttribute('data-action');
                    if (action === 'add') {
                        this.addWidget(widgetId);
                    } else {
                        this.closeWidget(widgetId);
                    }
                    document.body.removeChild(modalElement);
                    this.showAddWidgetModal(); // Re-open with refreshed state
                };
            });
            
            modalElement.querySelector('#closeModal').onclick = () => document.body.removeChild(modalElement);
            modalElement.onclick = (e) => {
                if (e.target === modalElement) document.body.removeChild(modalElement);
            };
        }
    }

    // Widget dragging and resizing logic
    setupWidgetDragging(card, id) {
        let isDragging = false;
        let dragStartX, dragStartY;
        let widgetStartX, widgetStartY;
        const dragHandle = card.querySelector('.widget-header') || card;
        dragHandle.addEventListener('mousedown', (e) => {
            if (e.target.closest('button, .resize-handle')) return;
            isDragging = true;
            card.classList.add('dragging');
            document.body.classList.add('dragging-widget');
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            const rect = card.getBoundingClientRect();
            widgetStartX = rect.left;
            widgetStartY = rect.top;
            document.body.style.userSelect = 'none';
            e.preventDefault();
        });
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const deltaX = e.clientX - dragStartX;
            const deltaY = e.clientY - dragStartY;
            let newX = widgetStartX + deltaX;
            let newY = widgetStartY + deltaY;
            const cardRect = card.getBoundingClientRect();
            const maxX = window.innerWidth - 50;
            const maxY = window.innerHeight - 50;
            newX = Math.max(-cardRect.width + 100, Math.min(newX, maxX));
            newY = Math.max(-20, Math.min(newY, maxY));
            card.style.left = newX + 'px';
            card.style.top = newY + 'px';
        });
        document.addEventListener('mouseup', () => {
            if (!isDragging) return;
            isDragging = false;
            card.classList.remove('dragging');
            document.body.classList.remove('dragging-widget');
            document.body.style.userSelect = '';
            const snapEnabled = localStorage.getItem('dashboardSnapToGrid') === 'true';
            if (snapEnabled) {
                const grid = 40;
                let left = parseInt(card.style.left);
                let top = parseInt(card.style.top);
                left = Math.round(left / grid) * grid;
                top = Math.round(top / grid) * grid;
                card.style.left = left + 'px';
                card.style.top = top + 'px';
            }
            this.saveWidgetPosition(id, {
                left: parseInt(card.style.left),
                top: parseInt(card.style.top)
            });
        });
    }

    setupWidgetResizing(card, resizeHandle, id) {
        let isResizing = false;
        let startX, startY, startW, startH;
        
        resizeHandle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            isResizing = true;
            card.classList.add('resizing');
            
            startX = e.clientX;
            startY = e.clientY;
            startW = card.offsetWidth;
            startH = card.offsetHeight;
            
            document.body.style.userSelect = 'none';
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            
            // iOS-style size limits - wider range for better flexibility
            let newW = Math.max(200, Math.min(800, startW + (e.clientX - startX)));
            let newH = Math.max(150, Math.min(800, startH + (e.clientY - startY)));
            
            card.style.width = newW + 'px';
            card.style.height = newH + 'px';
            
            // Apply responsive content scaling
            this.applyWidgetContentScaling(card, newW, newH);
        });
        
        document.addEventListener('mouseup', () => {
            if (!isResizing) return;
            
            isResizing = false;
            card.classList.remove('resizing');
            document.body.style.userSelect = '';
            
            // Update size class after resize
            this.updateWidgetSizeClass(card);
            
            // Save size
            let widgetSizes = JSON.parse(localStorage.getItem('dashboardWidgetSizes') || '{}');
            widgetSizes[id] = { 
                width: card.style.width, 
                height: card.style.height 
            };
            localStorage.setItem('dashboardWidgetSizes', JSON.stringify(widgetSizes));
        });
    }
    
    saveWidgetPosition(id, position) {
        let positions = JSON.parse(localStorage.getItem('dashboardWidgetPositions') || '{}');
        positions[id] = position;
        localStorage.setItem('dashboardWidgetPositions', JSON.stringify(positions));
    }

    bringWidgetToFront(card, id) {
        let widgetZ = JSON.parse(localStorage.getItem('dashboardWidgetZ') || '{}');
        let maxZ = parseInt(localStorage.getItem('dashboardWidgetMaxZ') || '150');
        maxZ += 1;
        widgetZ[id] = maxZ;
        card.style.zIndex = maxZ;
        localStorage.setItem('dashboardWidgetZ', JSON.stringify(widgetZ));
        localStorage.setItem('dashboardWidgetMaxZ', maxZ.toString());
    }

    // iOS-style responsive content scaling
    updateWidgetSizeClass(card) {
        const width = card.offsetWidth;
        const height = card.offsetHeight;
        
        // Remove existing size classes
        card.classList.remove('small', 'medium', 'large');
        
        // Apply size-based class for responsive scaling
        if (width < 300 || height < 250) {
            card.classList.add('small');
        } else if (width > 500 || height > 400) {
            card.classList.add('large');
        } else {
            card.classList.add('medium');
        }
    }

    applyWidgetContentScaling(card, width, height) {
        // Update size class during resize
        this.updateWidgetSizeClass(card);
        
        // Dynamic content scaling based on actual dimensions
        const content = card.querySelector('.widget-content');
        if (content) {
            // Calculate scale factors
            const baseWidth = 300;
            const baseHeight = 200;
            const widthRatio = width / baseWidth;
            const heightRatio = height / baseHeight;
            const scaleFactor = Math.min(widthRatio, heightRatio);
            
            // Apply dynamic CSS custom properties for consistent scaling
            card.style.setProperty('--widget-width', width + 'px');
            card.style.setProperty('--widget-height', height + 'px');
            card.style.setProperty('--scale-factor', Math.max(0.6, Math.min(1.4, scaleFactor)));
            
            // Force layout recalculation
            this.adjustContentLayout(content, width, height);
        }
    }

    adjustContentLayout(content, width, height) {
        // Adjust content layout for optimal fit
        const isSmall = width < 280 || height < 220;
        const isLarge = width > 500 || height > 350;
        
        // Reset any previous adjustments
        content.style.fontSize = '';
        content.style.padding = '';
        content.style.gap = '';
        
        if (isSmall) {
            // Ultra-compact mode for small widgets
            content.style.fontSize = Math.max(10, width / 25) + 'px';
            content.style.padding = Math.max(4, width / 50) + 'px';
            content.style.gap = Math.max(2, width / 100) + 'px';
            
            // Adjust all child elements
            const elements = content.querySelectorAll('*');
            elements.forEach(el => {
                el.style.fontSize = 'inherit';
                el.style.lineHeight = '1.1';
                el.style.margin = '1px 0';
                el.style.padding = '1px';
                el.style.overflow = 'hidden';
                el.style.textOverflow = 'ellipsis';
                el.style.whiteSpace = 'nowrap';
            });
        } else if (isLarge) {
            // Expanded mode for large widgets
            content.style.fontSize = Math.min(18, width / 20) + 'px';
            content.style.padding = Math.min(20, width / 25) + 'px';
            content.style.gap = Math.min(12, width / 40) + 'px';
        } else {
            // Medium size - use responsive defaults
            content.style.fontSize = Math.min(16, width / 22) + 'px';
            content.style.padding = Math.min(16, width / 30) + 'px';
            content.style.gap = Math.min(8, width / 50) + 'px';
        }
        
        // Handle specific widget content types
        this.adjustSpecificWidgetContent(content, width, height);
    }

    adjustSpecificWidgetContent(content, width, height) {
        // Handle prayer lists
        const prayerItems = content.querySelectorAll('.prayer-item');
        prayerItems.forEach(item => {
            if (width < 250) {
                item.style.flexDirection = 'column';
                item.style.alignItems = 'flex-start';
                item.style.fontSize = Math.max(9, width / 30) + 'px';
            } else {
                item.style.flexDirection = 'row';
                item.style.alignItems = 'center';
            }
        });
        
        // Handle action grids
        const actionGrids = content.querySelectorAll('.action-grid');
        actionGrids.forEach(grid => {
            const columns = Math.max(1, Math.floor(width / 80));
            grid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
            grid.style.gap = Math.max(3, width / 80) + 'px';
        });
        
        // Handle icons
        const icons = content.querySelectorAll('i, .stat-icon');
        icons.forEach(icon => {
            const iconSize = Math.max(12, Math.min(32, width / 15));
            icon.style.fontSize = iconSize + 'px';
        });
        
        // Handle text elements
        const headings = content.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headings.forEach(heading => {
            heading.style.fontSize = Math.max(11, Math.min(20, width / 18)) + 'px';
            heading.style.lineHeight = '1.2';
            heading.style.margin = Math.max(2, width / 100) + 'px 0';
        });
        
        const paragraphs = content.querySelectorAll('p, span, div');
        paragraphs.forEach(p => {
            if (!p.querySelector('i') && !p.classList.contains('prayer-item')) {
                p.style.fontSize = Math.max(9, Math.min(16, width / 25)) + 'px';
                p.style.lineHeight = '1.3';
            }
        });
    }

    reorderWidget(draggedId, targetId) {
        // Not needed for free-floating widgets
        // Position is saved automatically during drag
        console.log('Widget reordering not needed for free-floating layout');
    }

    showAddWidgetModal() {
        const widgets = this.getAvailableWidgets();
        const closed = JSON.parse(localStorage.getItem('dashboardClosedWidgets') || '[]');
        const snapEnabled = localStorage.getItem('dashboardSnapToGrid') === 'true';

        let html = '<div class="add-widget-modal">';
        html += '<div class="modal-header"><h3><i class="fas fa-plus-circle"></i> Manage Widgets</h3><button class="close-modal-btn" id="closeModal"><i class="fas fa-times"></i></button></div>';
        html += '<p class="modal-subtext">Click + to add or – to remove. Drag & resize on the dashboard.</p>';
        html += `<div class="layout-controls"><label class="switch-container small"><div class="switch small"><input type="checkbox" id="snapToGridToggle" ${snapEnabled ? 'checked' : ''}><span class="slider"></span></div><span>Snap to grid</span></label><button class="reset-layout-btn" id="resetLayoutBtn" title="Reset layout"><i class="fas fa-border-all"></i><span> Reset Layout</span></button></div>`;

        const categories = {};
        Object.keys(widgets).forEach(id => {
            const widget = widgets[id];
            const category = widget.category || 'Other';
            if (!categories[category]) categories[category] = [];
            categories[category].push({ id, widget });
        });

        Object.keys(categories).forEach(category => {
            const list = categories[category];
            if (!list.length) return;
            html += `<div class="widget-category">`;
            html += `<h4 class="category-title"><i class="fas fa-folder"></i> ${category}</h4>`;
            html += `<div class="widget-grid">`;
            list.forEach(({id, widget}) => {
                const isAdded = !closed.includes(id);
                html += `<div class="widget-option ${isAdded ? 'added' : ''}" data-widget="${id}">
                    <div class="widget-icon"><i class="${widget.icon}"></i></div>
                    <div class="widget-info">
                        <h5>${widget.title} ${isAdded ? '<span class="status-tag">Added</span>' : ''}</h5>
                        <p>${this.getWidgetDescription(id)}</p>
                    </div>
                    <button class="add-widget-btn" data-action="${isAdded ? 'remove' : 'add'}" data-widget="${id}" title="${isAdded ? 'Remove widget' : 'Add widget'}">
                        <i class="fas fa-${isAdded ? 'minus' : 'plus'}"></i>
                    </button>
                </div>`;
            });
            html += `</div></div>`;
        });
        html += '</div>';

        const modal = document.getElementById('widgetsModal');
        const modalContent = modal.querySelector('.modal-content');
        if (modal && modalContent) {
            modalContent.innerHTML = html;
            modal.style.display = 'flex';
            modalContent.querySelectorAll('.add-widget-btn').forEach(btn => {
                btn.onclick = () => {
                    const widgetId = btn.getAttribute('data-widget');
                    const action = btn.getAttribute('data-action');
                    if (action === 'add') {
                        this.addWidget(widgetId);
                        this.showNotification(`${this.getWidgetTitle(widgetId)} added`, 'success');
                    } else {
                        this.closeWidget(widgetId);
                        this.showNotification(`${this.getWidgetTitle(widgetId)} removed`, 'info');
                    }
                    this.showAddWidgetModal();
                };
            });
            const closeBtn = modalContent.querySelector('#closeModal');
            if (closeBtn) closeBtn.onclick = () => modal.style.display = 'none';
            const snapToggle = modalContent.querySelector('#snapToGridToggle');
            if (snapToggle) {
                snapToggle.onchange = () => {
                    localStorage.setItem('dashboardSnapToGrid', snapToggle.checked.toString());
                    this.showNotification(`Snap to grid ${snapToggle.checked ? 'enabled' : 'disabled'}`, 'info');
                };
            }
            const resetBtn = modalContent.querySelector('#resetLayoutBtn');
            if (resetBtn) {
                resetBtn.onclick = () => {
                    this.resetWidgetLayout();
                    this.showNotification('Layout reset', 'success');
                    this.showAddWidgetModal();
                };
            }
        } else {
            // Fallback to old method if modal structure doesn't exist
            let modalElement = document.createElement('div');
            modalElement.className = 'modal-overlay add-widget-overlay';
            modalElement.innerHTML = html;
            document.body.appendChild(modalElement);
            
            // Event listeners
            modalElement.querySelectorAll('.add-widget-btn').forEach(btn => {
                btn.onclick = () => {
                    const widgetId = btn.getAttribute('data-widget');
                    const action = btn.getAttribute('data-action');
                    if (action === 'add') {
                        this.addWidget(widgetId);
                    } else {
                        this.closeWidget(widgetId);
                    }
                    document.body.removeChild(modalElement);
                    this.showAddWidgetModal(); // Re-open with refreshed state
                };
            });
            
            modalElement.querySelector('#closeModal').onclick = () => document.body.removeChild(modalElement);
            modalElement.onclick = (e) => {
                if (e.target === modalElement) document.body.removeChild(modalElement);
            };
        }
    }

    // Reset widget layout to default
    resetWidgetLayout() {
        const closed = JSON.parse(localStorage.getItem('dashboardClosedWidgets') || '[]');
        const widgets = this.getAvailableWidgets();
        const openWidgetIds = Object.keys(widgets).filter(id => !closed.includes(id));
        localStorage.removeItem('dashboardWidgetPositions');
        localStorage.removeItem('dashboardWidgetSizes');
        localStorage.removeItem('dashboardWidgetZ');
        localStorage.removeItem('dashboardWidgetMaxZ');
        const gap = 24;
        const baseW = 300;
        const baseH = 200;
        const maxCols = Math.max(1, Math.floor((window.innerWidth - 80) / (baseW + gap)));
        let positions = {};
        openWidgetIds.forEach((id, idx) => {
            const col = idx % maxCols;
            const row = Math.floor(idx / maxCols);
            const left = 40 + col * (baseW + gap);
            const top = 80 + row * (baseH + gap);
            positions[id] = { left, top };
        });
        localStorage.setItem('dashboardWidgetPositions', JSON.stringify(positions));
        this.renderDashboardWidgets();
    }

    // Centralized updater for dashboard widgets and external consumers
    updateWidgetContent() {
        // Ensure objects exist
        const extensionStatus = this.extensionStatus || { active: false, version: null, blockedToday: 0 };
        const wellness = this.digitalWellnessData || { protectionPercentage: 0, blockedToday: 0, focusTime: 0 };

        // 1) Update built-in Extension Status widget
        try {
            const indicatorEl = document.getElementById('extensionIndicator');
            const statusTextEl = document.getElementById('statusText');
            const versionEl = document.getElementById('extVersion');
            const blockedEl = document.getElementById('blockedCount');

            if (indicatorEl) {
                indicatorEl.classList.toggle('active', !!extensionStatus.active);
                indicatorEl.classList.toggle('inactive', !extensionStatus.active);
            }
            if (statusTextEl) statusTextEl.textContent = extensionStatus.active ? 'Active & Protected' : 'Inactive';
            if (versionEl) versionEl.textContent = extensionStatus.version || '-';
            if (blockedEl) blockedEl.textContent = Number.isFinite(extensionStatus.blockedToday) ? extensionStatus.blockedToday : (Number.isFinite(wellness.blockedToday) ? wellness.blockedToday : 0);
        } catch (e) { /* no-op */ }

        // 2) Update Digital Wellness widget
        try {
            const percentageEl = document.querySelector('.wellness-widget .percentage');
            const todayBlockedEl = document.getElementById('todayBlocked');
            const focusTimeEl = document.getElementById('focusTime');

            const protectionPercentage = Number.isFinite(wellness.protectionPercentage) ? wellness.protectionPercentage : Math.min(100, Math.max(0, (extensionStatus.active ? 75 : 25)));
            const blockedToday = Number.isFinite(wellness.blockedToday) ? wellness.blockedToday : (Number.isFinite(extensionStatus.blockedToday) ? extensionStatus.blockedToday : 0);
            const focusTime = Number.isFinite(wellness.focusTime) ? wellness.focusTime : 0;

            if (percentageEl) percentageEl.textContent = `${protectionPercentage}%`;
            if (todayBlockedEl) todayBlockedEl.textContent = blockedToday;
            if (focusTimeEl) focusTimeEl.textContent = `${focusTime}h`;
            const circle = document.querySelector('.wellness-widget .circle-progress');
            if (circle) circle.setAttribute('data-percent', String(protectionPercentage));
        } catch (e) { /* no-op */ }

        // 3) Update Prayer Times widget list if any stored times
        try {
            const prayerTimes = this.prayerTimes && Object.keys(this.prayerTimes).length ? this.prayerTimes : (JSON.parse(localStorage.getItem('deenshield_prayerTimes') || 'null') || null);
            const listEl = document.getElementById('widgetPrayerTimes');
            if (listEl && prayerTimes) {
                listEl.innerHTML = Object.entries(prayerTimes).map(([name, time]) => `<div class="prayer-item"><span>${name}</span><span>${time}</span></div>`).join('');
            }
        } catch (e) { /* no-op */ }

        // 4) Update Protection Schedule widget from settings or defaults
        try {
            const schedule = (this.settings && this.settings.protectionSchedule) || {
                'Fajr - Sunrise': { mode: 'Enhanced' },
                'Work Hours': { mode: 'Standard' },
                'Maghrib+': { mode: 'Enhanced' }
            };
            const timeline = document.querySelector('.schedule-widget .protection-timeline');
            if (timeline) {
                timeline.innerHTML = Object.entries(schedule).map(([slot, cfg]) => `
                    <div class="timeline-item">
                        <span class="time">${slot}</span>
                        <span class="mode">${(cfg && cfg.mode) ? cfg.mode : '-'}</span>
                    </div>
                `).join('');
            }
        } catch (e) { /* no-op */ }

        // 5) Broadcast an update event for other modules (e.g., components/DashboardWidgets.js)
        try {
            const eventDetail = {
                stats: {
                    protectionPercentage: Number(document.querySelector('.wellness-widget .percentage')?.textContent?.replace('%', '')) || 0,
                    blockedToday: Number(document.getElementById('todayBlocked')?.textContent) || 0,
                    focusTime: parseFloat((document.getElementById('focusTime')?.textContent || '0').replace('h', '')) || 0
                },
                settings: {
                    protectionSchedule: (this.settings && this.settings.protectionSchedule) || null,
                    prayerTimes: this.prayerTimes || null
                },
                extensionStatus: this.extensionStatus || {}
            };
            window.dispatchEvent(new CustomEvent('deenshield-update', { detail: eventDetail }));
        } catch (e) { /* no-op */ }
    }
    // Widget definitions
    getAvailableWidgets() {
        return {
            prayerTimes: {
                id: 'prayerTimes',
                title: 'Prayer Times',
                html: `<div class="widget-header"><h4><i class="fas fa-pray"></i> Prayer Times</h4></div>
                       <div class="prayer-times-widget">
                           <div class="next-prayer"><span id="nextPrayerName">Asr</span> <strong id="nextPrayerTime">3:45 PM</strong></div>
                           <div class="prayer-list" id="widgetPrayerTimes">
                               <div class="prayer-item"><span>Fajr</span><span>5:30 AM</span></div>
                               <div class="prayer-item"><span>Dhuhr</span><span>1:15 PM</span></div>
                               <div class="prayer-item current"><span>Asr</span><span>3:45 PM</span></div>
                               <div class="prayer-item"><span>Maghrib</span><span>6:20 PM</span></div>
                               <div class="prayer-item"><span>Isha</span><span>8:00 PM</span></div>
                           </div>
                       </div>`,
                icon: 'fas fa-pray',
                closable: true,
                category: 'Prayer'
            },
            quranStudy: {
                id: 'quranStudy',
                title: 'Quran Study',
                html: `<div class="widget-header"><h4><i class="fas fa-quran"></i> Quran Study</h4></div>
                       <div class="quran-widget">
                           <div class="today-verse" id="todayVerseWidget">
                               <div class="arabic-text">بسم الله الرحمن الرحيم</div>
                               <div class="translation">"In the name of Allah, the Entirely Merciful, the Especially Merciful."</div>
                               <div class="reference">Al-Fatihah 1:1</div>
                           </div>
                           <div class="quran-actions">
                               <button onclick="window.deenShield.switchTab('quran')" class="widget-btn">Study Quran</button>
                               <button onclick="window.quranReader && window.quranReader.loadRandomVerse()" class="widget-btn">Random Verse</button>
                           </div>
                       </div>`,
                icon: 'fas fa-quran',
                closable: true,
                category: 'Quran'
            },
            dhikrCounter: {
                id: 'dhikrCounter',
                title: 'Dhikr Counter',
                html: `<div class="widget-header"><h4><i class="fas fa-dharmachakra"></i> Dhikr Counter</h4></div>
                       <div class="dhikr-widget">
                           <div class="dhikr-display">
                               <div class="dhikr-arabic" id="widgetDhikrArabic">سُبْحَانَ اللّٰهِ</div>
                               <div class="dhikr-translation" id="widgetDhikrTranslation">SubhanAllah</div>
                               <div class="dhikr-count"><span id="widgetDhikrCount">0</span> / <span id="widgetDhikrTarget">33</span></div>
                           </div>
                           <div class="dhikr-controls">
                               <button onclick="window.deenShield.incrementDhikr()" class="dhikr-btn">+1</button>
                               <button onclick="window.deenShield.switchTab('dhikr')" class="widget-btn">Open Dhikr</button>
                           </div>
                       </div>`,
                icon: 'fas fa-dharmachakra',
                closable: true,
                category: 'Dhikr'
            },
            library: {
                id: 'library',
                title: 'Islamic Library',
                html: `<div class="widget-header"><h4><i class="fas fa-book"></i> Islamic Library</h4></div>
                       <div class="library-widget">
                           <div class="library-stats">
                               <div class="stat-item"><span>Books</span><strong>150+</strong></div>
                               <div class="stat-item"><span>Articles</span><strong>500+</strong></div>
                               <div class="stat-item"><span>Media</span><strong>200+</strong></div>
                           </div>
                           <div class="library-actions">
                               <button onclick="window.deenShield.switchTab('library')" class="widget-btn">Browse Library</button>
                               <a href="https://www.alhaqds.software/library.html" target="_blank" class="widget-btn">Full Library</a>
                           </div>
                       </div>`,
                icon: 'fas fa-book',
                closable: true,
                category: 'Library'
            },
            tasks: {
                id: 'tasks',
                title: 'Tasks & Productivity',
                html: `<div class="widget-header"><h4><i class="fas fa-tasks"></i> Today's Tasks</h4></div>
                       <div class="tasks-widget">
                           <div class="task-summary">
                               <div class="task-progress"><span id="widgetTasksCompleted">3</span> / <span id="widgetTasksTotal">8</span> completed</div>
                               <div class="progress-bar"><div class="progress-fill" style="width: 37.5%"></div></div>
                           </div>
                           <div class="upcoming-tasks" id="widgetUpcomingTasks">
                               <div class="task-item-mini"><span class="task-time">8:00 AM</span><span class="task-name">Quran Reading</span></div>
                               <div class="task-item-mini"><span class="task-time">10:00 AM</span><span class="task-name">Team Meeting</span></div>
                               <div class="task-item-mini"><span class="task-time">2:00 PM</span><span class="task-name">Dhuhr Prayer</span></div>
                           </div>
                           <div class="task-actions">
                               <button onclick="window.deenShield.switchTab('productivity')" class="widget-btn">Manage Tasks</button>
                           </div>
                       </div>`,
                icon: 'fas fa-tasks',
                closable: true,
                category: 'Productivity'
            },
            greeting: {
                id: 'greeting',
                title: 'Welcome',
                html: `<div class="widget-header"><h4><i class="fas fa-sun"></i> <span id="greetingTime">Good Afternoon</span></h4></div>
                       <div class="greeting-widget">
                           <div class="greeting-message">
                               <p>السلام عليكم ورحمة الله وبركاته</p>
                               <p>May Allah bless your day with peace and productivity</p>
                           </div>
                           <div class="islamic-date" id="islamicDate">Loading Islamic date...</div>
                       </div>`,
                icon: 'fas fa-sun',
                closable: true,
                category: 'General'
            },
            quickActions: {
                id: 'quickActions',
                title: 'Quick Actions',
                html: `<div class="widget-header"><h4><i class="fas fa-bolt"></i> Quick Actions</h4></div>
                       <div class="quick-actions-widget">
                           <div class="action-grid">
                               <button onclick="window.deenShield.switchTab('quran')" class="action-btn"><i class="fas fa-quran"></i><span>Read Quran</span></button>
                               <button onclick="window.deenShield.switchTab('dhikr')" class="action-btn"><i class="fas fa-dharmachakra"></i><span>Dhikr</span></button>
                               <button onclick="window.deenShield.switchTab('prayer-times')" class="action-btn"><i class="fas fa-pray"></i><span>Prayer Times</span></button>
                               <button onclick="window.deenShield.switchTab('productivity')" class="action-btn"><i class="fas fa-tasks"></i><span>Tasks</span></button>
                           </div>
                       </div>`,
                icon: 'fas fa-bolt',
                closable: true,
                category: 'General'
            },
            islamicCalendar: {
                id: 'islamicCalendar',
                title: 'Islamic Calendar',
                html: `<div class="widget-header"><h4><i class="fas fa-calendar-alt"></i> Islamic Calendar</h4></div>
                       <div class="calendar-widget">
                           <div class="hijri-date" id="hijriDate">15 Rajab 1446</div>
                           <div class="gregorian-date" id="gregorianDate">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                           <div class="islamic-events" id="islamicEvents">
                               <div class="event-item">No special events today</div>
                           </div>
                       </div>`,
                icon: 'fas fa-calendar-alt',
                closable: true,
                category: 'General'
            },
            extensionStatus: {
                id: 'extensionStatus',
                title: 'Deen Shield Extension',
                html: `<div class="widget-header"><h4><i class="fas fa-shield-alt"></i> Extension Status</h4></div>
                       <div class="extension-widget">
                           <div class="extension-status" id="extensionStatusDisplay">
                               <div class="status-indicator" id="extensionIndicator">
                                   <i class="fas fa-circle" id="statusIcon"></i>
                                   <span id="statusText">Checking...</span>
                               </div>
                               <div class="extension-info" id="extensionInfo">
                                   <div class="info-item"><span>Version:</span><span id="extVersion">-</span></div>
                                   <div class="info-item"><span>Blocked Today:</span><span id="blockedCount">-</span></div>
                               </div>
                           </div>
                           <div class="extension-actions">
                               <button onclick="window.deenShield.checkExtension()" class="widget-btn">Refresh Status</button>
                               <button onclick="window.deenShield.openExtensionSettings()" class="widget-btn">Extension Settings</button>
                           </div>
                       </div>`,
                icon: 'fas fa-shield-alt',
                closable: true,
                category: 'Protection'
            },
            digitalWellness: {
                id: 'digitalWellness',
                title: 'Digital Wellness',
                html: `<div class="widget-header"><h4><i class="fas fa-heartbeat"></i> Digital Wellness</h4></div>
                       <div class="wellness-widget">
                           <div class="wellness-stats">
                               <div class="stat-circle">
                                   <div class="circle-progress" data-percent="75">
                                       <div class="circle-text">
                                           <span class="percentage">75%</span>
                                           <span class="label">Protected</span>
                                       </div>
                                   </div>
                               </div>
                               <div class="wellness-metrics">
                                   <div class="metric-item">
                                       <i class="fas fa-shield-alt"></i>
                                       <span class="metric-value" id="todayBlocked">23</span>
                                       <span class="metric-label">Blocked Today</span>
                                   </div>
                                   <div class="metric-item">
                                       <i class="fas fa-clock"></i>
                                       <span class="metric-value" id="focusTime">4.2h</span>
                                       <span class="metric-label">Focus Time</span>
                                   </div>
                               </div>
                           </div>
                           <div class="wellness-actions">
                               <button onclick="window.deenShield.toggleIslamicMode()" class="widget-btn" id="islamicModeBtn">Enable Islamic Mode</button>
                           </div>
                       </div>`,
                icon: 'fas fa-heartbeat',
                closable: true,
                category: 'Protection'
            },
            protectionSchedule: {
                id: 'protectionSchedule',
                title: 'Protection Schedule',
                html: `<div class="widget-header"><h4><i class="fas fa-calendar-check"></i> Protection Schedule</h4></div>
                       <div class="schedule-widget">
                           <div class="schedule-status">
                               <div class="current-mode" id="currentProtectionMode">
                                   <i class="fas fa-shield-alt"></i>
                                   <span>Standard Protection</span>
                               </div>
                               <div class="next-change" id="nextModeChange">
                                   Next: Enhanced mode at Maghrib (6:20 PM)
                               </div>
                           </div>
                           <div class="protection-timeline">
                               <div class="timeline-item active">
                                   <span class="time">Fajr - Sunrise</span>
                                   <span class="mode">Enhanced</span>
                               </div>
                               <div class="timeline-item">
                                   <span class="time">Work Hours</span>
                                   <span class="mode">Standard</span>
                               </div>
                               <div class="timeline-item">
                                   <span class="time">Maghrib+</span>
                                   <span class="mode">Enhanced</span>
                               </div>
                           </div>
                           <div class="schedule-actions">
                               <button onclick="window.deenShield.editProtectionSchedule()" class="widget-btn">Edit Schedule</button>
                           </div>
                       </div>`,
                icon: 'fas fa-calendar-check',
                closable: true,
                category: 'Protection'
            }
        };
    }

    getDefaultWidgetOrder() {
        return ['greeting', 'extensionStatus', 'prayerTimes', 'digitalWellness', 'quranStudy', 'dhikrCounter', 'tasks', 'protectionSchedule'];
    }

    renderDashboardWidgets() {
        const container = document.getElementById('dashboard-widgets');
        if (!container) return;
        
        // Load from localStorage or use default
        let widgetOrder = JSON.parse(localStorage.getItem('dashboardWidgetOrder') || 'null') || this.getDefaultWidgetOrder();
        let closedWidgets = JSON.parse(localStorage.getItem('dashboardClosedWidgets') || '[]');
        let widgetPositions = JSON.parse(localStorage.getItem('dashboardWidgetPositions') || '{}');
        let widgetZ = JSON.parse(localStorage.getItem('dashboardWidgetZ') || '{}');
        let maxZ = parseInt(localStorage.getItem('dashboardWidgetMaxZ') || '150');

        // Sanitize (ensure on-screen) saved positions if viewport changed
        let viewportChanged = false;
        Object.keys(widgetPositions).forEach(id => {
            const pos = widgetPositions[id];
            if (!pos) return;
            let changed = false;
            const minVisibleX = 40; // ensure at least 40px visible
            const minVisibleY = 40;
            const assumedWidth = 300; // fallback typical width
            const assumedHeight = 200; // fallback typical height
            if (pos.left > window.innerWidth - minVisibleX) { pos.left = window.innerWidth - minVisibleX; changed = true; }
            if (pos.top > window.innerHeight - minVisibleY) { pos.top = window.innerHeight - minVisibleY; changed = true; }
            if (pos.left + assumedWidth < minVisibleX) { pos.left = minVisibleX - Math.min(assumedWidth - 40, assumedWidth - 80); changed = true; }
            if (pos.top + assumedHeight < minVisibleY) { pos.top = minVisibleY; changed = true; }
            if (changed) viewportChanged = true;
        });
        if (viewportChanged) {
            localStorage.setItem('dashboardWidgetPositions', JSON.stringify(widgetPositions));
        }
        
        const widgets = this.getAvailableWidgets();
        container.innerHTML = '';
        
        let positionOffset = 0;
        
        widgetOrder.forEach((id, index) => {
            if (!closedWidgets.includes(id) && widgets[id]) {
                const w = widgets[id];
                const card = document.createElement('div');
                card.className = 'stat-card dashboard-widget';
                card.setAttribute('data-widget', id);
                card.innerHTML = `<div class='stat-icon'><i class='${w.icon}'></i></div><div class='stat-content'>${w.html}</div>`;
                
                // Set initial position (free floating)
                let position = widgetPositions[id] || {
                    left: 50 + (positionOffset * 320), // Stagger widgets horizontally
                    top: 100 + (Math.floor(positionOffset / 3) * 220) // Stack vertically after 3 widgets
                };
                
                // Ensure widgets stay within viewport bounds
                position.left = Math.max(0, Math.min(position.left, window.innerWidth - 300));
                position.top = Math.max(60, Math.min(position.top, window.innerHeight - 200));
                
                card.style.left = position.left + 'px';
                card.style.top = position.top + 'px';
                
                positionOffset++;
                
                // Restore widget size if set and apply content scaling
                let widgetSizes = JSON.parse(localStorage.getItem('dashboardWidgetSizes') || '{}');
                if (widgetSizes[id]) {
                    card.style.width = widgetSizes[id].width;
                    card.style.height = widgetSizes[id].height;
                    setTimeout(() => {
                        const width = parseFloat(widgetSizes[id].width);
                        const height = parseFloat(widgetSizes[id].height);
                        this.applyWidgetContentScaling(card, width, height);
                    }, 100);
                }
                
                // Add resize handle
                const resizeHandle = document.createElement('div');
                resizeHandle.className = 'resize-handle';
                card.appendChild(resizeHandle);
                
                // Resizing & dragging
                this.setupWidgetResizing(card, resizeHandle, id);
                this.setupWidgetDragging(card, id);
                
                // Initial responsive scaling
                this.updateWidgetSizeClass(card);
                setTimeout(() => {
                    const rect = card.getBoundingClientRect();
                    this.applyWidgetContentScaling(card, rect.width, rect.height);
                }, 50);
                
                if (w.closable) {
                    const closeBtn = document.createElement('button');
                    closeBtn.className = 'close-widget';
                    closeBtn.setAttribute('title', 'Close');
                    closeBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="9" fill="#ffffff" stroke="#e0e0e0"/><path d="M6 6L14 14M14 6L6 14" stroke="#D32F2F" stroke-width="2" stroke-linecap="round"/></svg>';
                    closeBtn.onclick = () => this.closeWidget(id);
                    card.style.position = 'absolute';
                    card.appendChild(closeBtn);
                }

                // z-index assign/apply
                if (!widgetZ[id]) {
                    widgetZ[id] = 100 + index;
                    maxZ = Math.max(maxZ, widgetZ[id]);
                }
                card.style.zIndex = widgetZ[id];
                card.addEventListener('mousedown', (e) => {
                    if (e.target.closest('.close-widget,.resize-handle,button')) return;
                    this.bringWidgetToFront(card, id);
                });

                // Highlight newly added
                if (this.lastAddedWidget && this.lastAddedWidget === id) {
                    card.classList.add('widget-added-pulse');
                    setTimeout(() => card.classList.remove('widget-added-pulse'), 1500);
                    this.lastAddedWidget = null;
                }
                
                container.appendChild(card);
            }
        });

        // Persist z-index state
        localStorage.setItem('dashboardWidgetZ', JSON.stringify(widgetZ));
        localStorage.setItem('dashboardWidgetMaxZ', maxZ.toString());
        
        if (localStorage.getItem('contentBlockActive') === 'true') {
            this.showContentBlockOverlay();
        } else {
            this.hideContentBlockOverlay();
        }
        const blockBtn = document.getElementById('toggleBlockBtn');
        if (blockBtn) blockBtn.onclick = () => this.toggleContentBlock();
    }

    closeWidget(id) {
        let closed = JSON.parse(localStorage.getItem('dashboardClosedWidgets') || '[]');
        if (!closed.includes(id)) closed.push(id);
        localStorage.setItem('dashboardClosedWidgets', JSON.stringify(closed));
        this.renderDashboardWidgets();
    }

    setupWidgetDragging(card, id) {
        let isDragging = false;
        let dragStartX, dragStartY;
        let widgetStartX, widgetStartY;
        const dragHandle = card.querySelector('.widget-header') || card;
        dragHandle.addEventListener('mousedown', (e) => {
            if (e.target.closest('button, .resize-handle')) return;
            isDragging = true;
            card.classList.add('dragging');
            document.body.classList.add('dragging-widget');
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            const rect = card.getBoundingClientRect();
            widgetStartX = rect.left;
            widgetStartY = rect.top;
            document.body.style.userSelect = 'none';
            e.preventDefault();
        });
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const deltaX = e.clientX - dragStartX;
            const deltaY = e.clientY - dragStartY;
            let newX = widgetStartX + deltaX;
            let newY = widgetStartY + deltaY;
            const cardRect = card.getBoundingClientRect();
            const maxX = window.innerWidth - 50;
            const maxY = window.innerHeight - 50;
            newX = Math.max(-cardRect.width + 100, Math.min(newX, maxX));
            newY = Math.max(-20, Math.min(newY, maxY));
            card.style.left = newX + 'px';
            card.style.top = newY + 'px';
        });
        document.addEventListener('mouseup', () => {
            if (!isDragging) return;
            isDragging = false;
            card.classList.remove('dragging');
            document.body.classList.remove('dragging-widget');
            document.body.style.userSelect = '';
            const snapEnabled = localStorage.getItem('dashboardSnapToGrid') === 'true';
            if (snapEnabled) {
                const grid = 40;
                let left = parseInt(card.style.left);
                let top = parseInt(card.style.top);
                left = Math.round(left / grid) * grid;
                top = Math.round(top / grid) * grid;
                card.style.left = left + 'px';
                card.style.top = top + 'px';
            }
            this.saveWidgetPosition(id, {
                left: parseInt(card.style.left),
                top: parseInt(card.style.top)
            });
        });
    }
    
    setupWidgetResizing(card, resizeHandle, id) {
        let isResizing = false;
        let startX, startY, startW, startH;
        
        resizeHandle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            isResizing = true;
            card.classList.add('resizing');
            
            startX = e.clientX;
            startY = e.clientY;
            startW = card.offsetWidth;
            startH = card.offsetHeight;
            
            document.body.style.userSelect = 'none';
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            
            // iOS-style size limits - wider range for better flexibility
            let newW = Math.max(200, Math.min(800, startW + (e.clientX - startX)));
            let newH = Math.max(150, Math.min(800, startH + (e.clientY - startY)));
            
            card.style.width = newW + 'px';
            card.style.height = newH + 'px';
            
            // Apply responsive content scaling
            this.applyWidgetContentScaling(card, newW, newH);
        });
        
        document.addEventListener('mouseup', () => {
            if (!isResizing) return;
            
            isResizing = false;
            card.classList.remove('resizing');
            document.body.style.userSelect = '';
            
            // Update size class after resize
            this.updateWidgetSizeClass(card);
            
            // Save size
            let widgetSizes = JSON.parse(localStorage.getItem('dashboardWidgetSizes') || '{}');
            widgetSizes[id] = { 
                width: card.style.width, 
                height: card.style.height 
            };
            localStorage.setItem('dashboardWidgetSizes', JSON.stringify(widgetSizes));
        });
    }
    
    saveWidgetPosition(id, position) {
        let positions = JSON.parse(localStorage.getItem('dashboardWidgetPositions') || '{}');
        positions[id] = position;
        localStorage.setItem('dashboardWidgetPositions', JSON.stringify(positions));
    }

    bringWidgetToFront(card, id) {
        let widgetZ = JSON.parse(localStorage.getItem('dashboardWidgetZ') || '{}');
        let maxZ = parseInt(localStorage.getItem('dashboardWidgetMaxZ') || '150');
        maxZ += 1;
        widgetZ[id] = maxZ;
        card.style.zIndex = maxZ;
        localStorage.setItem('dashboardWidgetZ', JSON.stringify(widgetZ));
        localStorage.setItem('dashboardWidgetMaxZ', maxZ.toString());
    }

    // iOS-style responsive content scaling
    updateWidgetSizeClass(card) {
        const width = card.offsetWidth;
        const height = card.offsetHeight;
        
        // Remove existing size classes
        card.classList.remove('small', 'medium', 'large');
        
        // Apply size-based class for responsive scaling
        if (width < 300 || height < 250) {
            card.classList.add('small');
        } else if (width > 500 || height > 400) {
            card.classList.add('large');
        } else {
            card.classList.add('medium');
        }
    }

    applyWidgetContentScaling(card, width, height) {
        // Update size class during resize
        this.updateWidgetSizeClass(card);
        
        // Dynamic content scaling based on actual dimensions
        const content = card.querySelector('.widget-content');
        if (content) {
            // Calculate scale factors
            const baseWidth = 300;
            const baseHeight = 200;
            const widthRatio = width / baseWidth;
            const heightRatio = height / baseHeight;
            const scaleFactor = Math.min(widthRatio, heightRatio);
            
            // Apply dynamic CSS custom properties for consistent scaling
            card.style.setProperty('--widget-width', width + 'px');
            card.style.setProperty('--widget-height', height + 'px');
            card.style.setProperty('--scale-factor', Math.max(0.6, Math.min(1.4, scaleFactor)));
            
            // Force layout recalculation
            this.adjustContentLayout(content, width, height);
        }
    }

    adjustContentLayout(content, width, height) {
        // Adjust content layout for optimal fit
        const isSmall = width < 280 || height < 220;
        const isLarge = width > 500 || height > 350;
        
        // Reset any previous adjustments
        content.style.fontSize = '';
        content.style.padding = '';
        content.style.gap = '';
        
        if (isSmall) {
            // Ultra-compact mode for small widgets
            content.style.fontSize = Math.max(10, width / 25) + 'px';
            content.style.padding = Math.max(4, width / 50) + 'px';
            content.style.gap = Math.max(2, width / 100) + 'px';
            
            // Adjust all child elements
            const elements = content.querySelectorAll('*');
            elements.forEach(el => {
                el.style.fontSize = 'inherit';
                el.style.lineHeight = '1.1';
                el.style.margin = '1px 0';
                el.style.padding = '1px';
                el.style.overflow = 'hidden';
                el.style.textOverflow = 'ellipsis';
                el.style.whiteSpace = 'nowrap';
            });
        } else if (isLarge) {
            // Expanded mode for large widgets
            content.style.fontSize = Math.min(18, width / 20) + 'px';
            content.style.padding = Math.min(20, width / 25) + 'px';
            content.style.gap = Math.min(12, width / 40) + 'px';
        } else {
            // Medium size - use responsive defaults
            content.style.fontSize = Math.min(16, width / 22) + 'px';
            content.style.padding = Math.min(16, width / 30) + 'px';
            content.style.gap = Math.min(8, width / 50) + 'px';
        }
        
        // Handle specific widget content types
        this.adjustSpecificWidgetContent(content, width, height);
    }

    adjustSpecificWidgetContent(content, width, height) {
        // Handle prayer lists
        const prayerItems = content.querySelectorAll('.prayer-item');
        prayerItems.forEach(item => {
            if (width < 250) {
                item.style.flexDirection = 'column';
                item.style.alignItems = 'flex-start';
                item.style.fontSize = Math.max(9, width / 30) + 'px';
            } else {
                item.style.flexDirection = 'row';
                item.style.alignItems = 'center';
            }
        });
        
        // Handle action grids
        const actionGrids = content.querySelectorAll('.action-grid');
        actionGrids.forEach(grid => {
            const columns = Math.max(1, Math.floor(width / 80));
            grid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
            grid.style.gap = Math.max(3, width / 80) + 'px';
        });
        
        // Handle icons
        const icons = content.querySelectorAll('i, .stat-icon');
        icons.forEach(icon => {
            const iconSize = Math.max(12, Math.min(32, width / 15));
            icon.style.fontSize = iconSize + 'px';
        });
        
        // Handle text elements
        const headings = content.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headings.forEach(heading => {
            heading.style.fontSize = Math.max(11, Math.min(20, width / 18)) + 'px';
            heading.style.lineHeight = '1.2';
            heading.style.margin = Math.max(2, width / 100) + 'px 0';
        });
        
        const paragraphs = content.querySelectorAll('p, span, div');
        paragraphs.forEach(p => {
            if (!p.querySelector('i') && !p.classList.contains('prayer-item')) {
                p.style.fontSize = Math.max(9, Math.min(16, width / 25)) + 'px';
                p.style.lineHeight = '1.3';
            }
        });
    }

    reorderWidget(draggedId, targetId) {
        // Not needed for free-floating widgets
        // Position is saved automatically during drag
        console.log('Widget reordering not needed for free-floating layout');
    }

    showAddWidgetModal() {
        const widgets = this.getAvailableWidgets();
        const closed = JSON.parse(localStorage.getItem('dashboardClosedWidgets') || '[]');
        const snapEnabled = localStorage.getItem('dashboardSnapToGrid') === 'true';

        let html = '<div class="add-widget-modal">';
        html += '<div class="modal-header"><h3><i class="fas fa-plus-circle"></i> Manage Widgets</h3><button class="close-modal-btn" id="closeModal"><i class="fas fa-times"></i></button></div>';
        html += '<p class="modal-subtext">Click + to add or – to remove. Drag & resize on the dashboard.</p>';
        html += `<div class="layout-controls"><label class="switch-container small"><div class="switch small"><input type="checkbox" id="snapToGridToggle" ${snapEnabled ? 'checked' : ''}><span class="slider"></span></div><span>Snap to grid</span></label><button class="reset-layout-btn" id="resetLayoutBtn" title="Reset layout"><i class="fas fa-border-all"></i><span> Reset Layout</span></button></div>`;

        const categories = {};
        Object.keys(widgets).forEach(id => {
            const widget = widgets[id];
            const category = widget.category || 'Other';
            if (!categories[category]) categories[category] = [];
            categories[category].push({ id, widget });
        });

        Object.keys(categories).forEach(category => {
            const list = categories[category];
            if (!list.length) return;
            html += `<div class="widget-category">`;
            html += `<h4 class="category-title"><i class="fas fa-folder"></i> ${category}</h4>`;
            html += `<div class="widget-grid">`;
            list.forEach(({id, widget}) => {
                const isAdded = !closed.includes(id);
                html += `<div class="widget-option ${isAdded ? 'added' : ''}" data-widget="${id}">
                    <div class="widget-icon"><i class="${widget.icon}"></i></div>
                    <div class="widget-info">
                        <h5>${widget.title} ${isAdded ? '<span class="status-tag">Added</span>' : ''}</h5>
                        <p>${this.getWidgetDescription(id)}</p>
                    </div>
                    <button class="add-widget-btn" data-action="${isAdded ? 'remove' : 'add'}" data-widget="${id}" title="${isAdded ? 'Remove widget' : 'Add widget'}">
                        <i class="fas fa-${isAdded ? 'minus' : 'plus'}"></i>
                    </button>
                </div>`;
            });
            html += `</div></div>`;
        });
        html += '</div>';

        const modal = document.getElementById('widgetsModal');
        const modalContent = modal.querySelector('.modal-content');
        if (modal && modalContent) {
            modalContent.innerHTML = html;
            modal.style.display = 'flex';
            modalContent.querySelectorAll('.add-widget-btn').forEach(btn => {
                btn.onclick = () => {
                    const widgetId = btn.getAttribute('data-widget');
                    const action = btn.getAttribute('data-action');
                    if (action === 'add') {
                        this.addWidget(widgetId);
                        this.showNotification(`${this.getWidgetTitle(widgetId)} added`, 'success');
                    } else {
                        this.closeWidget(widgetId);
                        this.showNotification(`${this.getWidgetTitle(widgetId)} removed`, 'info');
                    }
                    this.showAddWidgetModal();
                };
            });
            const closeBtn = modalContent.querySelector('#closeModal');
            if (closeBtn) closeBtn.onclick = () => modal.style.display = 'none';
            const snapToggle = modalContent.querySelector('#snapToGridToggle');
            if (snapToggle) {
                snapToggle.onchange = () => {
                    localStorage.setItem('dashboardSnapToGrid', snapToggle.checked.toString());
                    this.showNotification(`Snap to grid ${snapToggle.checked ? 'enabled' : 'disabled'}`, 'info');
                };
            }
            const resetBtn = modalContent.querySelector('#resetLayoutBtn');
            if (resetBtn) {
                resetBtn.onclick = () => {
                    this.resetWidgetLayout();
                    this.showNotification('Layout reset', 'success');
                    this.showAddWidgetModal();
                };
            }
        } else {
            // Fallback to old method if modal structure doesn't exist
            let modalElement = document.createElement('div');
            modalElement.className = 'modal-overlay add-widget-overlay';
            modalElement.innerHTML = html;
            document.body.appendChild(modalElement);
            
            // Event listeners
            modalElement.querySelectorAll('.add-widget-btn').forEach(btn => {
                btn.onclick = () => {
                    const widgetId = btn.getAttribute('data-widget');
                    const action = btn.getAttribute('data-action');
                    if (action === 'add') {
                        this.addWidget(widgetId);
                    } else {
                        this.closeWidget(widgetId);
                    }
                    document.body.removeChild(modalElement);
                    this.showAddWidgetModal(); // Re-open with refreshed state
                };
            });
            
            modalElement.querySelector('#closeModal').onclick = () => document.body.removeChild(modalElement);
            modalElement.onclick = (e) => {
                if (e.target === modalElement) document.body.removeChild(modalElement);
            };
        }
    }

    // Reset widget layout to default
    resetWidgetLayout() {
        const closed = JSON.parse(localStorage.getItem('dashboardClosedWidgets') || '[]');
        const widgets = this.getAvailableWidgets();
        const openWidgetIds = Object.keys(widgets).filter(id => !closed.includes(id));
        localStorage.removeItem('dashboardWidgetPositions');
        localStorage.removeItem('dashboardWidgetSizes');
        localStorage.removeItem('dashboardWidgetZ');
        localStorage.removeItem('dashboardWidgetMaxZ');
        const gap = 24;
        const baseW = 300;
        const baseH = 200;
        const maxCols = Math.max(1, Math.floor((window.innerWidth - 80) / (baseW + gap)));
        let positions = {};
        openWidgetIds.forEach((id, idx) => {
            const col = idx % maxCols;
            const row = Math.floor(idx / maxCols);
            const left = 40 + col * (baseW + gap);
            const top = 80 + row * (baseH + gap);
            positions[id] = { left, top };
        });
        localStorage.setItem('dashboardWidgetPositions', JSON.stringify(positions));
        this.renderDashboardWidgets();
    }

    // Centralized updater for dashboard widgets and external consumers
    updateWidgetContent() {
        // Ensure objects exist
        const extensionStatus = this.extensionStatus || { active: false, version: null, blockedToday: 0 };
        const wellness = this.digitalWellnessData || { protectionPercentage: 0, blockedToday: 0, focusTime: 0 };

        // 1) Update built-in Extension Status widget
        try {
            const indicatorEl = document.getElementById('extensionIndicator');
            const statusTextEl = document.getElementById('statusText');
            const versionEl = document.getElementById('extVersion');
            const blockedEl = document.getElementById('blockedCount');

            if (indicatorEl) {
                indicatorEl.classList.toggle('active', !!extensionStatus.active);
                indicatorEl.classList.toggle('inactive', !extensionStatus.active);
            }
            if (statusTextEl) statusTextEl.textContent = extensionStatus.active ? 'Active & Protected' : 'Inactive';
            if (versionEl) versionEl.textContent = extensionStatus.version || '-';
            if (blockedEl) blockedEl.textContent = Number.isFinite(extensionStatus.blockedToday) ? extensionStatus.blockedToday : (Number.isFinite(wellness.blockedToday) ? wellness.blockedToday : 0);
        } catch (e) { /* no-op */ }
    }
    
    getWidgetDescription(id) {
        const descriptions = {
            prayerTimes: 'Shows daily prayer times and next prayer notification',
            quranStudy: 'Daily Quranic verse and study tools',
            dhikrCounter: 'Track your dhikr with an interactive counter',
            library: 'Access to Islamic books and resources',
            tasks: 'Manage your daily tasks and productivity',
            greeting: 'Daily greeting with Islamic date',
            quickActions: 'Quick access to important features',
            islamicCalendar: 'Islamic calendar with important dates',
            extensionStatus: 'Monitor Deen Shield browser extension',
            digitalWellness: 'Track your digital protection status',
            protectionSchedule: 'Manage your content protection schedule'
        };
        
        return descriptions[id] || 'Widget information';
    }
    
    getWidgetTitle(id) {
        const widgets = this.getAvailableWidgets();
        return widgets[id] ? widgets[id].title : id;
    }

    resetDhikrCounter() {
        this.dhikrCounter = 0;
        this.updateDhikrDisplay();
    }

    updateDhikrDisplay() {
        const categoryData = this.azkarDatabase[this.currentAzkarCategory];
        const dhikrData = categoryData ? categoryData.azkar[this.currentDhikr] : null;
        
        if (!dhikrData) return;

        // Update main display
        const currentDhikrTextEl = document.getElementById('currentDhikrText');
        const currentDhikrTranslationEl = document.getElementById('currentDhikrTranslation');
        const counterNumberEl = document.getElementById('counterNumber');
        const targetCountEl = document.getElementById('targetCount');
        const progressFillEl = document.getElementById('progressFillDhikr');
        
        if (currentDhikrTextEl) {
            currentDhikrTextEl.textContent = dhikrData.arabic;
        }
        
        if (currentDhikrTranslationEl) {
            currentDhikrTranslationEl.textContent = dhikrData.translation;
        }
        
        if (counterNumberEl) {
            counterNumberEl.textContent = this.dhikrCounter;
        }
        
        if (targetCountEl) {
            targetCountEl.textContent = this.dhikrTarget;
        }

        // Update progress bar
        const progressPercent = Math.min((this.dhikrCounter / this.dhikrTarget) * 100, 100);
        if (progressFillEl) {
            progressFillEl.style.width = progressPercent + '%';
        }

        // Update progress color
        if (counterNumberEl) {
            if (progressPercent >= 100) {
                counterNumberEl.style.color = '#2ECC71';
            } else {
                counterNumberEl.style.color = 'var(--tab-text)';
            }
        }

        // Update widget display if it exists
        this.updateWidgetDhikrDisplay();
    }

    resetDhikrCounter() {
        this.dhikrCounter = 0;
        this.updateDhikrDisplay();
        this.saveProgress();
    }

    showCompletionMessage() {
        const categoryData = this.azkarDatabase[this.currentAzkarCategory];
        const dhikrData = categoryData ? categoryData.azkar[this.currentDhikr] : null;
        
        if (dhikrData) {
            this.showCompletionModal(dhikrData);
        }
    }

    showCompletionModal(dhikrData) {
        // Create modal HTML
        const modalHTML = `
            <div class="completion-modal-overlay" id="completionModal">
                <div class="completion-modal">
                    <div class="completion-content">
                        <div class="completion-icon">
                            <i class="fas fa-star"></i>
                        </div>
                        <h3 class="completion-title">Mashaallah! Target Completed</h3>
                        <div class="completion-dhikr">
                            <div class="completion-arabic">${dhikrData.arabic}</div>
                            <div class="completion-translation">${dhikrData.translation}</div>
                        </div>
                        <p class="completion-message">May Allah accept your dhikr and grant you His blessings.</p>
                        <div class="completion-actions">
                            <button class="continue-btn" onclick="app.closeCompletionModal()">Continue</button>
                            <button class="reset-start-btn" onclick="app.resetAndContinue()">Reset & Continue</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Add animation
        setTimeout(() => {
            const modal = document.getElementById('completionModal');
            if (modal) {
                modal.classList.add('show');
            }
        }, 10);
    }

    closeCompletionModal() {
        const modal = document.getElementById('completionModal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    }

    resetAndContinue() {
        this.resetDhikrCounter();
        this.closeCompletionModal();
    }

    updateWidgetDhikrDisplay() {
        const widgetCountEl = document.getElementById('widgetDhikrCount');
        const widgetTargetEl = document.getElementById('widgetDhikrTarget');
        
        if (widgetCountEl) {
            widgetCountEl.textContent = this.dhikrCounter;
        }
        
        if (widgetTargetEl) {
            widgetTargetEl.textContent = this.dhikrTarget;
        }
    }

    // Prayer Times functionality
    loadPrayerTimes() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.location = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };
                    this.calculatePrayerTimes();
                },
                (error) => {
                    console.log('Location access denied:', error);
                    this.loadDefaultPrayerTimes();
                }
            );
        } else {
            this.loadDefaultPrayerTimes();
        }
    }

    calculatePrayerTimes() {
        // Simplified prayer time calculation
        // In production, use a proper Islamic calendar library
        const now = new Date();
        const prayers = {
            'Fajr': '05:30',
            'Dhuhr': '12:30',
            'Asr': '15:45',
            'Maghrib': '18:20',
            'Isha': '19:50'
        };

        this.prayerTimes = prayers;
        this.displayPrayerTimes();
    }

    loadDefaultPrayerTimes() {
        this.prayerTimes = {
            'Fajr': '05:30',
            'Dhuhr': '12:30',
            'Asr': '15:45',
            'Maghrib': '18:20',
            'Isha': '19:50'
        };
        this.displayPrayerTimes();
    }

    displayPrayerTimes() {
        const grid = document.getElementById('prayerTimesGrid');
        if (!grid) return;

        grid.innerHTML = '';
        
        Object.entries(this.prayerTimes).forEach(([name, time]) => {
            const prayerCard = this.createPrayerCard(name, time);
            grid.appendChild(prayerCard);
        });
    }

    createPrayerCard(name, time) {
        const card = document.createElement('div');
        card.className = 'prayer-card';
        card.innerHTML = `
            <div class="prayer-name">${name}</div>
            <div class="prayer-time">${time}</div>
            <div class="prayer-status">Upcoming</div>
        `;
        return card;
    }

    getNextPrayer() {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        const prayerTimes = {
            'Fajr': 330,    // 5:30
            'Dhuhr': 750,   // 12:30
            'Asr': 945,     // 15:45
            'Maghrib': 1100, // 18:20
            'Isha': 1190    // 19:50
        };

        for (const [name, minutes] of Object.entries(prayerTimes)) {
            if (currentTime < minutes) {
                const hours = Math.floor(minutes / 60);
                const mins = minutes % 60;
                return {
                    name: name,
                    time: `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
                };
            }
        }

        // If all prayers have passed, return Fajr of next day
        return { name: 'Fajr', time: '05:30' };
    }

    // Quran functionality
    loadQuranContent() {
        // Load verse of the day and reading progress
        this.updateVerseOfTheDay();
        this.updateReadingProgress();
    }

    updateVerseOfTheDay() {
        const verses = [
            {
                arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
                translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
                reference: 'Al-Fatihah 1:1'
            }
        ];
        
        const verse = verses[0]; // For now, just show the first verse
        
        const arabicEl = document.getElementById('arabicVerse');
        const translationEl = document.getElementById('verseTranslation');
        const referenceEl = document.getElementById('verseReference');
        
        if (arabicEl) arabicEl.textContent = verse.arabic;
        if (translationEl) translationEl.textContent = verse.translation;
        if (referenceEl) referenceEl.textContent = verse.reference;
    }

    updateReadingProgress() {
        const progress = this.getQuranProgress();
        const progressBar = document.getElementById('quranProgress');
        
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
    }

    // Utility functions
    updateCurrentTime() {
        const now = new Date();
        const timeOptions = { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        };
        const timeString = now.toLocaleTimeString('en-US', timeOptions);
        
        // Update any time displays
        const timeDisplays = document.querySelectorAll('.time-display');
        timeDisplays.forEach(display => {
            display.textContent = timeString;
        });
    }

    setupAudioPlayer() {
        const playPauseBtn = document.querySelector('.play-pause');
        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', () => {
                const icon = playPauseBtn.querySelector('i');
                if (icon.classList.contains('fa-pause')) {
                    icon.classList.remove('fa-pause');
                    icon.classList.add('fa-play');
                } else {
                    icon.classList.remove('fa-play');
                    icon.classList.add('fa-pause');
                }
            });
        }
        
        // Close button
        const closeBtn = document.getElementById('closePlayerBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                const player = document.getElementById('audioPlayer');
                if (player) player.style.display = 'none';
            });
        }
        
        // Make audio player draggable
        const player = document.getElementById('audioPlayer');
        if (player) this.makeElementDraggable(player);
    }
    
    // Audio categories function
    showAudioCategories() {
        let html = '<div class="audio-categories-modal" style="background:#fff;padding:2rem;border-radius:16px;box-shadow:0 8px 32px rgba(10,37,64,0.18);max-width:400px;margin:2rem auto;">';
        html += '<h3 style="font-size:1.5rem;margin-bottom:1.5rem;color:#0A2540;font-weight:700;">Audio Library</h3>';
        
        // Audio categories
        const categories = [
            { id: 'quran', name: 'Quran Recitations', icon: 'fas fa-quran' },
            { id: 'nasheeds', name: 'Nasheeds', icon: 'fas fa-music' },
            { id: 'taqreers', name: 'Islamic Lectures (Taqreers)', icon: 'fas fa-microphone-alt' }
        ];
        
        categories.forEach(cat => {
            html += `<button class="audio-category-btn" data-category="${cat.id}" style="display:flex;align-items:center;gap:12px;width:100%;padding:16px;margin-bottom:10px;background:#f5f8fb;border:none;border-radius:12px;text-align:left;cursor:pointer;transition:all 0.2s;box-shadow:0 2px 8px rgba(10,37,64,0.05);">`;
            html += `<i class="${cat.icon}" style="font-size:1.5rem;color:#4A90E2;width:30px;text-align:center;"></i>`;
            html += `<div><strong style="display:block;font-size:1.1rem;margin-bottom:4px;">${cat.name}</strong>`;
            
            if (cat.id === 'quran') {
                html += `<span style="font-size:0.9rem;color:#666;">Listen to beautiful recitations</span>`;
            } else if (cat.id === 'nasheeds') {
                html += `<span style="font-size:0.9rem;color:#666;">Islamic songs and hymns</span>`;
            } else {
                html += `<span style="font-size:0.9rem;color:#666;">Knowledge and guidance</span>`;
            }
            
            html += `</div></button>`;
        });
        
        html += '<button class="close-modal-btn" style="margin-top:16px;background:#D32F2F;color:#fff;padding:10px 20px;border:none;border-radius:8px;cursor:pointer;width:100%;">Close</button></div>';
        
        let modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.style.background = 'rgba(10,37,64,0.18)';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.zIndex = '9999';
        modal.innerHTML = html;
        
        document.body.appendChild(modal);
        
        // Add click handlers for category buttons
        modal.querySelectorAll('.audio-category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.getAttribute('data-category');
                this.showAudioPlayer(category);
                document.body.removeChild(modal);
            });
        });
        
        modal.querySelector('.close-modal-btn').addEventListener('click', () => document.body.removeChild(modal));
    }
    
    showAudioPlayer(category) {
        const audioPlayer = document.getElementById('audioPlayer');
        if (!audioPlayer) return;
        
        const surahNameEl = audioPlayer.querySelector('.surah-name');
        const reciterEl = audioPlayer.querySelector('.reciter');
        
        // Update player UI based on selected category
        if (category === 'quran') {
            surahNameEl.textContent = 'Surat Al-Waqiah';
            reciterEl.textContent = 'Quran • 1 of 96';
        } else if (category === 'nasheeds') {
            surahNameEl.textContent = 'Ya Nabi Salam Alayka';
            reciterEl.textContent = 'Nasheed • 1 of 24';
        } else if (category === 'taqreers') {
            surahNameEl.textContent = 'Virtues of Patience';
            reciterEl.textContent = 'Lecture • 1 of 15';
        }
        
        // Show the player
        audioPlayer.style.display = 'block';
    }

    // Helper functions for data
    getTotalDhikrToday() {
        // Return stored dhikr count for today
        return this.settings.dailyDhikr || 156;
    }

    getTasksStatus() {
        // Return tasks completed today
        return this.settings.tasksCompleted || '3/8';
    }

    getQuranProgress() {
        // Return Quran reading progress
        return this.settings.quranProgress || 25;
    }

    loadStoredSettings() {
        try {
            const stored = localStorage.getItem('deenshield-settings');
            return stored ? JSON.parse(stored) : {};
        } catch (e) {
            return {};
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('deenshield-settings', JSON.stringify(this.settings));
        } catch (e) {
            console.error('Failed to save settings:', e);
        }
    }

    saveProgress() {
        this.settings.dhikrCounter = this.dhikrCounter;
        this.settings.currentDhikr = this.currentDhikr;
        this.settings.lastUpdate = new Date().toISOString();
        
        try {
            localStorage.setItem('deenshield-settings', JSON.stringify(this.settings));
        } catch (e) {
            console.log('Could not save settings:', e);
        }
    }

    // Modal functions
    showLoginModal() {
        console.log('Login modal would open here');
        // Implement login modal
    }

    // Tab switching helper method
    switchTab(tabName) {
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Show selected tab
        const targetTab = document.getElementById(tabName);
        if (targetTab) {
            targetTab.classList.add('active');
        }
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const targetBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (targetBtn) {
            targetBtn.classList.add('active');
        }
        
        this.currentTab = tabName;
    }
    
    updateWidgetContent() {
        this.updateTimeBasedContent();
        this.updatePrayerTimesWidget();
        this.updateIslamicDate();
    }
    
    updateTimeBasedContent() {
        const now = new Date();
        const hour = now.getHours();
        let greeting = 'Good Morning';
        
        if (hour >= 12 && hour < 17) greeting = 'Good Afternoon';
        else if (hour >= 17) greeting = 'Good Evening';
        
        const greetingElement = document.getElementById('greetingTime');
        if (greetingElement) {
            greetingElement.textContent = greeting;
        }
    }
    
    updatePrayerTimesWidget() {
        // This would connect to actual prayer times API
        // For now, showing static times
        const nextPrayerName = document.getElementById('nextPrayerName');
        const nextPrayerTime = document.getElementById('nextPrayerTime');
        
        if (nextPrayerName && nextPrayerTime) {
            const now = new Date();
            const hour = now.getHours();
            
            if (hour < 6) {
                nextPrayerName.textContent = 'Fajr';
                nextPrayerTime.textContent = '5:30 AM';
            } else if (hour < 13) {
                nextPrayerName.textContent = 'Dhuhr';
                nextPrayerTime.textContent = '1:15 PM';
            } else if (hour < 16) {
                nextPrayerName.textContent = 'Asr';
                nextPrayerTime.textContent = '3:45 PM';
            } else if (hour < 19) {
                nextPrayerName.textContent = 'Maghrib';
                nextPrayerTime.textContent = '6:20 PM';
            } else {
                nextPrayerName.textContent = 'Isha';
                nextPrayerTime.textContent = '8:00 PM';
            }
        }
    }
    
    updateIslamicDate() {
        const islamicDateElement = document.getElementById('islamicDate');
        const hijriDateElement = document.getElementById('hijriDate');
        
        // Simple Islamic date calculation (this would normally use a proper library)
        const today = new Date();
        const islamicDate = '15 Rajab 1446 AH'; // Placeholder
        
        if (islamicDateElement) {
            islamicDateElement.textContent = islamicDate;
        }
        if (hijriDateElement) {
            hijriDateElement.textContent = islamicDate;
        }
    }
    
    // Setup window resize handler for responsive widget scaling
    setupWindowResizeHandler() {
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                const widgets = document.querySelectorAll('.widget-card');
                widgets.forEach(widget => {
                    const rect = widget.getBoundingClientRect();
                    this.applyWidgetContentScaling(widget, rect.width, rect.height);
                });
            }, 250); // Debounce resize events
        });
    }

    // Missing content loading methods
    loadLibraryContent() {
        console.log('Library content loaded');
        // Library content is already in HTML, just ensure it's visible
    }

    loadProductivityContent() {
        console.log('Productivity content loaded');
        // Productivity content is already in HTML, just ensure it's visible
    }

    // Initialize the app
    init() {
        this.setupEventListeners();
        this.loadUserLocation();
        this.initializePrayerTasks();
        this.startPrayerTimeMonitoring();
        this.requestNotificationPermission();
    }

    // Setup event listeners for task management
    setupEventListeners() {
        // Add task button
        const addTaskBtn = document.getElementById('addTaskBtn');
        if (addTaskBtn) {
            addTaskBtn.addEventListener('click', () => this.showTaskForm());
        }

        // Close form button
        const closeFormBtn = document.getElementById('closeFormBtn');
        if (closeFormBtn) {
            closeFormBtn.addEventListener('click', () => this.hideTaskForm());
        }

        // Task form submission
        const taskForm = document.querySelector('#taskForm form');
        if (taskForm) {
            taskForm.addEventListener('submit', (e) => this.handleTaskSubmit(e));
        }

        // Category filter tabs
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.filterTasksByCategory(e.target.dataset.category));
        });
    }

    // Request notification permission
    async requestNotificationPermission() {
        if ('Notification' in window && Notification.permission !== 'granted') {
            try {
                const permission = await Notification.requestPermission();
                console.log('Notification permission:', permission);
            } catch (error) {
                console.log('Error requesting notification permission:', error);
            }
        }
    }

    // Load user's geographical location
    loadUserLocation() {
        if (navigator.geolocation) {
            this.geolocationWatcher = navigator.geolocation.watchPosition(
                (position) => {
                    this.location = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };
                    this.calculateAccuratePrayerTimes();
                },
                (error) => {
                    console.log('Location access denied:', error);
                    this.loadDefaultPrayerTimes();
                },
                { 
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000 // 5 minutes
                }
            );
        } else {
            this.loadDefaultPrayerTimes();
        }
    }

    // Calculate accurate prayer times based on location
    calculateAccuratePrayerTimes() {
        if (!this.location) return;

        // This is a simplified calculation. In production, use a proper Islamic calendar library
        // like PrayTimes.js or similar
        const date = new Date();
        const { latitude, longitude } = this.location;
        
        // Simplified prayer time calculation (you should use a proper Islamic calendar library)
        const prayers = this.calculatePrayerTimesForLocation(latitude, longitude, date);
        
        this.prayerTimes = prayers;
        this.updatePrayerTasksWithTimes();
        this.displayPrayerTimes();
    }

    // Simplified prayer time calculation method
    calculatePrayerTimesForLocation(lat, lng, date) {
        // This is a basic implementation. Use a proper Islamic prayer time library in production
        const now = new Date();
        const hour = now.getHours();
        
        // Default times - replace with actual calculation
        return {
            'Fajr': '05:30',
            'Dhuhr': '12:30', 
            'Asr': '15:45',
            'Maghrib': '18:20',
            'Isha': '19:50'
        };
    }

    // Initialize mandatory prayer tasks
    initializePrayerTasks() {
        const prayerNames = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        const today = new Date().toDateString();
        
        prayerNames.forEach(prayer => {
            const existingTask = this.tasks.find(task => 
                task.title === `${prayer} Prayer` && 
                task.category === 'mandatory' && 
                new Date(task.dueDate).toDateString() === today
            );
            
            if (!existingTask) {
                this.addPrayerTask(prayer);
            }
        });
        
        this.saveTasks();
        this.renderTasks();
    }

    // Add a prayer task
    addPrayerTask(prayerName) {
        const task = {
            id: 'prayer_' + prayerName.toLowerCase() + '_' + Date.now(),
            title: `${prayerName} Prayer`,
            description: `Perform ${prayerName} prayer on time`,
            category: 'mandatory',
            dueDate: new Date().toISOString().split('T')[0],
            dueTime: this.getPrayerTime(prayerName),
            repeat: 'daily',
            completed: false,
            isPrayer: true,
            prayerName: prayerName,
            createdAt: new Date().toISOString()
        };
        
        this.tasks.push(task);
    }

    // Get prayer time for specific prayer
    getPrayerTime(prayerName) {
        return this.prayerTimes[prayerName] || '12:00';
    }

    // Update prayer task times when prayer times are recalculated
    updatePrayerTasksWithTimes() {
        this.tasks.forEach(task => {
            if (task.isPrayer && task.prayerName) {
                task.dueTime = this.getPrayerTime(task.prayerName);
            }
        });
        this.saveTasks();
        this.renderTasks();
    }

    // Start monitoring prayer times for notifications
    startPrayerTimeMonitoring() {
        // Clear existing timer
        if (this.notificationTimer) {
            clearInterval(this.notificationTimer);
        }

        // Check every minute for prayer time notifications
        this.notificationTimer = setInterval(() => {
            this.checkPrayerTimeNotifications();
        }, 60000); // Check every minute

        // Initial check
        this.checkPrayerTimeNotifications();
    }

    // Check if any prayer time is approaching
    checkPrayerTimeNotifications() {
        const now = new Date();
        const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                           now.getMinutes().toString().padStart(2, '0');

        Object.entries(this.prayerTimes).forEach(([prayerName, prayerTime]) => {
            // Check if current time matches prayer time
            if (currentTime === prayerTime) {
                this.showPrayerNotification(prayerName);
            }
            
            // Check if prayer time is in 5 minutes (warning notification)
            const prayerDate = this.parseTimeToDate(prayerTime);
            const timeDiff = prayerDate.getTime() - now.getTime();
            const minutesDiff = Math.floor(timeDiff / (1000 * 60));
            
            if (minutesDiff === 5) {
                this.showPrayerWarningNotification(prayerName);
            }
        });
    }

    // Parse time string to Date object
    parseTimeToDate(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
    }

    // Show prayer time notification
    showPrayerNotification(prayerName) {
        const notificationId = `prayer_${prayerName}_${Date.now()}`;
        
        // Browser notification
        if (Notification.permission === 'granted') {
            const notification = new Notification(`${prayerName} Prayer Time`, {
                body: `It's time for ${prayerName} prayer. May Allah accept your worship.`,
                icon: 'images/icon-192.png',
                tag: notificationId,
                badge: 'images/icon-192.png'
            });

            // Auto-close notification after 10 seconds
            setTimeout(() => notification.close(), 10000);
        }

        // In-app notification
        this.showInAppNotification(`${prayerName} Prayer Time`, `It's time for ${prayerName} prayer`);
        
        // Mark prayer task as due
        this.markPrayerTaskAsDue(prayerName);
    }

    // Show prayer warning notification (5 minutes before)
    showPrayerWarningNotification(prayerName) {
        if (Notification.permission === 'granted') {
            const notification = new Notification(`${prayerName} Prayer in 5 minutes`, {
                body: `${prayerName} prayer will begin in 5 minutes. Please prepare.`,
                icon: 'images/icon-192.png',
                tag: `warning_${prayerName}_${Date.now()}`,
                badge: 'images/icon-192.png'
            });

            setTimeout(() => notification.close(), 8000);
        }

        this.showInAppNotification(`${prayerName} in 5 minutes`, `Please prepare for ${prayerName} prayer`);
    }

    // Show in-app notification
    showInAppNotification(title, message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'in-app-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    <i class="fas fa-pray"></i>
                </div>
                <div class="notification-text">
                    <h4>${title}</h4>
                    <p>${message}</p>
                </div>
                <button class="notification-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Add close functionality
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });

        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 10000);

        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);
    }

    // Mark prayer task as due
    markPrayerTaskAsDue(prayerName) {
        const task = this.tasks.find(t => 
            t.isPrayer && 
            t.prayerName === prayerName && 
            new Date(t.dueDate).toDateString() === new Date().toDateString()
        );
        
        if (task) {
            task.isDue = true;
            this.saveTasks();
            this.renderTasks();
        }
    }

    // Task management methods
    loadTasks() {
        try {
            const stored = localStorage.getItem('deenshield-tasks');
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            return [];
        }
    }

    saveTasks() {
        try {
            localStorage.setItem('deenshield-tasks', JSON.stringify(this.tasks));
        } catch (e) {
            console.log('Could not save tasks:', e);
        }
    }

    showTaskForm() {
        const taskForm = document.getElementById('taskForm');
        const originalView = document.getElementById('originalTaskView');
        
        if (taskForm && originalView) {
            taskForm.style.display = 'block';
            originalView.style.display = 'none';
        }
    }

    hideTaskForm() {
        const taskForm = document.getElementById('taskForm');
        const originalView = document.getElementById('originalTaskView');
        
        if (taskForm && originalView) {
            taskForm.style.display = 'none';
            originalView.style.display = 'block';
        }
        
        // Reset form
        const form = taskForm.querySelector('form');
        if (form) form.reset();
    }

    handleTaskSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const task = {
            id: 'task_' + Date.now(),
            title: document.getElementById('taskInput').value,
            description: document.getElementById('taskInput').value,
            category: document.getElementById('categorySelect').value,
            dueDate: document.getElementById('dueDateInput').value,
            dueTime: document.getElementById('dueTimeInput').value,
            repeat: document.getElementById('repeatSelect').value,
            completed: false,
            isPrayer: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();
        this.hideTaskForm();
    }

    filterTasksByCategory(category) {
        // Update active tab
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        const activeTab = document.querySelector(`[data-category="${category}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }

        // Filter and render tasks
        this.renderTasks(category);
    }

    renderTasks(filterCategory = 'all') {
        const taskList = document.getElementById('simpleTaskList');
        if (!taskList) return;

        let filteredTasks = this.tasks;
        if (filterCategory !== 'all') {
            filteredTasks = this.tasks.filter(task => task.category === filterCategory);
        }

        // Sort tasks: mandatory prayers first, then by due time
        filteredTasks.sort((a, b) => {
            if (a.category === 'mandatory' && b.category !== 'mandatory') return -1;
            if (b.category === 'mandatory' && a.category !== 'mandatory') return 1;
            
            const aTime = a.dueTime || '23:59';
            const bTime = b.dueTime || '23:59';
            return aTime.localeCompare(bTime);
        });

        taskList.innerHTML = filteredTasks.map(task => this.renderTaskItem(task)).join('');

        // Add event listeners to task items
        filteredTasks.forEach(task => {
            const taskElement = document.getElementById(`task_${task.id}`);
            if (taskElement) {
                const checkbox = taskElement.querySelector('.task-checkbox');
                const deleteBtn = taskElement.querySelector('.delete-task');
                
                if (checkbox) {
                    checkbox.addEventListener('change', () => this.toggleTaskCompletion(task.id));
                }
                
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', () => this.deleteTask(task.id));
                }
            }
        });
    }

    renderTaskItem(task) {
        const isOverdue = this.isTaskOverdue(task);
        const isDue = task.isDue || this.isTaskDue(task);
        
        return `
            <div class="task-item ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''} ${isDue ? 'due' : ''}" id="task_${task.id}">
                <div class="task-content">
                    <div class="task-checkbox-container">
                        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                        ${task.category === 'mandatory' ? '<span class="mandatory-badge">FARD</span>' : ''}
                    </div>
                    <div class="task-details">
                        <div class="task-title">${task.title}</div>
                        <div class="task-meta">
                            <span class="task-category">${this.getCategoryIcon(task.category)} ${task.category}</span>
                            <span class="task-time">${task.dueTime}</span>
                            ${task.repeat !== 'none' ? `<span class="task-repeat">↻ ${task.repeat}</span>` : ''}
                        </div>
                    </div>
                </div>
                <div class="task-actions">
                    ${!task.isPrayer ? `<button class="delete-task" title="Delete Task"><i class="fas fa-trash"></i></button>` : ''}
                </div>
            </div>
        `;
    }

    getCategoryIcon(category) {
        const icons = {
            'mandatory': '🤲',
            'spiritual': '🤲',
            'work': '💼',
            'personal': '👤',
            'shopping': '🛒',
            'other': '📋'
        };
        return icons[category] || '📋';
    }

    isTaskOverdue(task) {
        if (task.completed) return false;
        
        const now = new Date();
        const taskDate = new Date(task.dueDate + 'T' + (task.dueTime || '23:59'));
        
        return taskDate < now;
    }

    isTaskDue(task) {
        if (task.completed) return false;
        
        const now = new Date();
        const taskDate = new Date(task.dueDate + 'T' + (task.dueTime || '23:59'));
        const timeDiff = taskDate.getTime() - now.getTime();
        const minutesDiff = Math.floor(timeDiff / (1000 * 60));
        
        return minutesDiff <= 15 && minutesDiff >= 0; // Due within 15 minutes
    }

    toggleTaskCompletion(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date().toISOString() : null;
            
            this.saveTasks();
            this.renderTasks();
            
            if (task.completed && task.isPrayer) {
                this.showTaskCompletionMessage(task);
            }
        }
    }

    showTaskCompletionMessage(task) {
        this.showInAppNotification(
            'Prayer Completed!', 
            `May Allah accept your ${task.prayerName} prayer. Barakallahu feeki.`
        );
    }

    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.saveTasks();
            this.renderTasks();
        }
    }

    // ============================================= 
    // Browser Extension Integration
    // ============================================= 

    initExtensionIntegration() {
        // Check if Deen Shield extension is installed
        this.checkExtension();
        
        // Set up communication channel with extension
        this.setupExtensionCommunication();
        
        // Start periodic sync with extension
        this.startExtensionSync();
        
        console.log('🔗 Extension integration initialized');
    }

    checkExtension() {
        try {
            // Try to communicate with the Deen Shield extension
            if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
                // Chrome-based browsers
                chrome.runtime.sendMessage('deen-shield-extension-id', 
                    { action: 'getStatus' }, 
                    (response) => {
                        if (chrome.runtime.lastError) {
                            this.handleExtensionNotFound();
                        } else {
                            this.handleExtensionFound(response);
                        }
                    }
                );
            } else if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.sendMessage) {
                // Firefox
                browser.runtime.sendMessage('deen-shield-extension-id', 
                    { action: 'getStatus' }
                ).then(response => {
                    this.handleExtensionFound(response);
                }).catch(() => {
                    this.handleExtensionNotFound();
                });
            } else {
                // Fallback: Check for custom extension indicator
                this.checkExtensionByDOM();
            }
        } catch (error) {
            console.log('Extension check failed:', error);
            this.handleExtensionNotFound();
        }
    }

    checkExtensionByDOM() {
        // Alternative method: Look for extension-injected DOM elements
        const extensionMarker = document.querySelector('[data-deen-shield-extension]');
        if (extensionMarker) {
            this.handleExtensionFound({
                installed: true,
                active: true,
                version: extensionMarker.getAttribute('data-version') || 'Unknown',
                blockedToday: parseInt(extensionMarker.getAttribute('data-blocked-today') || '0')
            });
        } else {
            // Inject a script to check for extension global variables
            this.injectExtensionDetector();
        }
    }

    injectExtensionDetector() {
        const script = document.createElement('script');
        script.textContent = `
            (function() {
                // Check for extension global variables
                if (window.DeenShieldExtension || window.deenShieldExtension) {
                    const event = new CustomEvent('deenShieldExtensionDetected', {
                        detail: {
                            installed: true,
                            active: window.DeenShieldExtension?.isActive || true,
                            version: window.DeenShieldExtension?.version || '1.2.0',
                            blockedToday: window.DeenShieldExtension?.getBlockedCount?.() || 0
                        }
                    });
                    window.dispatchEvent(event);
                } else {
                    const event = new CustomEvent('deenShieldExtensionNotFound');
                    window.dispatchEvent(event);
                }
            })();
        `;
        document.head.appendChild(script);
        document.head.removeChild(script);

        // Listen for the custom events
        window.addEventListener('deenShieldExtensionDetected', (e) => {
            this.handleExtensionFound(e.detail);
        });

        window.addEventListener('deenShieldExtensionNotFound', () => {
            this.handleExtensionNotFound();
        });

        // Timeout fallback
        setTimeout(() => {
            if (!this.extensionStatus.installed) {
                this.handleExtensionNotFound();
            }
        }, 2000);
    }

    handleExtensionFound(response) {
        this.extensionConnected = true;
        this.extensionStatus = {
            installed: true,
            active: response.active !== false,
            version: response.version || '1.2.0',
            blockedToday: response.blockedToday || 0,
            lastSync: new Date().toISOString()
        };

        console.log('✅ Deen Shield Extension detected:', this.extensionStatus);
        this.updateExtensionUI();
        this.syncWithExtension();
    }

    handleExtensionNotFound() {
        this.extensionConnected = false;
        this.extensionStatus = {
            installed: false,
            active: false,
            version: null,
            blockedToday: 0,
            lastSync: null
        };

        console.log('❌ Deen Shield Extension not found');
        this.updateExtensionUI();
        this.showExtensionInstallPrompt();
    }

    updateExtensionUI() {
        // Update extension status widget
        const statusIcon = document.getElementById('statusIcon');
        const statusText = document.getElementById('statusText');
        const extVersion = document.getElementById('extVersion');
        const blockedCount = document.getElementById('blockedCount');
        const extensionIndicator = document.getElementById('extensionIndicator');

        if (statusIcon && statusText && extVersion && blockedCount) {
            if (this.extensionStatus.installed) {
                if (this.extensionStatus.active) {
                    statusIcon.className = 'fas fa-circle';
                    statusIcon.style.color = '#28a745';
                    statusText.textContent = 'Active & Protected';
                    extensionIndicator.className = 'status-indicator active';
                } else {
                    statusIcon.className = 'fas fa-circle';
                    statusIcon.style.color = '#ffc107';
                    statusText.textContent = 'Installed (Inactive)';
                    extensionIndicator.className = 'status-indicator warning';
                }
                extVersion.textContent = this.extensionStatus.version;
                blockedCount.textContent = this.extensionStatus.blockedToday.toString();
            } else {
                statusIcon.className = 'fas fa-circle';
                statusIcon.style.color = '#dc3545';
                statusText.textContent = 'Not Installed';
                extensionIndicator.className = 'status-indicator inactive';
                extVersion.textContent = 'N/A';
                blockedCount.textContent = '0';
            }
        }

        // Update digital wellness widget
        this.updateDigitalWellnessWidget();

    // Broadcast new stats to external widgets
    try { this.updateWidgetContent(); } catch (e) {}
    }

    updateDigitalWellnessWidget() {
        const todayBlocked = document.getElementById('todayBlocked');
        const focusTime = document.getElementById('focusTime');

        if (todayBlocked) {
            todayBlocked.textContent = this.extensionStatus.blockedToday.toString();
        }

        if (focusTime) {
            // Calculate focus time based on blocked content (rough estimate)
            const focusHours = Math.max(0, 8 - (this.extensionStatus.blockedToday * 0.1));
            focusTime.textContent = `${focusHours.toFixed(1)}h`;
        }

        // Update protection percentage
        const protectionPercentage = this.extensionStatus.installed ? 
            (this.extensionStatus.active ? 85 : 45) : 25;
        
        this.updateCircularProgress(protectionPercentage);
    }

    updateCircularProgress(percentage) {
        const progressCircle = document.querySelector('.circle-progress');
        const percentageText = document.querySelector('.percentage');
        
        if (progressCircle && percentageText) {
            progressCircle.setAttribute('data-percent', percentage);
            percentageText.textContent = `${percentage}%`;
            
            // Update the visual progress (if you have CSS animations)
            progressCircle.style.setProperty('--progress', `${percentage}%`);
        }
    }

    setupExtensionCommunication() {
        // Set up message listener for extension communication
        window.addEventListener('message', (event) => {
            if (event.origin !== window.location.origin) return;
            
            if (event.data.type === 'DEEN_SHIELD_EXTENSION_UPDATE') {
                this.handleExtensionUpdate(event.data.payload);
            }
        });

        // Post message to extension if available
        this.postMessageToExtension({ action: 'registerApp' });
    }

    postMessageToExtension(message) {
        try {
            window.postMessage({
                type: 'DEEN_SHIELD_APP_MESSAGE',
                payload: message
            }, window.location.origin);
        } catch (error) {
            console.log('Failed to send message to extension:', error);
        }
    }

    handleExtensionUpdate(payload) {
        switch (payload.action) {
            case 'statusUpdate':
                this.extensionStatus = { ...this.extensionStatus, ...payload.data };
                this.updateExtensionUI();
                break;
            case 'blockingEvent':
                this.handleBlockingEvent(payload.data);
                break;
            case 'settingsSync':
                this.syncSettingsWithExtension(payload.data);
                break;
        }
    }

    handleBlockingEvent(data) {
        // Handle when extension blocks content
        this.extensionStatus.blockedToday++;
        this.updateDigitalWellnessWidget();
        
        // Show notification if enabled
        if (this.settings.showBlockingNotifications) {
            this.showInAppNotification(
                'Content Blocked',
                `Deen Shield blocked: ${data.domain || 'inappropriate content'}`,
                'shield'
            );
        }
    }

    syncWithExtension() {
        if (!this.extensionConnected) return;

        // Send app settings to extension
        this.postMessageToExtension({
            action: 'syncSettings',
            data: {
                prayerTimes: this.prayerTimes,
                location: this.location,
                islamicMode: this.settings.islamicMode || false,
                prayerNotifications: this.settings.prayerNotifications || true
            }
        });
    }

    startExtensionSync() {
        // Sync with extension every 5 minutes
        setInterval(() => {
            if (this.extensionConnected) {
                this.checkExtension();
                this.syncWithExtension();
            }
        }, 5 * 60 * 1000);
    }

    toggleIslamicMode() {
        const islamicMode = !this.settings.islamicMode;
        this.settings.islamicMode = islamicMode;
        this.saveSettings();

        // Sync with extension
        this.postMessageToExtension({
            action: 'toggleIslamicMode',
            data: { enabled: islamicMode }
        });

        // Update UI
        const btn = document.getElementById('islamicModeBtn');
        if (btn) {
            btn.textContent = islamicMode ? 'Disable Islamic Mode' : 'Enable Islamic Mode';
            btn.classList.toggle('active', islamicMode);
        }

        // Show notification
        this.showInAppNotification(
            'Islamic Mode',
            `Islamic Mode ${islamicMode ? 'enabled' : 'disabled'}. Enhanced protection during prayer times.`,
            'shield'
        );
    }

    openExtensionSettings() {
        if (this.extensionStatus.installed) {
            // Try to open extension options page
            this.postMessageToExtension({ action: 'openSettings' });
        } else {
            this.showExtensionInstallPrompt();
        }
    }

    showExtensionInstallPrompt() {
        const modalHTML = `
            <div class="modal-overlay" id="extensionInstallModal">
                <div class="modal">
                    <div class="modal-header">
                        <h3><i class="fas fa-shield-alt"></i> Install Deen Shield Extension</h3>
                        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="extension-promo">
                            <div class="promo-icon">
                                <i class="fas fa-shield-alt"></i>
                            </div>
                            <h4>Enhanced Protection with Browser Extension</h4>
                            <p>Get comprehensive Islamic content blocking across all websites with the official Deen Shield browser extension.</p>
                            
                            <div class="features-list">
                                <div class="feature-item">
                                    <i class="fas fa-check"></i>
                                    <span>Block inappropriate content automatically</span>
                                </div>
                                <div class="feature-item">
                                    <i class="fas fa-check"></i>
                                    <span>Social media blocking for better focus</span>
                                </div>
                                <div class="feature-item">
                                    <i class="fas fa-check"></i>
                                    <span>Custom keyword filtering</span>
                                </div>
                                <div class="feature-item">
                                    <i class="fas fa-check"></i>
                                    <span>Password protection for settings</span>
                                </div>
                                <div class="feature-item">
                                    <i class="fas fa-check"></i>
                                    <span>Sync with this productivity app</span>
                                </div>
                            </div>
                            
                            <div class="install-buttons">
                                <a href="https://chrome.google.com/webstore/detail/deen-shield" target="_blank" class="install-btn chrome">
                                    <i class="fab fa-chrome"></i>
                                    Chrome Web Store
                                </a>
                                <a href="https://addons.mozilla.org/firefox/addon/deen-shield" target="_blank" class="install-btn firefox">
                                    <i class="fab fa-firefox"></i>
                                    Firefox Add-ons
                                </a>
                                <a href="https://microsoftedge.microsoft.com/addons/detail/deen-shield" target="_blank" class="install-btn edge">
                                    <i class="fab fa-edge"></i>
                                    Edge Add-ons
                                </a>
                            </div>
                            
                            <div class="github-link">
                                <a href="https://github.com/HabibGHub/DeenShield-Extension" target="_blank">
                                    <i class="fab fa-github"></i>
                                    View on GitHub
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    editProtectionSchedule() {
        // Show protection schedule editor
        const modalHTML = `
            <div class="modal-overlay" id="scheduleModal">
                <div class="modal">
                    <div class="modal-header">
                        <h3><i class="fas fa-calendar-check"></i> Protection Schedule</h3>
                        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="schedule-editor">
                            <h4>Automatic Protection Levels</h4>
                            <div class="schedule-options">
                                <div class="schedule-option">
                                    <input type="checkbox" id="enhancedPrayerTime" checked>
                                    <label for="enhancedPrayerTime">Enhanced protection during prayer times</label>
                                </div>
                                <div class="schedule-option">
                                    <input type="checkbox" id="enhancedEvening" checked>
                                    <label for="enhancedEvening">Stricter blocking after Maghrib</label>
                                </div>
                                <div class="schedule-option">
                                    <input type="checkbox" id="workModeEnabled">
                                    <label for="workModeEnabled">Work mode (9 AM - 5 PM)</label>
                                </div>
                                <div class="schedule-option">
                                    <input type="checkbox" id="sleepModeEnabled" checked>
                                    <label for="sleepModeEnabled">Sleep mode (10 PM - 5 AM)</label>
                                </div>
                            </div>
                            
                            <div class="custom-times">
                                <h5>Custom Time Ranges</h5>
                                <div class="time-range">
                                    <input type="time" value="22:00"> - <input type="time" value="05:00">
                                    <select>
                                        <option>Enhanced Protection</option>
                                        <option>Standard Protection</option>
                                        <option>Minimal Protection</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="schedule-actions">
                                <button class="btn btn-primary" onclick="window.deenShieldApp.saveProtectionSchedule()">Save Schedule</button>
                                <button class="btn" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    saveProtectionSchedule() {
        // Save protection schedule settings
        const settings = {
            enhancedPrayerTime: document.getElementById('enhancedPrayerTime')?.checked || false,
            enhancedEvening: document.getElementById('enhancedEvening')?.checked || false,
            workModeEnabled: document.getElementById('workModeEnabled')?.checked || false,
            sleepModeEnabled: document.getElementById('sleepModeEnabled')?.checked || false
        };

        // Save to localStorage
        localStorage.setItem('protectionSchedule', JSON.stringify(settings));

        // Sync with extension
        this.postMessageToExtension({
            action: 'updateSchedule',
            data: settings
        });

        // Close modal
        const modal = document.getElementById('scheduleModal');
        if (modal) modal.remove();

        // Show success message
        this.showInAppNotification(
            'Schedule Updated',
            'Protection schedule has been updated and synced with the extension.',
            'check'
        );
    }

    loadDigitalWellnessData() {
        const stored = localStorage.getItem('digitalWellnessData');
        return stored ? JSON.parse(stored) : {
            blockedSites: [],
            focusTime: 0,
            dailyStats: {},
            weeklyGoals: {
                focusHours: 6,
                blockedLimit: 50
            }
        };
    }

    saveDigitalWellnessData() {
        localStorage.setItem('digitalWellnessData', JSON.stringify(this.digitalWellnessData));
    }

    showInAppNotification(title, message, icon = 'info') {
        const notification = document.createElement('div');
        notification.className = 'in-app-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    <i class="fas fa-${icon}"></i>
                </div>
                <div class="notification-text">
                    <h4>${title}</h4>
                    <p>${message}</p>
                </div>
                <button class="notification-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);

        // Auto hide after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 5000);

        // Close button
        notification.querySelector('.notification-close').onclick = () => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        };
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.deenShieldApp = new DeenShieldApp();
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DeenShieldApp;
}

// Debug initialization
console.log('DeenShield app script loaded');
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded, initializing app');
    try {
        window.deenShieldApp = new DeenShieldApp();
        console.log('App initialized successfully');
    } catch (error) {
        console.error('Error initializing app:', error);
    }
});
