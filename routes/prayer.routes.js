const express = require('express');
const router = express.Router();
const prayerController = require('../controllers/prayer.controller');
const { protect, authorize } = require('../middleware/auth');

// Protected routes (all prayer routes require authentication)
router.get('/', protect, prayerController.getAll);
router.get('/my-prayers', protect, prayerController.getMyPrayers);
router.get('/public', protect, prayerController.getPublicPrayers);
router.get('/:id', protect, prayerController.getById);

router.post('/', protect, prayerController.create);
router.put('/:id', protect, prayerController.update);
router.delete('/:id', protect, prayerController.delete);

router.post('/:id/pray', protect, prayerController.prayFor);
router.post('/:id/comment', protect, prayerController.addComment);
router.post('/:id/answer', protect, prayerController.markAsAnswered);

router.post('/:id/child', protect, prayerController.addChildPrayer);
router.get('/:id/tree', protect, prayerController.getPrayerTree);

// Admin routes
router.patch('/:id/flag', protect, authorize('admin', 'moderator'), prayerController.flagPrayer);
router.delete('/:id/comment/:commentId', protect, authorize('admin', 'moderator'), prayerController.deleteComment);

module.exports = router;
