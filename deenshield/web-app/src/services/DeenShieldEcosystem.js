/**
 * DeenShieldEcosystem.js
 * Core service managing the integration between web app and extension
 */

class DeenShieldEcosystem {
    constructor() {
        this.extensionStatus = {
            installed: false,
            active: false,
            version: null
        };
        this.settings = {
            islamicMode: false,
            prayerTimes: null,
            location: null,
            protectionSchedule: null
        };
        this.stats = {
            blockedToday: 0,
            focusTime: 0,
            protectionPercentage: 0
        };
        this.initializeEcosystem();
    }

    async initializeEcosystem() {
        await this.detectExtension();
        this.setupMessageListeners();
        this.syncSettings();
        this.initializeFeatures();
    }

    async detectExtension() {
        try {
            // Try runtime API first
            if (typeof chrome !== 'undefined' && chrome.runtime) {
                const response = await chrome.runtime.sendMessage('deen-shield-extension-id', { action: 'getStatus' });
                this.handleExtensionDetection(response);
                return;
            }

            // Fallback to DOM injection check
            const marker = document.querySelector('[data-deen-shield-extension]');
            if (marker) {
                this.handleExtensionDetection({
                    installed: true,
                    active: true,
                    version: marker.getAttribute('data-version')
                });
                return;
            }

            // Check global variable
            if (window.DeenShieldExtension) {
                this.handleExtensionDetection({
                    installed: true,
                    active: window.DeenShieldExtension.isActive,
                    version: window.DeenShieldExtension.version
                });
                return;
            }
        } catch (error) {
            console.error('Extension detection failed:', error);
        }
    }

    setupMessageListeners() {
        window.addEventListener('message', (event) => {
            if (event.data.type === 'DEEN_SHIELD_EXTENSION_UPDATE') {
                this.handleExtensionMessage(event.data.payload);
            }
        });
    }

    handleExtensionMessage(payload) {
        switch (payload.action) {
            case 'statusUpdate':
                this.updateStats(payload.data);
                break;
            case 'prayerTimeSync':
                this.updatePrayerTimes(payload.data);
                break;
            case 'settingsSync':
                this.syncSettings(payload.data);
                break;
            default:
                console.warn('Unknown message type:', payload.action);
        }
    }

    updateStats(data) {
        this.stats = { ...this.stats, ...data };
        this.updateDashboard();
    }

    updatePrayerTimes(prayerData) {
        this.settings.prayerTimes = prayerData;
        this.updateProtectionSchedule();
    }

    syncSettings(settings = null) {
        if (settings) {
            this.settings = { ...this.settings, ...settings };
        }
        
        // Send current settings to extension
        window.postMessage({
            type: 'DEEN_SHIELD_APP_MESSAGE',
            payload: {
                action: 'syncSettings',
                data: this.settings
            }
        }, window.location.origin);
    }

    calculateFocusTime(blockedCount) {
        const savedMinutes = blockedCount * 5;
        const baseWorkHours = 8 * 60;
        return Math.min(baseWorkHours, savedMinutes) / 60;
    }

    updateProtectionSchedule() {
        if (!this.settings.prayerTimes) return;

        const schedule = {
            fajr: { mode: 'enhanced', duration: 30 },
            dhuhr: { mode: 'enhanced', duration: 30 },
            asr: { mode: 'enhanced', duration: 30 },
            maghrib: { mode: 'strict', duration: 60 },
            isha: { mode: 'enhanced', duration: 30 }
        };

        this.settings.protectionSchedule = schedule;
        this.syncSettings();
    }

    toggleIslamicMode(enabled) {
        this.settings.islamicMode = enabled;
        this.syncSettings();
        this.updateDashboard();
    }

    updateDashboard() {
        // Dispatch event for UI components to update
        const event = new CustomEvent('deenshield-update', { 
            detail: {
                stats: this.stats,
                settings: this.settings,
                extensionStatus: this.extensionStatus
            }
        });
        window.dispatchEvent(event);
    }

    initializeFeatures() {
        // Initialize core features
        this.initializePrayerTimes();
        this.initializeDigitalWellness();
        this.initializeProtectionSchedule();
    }

    // Feature-specific initialization methods
    initializePrayerTimes() {
        // Initialize prayer times feature
    }

    initializeDigitalWellness() {
        // Initialize digital wellness tracking
    }

    initializeProtectionSchedule() {
        // Initialize protection scheduling
    }
}

// Export as singleton
export default new DeenShieldEcosystem();
