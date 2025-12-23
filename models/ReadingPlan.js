const mongoose = require('mongoose');

const readingPlanSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  duration: {
    type: String,
    required: [true, 'Duration is required']
  },
  durationDays: {
    type: Number,
    required: [true, 'Duration in days is required']
  },
  topic: {
    type: String,
    required: [true, 'Topic is required']
  },
  category: {
    type: String,
    enum: ['Faith', 'Mental Health', 'Relationships', 'Purpose', 'Character', 'Wisdom', 'Other'],
    default: 'Other'
  },
  passages: [{
    day: Number,
    reference: String,
    verseText: String,
    reflection: String
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  icon: {
    type: String,
    default: 'BookMarked'
  },
  imageUrl: {
    type: String
  },
  enrolledUsers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    progress: {
      currentDay: { type: Number, default: 1 },
      completedDays: [{ type: Number }],
      percentage: { type: Number, default: 0 }
    },
    startedAt: { type: Date, default: Date.now },
    completedAt: Date,
    isCompleted: { type: Boolean, default: false }
  }],
  totalEnrollments: {
    type: Number,
    default: 0
  },
  completionRate: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: { type: Number, min: 1, max: 5 },
    review: String,
    createdAt: { type: Date, default: Date.now }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for efficient queries
readingPlanSchema.index({ status: 1, category: 1 });
readingPlanSchema.index({ topic: 1 });

// Update total enrollments
readingPlanSchema.methods.updateEnrollmentCount = function() {
  this.totalEnrollments = this.enrolledUsers.length;
  return this.save();
};

module.exports = mongoose.model('ReadingPlan', readingPlanSchema);
