// backend/src/controllers/adminController.js
const { prisma } = require('../utils/db');

const getDashboardStats = async (req, res) => {
    try {
        const schoolId = req.schoolId; // Lấy từ Middleware

        // Sử dụng Promise.all để chạy các lệnh đếm song song cho nhanh
        const [totalStudents, totalTeachers, totalCourses] = await Promise.all([
            // 1. Đếm học sinh của trường này
            prisma.user.count({
                where: {
                    schoolId: schoolId,
                    role: 'student'
                }
            }),
            // 2. Đếm giáo viên của trường này
            prisma.user.count({
                where: {
                    schoolId: schoolId,
                    role: 'teacher'
                }
            }),
            // 3. Đếm khóa học của trường này
            prisma.course.count({
                where: {
                    schoolId: schoolId
                }
            })
        ]);
        const totalUsers = totalStudents + totalTeachers;

        res.status(200).json({
            totalUsers,
            totalCourses,
            // Có thể tính thêm totalRevenue nếu sau này có thanh toán
        });

    } catch (error) {
        console.error("Lỗi lấy thống kê Dashboard:", error);
        res.status(500).json({ message: "Lỗi máy chủ." });
    }
};

module.exports = {
    getDashboardStats
};