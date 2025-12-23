const User = require('../models/User');
const Devotional = require('../models/Devotional');
const Quest = require('../models/Quest');
const ReadingPlan = require('../models/ReadingPlan');
const Prayer = require('../models/Prayer');
const VerseArt = require('../models/VerseArt');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalDevotionals = await Devotional.countDocuments();
    const publishedDevotionals = await Devotional.countDocuments({ status: 'published' });
    const totalQuests = await Quest.countDocuments();
    const activeQuests = await Quest.countDocuments({ status: 'active' });
    const totalReadingPlans = await ReadingPlan.countDocuments();
    const activeReadingPlans = await ReadingPlan.countDocuments({ status: 'active' });
    const totalPrayers = await Prayer.countDocuments();
    const totalVerseArt = await VerseArt.countDocuments();

    // Get recent users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          newThisMonth: newUsers
        },
        content: {
          devotionals: { total: totalDevotionals, published: publishedDevotionals },
          quests: { total: totalQuests, active: activeQuests },
          readingPlans: { total: totalReadingPlans, active: activeReadingPlans },
          prayers: totalPrayers,
          verseArt: totalVerseArt
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getUserAnalytics = async (req, res) => {
  try {
    const users = await User.find().select('name email role createdAt lastActive stats isActive').sort({ createdAt: -1 }).limit(100);

    // Calculate role distribution
    const roleDistribution = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Calculate average stats
    const avgStats = await User.aggregate([
      {
        $group: {
          _id: null,
          avgStreak: { $avg: '$stats.streak' },
          avgPoints: { $avg: '$stats.totalPoints' },
          avgChaptersRead: { $avg: '$stats.chaptersRead' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        users,
        roleDistribution,
        averageStats: avgStats[0] || { avgStreak: 0, avgPoints: 0, avgChaptersRead: 0 }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getEngagementAnalytics = async (req, res) => {
  try {
    // Get most popular devotionals
    const topDevotionals = await Devotional.find({ status: 'published' }).sort({ readCount: -1 }).limit(10).select('title readCount likes');

    // Get most popular quests
    const topQuests = await Quest.find({ status: 'active' }).sort({ totalCompletions: -1 }).limit(10).select('title totalCompletions participants');

    // Get most popular reading plans
    const topReadingPlans = await ReadingPlan.find({ status: 'active' }).sort({ totalEnrollments: -1 }).limit(10).select('title totalEnrollments completionRate');

    // Get total engagement counts
    const totalDevotionalReads = await Devotional.aggregate([
      { $group: { _id: null, total: { $sum: '$readCount' } } }
    ]);

    const totalQuestCompletions = await Quest.aggregate([
      { $group: { _id: null, total: { $sum: '$totalCompletions' } } }
    ]);

    res.json({
      success: true,
      data: {
        topDevotionals,
        topQuests,
        topReadingPlans,
        totalReads: totalDevotionalReads[0]?.total || 0,
        totalQuestCompletions: totalQuestCompletions[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getContentAnalytics = async (req, res) => {
  try {
    // Count by status
    const devotionalsByStatus = await Devotional.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const questsByDifficulty = await Quest.aggregate([
      { $group: { _id: '$difficulty', count: { $sum: 1 } } }
    ]);

    const readingPlansByCategory = await ReadingPlan.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const prayersByCategory = await Prayer.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        devotionalsByStatus,
        questsByDifficulty,
        readingPlansByCategory,
        prayersByCategory
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getGrowthAnalytics = async (req, res) => {
  try {
    // Get user growth over last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get daily active users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyActiveUsers = await User.countDocuments({
      lastActive: { $gte: thirtyDaysAgo }
    });

    res.json({
      success: true,
      data: {
        userGrowth,
        dailyActiveUsers
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
