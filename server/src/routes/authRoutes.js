const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit'); 
const { body } = require('express-validator');
const { register, login, refresh } = require('../controllers/authController');
const validate = require('../middleware/validate'); // Keeps your original validation interceptor

// 1. Setup the IP Rate Limiter against brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window duration
  max: 15, // Max 15 attempts allowed per IP within the 15-minute frame
  message: { error: 'Too many login or registration attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 2. Register Route: Combines Rate Limiting + Express Validation Rules + Controller
router.post(
  '/register',
  authLimiter,
  [
    body('full_name').notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  register
);

// 3. Login Route: Combines Rate Limiting + Express Validation Rules + Controller
router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

// 4. Refresh Token Route (Does not require validation bodies as it reads from HTTP cookies)
router.post('/refresh', refresh); 

module.exports = router;