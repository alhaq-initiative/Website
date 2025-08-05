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
            }
        };
    }

    getDefaultWidgetOrder() {
        return ['greeting', 'prayerTimes', 'quranStudy', 'dhikrCounter', 'tasks', 'library'];
    }

    renderDashboardWidgets() {
        const container = document.getElementById('dashboard-widgets');
        if (!container) return;
        
        // Load from localStorage or use default
        let widgetOrder = JSON.parse(localStorage.getItem('dashboardWidgetOrder') || 'null') || this.getDefaultWidgetOrder();
        let closedWidgets = JSON.parse(localStorage.getItem('dashboardClosedWidgets') || '[]');
        let widgetPositions = JSON.parse(localStorage.getItem('dashboardWidgetPositions') || '{}');
        
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
                    
                    // Apply content scaling for restored size
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
                
                // Enhanced resizing logic
                this.setupWidgetResizing(card, resizeHandle, id);
                
                // Enhanced dragging logic for free movement
                this.setupWidgetDragging(card, id);
                
                // Initialize responsive scaling
                this.updateWidgetSizeClass(card);
                
                // Apply initial content scaling for new widgets
                setTimeout(() => {
                    const rect = card.getBoundingClientRect();
                    this.applyWidgetContentScaling(card, rect.width, rect.height);
                }, 50);
                
                if (w.closable) {
                    const closeBtn = document.createElement('button');
                    closeBtn.className = 'close-widget';
                    closeBtn.setAttribute('title', 'Close');
                    closeBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="10" fill="#fff"/><path d="M6 6L14 14M14 6L6 14" stroke="#D32F2F" stroke-width="2" stroke-linecap="round"/></svg>';
                    closeBtn.onclick = () => this.closeWidget(id);
                    closeBtn.style.position = 'absolute';
                    closeBtn.style.top = '8px';
                    closeBtn.style.right = '8px';
                    closeBtn.style.background = 'rgba(255,255,255,0.8)';
                    closeBtn.style.border = 'none';
                    closeBtn.style.borderRadius = '50%';
                    closeBtn.style.padding = '2px';
                    closeBtn.style.cursor = 'pointer';
                    closeBtn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                    closeBtn.onmouseover = () => closeBtn.style.background = '#ffeaea';
                    closeBtn.onmouseout = () => closeBtn.style.background = 'rgba(255,255,255,0.8)';
                    card.style.position = 'absolute';
                    card.appendChild(closeBtn);
                }
                
                container.appendChild(card);
            }
        });
        
        // Add content block overlay if enabled
        if (localStorage.getItem('contentBlockActive') === 'true') {
            this.showContentBlockOverlay();
        } else {
            this.hideContentBlockOverlay();
        }
        
        // Add event for protection widget
        const blockBtn = document.getElementById('toggleBlockBtn');
        if (blockBtn) {
            blockBtn.onclick = () => this.toggleContentBlock();
        }
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
        
        // Use the widget header as drag handle
        const dragHandle = card.querySelector('.widget-header') || card;
        
        dragHandle.addEventListener('mousedown', (e) => {
            // Don't drag if clicking on buttons or resize handle
            if (e.target.closest('button, .resize-handle')) return;
            
            isDragging = true;
            card.classList.add('dragging');
            document.body.classList.add('dragging-widget'); // Prevent body scrolling
            
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
            
            // Allow complete freedom - true edge-to-edge positioning
            const cardRect = card.getBoundingClientRect();
            const maxX = window.innerWidth - 50; // Keep 50px visible on right
            const maxY = window.innerHeight - 50; // Keep 50px visible on bottom
            
            // Allow positioning anywhere including negative values for true edge positioning
            newX = Math.max(-cardRect.width + 100, Math.min(newX, maxX)); // Allow 100px visible
            newY = Math.max(-20, Math.min(newY, maxY)); // Allow going above top edge (negative values)
            
            card.style.left = newX + 'px';
            card.style.top = newY + 'px';
        });
        
        document.addEventListener('mouseup', () => {
            if (!isDragging) return;
            
            isDragging = false;
            card.classList.remove('dragging');
            document.body.classList.remove('dragging-widget'); // Re-enable body scrolling
            document.body.style.userSelect = '';
            
            // Save position
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
        let closed = JSON.parse(localStorage.getItem('dashboardClosedWidgets') || '[]');
        
        let html = '<div class="add-widget-modal">';
        html += '<div class="modal-header"><h3><i class="fas fa-plus-circle"></i> Create Widget</h3><button class="close-modal-btn" id="closeModal"><i class="fas fa-times"></i></button></div>';
        
        // Group widgets by category
        const categories = {};
        Object.keys(widgets).forEach(id => {
            if (closed.includes(id)) {
                const widget = widgets[id];
                const category = widget.category || 'Other';
                if (!categories[category]) categories[category] = [];
                categories[category].push({id, widget});
            }
        });
        
        let hasWidgets = false;
        Object.keys(categories).forEach(category => {
            if (categories[category].length > 0) {
                hasWidgets = true;
                html += `<div class="widget-category">`;
                html += `<h4 class="category-title"><i class="fas fa-folder"></i> ${category}</h4>`;
                html += `<div class="widget-grid">`;
                categories[category].forEach(({id, widget}) => {
                    html += `<div class="widget-option" data-widget="${id}">
                        <div class="widget-icon"><i class="${widget.icon}"></i></div>
                        <div class="widget-info">
                            <h5>${widget.title}</h5>
                            <p>${this.getWidgetDescription(id)}</p>
                        </div>
                        <button class="add-widget-btn" data-widget="${id}"><i class="fas fa-plus"></i></button>
                    </div>`;
                });
                html += `</div></div>`;
            }
        });
        
        if (!hasWidgets) {
            html += '<div class="no-widgets"><i class="fas fa-check-circle"></i><p>All widgets are already added to your dashboard!</p></div>';
        }
        
        html += '</div>';
        
        // Use the new modal structure
        const modal = document.getElementById('widgetsModal');
        const modalContent = modal.querySelector('.modal-content');
        if (modal && modalContent) {
            modalContent.innerHTML = html;
            modal.style.display = 'flex';
            
            // Event listeners
            modalContent.querySelectorAll('.add-widget-btn').forEach(btn => {
                btn.onclick = () => {
                    this.addWidget(btn.getAttribute('data-widget'));
                    modal.style.display = 'none';
                };
            });
            
            const closeBtn = modalContent.querySelector('#closeModal');
            if (closeBtn) {
                closeBtn.onclick = () => modal.style.display = 'none';
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
                    this.addWidget(btn.getAttribute('data-widget'));
                    document.body.removeChild(modalElement);
                };
            });
            
            modalElement.querySelector('#closeModal').onclick = () => document.body.removeChild(modalElement);
            modalElement.onclick = (e) => {
                if (e.target === modalElement) document.body.removeChild(modalElement);
            };
        }
    }
    
    getWidgetDescription(id) {
        const descriptions = {
            prayerTimes: 'View current prayer times and next prayer',
            quranStudy: 'Today\'s verse and quick Quran access',
            dhikrCounter: 'Track your daily dhikr and remembrance',
            library: 'Access Islamic books and resources',
            tasks: 'Manage your daily tasks and productivity',
            greeting: 'Islamic greetings and current date',
            quickActions: 'Fast access to all app features',
            islamicCalendar: 'Hijri calendar and Islamic events'
        };
        return descriptions[id] || 'Useful widget for your dashboard';
    }

    addWidget(id) {
        let closed = JSON.parse(localStorage.getItem('dashboardClosedWidgets') || '[]');
        closed = closed.filter(x => x !== id);
        localStorage.setItem('dashboardClosedWidgets', JSON.stringify(closed));
        this.renderDashboardWidgets();
    }

    createWidgetForCurrentTab() {
        // Get the current active tab
        const currentTab = this.currentTab || 'dashboard';
        
        // Map tabs to their corresponding widgets
        const tabToWidget = {
            'prayer-times': 'prayerTimes',
            'quran': 'quranStudy', 
            'dhikr': 'dhikrCounter',
            'library': 'library',
            'productivity': 'tasks'
        };
        
        // Get the widget ID for the current tab
        const widgetId = tabToWidget[currentTab];
        
        if (widgetId) {
            // Check if widget is already visible
            let closed = JSON.parse(localStorage.getItem('dashboardClosedWidgets') || '[]');
            
            if (closed.includes(widgetId)) {
                // Add the widget (remove from closed list)
                this.addWidget(widgetId);
                
                // Switch to dashboard to show the new widget
                this.switchTab('dashboard');
                
                // Show success message
                this.showNotification(`Created ${tabToWidget[currentTab]} widget on dashboard!`, 'success');
            } else {
                // Widget already exists
                this.showNotification(`${this.getWidgetTitle(widgetId)} widget already exists on dashboard!`, 'info');
            }
        } else if (currentTab === 'dashboard') {
            // If on dashboard, show the add widget modal
            this.showAddWidgetModal();
        } else {
            // No widget available for this tab
            this.showNotification('No widget available for this tab', 'warning');
        }
    }
    
    getWidgetTitle(widgetId) {
        const widgets = this.getAvailableWidgets();
        return widgets[widgetId] ? widgets[widgetId].title : 'Widget';
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add to body
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    toggleContentBlock() {
        const active = localStorage.getItem('contentBlockActive') === 'true';
        localStorage.setItem('contentBlockActive', (!active).toString());
        this.renderDashboardWidgets();
    }

    showContentBlockOverlay() {
        if (!document.getElementById('contentBlockOverlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'contentBlockOverlay';
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100vw';
            overlay.style.height = '100vh';
            overlay.style.background = 'rgba(10,37,64,0.85)';
            overlay.style.zIndex = '9999';
            overlay.style.display = 'flex';
            overlay.style.alignItems = 'center';
            overlay.style.justifyContent = 'center';
            overlay.innerHTML = '<div style="color:white;font-size:2rem;text-align:center;">Content Blocked for Protection<br><button id="unblockBtn" style="margin-top:2rem;padding:1rem 2rem;font-size:1.2rem;">Unblock</button></div>';
            document.body.appendChild(overlay);
            document.getElementById('unblockBtn').onclick = () => {
                localStorage.setItem('contentBlockActive', 'false');
                this.renderDashboardWidgets();
            };
        }
    }

    hideContentBlockOverlay() {
        const overlay = document.getElementById('contentBlockOverlay');
        if (overlay) overlay.remove();
    }

    setupEventListeners() {
        // Tab Navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = btn.getAttribute('data-tab');
                this.showTab(tabName);
            });
        });

        // Profile Menu
        this.setupProfileMenu();

        // Header buttons
        const loginBtn = document.querySelector('.login-email-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.showLoginModal());
        }
        
        // Audio button (previously nasheeds)
        const audioBtn = document.querySelector('.nasheeds-btn');
        if (audioBtn) {
            audioBtn.addEventListener('click', () => this.showAudioCategories());
        }

        // Dhikr counter
        const counterBtn = document.getElementById('counterBtn');
        if (counterBtn) {
            counterBtn.addEventListener('click', () => this.incrementDhikr());
        }

        // Dhikr presets
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectDhikrPreset(btn);
            });
        });

        // Reset dhikr
        const resetBtn = document.getElementById('resetDhikr');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetDhikr());
        }

        // Create widget button
        const addWidgetBtn = document.getElementById('addWidgetBtn');
        if (addWidgetBtn) {
            addWidgetBtn.addEventListener('click', () => this.createWidgetForCurrentTab());
        }

        // Audio player controls
        this.setupAudioPlayer();
    }

    setupProfileMenu() {
        const profileBtn = document.getElementById('profileBtn');
        const profileDropdown = document.getElementById('profileDropdown');
        
        if (profileBtn && profileDropdown) {
            // Toggle profile dropdown
            profileBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                profileDropdown.classList.toggle('show');
                profileBtn.classList.toggle('active');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
                    profileDropdown.classList.remove('show');
                    profileBtn.classList.remove('active');
                }
            });

            // Profile menu items
            const loginSignupBtn = document.getElementById('loginSignupBtn');
            const progressBtn = document.getElementById('progressBtn');
            const premiumMenuBtn = document.getElementById('premiumMenuBtn');
            const settingsBtn = document.getElementById('settingsBtn');
            const helpBtn = document.getElementById('helpBtn');
            const changeAvatarBtn = document.getElementById('changeAvatarBtn');

            if (loginSignupBtn) {
                loginSignupBtn.addEventListener('click', () => this.showLoginModal());
            }

            if (progressBtn) {
                progressBtn.addEventListener('click', () => this.showProgressModal());
            }

            if (premiumMenuBtn) {
                premiumMenuBtn.addEventListener('click', () => this.showPremiumModal());
            }

            if (settingsBtn) {
                settingsBtn.addEventListener('click', () => this.showSettingsModal());
            }

            if (helpBtn) {
                helpBtn.addEventListener('click', () => this.showHelpModal());
            }

            if (changeAvatarBtn) {
                changeAvatarBtn.addEventListener('click', () => this.changeProfilePicture());
            }
        }
    }

    changeProfilePicture() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imageUrl = e.target.result;
                    this.updateProfilePicture(imageUrl);
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    }

    updateProfilePicture(imageUrl) {
        // Update both small and large profile images
        const profileImage = document.getElementById('profileImage');
        const profileImageLarge = document.getElementById('profileImageLarge');
        
        if (profileImage) {
            profileImage.src = imageUrl;
            profileImage.style.display = 'block';
            profileImage.nextElementSibling.style.display = 'none';
        }
        
        if (profileImageLarge) {
            profileImageLarge.src = imageUrl;
            profileImageLarge.style.display = 'block';
            profileImageLarge.nextElementSibling.style.display = 'none';
        }

        // Save to localStorage
        localStorage.setItem('profilePicture', imageUrl);
    }

    showProgressModal() {
        // Create progress modal
        const modalHTML = `
            <div class="modal-overlay" id="progressModal">
                <div class="modal">
                    <div class="modal-header">
                        <h3><i class="fas fa-chart-line"></i> My Progress</h3>
                        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="progress-stats">
                            <div class="stat-card">
                                <h4>Daily Dhikr</h4>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: 65%"></div>
                                </div>
                                <p>65% completed today</p>
                            </div>
                            <div class="stat-card">
                                <h4>Quran Reading</h4>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: 30%"></div>
                                </div>
                                <p>30% of daily goal</p>
                            </div>
                            <div class="stat-card">
                                <h4>Prayer Times</h4>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: 80%"></div>
                                </div>
                                <p>4/5 prayers completed</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    showPremiumModal() {
        // Create premium modal
        const modalHTML = `
            <div class="modal-overlay" id="premiumModal">
                <div class="modal">
                    <div class="modal-header">
                        <h3><i class="fas fa-crown"></i> Premium Features</h3>
                        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="premium-features">
                            <div class="feature-item">
                                <i class="fas fa-check"></i>
                                <span>Advanced Progress Tracking</span>
                            </div>
                            <div class="feature-item">
                                <i class="fas fa-check"></i>
                                <span>Custom Prayer Notifications</span>
                            </div>
                            <div class="feature-item">
                                <i class="fas fa-check"></i>
                                <span>Additional Dhikr Categories</span>
                            </div>
                            <div class="feature-item">
                                <i class="fas fa-check"></i>
                                <span>Cloud Sync & Backup</span>
                            </div>
                        </div>
                        <button class="premium-upgrade-btn">
                            <i class="fas fa-crown"></i>
                            Upgrade to Premium
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    showSettingsModal() {
        // Create settings modal
        const modalHTML = `
            <div class="modal-overlay" id="settingsModal">
                <div class="modal">
                    <div class="modal-header">
                        <h3><i class="fas fa-cog"></i> Settings</h3>
                        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="settings-section">
                            <h4>Notifications</h4>
                            <label class="setting-item">
                                <span>Prayer Time Alerts</span>
                                <input type="checkbox" checked>
                            </label>
                            <label class="setting-item">
                                <span>Dhikr Reminders</span>
                                <input type="checkbox" checked>
                            </label>
                        </div>
                        <div class="settings-section">
                            <h4>Display</h4>
                            <label class="setting-item">
                                <span>Dark Mode</span>
                                <input type="checkbox">
                            </label>
                            <label class="setting-item">
                                <span>Arabic Text Size</span>
                                <select>
                                    <option>Small</option>
                                    <option selected>Medium</option>
                                    <option>Large</option>
                                </select>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    showHelpModal() {
        // Create help modal
        const modalHTML = `
            <div class="modal-overlay" id="helpModal">
                <div class="modal">
                    <div class="modal-header">
                        <h3><i class="fas fa-question-circle"></i> Help & Support</h3>
                        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="help-section">
                            <h4>Quick Guide</h4>
                            <p>Navigate between different sections using the tabs. Track your daily prayers, dhikr, and Quran reading progress.</p>
                        </div>
                        <div class="help-section">
                            <h4>Contact Support</h4>
                            <p>Email: support@alhaqds.software</p>
                            <p>Website: www.alhaqds.software</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    loadProfilePicture() {
        const savedPicture = localStorage.getItem('profilePicture');
        if (savedPicture) {
            this.updateProfilePicture(savedPicture);
        }
    }

    showLoginModal() {
        // Create login modal
        const modalHTML = `
            <div class="modal-overlay" id="loginModal">
                <div class="modal">
                    <div class="modal-header">
                        <h3><i class="fas fa-sign-in-alt"></i> Login / Sign Up</h3>
                        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form class="login-form">
                            <div class="form-group">
                                <label>Email</label>
                                <input type="email" placeholder="Enter your email" required>
                            </div>
                            <div class="form-group">
                                <label>Password</label>
                                <input type="password" placeholder="Enter your password" required>
                            </div>
                            <button type="submit" class="btn-primary">Login</button>
                            <div class="form-divider">or</div>
                            <button type="button" class="btn-secondary">Sign Up</button>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // ============================================= 
    // Task Manager Functionality (TaskMaster Integration)
    // ============================================= 

    initTaskManager() {
        // Cache DOM elements
        this.taskInputEl = document.getElementById('taskInput');
        this.taskDateEl = document.getElementById('taskDate');
        this.taskTimeEl = document.getElementById('taskTime');
        this.taskCategoryEl = document.getElementById('taskCategory');
        this.taskPriorityEl = document.getElementById('taskPriority');
        this.taskListEl = document.getElementById('taskList');

        // Event listeners
        this.setupTaskEventListeners();
        
        // Load existing tasks
        this.loadTasks();
        
        // Apply default settings
        this.applyTaskSettings();
    }

    setupTaskEventListeners() {
        // Task form submission
        const addTaskButton = document.getElementById('addTaskButton');
        if (addTaskButton) {
            addTaskButton.addEventListener('click', () => this.addTask());
        }

        // Clear all tasks
        const clearAllTasksButton = document.getElementById('clearAllTasksButton');
        if (clearAllTasksButton) {
            clearAllTasksButton.addEventListener('click', () => this.clearAllTasks());
        }

        // Enter key to add task
        if (this.taskInputEl) {
            this.taskInputEl.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addTask();
                }
            });
        }
    }

    addTask(taskData = {}) {
        const {
            text: initialText = null,
            dueDate: initialDueDate = null,
            time: initialTime = null,
            category: initialCategory = 'spiritual',
            priority: initialPriority = 'medium',
            completed: initialCompleted = false
        } = taskData;

        const text = initialText || this.taskInputEl?.value.trim();
        const date = initialDueDate || this.taskDateEl?.value;
        const time = initialTime || this.taskTimeEl?.value;
        const categoryValue = initialCategory || this.taskCategoryEl?.value;
        const priorityValue = initialPriority || this.taskPriorityEl?.value;

        if (!text) {
            alert('Please enter a task!');
            return;
        }

        const li = document.createElement('li');
        li.dataset.category = categoryValue;
        li.dataset.priority = priorityValue;
        li.dataset.text = text;
        li.dataset.dueDate = date;
        li.dataset.time = time;
        li.dataset.completed = initialCompleted.toString();

        const span = document.createElement('span');
        span.className = 'task-content';
        if (initialCompleted) span.classList.add('completed');
        
        let displayText = text;
        if (date) displayText += ` (Due: ${date}${time ? ' ' + time : ''})`;
        span.textContent = displayText;
        li.appendChild(span);

        const actions = document.createElement('div');
        actions.className = 'task-actions';

        const doneBtn = this.createTaskButton('Done', 'fas fa-check', () => {
            span.classList.toggle('completed');
            li.dataset.completed = span.classList.contains('completed').toString();
            this.saveTasks();
        });

        const editBtn = this.createTaskButton('Edit', 'fas fa-edit', () => {
            if (this.taskInputEl) this.taskInputEl.value = li.dataset.text;
            if (this.taskDateEl) this.taskDateEl.value = li.dataset.dueDate;
            if (this.taskTimeEl) this.taskTimeEl.value = li.dataset.time;
            if (this.taskCategoryEl) this.taskCategoryEl.value = li.dataset.category;
            if (this.taskPriorityEl) this.taskPriorityEl.value = li.dataset.priority;
            if (this.taskInputEl) this.taskInputEl.focus();
            this.taskListEl.removeChild(li);
            this.saveTasks();
        });

        const delBtn = this.createTaskButton('Delete', 'fas fa-trash', () => {
            if (confirm('Are you sure you want to delete this task?')) {
                this.taskListEl.removeChild(li);
                this.saveTasks();
            }
        });

        actions.appendChild(doneBtn);
        actions.appendChild(editBtn);
        actions.appendChild(delBtn);

        li.appendChild(actions);
        this.taskListEl.appendChild(li);

        // Clear input fields
        if (!initialText) {
            if (this.taskInputEl) this.taskInputEl.value = '';
            if (this.taskDateEl) this.taskDateEl.value = '';
            if (this.taskTimeEl) this.taskTimeEl.value = '';
            if (this.taskCategoryEl) this.taskCategoryEl.value = 'spiritual';
            if (this.taskPriorityEl) this.taskPriorityEl.value = 'medium';
        }

        this.saveTasks();
        this.highlightOverdueTasks();
    }

    createTaskButton(text, iconClass, onClick) {
        const button = document.createElement('button');
        button.innerHTML = `<i class="${iconClass}"></i>`;
        button.title = text;
        button.onclick = onClick;
        return button;
    }

    saveTasks() {
        const tasks = [];
        if (this.taskListEl) {
            this.taskListEl.querySelectorAll('li').forEach(li => {
                tasks.push({
                    text: li.dataset.text || '',
                    dueDate: li.dataset.dueDate || '',
                    time: li.dataset.time || '',
                    category: li.dataset.category || 'spiritual',
                    priority: li.dataset.priority || 'medium',
                    completed: li.dataset.completed === 'true'
                });
            });
        }
        localStorage.setItem('deenshield_tasks', JSON.stringify(tasks));
    }

    loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('deenshield_tasks')) || [];
        if (this.taskListEl) {
            this.taskListEl.innerHTML = '';
            tasks.forEach(task => this.addTask(task));
        }
        this.highlightOverdueTasks();
    }

    clearAllTasks() {
        if (confirm('Are you sure you want to delete all tasks?')) {
            if (this.taskListEl) {
                this.taskListEl.innerHTML = '';
            }
            this.saveTasks();
        }
    }

    highlightOverdueTasks() {
        if (!this.taskListEl) return;
        
        const today = new Date().setHours(0, 0, 0, 0);
        this.taskListEl.querySelectorAll('li').forEach(task => {
            const dueDate = task.dataset.dueDate;
            const isCompleted = task.dataset.completed === 'true';

            task.classList.remove('overdue-task');

            if (dueDate && !isCompleted && new Date(dueDate) < today) {
                task.classList.add('overdue-task');
                task.style.backgroundColor = '#fff5f5';
                task.style.borderLeft = '4px solid #dc3545';
            }
        });
    }

    applyTaskSettings() {
        // Set default values and apply any saved settings
        if (this.taskPriorityEl) {
            this.taskPriorityEl.value = 'medium';
        }
        if (this.taskCategoryEl) {
            this.taskCategoryEl.value = 'spiritual';
        }
    }

    showTab(tabName) {
        console.log('showTab called with:', tabName); // Debug log
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        // Update tab content - CRITICAL FIX
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
            content.style.display = 'none'; // Force hide all tabs
        });

        const targetContent = document.getElementById(tabName);
        console.log('Target content element:', targetContent); // Debug log
        if (targetContent) {
            targetContent.classList.add('active');
            targetContent.style.display = 'block'; // Force show active tab
            this.currentTab = tabName;
            console.log('Tab content activated:', tabName); // Debug log
            console.log('Active tab classes:', targetContent.className); // Debug log
        } else {
            console.error('Tab content not found for:', tabName); // Debug log
        }

        // Update page title in header
        this.updatePageTitle(tabName);

        // Load specific tab content
        switch(tabName) {
            case 'prayer-times':
                console.log('Loading prayer times content'); // Debug log
                this.loadPrayerTimes();
                break;
            case 'quran':
                console.log('Loading Quran content'); // Debug log
                this.loadQuranContent();
                break;
            case 'dhikr':
                console.log('Loading dhikr content'); // Debug log
                // Reinitialize dhikr when tab is shown
                this.initializeDhikr();
                break;
            case 'library':
                console.log('Loading library content'); // Debug log
                this.loadLibraryContent();
                break;
            case 'productivity':
                console.log('Loading productivity content'); // Debug log
                this.loadProductivityContent();
                // Ensure task manager is properly initialized
                if (!this.taskManagerInitialized) {
                    this.initTaskManager();
                    this.taskManagerInitialized = true;
                }
                break;
        }
    }

    // Update page title in header
    updatePageTitle(tabName) {
        const pageTitles = {
            'dashboard': 'Dashboard',
            'prayer-times': 'Prayer Times', 
            'quran': 'Quran Study',
            'dhikr': 'Dhikr & Tasbih',
            'library': 'Islamic Library',
            'productivity': 'Tasks & Productivity'
        };
        
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle && pageTitles[tabName]) {
            pageTitle.textContent = pageTitles[tabName];
        }
    }

    // Setup drawer navigation
    setupDrawerNavigation() {
        console.log('Setting up drawer navigation...'); // Debug log
        
        // Handle internal tab navigation (buttons with data-tab)
        const drawerTabLinks = document.querySelectorAll('.drawer-link[data-tab]');
        console.log('Found drawer tab links:', drawerTabLinks.length); // Debug log
        
        drawerTabLinks.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent any default behavior
                const tab = btn.getAttribute('data-tab');
                console.log('Drawer tab click detected:', tab); // Debug log
                if (tab) {
                    this.showTab(tab);
                    // Close drawer
                    this.closeDrawer();
                }
            });
        });

        // Handle external link navigation (anchors with href)
        const drawerExternalLinks = document.querySelectorAll('.drawer-link.external-link');
        console.log('Found drawer external links:', drawerExternalLinks.length); // Debug log
        
        drawerExternalLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                console.log('External link clicked:', link.href); // Debug log
                // Let the default behavior happen (navigate to external page)
                // But close the drawer first
                setTimeout(() => {
                    this.closeDrawer();
                }, 100); // Small delay to ensure navigation starts
            });
        });
    }

    // Helper method to close drawer
    closeDrawer() {
        const drawer = document.querySelector('.side-drawer');
        const backdrop = document.querySelector('.drawer-backdrop');
        if (drawer) {
            drawer.classList.remove('open');
            console.log('Drawer closed'); // Debug log
        }
        if (backdrop) {
            backdrop.classList.remove('open');
        }
    }

    // Dashboard functionality
    loadDashboard() {
        this.updateDashboardStats();
        this.updateGreeting();
    }

    updateDashboardStats() {
        // Update next prayer
        const nextPrayer = this.getNextPrayer();
        const nextPrayerName = document.getElementById('nextPrayerName');
        const nextPrayerTime = document.getElementById('nextPrayerTime');
        
        if (nextPrayerName && nextPrayerTime) {
            nextPrayerName.textContent = nextPrayer.name;
            nextPrayerTime.textContent = nextPrayer.time;
        }

        // Update other stats
        const dhikrCount = document.getElementById('dhikrCount');
        if (dhikrCount) {
            dhikrCount.textContent = this.getTotalDhikrToday();
        }

        const tasksCompleted = document.getElementById('tasksCompleted');
        if (tasksCompleted) {
            tasksCompleted.textContent = this.getTasksStatus();
        }

        const quranProgress = document.getElementById('dailyQuranProgress');
        if (quranProgress) {
            quranProgress.textContent = this.getQuranProgress() + '%';
        }
    }

    updateGreeting() {
        const now = new Date();
        const hour = now.getHours();
        let greeting = 'Good Evening';
        
        if (hour < 12) {
            greeting = 'Good Morning';
        } else if (hour < 17) {
            greeting = 'Good Afternoon';
        }

        const greetingCard = document.querySelector('.greeting-card h3');
        if (greetingCard) {
            greetingCard.textContent = `${greeting}, Friend`;
        }
    }

    // Dhikr functionality
    initializeDhikr() {
        console.log('Initializing Dhikr section...');
        
        // Set up category navigation
        this.setupCategoryNavigation();
        
        // Populate azkar grid with current category
        this.populateAzkarGrid();
        this.updateDhikrDisplay();
        
        // Only set up event listeners once
        if (!this.dhikrInitialized) {
            this.setupDhikrEventListeners();
            this.dhikrInitialized = true;
        }
    }

    setupCategoryNavigation() {
        const categoryTabs = document.querySelectorAll('.category-tab');
        if (categoryTabs.length === 0) {
            console.warn('Category tabs not found');
            return;
        }

        categoryTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const category = tab.getAttribute('data-category');
                if (category) {
                    this.switchAzkarCategory(category);
                }
            });
        });
    }

    switchAzkarCategory(category) {
        if (!this.azkarDatabase[category]) {
            console.error('Invalid category:', category);
            return;
        }

        // Update current category
        this.currentAzkarCategory = category;
        
        // Update active tab styling
        const categoryTabs = document.querySelectorAll('.category-tab');
        categoryTabs.forEach(tab => {
            if (tab.getAttribute('data-category') === category) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // Refresh the azkar grid with new category
        this.populateAzkarGrid();
        
        // Reset to first dhikr in the new category if current dhikr doesn't exist
        const categoryData = this.azkarDatabase[category];
        const azkarKeys = Object.keys(categoryData.azkar);
        if (azkarKeys.length > 0 && !categoryData.azkar[this.currentDhikr]) {
            this.currentDhikr = azkarKeys[0];
            this.dhikrTarget = categoryData.azkar[this.currentDhikr].target;
            this.dhikrCounter = 0;
            this.updateDhikrDisplay();
        }
    }

    setupDhikrEventListeners() {
        console.log('Setting up Dhikr event listeners...');
        
        // Counter button
        const counterBtn = document.getElementById('counterBtn');
        if (counterBtn) {
            // Remove existing listener if any
            counterBtn.onclick = null;
            counterBtn.onclick = () => this.incrementDhikr();
            console.log('Counter button listener attached');
        } else {
            console.warn('Counter button not found');
        }

        // Reset button
        const resetBtn = document.getElementById('resetDhikr');
        if (resetBtn) {
            resetBtn.onclick = null;
            resetBtn.onclick = () => this.resetDhikrCounter();
            console.log('Reset button listener attached');
        } else {
            console.warn('Reset button not found');
        }

        // Azkar items click handling
        this.setupAzkarItemButtons();
    }

    setupAzkarItemButtons() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.azkar-item')) {
                const button = e.target.closest('.azkar-item');
                const dhikrKey = button.getAttribute('data-dhikr');
                if (dhikrKey) {
                    this.selectDhikrFromGrid(dhikrKey);
                }
            }
        });
    }

    selectDhikrFromGrid(dhikrKey) {
        this.currentDhikr = dhikrKey;
        const azkarData = this.azkarDatabase[this.currentAzkarCategory].azkar[dhikrKey];
        this.dhikrTarget = azkarData.target;
        this.dhikrCounter = 0;
        this.updateDhikrDisplay();
    }

    populateAzkarGrid() {
        const azkarGrid = document.getElementById('azkarGrid');
        const categoryTitle = document.getElementById('azkarCategoryTitle');
        
        if (!azkarGrid || !categoryTitle) {
            console.error('azkarGrid or azkarCategoryTitle element not found');
            return;
        }

        const categoryData = this.azkarDatabase[this.currentAzkarCategory];
        if (!categoryData) {
            console.error('Category data not found for grid:', this.currentAzkarCategory);
            return;
        }

        categoryTitle.textContent = categoryData.title;
        azkarGrid.innerHTML = '';

        const azkarKeys = Object.keys(categoryData.azkar);
        console.log('Populating grid for category:', this.currentAzkarCategory, 'with', azkarKeys.length, 'azkar');

        azkarKeys.forEach(key => {
            const azkar = categoryData.azkar[key];
            const azkarItem = document.createElement('div');
            azkarItem.className = 'azkar-item';
            azkarItem.setAttribute('data-dhikr', key);
            
            azkarItem.innerHTML = `
                <div class="azkar-content">
                    <div class="azkar-arabic">${azkar.arabic}</div>
                    <div class="azkar-translation">${azkar.translation}</div>
                    <div class="azkar-count">Recommended: ${azkar.target}x</div>
                </div>
                <button class="azkar-select-btn" title="Select this dhikr">
                    <i class="fas fa-play"></i>
                </button>
            `;
            
            azkarGrid.appendChild(azkarItem);
        });
    }

    incrementDhikr() {
        this.dhikrCounter++;
        this.updateDhikrDisplay();
        this.saveProgress();
        
        // Add pulse animation to counter
        const counterNumberEl = document.getElementById('counterNumber');
        if (counterNumberEl) {
            counterNumberEl.classList.add('pulse');
            setTimeout(() => {
                counterNumberEl.classList.remove('pulse');
            }, 600);
        }
        
        // Haptic feedback on mobile
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }

        // Check if target reached
        if (this.dhikrCounter >= this.dhikrTarget) {
            this.showCompletionMessage();
        }
    }

    // Add missing makeElementDraggable method
    makeElementDraggable(element) {
        if (!element) return;
        
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        
        // Make the header draggable if it exists, otherwise the element itself
        const dragHeader = element.querySelector('.widget-header') || element.querySelector('.modal-header') || element;
        
        dragHeader.style.cursor = 'move';
        dragHeader.onmousedown = dragMouseDown;
        
        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }
        
        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
        }
        
        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    // Method to apply responsive content scaling to widgets
    applyWidgetContentScaling(widget, width, height) {
        const baseWidth = 300; // Default widget width
        const baseHeight = 200; // Default widget height
        
        // Calculate scale factors
        const widthScale = width / baseWidth;
        const heightScale = height / baseHeight;
        const avgScale = (widthScale + heightScale) / 2;
        
        // Apply scaling to different content elements
        this.scaleWidgetText(widget, avgScale);
        this.scaleWidgetIcons(widget, avgScale);
        this.scaleWidgetSpacing(widget, avgScale);
        this.scaleWidgetButtons(widget, avgScale);
        this.scaleSpecificWidgetContent(widget, widthScale, heightScale);
    }

    scaleWidgetText(widget, scale) {
        // Scale text elements
        const textElements = widget.querySelectorAll('h4, h5, p, span, div');
        textElements.forEach(el => {
            if (!el.dataset.originalFontSize) {
                el.dataset.originalFontSize = window.getComputedStyle(el).fontSize;
            }
            const originalSize = parseFloat(el.dataset.originalFontSize);
            const newSize = Math.max(10, Math.min(24, originalSize * scale));
            el.style.fontSize = newSize + 'px';
        });
    }

    scaleWidgetIcons(widget, scale) {
        // Scale icons and icon containers
        const iconElements = widget.querySelectorAll('i, .widget-icon, .dhikr-btn');
        iconElements.forEach(el => {
            if (!el.dataset.originalFontSize) {
                el.dataset.originalFontSize = window.getComputedStyle(el).fontSize;
            }
            const originalSize = parseFloat(el.dataset.originalFontSize);
            const newSize = Math.max(12, Math.min(36, originalSize * scale));
            el.style.fontSize = newSize + 'px';
        });
    }

    scaleWidgetSpacing(widget, scale) {
        // Scale padding and margins
        const spacingElements = widget.querySelectorAll('.widget-header, .prayer-times-widget, .quran-widget, .dhikr-widget, .library-widget, .tasks-widget, .greeting-widget, .quick-actions-widget, .calendar-widget');
        spacingElements.forEach(el => {
            if (!el.dataset.originalPadding) {
                const computedStyle = window.getComputedStyle(el);
                el.dataset.originalPadding = computedStyle.padding;
                el.dataset.originalMargin = computedStyle.margin;
            }
            
            // Apply scaled padding/margin
            const scaledPadding = this.scaleSpacingValue(el.dataset.originalPadding, scale);
            const scaledMargin = this.scaleSpacingValue(el.dataset.originalMargin, scale);
            
            if (scaledPadding) el.style.padding = scaledPadding;
            if (scaledMargin) el.style.margin = scaledMargin;
        });
    }

    scaleWidgetButtons(widget, scale) {
        // Scale buttons
        const buttons = widget.querySelectorAll('button, .widget-btn, .action-btn');
        buttons.forEach(btn => {
            if (!btn.dataset.originalPadding) {
                const computedStyle = window.getComputedStyle(btn);
                btn.dataset.originalPadding = computedStyle.padding;
                btn.dataset.originalFontSize = computedStyle.fontSize;
            }
            
            const originalPadding = btn.dataset.originalPadding;
            const originalFontSize = parseFloat(btn.dataset.originalFontSize);
            
            const scaledPadding = this.scaleSpacingValue(originalPadding, scale);
            const scaledFontSize = Math.max(10, Math.min(18, originalFontSize * scale));
            
            if (scaledPadding) btn.style.padding = scaledPadding;
            btn.style.fontSize = scaledFontSize + 'px';
        });
    }

    scaleSpecificWidgetContent(widget, widthScale, heightScale) {
        // Handle specific widget content that needs special scaling
        
        // Prayer times widget
        const prayerList = widget.querySelector('.prayer-list');
        if (prayerList) {
            const items = prayerList.querySelectorAll('.prayer-item');
            items.forEach(item => {
                if (widthScale < 0.7) {
                    item.style.flexDirection = 'column';
                    item.style.textAlign = 'center';
                } else {
                    item.style.flexDirection = 'row';
                    item.style.textAlign = 'left';
                }
            });
        }

        // Quick actions grid
        const actionGrid = widget.querySelector('.action-grid');
        if (actionGrid) {
            if (widthScale < 0.8) {
                actionGrid.style.gridTemplateColumns = '1fr 1fr';
            } else {
                actionGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
            }
        }

        // Task list in tasks widget
        const tasksList = widget.querySelector('.upcoming-tasks');
        if (tasksList) {
            const taskItems = tasksList.querySelectorAll('.task-item-mini');
            taskItems.forEach(item => {
                if (widthScale < 0.7) {
                    item.style.fontSize = '0.8em';
                    const timeSpan = item.querySelector('.task-time');
                    const nameSpan = item.querySelector('.task-name');
                    if (timeSpan && nameSpan) {
                        timeSpan.style.display = 'block';
                        nameSpan.style.display = 'block';
                        item.style.flexDirection = 'column';
                    }
                } else {
                    item.style.fontSize = '';
                    item.style.flexDirection = 'row';
                    const timeSpan = item.querySelector('.task-time');
                    const nameSpan = item.querySelector('.task-name');
                    if (timeSpan && nameSpan) {
                        timeSpan.style.display = '';
                        nameSpan.style.display = '';
                    }
                }
            });
        }

        // Library stats
        const libraryStats = widget.querySelector('.library-stats');
        if (libraryStats) {
            if (widthScale < 0.8) {
                libraryStats.style.flexDirection = 'column';
                libraryStats.style.gap = '5px';
            } else {
                libraryStats.style.flexDirection = 'row';
                libraryStats.style.gap = '';
            }
        }

        // Progress bars
        const progressBars = widget.querySelectorAll('.progress-bar');
        progressBars.forEach(bar => {
            if (widthScale < 0.6) {
                bar.style.height = '4px';
            } else {
                bar.style.height = '6px';
            }
        });
    }

    scaleSpacingValue(spacingValue, scale) {
        if (!spacingValue || spacingValue === '0px') return null;
        
        // Parse spacing value (handles multiple values like "10px 15px")
        const values = spacingValue.split(' ').map(val => {
            const numValue = parseFloat(val);
            if (isNaN(numValue)) return val;
            const scaledValue = Math.max(2, numValue * scale);
            return scaledValue + 'px';
        });
        
        return values.join(' ');
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
