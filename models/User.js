const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  age: {
    type: Number,
    min: [1, 'Age must be at least 1'],
    max: [150, 'Age cannot exceed 150']
  },
  avatar: {
    type: String,
    default: null
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'pastel'],
      default: 'light'
    },
    fontSize: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium'
    },
    translation: {
      type: String,
      default: 'NIV'
    },
    notifications: {
      dailyVerse: { type: Boolean, default: true },
      devotionals: { type: Boolean, default: true },
      prayerUpdates: { type: Boolean, default: true }
    }
  },
  stats: {
    streak: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 },
    chaptersRead: { type: Number, default: 0 },
    devotionsCompleted: { type: Number, default: 0 },
    questsCompleted: { type: Number, default: 0 }
  },
  bookmarks: [{
    verse: String,
    reference: String,
    note: String,
    createdAt: { type: Date, default: Date.now }
  }],
  highlights: [{
    verse: String,
    reference: String,
    color: String,
    createdAt: { type: Date, default: Date.now }
  }],
  parentalControls: {
    enabled: { type: Boolean, default: false },
    parentEmail: String,
    restrictions: {
      comments: { type: Boolean, default: false },
      socialFeatures: { type: Boolean, default: false }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update last active timestamp
userSchema.methods.updateLastActive = function() {
  this.lastActive = Date.now();
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
