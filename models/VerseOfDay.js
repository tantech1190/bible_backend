const mongoose = require('mongoose');

const verseOfDaySchema = new mongoose.Schema({
  verse: {
    type: String,
    required: [true, 'Verse text is required']
  },
  reference: {
    type: String,
    required: [true, 'Verse reference is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    unique: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'published', 'archived'],
    default: 'scheduled'
  },
  translation: {
    type: String,
    default: 'NIV'
  },
  theme: {
    type: String,
    enum: ['Faith', 'Hope', 'Love', 'Peace', 'Courage', 'Wisdom', 'Gratitude', 'Other'],
    default: 'Other'
  },
  imageUrl: {
    type: String
  },
  backgroundColor: {
    type: String,
    default: '#161d49'
  },
  shares: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  reflections: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: String,
    createdAt: { type: Date, default: Date.now }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for efficient date queries
verseOfDaySchema.index({ date: -1, status: 1 });

// Get today's verse
verseOfDaySchema.statics.getTodaysVerse = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return this.findOne({
    date: today,
    status: 'published'
  });
};

module.exports = mongoose.model('VerseOfDay', verseOfDaySchema);
