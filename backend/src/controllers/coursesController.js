const { get } = require('../routes/coursesRoute');
const coursesService = require('../services/coursesServices');

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
        resizeBy.status(500).json ({ message: "Lỗi xoá bài học."});
    }
}

module.exports = {
    getCoursesByTeacher,
    createCourse,
    getCourseDetail,
    addSection,
    addModule,
    getModuleById,
    deleteSection,
    deleteModule,
};