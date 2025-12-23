const mongoose = require('mongoose');

const devotionalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  verse: {
    type: String,
    required: [true, 'Verse reference is required']
  },
  verseText: {
    type: String
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  status: {
    type: String,
    enum: ['published', 'draft', 'archived'],
    default: 'draft'
  },
  category: {
    type: String,
    enum: ['Faith', 'Hope', 'Love', 'Peace', 'Strength', 'Wisdom', 'Gratitude', 'Other'],
    default: 'Other'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  readCount: {
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
    isPrivate: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Index for efficient queries
devotionalSchema.index({ date: -1, status: 1 });
devotionalSchema.index({ status: 1, category: 1 });

// Increment read count
devotionalSchema.methods.incrementReadCount = function() {
  this.readCount += 1;
  return this.save();
};

module.exports = mongoose.model('Devotional', devotionalSchema);
