const mongoose = require('mongoose');

const verseArtSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  verse: {
    type: String,
    required: [true, 'Verse text is required']
  },
  reference: {
    type: String,
    required: [true, 'Verse reference is required']
  },
  design: {
    template: {
      type: String,
      enum: ['minimal', 'bold', 'nature', 'abstract', 'vintage', 'modern'],
      default: 'minimal'
    },
    backgroundColor: {
      type: String,
      default: '#161d49'
    },
    textColor: {
      type: String,
      default: '#ffffff'
    },
    fontFamily: {
      type: String,
      default: 'Inter'
    },
    fontSize: {
      type: String,
      default: 'medium'
    },
    alignment: {
      type: String,
      enum: ['left', 'center', 'right'],
      default: 'center'
    },
    backgroundImage: {
      type: String
    },
    overlay: {
      enabled: { type: Boolean, default: false },
      color: String,
      opacity: { type: Number, min: 0, max: 1, default: 0.5 }
    },
    effects: {
      shadow: { type: Boolean, default: false },
      border: { type: Boolean, default: false },
      borderColor: String
    }
  },
  imageUrl: {
    type: String
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  shares: {
    type: Number,
    default: 0
  },
  downloads: {
    type: Number,
    default: 0
  },
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: String,
    isModerated: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['active', 'archived', 'flagged'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Index for efficient queries
verseArtSchema.index({ user: 1, status: 1 });
verseArtSchema.index({ isPublic: 1, status: 1 });
verseArtSchema.index({ reference: 1 });

// Increment shares
verseArtSchema.methods.incrementShares = function() {
  this.shares += 1;
  return this.save();
};

// Increment downloads
verseArtSchema.methods.incrementDownloads = function() {
  this.downloads += 1;
  return this.save();
};

module.exports = mongoose.model('VerseArt', verseArtSchema);
