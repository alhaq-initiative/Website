/**
 * DashboardWidgets.js
 * UI Components for the DeenShield Ecosystem Dashboard
 */

class DashboardWidgets {
    constructor() {
        this.initializeWidgets();
        this.setupEventListeners();
    // cache last known data for partial updates
    this._lastStats = {};
    this._lastSettings = {};
    this._lastExtensionStatus = {};
    }

    initializeWidgets() {
        this.createExtensionStatusWidget();
        this.createDigitalWellnessWidget();
        this.createProtectionScheduleWidget();
        this.createPrayerTimesWidget();
    }

    setupEventListeners() {
        window.addEventListener('deenshield-update', (event) => {
            this.updateWidgets(event.detail);
        });
    }

    createExtensionStatusWidget() {
        const widget = document.createElement('div');
        widget.className = 'extension-widget';
        widget.innerHTML = `
            <div class="status-indicator">
                <i class="fas fa-circle"></i>
                <span>Checking Status...</span>
            </div>
            <div class="extension-info">
                <div class="info-item">
                    <span>Version:</span><span>-</span>
                </div>
                <div class="info-item">
                    <span>Blocked Today:</span><span>-</span>
                </div>
            </div>
        `;
        this.mountWidget(widget, 'extensionStatus');
    }

    createDigitalWellnessWidget() {
        const widget = document.createElement('div');
        widget.className = 'wellness-widget';
        widget.innerHTML = `
            <div class="stat-circle">
                <div class="circle-progress" data-percent="0">
                    <div class="circle-text">
                        <span class="percentage">0%</span>
                        <span class="label">Protected</span>
                    </div>
                </div>
            </div>
            <div class="wellness-metrics">
                <div class="metric-item">
                    <i class="fas fa-shield-alt"></i>
                    <span class="metric-value">0</span>
                    <span class="metric-label">Blocked Today</span>
                </div>
                <div class="metric-item">
                    <i class="fas fa-clock"></i>
                    <span class="metric-value">0h</span>
                    <span class="metric-label">Focus Time</span>
                </div>
            </div>
        `;
        this.mountWidget(widget, 'digitalWellness');
    }

    createProtectionScheduleWidget() {
        const widget = document.createElement('div');
        widget.className = 'schedule-widget';
        widget.innerHTML = `
            <div class="current-mode">
                <i class="fas fa-shield-alt"></i>
                <span>Standard Protection</span>
            </div>
            <div class="protection-timeline">
                <div class="timeline-item">
                    <span class="time">Loading...</span>
                    <span class="mode">-</span>
                </div>
            </div>
        `;
        this.mountWidget(widget, 'protectionSchedule');
    }

    createPrayerTimesWidget() {
        const widget = document.createElement('div');
        widget.className = 'prayer-times-widget';
        widget.innerHTML = `
            <div class="prayer-times-header">
                <i class="fas fa-mosque"></i>
                <span>Prayer Times</span>
            </div>
            <div class="prayer-times-list">
                <div class="prayer-time">Loading prayer times...</div>
            </div>
        `;
        this.mountWidget(widget, 'prayerTimes');
    }

    mountWidget(widget, containerId) {
        // Try to mount into a dedicated container if present
        let container = document.getElementById(containerId);

        // Fallback: auto-create a wrapper inside the system grid first, then dashboard grid
        if (!container) {
            const grid = document.getElementById('system-widgets') || document.getElementById('dashboard-widgets');
            if (grid) {
                container = document.createElement('div');
                container.id = containerId;
                container.className = 'dashboard-widget-card';
                // Basic header based on containerId
                const prettyTitle = {
                    extensionStatus: 'DeenShield Status',
                    digitalWellness: 'Digital Wellness',
                    protectionSchedule: 'Protection Schedule',
                    prayerTimes: 'Prayer Times'
                }[containerId] || 'Widget';

                const header = document.createElement('div');
                header.className = 'dashboard-widget-header';
                header.innerHTML = `<h3>${prettyTitle}</h3>`;

                const body = document.createElement('div');
                body.className = 'dashboard-widget-body';
                container.appendChild(header);
                container.appendChild(body);
                grid.appendChild(container);
                // Repoint widget mount into body for nicer layout
                widget = (() => { const wrap = document.createElement('div'); wrap.className = 'dashboard-widget'; wrap.appendChild(widget); return wrap; })();
                body.appendChild(widget);
                return;
            }
        }
        // Default behavior: append directly if container exists
        if (container) container.appendChild(widget);
    }

    updateWidgets(data = {}) {
        const stats = data.stats || this._lastStats || {};
        const settings = data.settings || this._lastSettings || {};
        const extensionStatus = data.extensionStatus || this._lastExtensionStatus || {};

        this._lastStats = stats;
        this._lastSettings = settings;
        this._lastExtensionStatus = extensionStatus;

        // Update widgets with graceful fallbacks
        this.updateExtensionStatus(extensionStatus, stats);
        this.updateDigitalWellness(stats);
        this.updateProtectionSchedule(settings);
        this.updatePrayerTimes(settings.prayerTimes);
    }

    updateExtensionStatus(status = {}, stats = {}) {
        const widget = document.querySelector('.extension-widget');
        if (!widget) return;

        const indicator = widget.querySelector('.status-indicator');
        const version = widget.querySelector('.info-item:first-child span:last-child');
        const blockedTodayField = widget.querySelector('.info-item:last-child span:last-child');
        
        const isActive = !!status.active;
        indicator.className = `status-indicator ${isActive ? 'active' : 'inactive'}`;
        const label = indicator.querySelector('span');
        if (label) label.textContent = isActive ? 'Active & Protected' : 'Inactive';
        if (version) version.textContent = status.version || '-';
        if (blockedTodayField) blockedTodayField.textContent = (typeof status.blockedToday === 'number' ? status.blockedToday : (typeof stats.blockedToday === 'number' ? stats.blockedToday : '-'));
    }

    updateDigitalWellness(stats = {}) {
        const widget = document.querySelector('.wellness-widget');
        if (!widget) return;

        const percentage = widget.querySelector('.percentage');
        const blockedCount = widget.querySelector('.metric-item:first-child .metric-value');
        const focusTime = widget.querySelector('.metric-item:last-child .metric-value');

        const prot = Number.isFinite(stats.protectionPercentage) ? stats.protectionPercentage : 0;
        const blocked = Number.isFinite(stats.blockedToday) ? stats.blockedToday : 0;
        const focus = Number.isFinite(stats.focusTime) ? stats.focusTime : 0;

        if (percentage) percentage.textContent = `${prot}%`;
        if (blockedCount) blockedCount.textContent = blocked;
        if (focusTime) focusTime.textContent = `${focus}h`;

        // Optional: animate radial progress via CSS var
        const progress = widget.querySelector('.circle-progress');
        if (progress) progress.style.setProperty('--progress', String(prot));
    }

    updateProtectionSchedule(settings = {}) {
        const widget = document.querySelector('.schedule-widget');
        if (!widget) return;

        const timeline = widget.querySelector('.protection-timeline');
        const schedule = settings.protectionSchedule || {};
        if (!timeline) return;
        timeline.innerHTML = Object.entries(schedule)
            .map(([prayer, config]) => `
                <div class="timeline-item">
                    <span class="time">${prayer}</span>
                    <span class="mode">${(config && config.mode) ? config.mode : '-'}</span>
                </div>
            `).join('');
    }

    updatePrayerTimes(prayerTimes) {
        const widget = document.querySelector('.prayer-times-widget');
        if (!widget || !prayerTimes) return;

        const list = widget.querySelector('.prayer-times-list');
        list.innerHTML = Object.entries(prayerTimes)
            .map(([prayer, time]) => `
                <div class="prayer-time">
                    <span class="prayer-name">${prayer}</span>
                    <span class="prayer-time-value">${time}</span>
                </div>
            `).join('');
    }
}

// Export as singleton
export default new DashboardWidgets();
