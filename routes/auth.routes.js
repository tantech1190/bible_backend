const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');

// Validation middleware
const registerValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty if provided'),
  body('username').optional().trim().notEmpty().withMessage('Username cannot be empty if provided'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('age').optional().isInt({ min: 1, max: 150 }).withMessage('Age must be between 1 and 150'),
  body('role').optional().isIn(['user', 'admin', 'moderator']).withMessage('Invalid role')
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// Public routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

// Protected routes
router.get('/me', protect, authController.getMe);
router.put('/update-profile', protect, authController.updateProfile);
router.put('/update-password', protect, authController.updatePassword);
router.post('/logout', protect, authController.logout);

module.exports = router;