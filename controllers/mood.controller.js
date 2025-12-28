const User = require('../models/User');

// @desc    Update user's mood for today
// @route   POST /api/mood
// @access  Private
exports.updateMood = async (req, res) => {
  try {
    const { mood } = req.body;

    console.log('========================================');
    console.log('😊 Update Mood Request:');
    console.log('   User ID:', req.user.id);
    console.log('   Mood:', mood);
    console.log('========================================');

    if (!mood) {
      return res.status(400).json({
        success: false,
        message: 'Mood is required'
      });
    }

    const validMoods = ['joyful', 'peaceful', 'grateful', 'hopeful', 'struggling', 'anxious'];
    if (!validMoods.includes(mood)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mood value'
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get today's date at midnight for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if user already logged mood today
    const todayMoodIndex = user.moodTracking.findIndex(entry => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === today.getTime();
    });

    if (todayMoodIndex !== -1) {
      // Update existing mood for today
      console.log('📝 Updating existing mood for today');
      user.moodTracking[todayMoodIndex].mood = mood;
      user.moodTracking[todayMoodIndex].date = new Date(); // Update timestamp
    } else {
      // Add new mood entry
      console.log('➕ Adding new mood entry for today');
      user.moodTracking.push({
        mood: mood,
        date: new Date()
      });
    }

    await user.save();

    console.log('✅ Mood saved successfully');
    console.log('========================================');

    res.json({
      success: true,
      message: 'Mood updated successfully',
      data: {
        mood: mood,
        date: new Date()
      }
    });
  } catch (error) {
    console.log('❌ Error updating mood:', error);
    console.log('========================================');
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get user's mood for today
// @route   GET /api/mood/today
// @access  Private
exports.getTodayMood = async (req, res) => {
  try {
    console.log('========================================');
    console.log('😊 Get Today\'s Mood Request:');
    console.log('   User ID:', req.user.id);
    console.log('========================================');

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get today's date at midnight for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find today's mood
    const todayMood = user.moodTracking.find(entry => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === today.getTime();
    });

    if (todayMood) {
      console.log('✅ Found mood for today:', todayMood.mood);
    } else {
      console.log('⚠️ No mood logged for today');
    }
    console.log('========================================');

    res.json({
      success: true,
      data: {
        mood: todayMood ? todayMood.mood : null,
        date: todayMood ? todayMood.date : null
      }
    });
  } catch (error) {
    console.log('❌ Error getting mood:', error);
    console.log('========================================');
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get user's mood history
// @route   GET /api/mood/history
// @access  Private
exports.getMoodHistory = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get mood entries from the last X days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    const recentMoods = user.moodTracking
      .filter(entry => new Date(entry.date) >= cutoffDate)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      data: {
        moods: recentMoods,
        count: recentMoods.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
