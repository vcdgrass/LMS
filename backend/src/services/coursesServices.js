const e = require('express');
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

const createSection = async (courseId, title) => {
    // Tìm section cuối cùng để tính orderIndex
    const lastSection = await prisma.courseSection.findFirst({
        where: { courseId: parseInt(courseId) },
        orderBy: { orderIndex: 'desc' }
    });
    const newOrder = lastSection ? (lastSection.orderIndex || 0) + 1 : 0;

    return await prisma.courseSection.create({
        data: {
            courseId: parseInt(courseId),
            title: title.title,
            orderIndex: newOrder
        }
    });
};

const createModule = async (sectionId, moduleData) => {
  const lastModule = await prisma.courseModule.findFirst({
    where: { sectionId: parseInt(sectionId) },
    orderBy: { orderIndex: 'desc' }
  });

  const newOrder = lastModule ? (lastModule.orderIndex || 0) + 1 : 0;

  let content;

  if (moduleData.type === 'resource_url') {
    content = await prisma.moduleResource.create({
      data: {
        description: moduleData.description,
        filePathOrUrl: moduleData.filePathOrUrl || ''
      }
    });
  } else if (moduleData.type === 'resource_file') {
    content = await prisma.moduleResource.create({
      data: {
        description: moduleData.description, 
        filePathOrUrl: moduleData.filePathOrUrl || ''
      }
    });
  } else if (moduleData.type === 'assignment') {
    content = await prisma.moduleAssignment.create({
      data: {
        description: moduleData.description || '',
        dueDate: moduleData.dueDate ? new Date(moduleData.dueDate) : null
      }
    });
  } else if (moduleData.type === 'quiz') {
    content = await prisma.moduleQuiz.create({
      data: {
        timeLimitMinutes: moduleData.timeLimitMinutes || null,
        description: moduleData.description || '',
        gradePassing: moduleData.gradePassing || null,
      }
    });
  }

  const courseModule = await prisma.courseModule.create({
    data: {
      sectionId: parseInt(sectionId),
      title: moduleData.title,
      moduleType: moduleData.type,
      contentId: content.id,
      orderIndex: newOrder
    }
  });

  return courseModule;
};


const getModuleById = async (id, type) => {
    let moduleContent = null;
    if (type === 'resource_url') {
        moduleContent = await prisma.moduleResource.findUnique({
            where: { id: parseInt(id) } 
        });
    } else if (type === 'resource_file') {
        moduleContent = await prisma.moduleResource.findUnique({
            where: { id: parseInt(id) } 
        });
    } else if (type === 'assignment') {
        moduleContent = await prisma.moduleAssignment.findUnique({
            where: { id: parseInt(id) } 
        });
    } else if (type === 'quiz') {
        moduleContent = await prisma.moduleQuiz.findUnique({
            where: { id: parseInt(id) } 
        });
    }
    return moduleContent;
}

const deleteSection = async (sectionId) => {
    // Xoá section cùng với các module bên trong (theo cascade)
    await prisma.courseSection.delete({
        where: { id: parseInt(sectionId) }
    });
};

const deleteModule = async (moduleId, type) => {
    try {
        const contentId = await prisma.courseModule.findUnique({
            where: { id: parseInt(moduleId)},
            select: { contentId: true, },
        });
        await prisma.courseModule.delete({
            where: { id: parseInt(moduleId) }
        });
        console.log("contentId: ", contentId);
        if (type === 'resource_url' || type === 'resource_file') {
            await prisma.moduleResource.delete({
                where: { id: parseInt(contentId) }
            });
        } else if (type === 'assignment') {
            await prisma.moduleAssignment.delete({
                where: { id: parseInt(contentId) }
            });
        } else if (type === 'quiz') {
            await prisma.moduleQuiz.delete({
                where: { id: parseInt(contentId) }
            });
        }
    } catch (error) {
        throw new Error('Lỗi khi xoá bài học: ' + error.message);
    }
};

module.exports = {
    createCourse,
    getTeachingCourses,
    getCourseById,
    createSection, 
    createModule, 
    getModuleById,
    deleteSection, 
    deleteModule,
};