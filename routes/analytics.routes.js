const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { protect, authorize } = require('../middleware/auth');

// Admin routes for analytics
router.get('/dashboard', protect, authorize('admin'), analyticsController.getDashboardStats);
router.get('/users', protect, authorize('admin'), analyticsController.getUserAnalytics);
router.get('/engagement', protect, authorize('admin'), analyticsController.getEngagementAnalytics);
router.get('/content', protect, authorize('admin'), analyticsController.getContentAnalytics);
router.get('/growth', protect, authorize('admin'), analyticsController.getGrowthAnalytics);

module.exports = router;
