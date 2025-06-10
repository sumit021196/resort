const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// User login route
router.post('/login', authController.login);

// User registration route
router.post('/register', authController.register);

module.exports = router;
