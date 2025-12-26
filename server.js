const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors());


// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Import Routes
const authRoutes = require('./routes/auth.routes');
const devotionalRoutes = require('./routes/devotional.routes');
const questRoutes = require('./routes/quest.routes');
const verseOfDayRoutes = require('./routes/verseOfDay.routes');
const readingPlanRoutes = require('./routes/readingPlan.routes');
const userRoutes = require('./routes/user.routes');
const prayerRoutes = require('./routes/prayer.routes');
const verseArtRoutes = require('./routes/verseArt.routes');
const moderationRoutes = require('./routes/moderation.routes');
const analyticsRoutes = require('./routes/analytics.routes');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/devotionals', devotionalRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/verse-of-day', verseOfDayRoutes);
app.use('/api/reading-plans', readingPlanRoutes);
app.use('/api/users', userRoutes);
app.use('/api/prayers', prayerRoutes);
app.use('/api/verse-art', verseArtRoutes);
app.use('/api/moderation', moderationRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'IntentionalStudy API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start Server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`🚀 IntentionalStudy API Server running on port ${PORT}`);
  console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
