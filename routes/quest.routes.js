const express = require('express');
const router = express.Router();
const questController = require('../controllers/quest.controller');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

// Public routes
router.get('/', optionalAuth, questController.getAll);
router.get('/active', questController.getActive);
router.get('/:id', optionalAuth, questController.getById);

// Protected routes (users can join and track progress)
router.post('/:id/join', protect, questController.joinQuest);
router.post('/:id/progress', protect, questController.updateProgress);
router.post('/:id/complete', protect, questController.completeQuest);
router.get('/:id/my-progress', protect, questController.getMyProgress);

// Admin routes
router.post('/', protect, authorize('admin', 'moderator'), questController.create);
router.put('/:id', protect, authorize('admin', 'moderator'), questController.update);
router.delete('/:id', protect, authorize('admin'), questController.delete);
router.patch('/:id/status', protect, authorize('admin', 'moderator'), questController.updateStatus);

module.exports = router;
