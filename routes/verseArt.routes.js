const express = require('express');
const router = express.Router();
const verseArtController = require('../controllers/verseArt.controller');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

// Public routes
router.get('/', optionalAuth, verseArtController.getAll);
router.get('/public', verseArtController.getPublic);
router.get('/:id', optionalAuth, verseArtController.getById);

// Protected routes
router.get('/user/my-art', protect, verseArtController.getMyArt);
router.post('/', protect, verseArtController.create);
router.put('/:id', protect, verseArtController.update);
router.delete('/:id', protect, verseArtController.delete);

router.post('/:id/like', protect, verseArtController.likeArt);
router.post('/:id/share', protect, verseArtController.incrementShares);
router.post('/:id/download', protect, verseArtController.incrementDownloads);
router.post('/:id/comment', protect, verseArtController.addComment);

// Admin routes
router.patch('/:id/flag', protect, authorize('admin', 'moderator'), verseArtController.flagArt);
router.delete('/:id/comment/:commentId', protect, authorize('admin', 'moderator'), verseArtController.deleteComment);

module.exports = router;
