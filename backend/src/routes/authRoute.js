const express = require('express');
const { registerAdmin, login, getMe, registerTenant, findSchool } = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// POST /auth/register
router.post('/register', registerAdmin);

// POST /auth/login
router.post('/login', login);

// [MỚI] GET /auth/me - Lấy thông tin user hiện tại
router.get('/me', verifyToken, getMe);

// [MỚI] POST /auth/register-tenant - Đăng ký mở trường mới
router.post('/register-tenant', registerTenant);

router.post('/find-school', findSchool);

module.exports = router;