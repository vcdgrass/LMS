const coursesService = require('../services/coursesServices');

const getCoursesByTeacher = async (req, res) => {
    try {
        const teacherId = req.user.userId;
        const schoolId = req.schoolId; // [MỚI] Lấy schoolId từ middleware

        // Truyền schoolId vào service để lọc khóa học của trường này
        const courses = await coursesService.getTeachingCourses(teacherId, schoolId);
        res.status(200).json(courses);
    } catch (error) {
        console.error("Lỗi khi lấy khóa học của giảng viên:", error);
        res.status(500).json({ message: "Lỗi máy chủ khi lấy khóa học." });
    }   
};

const createCourse = async (req, res) => {
    try {
        const teacherId = req.user.userId; 
        const schoolId = req.schoolId; // [MỚI] Lấy schoolId
        
        console.log("Creating course for teacherId:", teacherId, "at School:", schoolId);
        
        // Truyền req.body (dữ liệu form), teacherId và schoolId sang Service
        const newCourse = await coursesService.createCourse(req.body, teacherId, schoolId);
        
        res.status(201).json(newCourse);
    } catch (error) {
        console.error("Lỗi khi tạo khóa học:", error);
        res.status(500).json({ message: error.message || "Lỗi máy chủ khi tạo khóa học." });
    }
};

const getCourseDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const schoolId = req.schoolId; // [MỚI]

        // Truyền thêm schoolId để đảm bảo không xem trộm khóa học trường khác
        const course = await coursesService.getCourseById(id, schoolId);

        if (!course) {
            return res.status(404).json({ message: "Không tìm thấy khóa học hoặc không thuộc trường này." });
        }

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
        // Có thể thêm check schoolId ở đây nếu cần bảo mật kỹ hơn
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
        const userId = Number(req.user.userId);
        const file = req.file;

        if (isNaN(assignmentId) || isNaN(userId)) {
            return res.status(400).json({ message: "assignmentId hoặc userId không hợp lệ" });
        }

        const result = await coursesService.submitAssignment(userId, assignmentId, file);
        return res.json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message || "Lỗi server khi nộp bài." });
    }
};


const getStudentCourses = async (req, res) => {
    try {
        const studentId = req.user.userId;
        const schoolId = req.schoolId; // [MỚI]

        if (!studentId) {
             return res.status(400).json({ message: "Không xác định được người dùng." });
        }       
        // Truyền schoolId để chỉ lấy khóa học trường này
        const courses = await coursesService.getEnrolledCourses(studentId, schoolId);
        res.status(200).json(courses);
    } catch (error) {
        console.error("Lỗi lấy khóa học sinh viên:", error);
        res.status(500).json({ message: "Lỗi máy chủ khi tải khóa học." });
    }
};

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

const addStudent = async (req, res) => {
    try {
        const { id } = req.params; // courseId
        const { email } = req.body;
        // Có thể thêm schoolId vào đây để đảm bảo student thuộc trường này
        const schoolId = req.schoolId; 

        if (!email) return res.status(400).json({ message: "Vui lòng nhập email." });

        await coursesService.addStudentToCourse(id, email, schoolId);
        res.status(201).json({ message: "Thêm học viên thành công!" });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message || "Lỗi khi thêm học viên." });
    }
};

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
        const graderId = req.user.userId; 

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
        const { answers } = req.body; 
        const userId = req.user.userId;   
        
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