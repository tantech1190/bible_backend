const express = require('express');
const router = express.Router();
const verseOfDayController = require('../controllers/verseOfDay.controller');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

// Public routes
router.get('/', verseOfDayController.getAll);
router.get('/today', verseOfDayController.getToday);
router.get('/:id', optionalAuth, verseOfDayController.getById);

// Protected routes (users can like and reflect)
router.post('/:id/like', protect, verseOfDayController.likeVerse);
router.post('/:id/reflect', protect, verseOfDayController.addReflection);
router.post('/:id/share', protect, verseOfDayController.incrementShares);

// Admin routes
router.post('/', protect, authorize('admin', 'moderator'), verseOfDayController.create);
router.put('/:id', protect, authorize('admin', 'moderator'), verseOfDayController.update);
router.delete('/:id', protect, authorize('admin'), verseOfDayController.delete);
router.patch('/:id/status', protect, authorize('admin', 'moderator'), verseOfDayController.updateStatus);

module.exports = router;
