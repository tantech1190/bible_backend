const express = require('express');
const router = express.Router();
const devotionalController = require('../controllers/devotional.controller');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

// Public routes (with optional auth for personalization)
router.get('/', optionalAuth, devotionalController.getAll);
router.get('/published', devotionalController.getPublished);
router.get('/today', devotionalController.getToday);
router.get('/:id', optionalAuth, devotionalController.getById);

// Protected routes (users can like and reflect)
router.post('/:id/like', protect, devotionalController.likeDevotional);
router.post('/:id/reflect', protect, devotionalController.addReflection);
router.put('/:id/reflections/:reflectionId', protect, devotionalController.updateReflection);
router.post('/:id/read', protect, devotionalController.markAsRead);

// Admin routes
router.post('/', protect, authorize('admin', 'moderator'), devotionalController.create);
router.put('/:id', protect, authorize('admin', 'moderator'), devotionalController.update);
router.delete('/:id', protect, authorize('admin'), devotionalController.delete);
router.patch('/:id/status', protect, authorize('admin', 'moderator'), devotionalController.updateStatus);

module.exports = router;
