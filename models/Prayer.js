const mongoose = require('mongoose');

const prayerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Prayer title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Prayer content is required']
  },
  category: {
    type: String,
    enum: ['Personal', 'Family', 'Friends', 'Health', 'Guidance', 'Gratitude', 'World', 'Other'],
    default: 'Personal'
  },
  isPrivate: {
    type: Boolean,
    default: true
  },
  isAnswered: {
    type: Boolean,
    default: false
  },
  answeredAt: {
    type: Date
  },
  answeredNote: {
    type: String
  },
  prayerCount: {
    type: Number,
    default: 0
  },
  prayedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    prayedAt: { type: Date, default: Date.now }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: String,
    isModerated: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
  status: {
    type: String,
    enum: ['active', 'archived', 'flagged'],
    default: 'active'
  },
  parentNode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prayer',
    default: null
  },
  childNodes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prayer'
  }],
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Index for efficient queries
prayerSchema.index({ user: 1, status: 1 });
prayerSchema.index({ isPrivate: 1, status: 1 });
prayerSchema.index({ category: 1 });

// Increment prayer count
prayerSchema.methods.incrementPrayerCount = function() {
  this.prayerCount += 1;
  return this.save();
};

// Mark as answered
prayerSchema.methods.markAsAnswered = function(note) {
  this.isAnswered = true;
  this.answeredAt = Date.now();
  this.answeredNote = note || '';
  return this.save();
};

module.exports = mongoose.model('Prayer', prayerSchema);
