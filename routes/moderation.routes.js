const express = require('express');
const router = express.Router();
const moderationController = require('../controllers/moderation.controller');
const { protect, authorize } = require('../middleware/auth');

// All moderation routes require admin or moderator role
router.get('/flagged-content', protect, authorize('admin', 'moderator'), moderationController.getFlaggedContent);
router.get('/pending-comments', protect, authorize('admin', 'moderator'), moderationController.getPendingComments);
router.get('/reported-users', protect, authorize('admin', 'moderator'), moderationController.getReportedUsers);

router.post('/approve-comment/:commentId', protect, authorize('admin', 'moderator'), moderationController.approveComment);
router.post('/reject-comment/:commentId', protect, authorize('admin', 'moderator'), moderationController.rejectComment);

router.post('/flag-content', protect, authorize('admin', 'moderator'), moderationController.flagContent);
router.post('/unflag-content', protect, authorize('admin', 'moderator'), moderationController.unflagContent);

router.post('/warn-user/:userId', protect, authorize('admin', 'moderator'), moderationController.warnUser);
router.post('/suspend-user/:userId', protect, authorize('admin'), moderationController.suspendUser);

module.exports = router;
