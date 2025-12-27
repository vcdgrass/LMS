const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware'); // Middleware xác thực

// GET /users/students
router.get('/students', userController.getAllStudentsController);

module.exports = router;