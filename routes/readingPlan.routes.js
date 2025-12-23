const express = require('express');
const router = express.Router();
const readingPlanController = require('../controllers/readingPlan.controller');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

// Public routes
router.get('/', optionalAuth, readingPlanController.getAll);
router.get('/active', readingPlanController.getActive);
router.get('/:id', optionalAuth, readingPlanController.getById);

// Protected routes (users can enroll and track progress)
router.post('/:id/enroll', protect, readingPlanController.enrollInPlan);
router.post('/:id/progress', protect, readingPlanController.updateProgress);
router.post('/:id/complete', protect, readingPlanController.completePlan);
router.post('/:id/rate', protect, readingPlanController.ratePlan);
router.get('/:id/my-progress', protect, readingPlanController.getMyProgress);
router.get('/user/enrolled', protect, readingPlanController.getMyEnrolledPlans);

// Admin routes
router.post('/', protect, authorize('admin', 'moderator'), readingPlanController.create);
router.put('/:id', protect, authorize('admin', 'moderator'), readingPlanController.update);
router.delete('/:id', protect, authorize('admin'), readingPlanController.delete);
router.patch('/:id/status', protect, authorize('admin', 'moderator'), readingPlanController.updateStatus);

module.exports = router;
