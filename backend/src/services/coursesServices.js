const { prisma } = require('../utils/db');

const createCourse = async (courseData) => {
    // 1. Validate teacherId TRƯỚC khi gọi DB
    const teacherIdRaw = courseData.teacherId;
    const teacherId = teacherIdRaw ? parseInt(teacherIdRaw, 10) : NaN;

    if (Number.isNaN(teacherId)) {
        throw new Error('teacherId is required and must be a valid number.');
    }

    // 2. Tạo Course và Link TeacherCourse trong CÙNG 1 lệnh (Transaction ngầm định)
    const newCourse = await prisma.course.create({
        data: {
            title: courseData.title,
            description: courseData.description,
            categoryId: parseInt(courseData.categoryId, 10),
            startDate: courseData.startDate ? new Date(courseData.startDate) : null,
            endDate: courseData.endDate ? new Date(courseData.endDate) : null,
            enrollmentKey: courseData.enrollmentKey || null,
            
            // [QUAN TRỌNG] Tạo luôn bản ghi trong bảng TeacherCourse tại đây
            teacherCourses: {
                create: {
                    userId: teacherId
                }
            }
        }
    });

    return newCourse;
}

const getTeachingCourses = async (teacherId) => {
    const courses = await prisma.course.findMany({
        where: {
            teacherCourses: {
                some: {
                    userId: parseInt(teacherId) // Đảm bảo teacherId là số
                }
            }
        },
        include: {
            category: true, // Lấy thêm thông tin danh mục để hiển thị đẹp hơn
            _count: {
                select: { enrollments: true } // Đếm số học viên
            }
        }
    });
    return courses;
}

/**
 * Lấy chi tiết khóa học kèm nội dung (Sections > Modules)
 */
const getCourseById = async (courseId) => {
    const course = await prisma.course.findUnique({
        where: { id: parseInt(courseId) },
        include: {
            category: true,
            sections: {
                orderBy: { orderIndex: 'asc' }, // Sắp xếp chương theo thứ tự
                include: {
                    modules: {
                        orderBy: { orderIndex: 'asc' } // Sắp xếp bài học
                    }
                }
            },
            _count: {
                select: { enrollments: true }
            }
        }
    });
    return course;
};

module.exports = {
    createCourse,
    getTeachingCourses,
    getCourseById,
};