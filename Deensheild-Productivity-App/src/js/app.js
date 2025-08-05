// @ts-nocheck
// Deen Shield Productivity App - Islamic Productivity Application
// Main JavaScript functionality for prayer times, Quran study, dhikr counter, and more

class DeenShieldApp {
    constructor() {
        this.currentSection = 'dashboard';
        this.prayerTimes = {};
        this.location = null;
        this.settings = this.loadStoredSettings();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateCurrentTime();
        this.loadDashboard();
        
        // Update time every second
        setInterval(() => this.updateCurrentTime(), 1000);
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('href').substring(1);
                this.showSection(section);
            });
        });
    }

    showSection(sectionName) {
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionName;
        }

        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        const activeLink = document.querySelector(`[href="#${sectionName}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    loadStoredSettings() {
        try {
            return JSON.parse(localStorage.getItem('deenshield_settings')) || {};
        } catch (error) {
            return {};
        }
    }

    updateCurrentTime() {
        const now = new Date();
        const timeElement = document.getElementById('currentTime');
        if (timeElement) {
            timeElement.textContent = now.toLocaleTimeString();
        }
        
        const dateElement = document.getElementById('currentDate');
        if (dateElement) {
            dateElement.textContent = now.toLocaleDateString();
        }
    }

    loadDashboard() {
        // Load dashboard content
        this.showSection('dashboard');
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
