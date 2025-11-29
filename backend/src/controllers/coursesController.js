const coursesService = require('../services/coursesServices');

const getCoursesByTeacher = async (req, res) => {
    try {
        const teacherId = req.user.id; // Giả sử ID giảng viên được lưu trong req.user sau khi xác thực
        const courses = await coursesService.getTeachingCourses(teacherId);
        res.status(200).json(courses);
    } catch (error) {
        console.error("Lỗi khi lấy khóa học của giảng viên:", error);
        res.status(500).json({ message: "Lỗi máy chủ khi lấy khóa học." });
    }   
};

const createCourse = async (req, res) => {
    try {
        const teacherId = req.user.id; // Giả sử ID giảng viên được lưu trong req.user sau khi xác thực
        console.log("Creating course for teacherId:", teacherId);
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

module.exports = {
    getCoursesByTeacher,
    createCourse
};