const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth');

// User profile routes (protected)
router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, userController.updateProfile);
router.put('/preferences', protect, userController.updatePreferences);
router.put('/parental-controls', protect, userController.updateParentalControls);

// Bookmarks and highlights
router.post('/bookmarks', protect, userController.addBookmark);
router.delete('/bookmarks/:bookmarkId', protect, userController.removeBookmark);
router.get('/bookmarks', protect, userController.getBookmarks);

router.post('/highlights', protect, userController.addHighlight);
router.delete('/highlights/:highlightId', protect, userController.removeHighlight);
router.get('/highlights', protect, userController.getHighlights);

// Stats and progress
router.get('/stats', protect, userController.getStats);
router.post('/stats/update-streak', protect, userController.updateStreak);
router.post('/stats/add-points', protect, userController.addPoints);

// Admin routes
router.get('/', protect, authorize('admin', 'moderator'), userController.getAllUsers);
router.get('/:id', protect, authorize('admin', 'moderator'), userController.getUserById);
router.patch('/:id/status', protect, authorize('admin'), userController.updateUserStatus);
router.patch('/:id/role', protect, authorize('admin'), userController.updateUserRole);
router.delete('/:id', protect, authorize('admin'), userController.deleteUser);

module.exports = router;
