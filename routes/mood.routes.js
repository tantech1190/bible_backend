const express = require('express');
const router = express.Router();
const moodController = require('../controllers/mood.controller');
const { protect } = require('../middleware/auth');

// All mood routes require authentication
router.use(protect);

// Update today's mood
router.post('/', moodController.updateMood);

// Get today's mood
router.get('/today', moodController.getTodayMood);

// Get mood history
router.get('/history', moodController.getMoodHistory);

module.exports = router;
