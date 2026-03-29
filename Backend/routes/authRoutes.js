const express = require('express');
const router = express.Router();
const { register, login, getProfile, updatePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Private routes (need to be logged in)
router.get('/profile', protect, getProfile);
router.put('/password', protect, updatePassword);

module.exports = router;