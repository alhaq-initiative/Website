# Deen Shield Productivity App 

A comprehensive Islamic productivity web application that integrates seamlessly with the Deen Shield browser extension.

## Features 

###  Prayer Times & Alerts
- **Automatic Location Detection**: Uses GPS to determine your location
- **Accurate Prayer Times**: Calculates Fajr, Dhuhr, Asr, Maghrib, and Isha times
- **Prayer Notifications**: Customizable alerts for each prayer
- **Current Prayer Highlighting**: Visual indication of current and upcoming prayers

###  Qibla Direction
- **Interactive Compass**: Points towards Mecca from your location
- **Distance Calculation**: Shows exact distance to the Kaaba
- **Real-time Updates**: Updates when location changes

###  Quran Study
- **Surah Selection**: Browse and read different chapters of the Quran
- **Arabic & Translation**: Side-by-side Arabic text with English translation
- **Bookmarking System**: Save your favorite verses for quick access
- **Reading Progress**: Track your Quran reading journey
- **Audio Support**: Built-in audio player for recitations (upcoming)

###  Digital Dhikr Counter
- **Tasbih Counter**: Digital counter for dhikr and remembrance
- **Islamic Presets**: Pre-configured dhikr with traditional counts
  - SubhanAllah (33x)
  - Alhamdulillah (33x)
  - Allahu Akbar (34x)
  - La ilaha illa Allah (100x)
- **Progress Tracking**: Keep track of your daily dhikr

###  Task Management
- **Islamic Context**: Productivity with Islamic principles
- **Daily Tasks**: Organize your daily activities
- **Progress Tracking**: Monitor completed tasks
- **Habit Building**: Build positive Islamic habits

###  Library Integration
- **Al-Haq Library**: Direct access to extensive Islamic resources
- **Seamless Integration**: Embedded library interface
- **Resource Access**: Books, articles, and Islamic content

###  Extension Integration
- **Professional Link**: Direct access from browser extension
- **Unified Experience**: Consistent Islamic theme and branding
- **Cross-Platform**: Works on desktop and mobile browsers

## Technology Stack 

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: CSS Variables, Flexbox, Grid Layout
- **APIs**: Geolocation API for location services
- **Storage**: Local Storage for user preferences and data
- **Fonts**: Inter (UI), Amiri (Arabic text)
- **Responsive**: Mobile-first responsive design

## Installation & Setup 

1. **Clone or Download** the project files
2. **Open** index.html in a modern web browser
3. **Allow Location Access** when prompted for accurate prayer times
4. **Start Using** the Islamic productivity features

### For Development:

`ash
# Clone the repository
git clone https://github.com/HabibGHub/DeenShield-Extension.git

# Navigate to productivity app
cd Deensheild-Productivity-App

# Open in development server (optional)
# Use live-server, http-server, or similar
npx live-server
`

## Browser Compatibility 

- **Chrome/Chromium**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **Mobile Browsers**: Responsive design optimized

### Requirements:
- Modern browser with ES6+ support
- Geolocation API support
- Local Storage support

## File Structure 

`
Deensheild-Productivity-App/
 index.html                    # Main application
 package.json                  # Project configuration
 README.md                     # This file
 DEVELOPMENT_SESSION_BACKUP.md # Technical documentation
 PROJECT_STATUS_SUMMARY.md     # Project status
 src/
    styles/
       main.css             # Core styles
       prayer-times.css     # Prayer times styles
       quran-study.css      # Quran study styles
    js/
        app.js               # Main application logic
 assets/
     images/                  # Application icons
`

## Features in Detail 

### Prayer Times System
- Uses simplified calculation (production should use proper Islamic library)
- Location-based accuracy
- Visual prayer cards with status indicators
- Customizable notification preferences

### Qibla Compass
- Mathematical calculation pointing to Kaaba coordinates (21.4225N, 39.8262E)
- Real-time direction updates
- Distance calculation using haversine formula

### Quran Interface
- Sample verses for demonstration
- Bookmark system with local storage
- Reading progress tracking
- Note-taking capabilities (planned)

### Digital Dhikr
- Touch/click counter with haptic feedback on mobile
- Traditional Islamic dhikr presets
- Daily and total count tracking
- Reset functionality

## Development Notes 

### Current Implementation
- Simplified prayer time calculations (for demonstration)
- Sample Quran verses (first few verses of Al-Fatiha)
- Basic local storage for user data
- Responsive design optimized for all devices

### Production Recommendations
1. **Integrate Prayer Time Library**: Use Adhan.js or similar for accurate calculations
2. **Add Quran API**: Connect to comprehensive Quran database
3. **Audio Implementation**: Add actual Adhan and recitation files
4. **Offline Support**: Implement service workers
5. **Testing**: Add comprehensive test suite

## Security & Privacy 

- **No Personal Data**: Only stores preferences locally
- **Local Storage**: All data remains on user's device
- **Location Privacy**: Location used only for prayer time calculation
- **No Tracking**: No analytics or user tracking
- **HTTPS Ready**: Designed for secure connections

## Integration with Deen Shield Extension 

The productivity app integrates seamlessly with the Deen Shield browser extension:

- **Direct Link**: Professional link in extension popup
- **Consistent Branding**: Shared Islamic theme and design
- **Unified Experience**: Smooth transition between extension and app

## Contributing 

This project is part of the Deen Shield ecosystem. For contributions:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License 

This project is part of the Deen Shield Extension project. See the main repository for license information.

## Contact 

- **Business Email**: business@deenshield.com
- **Repository**: https://github.com/HabibGHub/DeenShield-Extension
- **Extension**: Deen Shield - Islamic Content Blocker

## Acknowledgments 

- Islamic prayer time calculation resources
- Open source Islamic calendar libraries
- Arabic font providers (Amiri font)
- Islamic community feedback and suggestions

---

**May Allah bless this project and make it beneficial for the Muslim Ummah. Ameen.** 

*Developed with love for the Islamic community*
