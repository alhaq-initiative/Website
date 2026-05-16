const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Prayer times endpoint (placeholder)
app.get('/api/prayer-times', (req, res) => {
  const { lat, lng } = req.query;
  
  if (!lat || !lng) {
    return res.status(400).json({ 
      error: 'Latitude and longitude are required' 
    });
  }
  
  // Placeholder prayer times data
  const prayerTimes = {
    fajr: '05:30',
    sunrise: '06:45',
    dhuhr: '12:30',
    asr: '15:45',
    maghrib: '18:20',
    isha: '19:35',
    location: { lat: parseFloat(lat), lng: parseFloat(lng) },
    date: new Date().toISOString().split('T')[0]
  };
  
  res.json(prayerTimes);
});

// Quran verse endpoint (placeholder)
app.get('/api/quran/verse/:surah/:ayah', (req, res) => {
  const { surah, ayah } = req.params;
  const { translation = 'en' } = req.query;
  
  // Placeholder verse data
  const verse = {
    surah: parseInt(surah),
    ayah: parseInt(ayah),
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
    translationLanguage: translation,
    surahName: 'Al-Fatihah'
  };
  
  res.json(verse);
});

// AI chat endpoint (placeholder)
app.post('/api/ai/chat', (req, res) => {
  const { message, context } = req.body;
  
  if (!message) {
    return res.status(400).json({ 
      error: 'Message is required' 
    });
  }
  
  // Placeholder AI response
  const response = {
    response: `Thank you for your question: "${message}". This is a placeholder response from quranhub. In the full implementation, this would provide Islamic guidance and answers.`,
    confidence: 0.85,
    sources: [
      'Placeholder source 1',
      'Placeholder source 2'
    ],
    timestamp: new Date().toISOString()
  };
  
  res.json(response);
});

// User preferences endpoint (placeholder)
app.get('/api/user/preferences', (req, res) => {
  // Placeholder user preferences
  const preferences = {
    prayerNotifications: true,
    calculationMethod: 'MuslimWorldLeague',
    language: 'en',
    theme: 'light',
    location: {
      lat: null,
      lng: null,
      city: null
    }
  };
  
  res.json(preferences);
});

app.post('/api/user/preferences', (req, res) => {
  const preferences = req.body;
  
  // In a real implementation, this would save to database
  console.log('Saving user preferences:', preferences);
  
  res.json({ 
    message: 'Preferences saved successfully',
    preferences 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Al-Haq Initiative API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🕌 Prayer times: http://localhost:${PORT}/api/prayer-times?lat=40.7128&lng=-74.0060`);
  console.log(`📖 Quran verse: http://localhost:${PORT}/api/quran/verse/1/1`);
});

module.exports = app;
