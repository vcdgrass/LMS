const express = require('express');
const router = express.Router();
const coursesController = require('../controllers/coursesController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/teaching', verifyToken, coursesController.getCoursesByTeacher);
router.post('/', verifyToken, coursesController.createCourse);

module.exports = router;