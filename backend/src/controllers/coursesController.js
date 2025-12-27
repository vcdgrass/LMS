const { get } = require('../routes/coursesRoute');
const coursesService = require('../services/coursesServices');
const { prisma } = require('../utils/db');

const getCoursesByTeacher = async (req, res) => {
    try {
        // SỬA DÒNG NÀY: req.user.id -> req.user.userId
        const teacherId = req.user.userId; 
        
        const courses = await coursesService.getTeachingCourses(teacherId);
        res.status(200).json(courses);
    } catch (error) {
        console.error("Lỗi khi lấy khóa học của giảng viên:", error);
        res.status(500).json({ message: "Lỗi máy chủ khi lấy khóa học." });
    }   
};

const createCourse = async (req, res) => {
    try {
        // SỬA DÒNG NÀY: req.user.id -> req.user.userId
        const teacherId = req.user.userId; 
        
        console.log("Creating course for teacherId:", teacherId); // Log kiểm tra
        
        const courseData = {
            ...req.body,
            teacherId 
        };
        const newCourse = await coursesService.createCourse(courseData);
        res.status(201).json(newCourse);
    } catch (error) {
        console.error("Lỗi khi tạo khóa học:", error);
        res.status(500).json({ message: "Lỗi máy chủ khi tạo khóa học." });
    }
};

const getCourseDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await coursesService.getCourseById(id);

        if (!course) {
            return res.status(404).json({ message: "Không tìm thấy khóa học." });
        }

        // (Tùy chọn) Kiểm tra quyền truy cập: 
        // Chỉ cho phép nếu user là Giáo viên của lớp HOẶC Sinh viên đã ghi danh
        // Logic này có thể mở rộng sau.

        res.status(200).json(course);
    } catch (error) {
        console.error("Lỗi lấy chi tiết khóa học:", error);
        res.status(500).json({ message: "Lỗi máy chủ." });
    }
};

const addSection = async (req, res) => {
    try {
        const { id } = req.params; // courseId
        const { title } = req.body;
        const section = await coursesService.createSection(id, title);
        res.status(201).json(section);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi tạo chương." });
    }
};

const addModule = async (req, res) => {
    try {
        const { sectionId } = req.params;
        // body: { title, type, ... }
        const module = await coursesService.createModule(sectionId, req.body);
        res.status(201).json(module);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi tạo bài học." });
    }
};

const getModuleById = async (req, res) => {
    try {
        const { moduleId } = req.params;
        const type = req.query.type;
        const module = await coursesService.getModuleById(moduleId, type);
        if (!module) {
            console.error("Module not found for ID:", moduleId, "and type:", type);
            return res.status(404).json({ message: "Không tìm thấy bài học." });
        }
        res.status(200).json(module);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi máy chủ." });
    }
};

const deleteSection = async (req, res) => {
    try {
        const { sectionId } = req.params;
        await coursesService.deleteSection(sectionId);
        res.status(200).json({ message: "Xoá chương thành công." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi xoá chương." });
    }
};

const deleteModule = async (req, res) => {
    try { 
        const { moduleId } = req.params;
        const { type } = req.query;
        await coursesService.deleteModule(moduleId, type);
        res.status(200).json({ message: "Xoá bài học thành công."});
    } catch (error) {
        console.error(error);
        res.status(500).json ({ message: "Lỗi xoá bài học."});
    }
};

const submitAssignment = async (req, res) => {
    try {
        const assignmentId = Number(req.params.assignmentId);
        const userId = Number(req.user.userId); // hoặc req.user.id tùy middleware
        const file = req.file;

        if (isNaN(assignmentId) || isNaN(userId)) {
            return res.status(400).json({ message: "assignmentId hoặc userId không hợp lệ" });
        }

        console.log("assignmentId: ", assignmentId);

        // 1. Kiểm tra assignment có tồn tại không
        const assignment = await prisma.moduleAssignment.findUnique({
            where: { id: assignmentId }
        });

        if (!assignment) {
            return res.status(404).json({ message: "Bài tập không tồn tại." });
        }

        // 2. Tính toán nộp muộn
        const isLate = assignment.dueDate && new Date() > new Date(assignment.dueDate);

        // 3. Tạo record Submission
        const submission = await prisma.assignmentSubmission.create({
            data: {
                assignmentId,
                userId,
                filePath: file.path,
                submittedAt: new Date(),
                isLate
            }
        });

        return res.json(submission); // gửi response về client
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Lỗi server khi nộp bài." });
    }
};


const getStudentCourses = async (req, res) => {
    try {
        // req.user.userId lấy từ middleware verifyToken
        const studentId = req.user.userId;
        console.log("studentID: ", studentId);
        if (!studentId) {
             return res.status(400).json({ message: "Không xác định được người dùng." });
        }       
        const courses = await coursesService.getEnrolledCourses(studentId);
        res.status(200).json(courses);
    } catch (error) {
        console.error("Lỗi lấy khóa học sinh viên:", error);
        res.status(500).json({ message: "Lỗi máy chủ khi tải khóa học." });
    }
};

// [MỚI] Lấy danh sách học sinh
const getStudents = async (req, res) => {
    try {
        const { id } = req.params; // courseId
        const students = await coursesService.getStudentsInCourse(id);
        res.status(200).json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi lấy danh sách học viên." });
    }
};

// [MỚI] Thêm học sinh
const addStudent = async (req, res) => {
    try {
        const { id } = req.params; // courseId
        const { email } = req.body;

        if (!email) return res.status(400).json({ message: "Vui lòng nhập email." });

        await coursesService.addStudentToCourse(id, email);
        res.status(201).json({ message: "Thêm học viên thành công!" });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message || "Lỗi khi thêm học viên." });
    }
};

// [MỚI] Xóa học sinh
const removeStudent = async (req, res) => {
    try {
        const { id, studentId } = req.params;
        await coursesService.removeStudentFromCourse(id, studentId);
        res.status(200).json({ message: "Đã xóa học viên khỏi lớp." });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi xóa học viên." });
    }
};

const getModuleSubmissions = async (req, res) => {
    try {
        const { moduleId } = req.params;
        const data = await coursesService.getSubmissionsByModule(moduleId);
        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

const gradeStudent = async (req, res) => {
    try {
        const { moduleId } = req.params;
        const { studentId, score, feedback } = req.body;
        const graderId = req.user.userId; // Người chấm

        const grade = await coursesService.updateGrade(graderId, moduleId, studentId, score, feedback);
        res.status(200).json({ message: "Chấm điểm thành công", grade });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi khi chấm điểm." });
    }
};

const submitQuizController = async (req, res) => {
    try {
        const { moduleId } = req.params;
        const { answers } = req.body; // Dạng { "1": 5, "2": 8 } (questionId: optionId)
        const userId = req.user.userId;   // Lấy từ token xác thực
        console.log(userId, moduleId, answers);
        const result = await coursesService.submitQuiz(userId, moduleId, answers);
        
        res.status(200).json({
            message: "Nộp bài thành công",
            data: result
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || "Lỗi server khi nộp bài" });
    }
};

const getLeaderboard = async (req, res) => {
    try {
        const { moduleId } = req.params;
        const data = await coursesService.getQuizLeaderboard(moduleId);
        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi lấy bảng xếp hạng." });
    }
};

module.exports = {
    getCoursesByTeacher,
    createCourse,
    getCourseDetail,
    addSection,
    addModule,
    getModuleById,
    deleteSection,
    deleteModule,
    submitAssignment,
    getStudentCourses,
    getStudents,
    addStudent,
    removeStudent,
    getModuleSubmissions,
    gradeStudent,
    submitQuizController,
    getLeaderboard,
};