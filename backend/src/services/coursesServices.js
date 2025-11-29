const { prisma } = require('../utils/db');

const createCourse = async (courseData) => {
    const newCourse = await prisma.course.create({
        data: {
            title: courseData.title,
            description: courseData.description,
            categoryId: parseInt(courseData.categoryId, 10),
            startDate: courseData.startDate ? new Date(courseData.startDate) : null,
            endDate: courseData.endDate ? new Date(courseData.endDate) : null,
            enrollmentKey: courseData.enrollmentKey || null,
        }
    });

    // Validate teacherId
    const teacherIdRaw = courseData.teacherId ?? courseData.teacher?.id;
    const teacherId = teacherIdRaw !== undefined && teacherIdRaw !== null ? parseInt(teacherIdRaw, 10) : NaN;
    if (Number.isNaN(teacherId)) {
        throw new Error('teacherId is required and must be a valid number to link teacher to course.');
    }

    // Tạo liên kết giảng viên - khóa học (dùng connect để tránh userId undefined)
    await prisma.teacherCourse.create({
        data: {
            user: { connect: { id: teacherId } },
            course: { connect: { id: newCourse.id } }
        }
    });

    return newCourse;
}

const getTeachingCourses = async (teacherId) => {
    const courses = await prisma.course.findMany({
        where: {
            teacherCourses: {
                some: {
                    userId: teacherId
                }
            }
        },
    });
    return courses;
}

module.exports = {
    createCourse,
    getTeachingCourses
};