const express = require('express');
const router = express.Router();
const coursesController = require('../controllers/coursesController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { uploadAssignment } = require('../middlewares/uploadMiddleware'); // Import middleware mới

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

// Route nộp bài tập
router.post('/assignments/:assignmentId/submit', 
    verifyToken, 
    uploadAssignment.single('file'), // 'file' là key của FormData
    coursesController.submitAssignment
);

// Route lấy Courses theo ID
router.get('/student/:studentId', verifyToken, coursesController.getStudentCourses);

// Route quản lý học viên
router.get('/:id/students', verifyToken, coursesController.getStudents);
router.post('/:id/students', verifyToken, coursesController.addStudent);
router.delete('/:id/students/:studentId', verifyToken, coursesController.removeStudent);


module.exports = router;