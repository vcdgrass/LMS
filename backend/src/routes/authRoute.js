const express = require('express');
const { registerAdmin, login } = require('../controllers/authController');

const router = express.Router();

// POST /auth/register
router.post('/register', registerAdmin);

// POST /auth/login
router.post('/login', login);

module.exports = router;