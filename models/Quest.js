const mongoose = require('mongoose');

const questSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  book: {
    type: String,
    required: [true, 'Book is required']
  },
  chapters: {
    type: String,
    required: [true, 'Chapters are required']
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  points: {
    type: Number,
    required: [true, 'Points are required'],
    min: [0, 'Points cannot be negative'],
    default: 100
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  },
  icon: {
    type: String,
    default: 'BookOpen'
  },
  category: {
    type: String,
    enum: ['Old Testament', 'New Testament', 'Wisdom', 'Prophets', 'Gospels', 'Letters', 'Other'],
    default: 'Other'
  },
  requirements: [{
    type: {
      type: String,
      enum: ['read', 'memorize', 'reflect', 'quiz', 'discuss']
    },
    description: String,
    completed: { type: Boolean, default: false }
  }],
  milestones: [{
    chapter: Number,
    points: Number,
    title: String
  }],
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    progress: {
      chaptersCompleted: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 },
      pointsEarned: { type: Number, default: 0 }
    },
    startedAt: { type: Date, default: Date.now },
    completedAt: Date,
    isCompleted: { type: Boolean, default: false }
  }],
  totalCompletions: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for efficient queries
questSchema.index({ status: 1, difficulty: 1 });
questSchema.index({ book: 1 });

module.exports = mongoose.model('Quest', questSchema);
