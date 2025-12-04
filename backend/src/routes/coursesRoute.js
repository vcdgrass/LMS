const express = require('express');
const router = express.Router();
const coursesController = require('../controllers/coursesController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/teaching', verifyToken, coursesController.getCoursesByTeacher);
router.post('/', verifyToken, coursesController.createCourse);
router.get('/:id', verifyToken, coursesController.getCourseDetail);
// Route thêm Section vào Course
router.post('/:id/sections', verifyToken, coursesController.addSection);

// Route thêm Module vào Section
router.post('/sections/:sectionId/modules', verifyToken, coursesController.addModule);

// Route lấy Module theo ID
router.get('/modules/:moduleId', verifyToken, coursesController.getModuleById);
// Route xoá Section
router.delete('/sections/:sectionId', verifyToken, coursesController.deleteSection);
// Route xoá Module
router.delete('/modules/:moduleId', verifyToken, coursesController.deleteModule);

module.exports = router;