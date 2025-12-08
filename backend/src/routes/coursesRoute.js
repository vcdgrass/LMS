const express = require('express');
const router = express.Router();
const coursesController = require('../controllers/coursesController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { uploadAssignment } = require('../middlewares/uploadMiddleware');

// 1. CÁC ROUTE CỤ THỂ (ĐẶT LÊN ĐẦU)
router.get('/teaching', verifyToken, coursesController.getCoursesByTeacher);

router.get('/my-courses', verifyToken, coursesController.getStudentCourses);

// Route nộp bài tập (cũng nên đặt trên :id để tránh nhầm lẫn)
router.post('/assignments/:assignmentId/submit', 
    verifyToken, 
    uploadAssignment.single('file'), 
    coursesController.submitAssignment
);

// Route Module (cũng có params nhưng khác cấu trúc, đặt ở đây cho an toàn)
router.get('/modules/:moduleId', verifyToken, coursesController.getModuleById);
router.delete('/modules/:moduleId', verifyToken, coursesController.deleteModule);
// Lấy danh sách bài nộp của 1 module
router.get('/modules/:moduleId/submissions', verifyToken, coursesController.getModuleSubmissions);
// Chấm điểm cho 1 học viên trong module
router.post('/modules/:moduleId/grade', verifyToken, coursesController.gradeStudent);


// 2. CÁC ROUTE ĐỘNG /:id (ĐẶT CUỐI CÙNG)
// Vì /:id sẽ "bắt" tất cả các request có 1 tham số sau /courses/
router.get('/:id', verifyToken, coursesController.getCourseDetail);
router.post('/', verifyToken, coursesController.createCourse); // POST /courses tạo mới (không có ID) thì đặt đâu cũng được, nhưng gom nhóm cho gọn.

// Các route con của :id
router.post('/:id/sections', verifyToken, coursesController.addSection);
router.post('/sections/:sectionId/modules', verifyToken, coursesController.addModule);
router.delete('/sections/:sectionId', verifyToken, coursesController.deleteSection);
router.get('/:id/students', verifyToken, coursesController.getStudents);
router.post('/:id/students', verifyToken, coursesController.addStudent);
router.delete('/:id/students/:studentId', verifyToken, coursesController.removeStudent);

module.exports = router;