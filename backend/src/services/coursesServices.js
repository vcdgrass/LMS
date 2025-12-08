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
};

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

const submitAssignment = async (userId, assignmentId, file) => {
    // 1. Kiểm tra assignment có tồn tại không
    const assignment = await prisma.moduleAssignment.findUnique({
        where: { id: parseInt(assignmentId) }
    });

    if (!assignment) {
        throw new Error("Bài tập không tồn tại.");
    }

    // 2. Tính toán nộp muộn (isLate)
    let isLate = false;
    if (assignment.dueDate && new Date() > new Date(assignment.dueDate)) {
        isLate = true;
    }

    // 3. Tạo record Submission
    // Lưu ý: userId lấy từ token, assignmentId lấy từ params
    const submission = await prisma.assignmentSubmission.create({
        data: {
            assignmentId: parseInt(assignmentId),
            userId: parseInt(userId),
            filePath: file.path, // Đường dẫn file đã lưu trên server
            submittedAt: new Date(),
            isLate: isLate
        }
    });

    return submission;
};

const getEnrolledCourses = async (studentId) => {
    const id = parseInt(studentId);
    if (isNaN(id)) {
        throw new Error("Student ID không hợp lệ.");
    }
    return await prisma.course.findMany({
        where: {
            enrollments: {
                some: {
                    userId: parseInt(studentId)
                }
            }
        },
        include: {
            category: true,
            // Lấy thông tin giảng viên để hiển thị
            teacherCourses: {
                include: {
                    user: {
                        select: { username: true, email: true }
                    }
                }
            },
            // Đếm số bài học để tính tiến độ (cơ bản)
            _count: {
                select: { 
                    sections: true // Hoặc query sâu hơn để đếm modules
                }
            }
        }
    });
};

// Lấy danh sách học sinh trong khóa học
const getStudentsInCourse = async (courseId) => {
    return await prisma.enrollment.findMany({
        where: {
            courseId: parseInt(courseId),
            role: 'student' // Chỉ lấy role student
        },
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                    email: true,
                    isLocked: true
                }
            }
        }
    });
};

// Thêm học sinh vào khóa học bằng Email
const addStudentToCourse = async (courseId, email) => {
    // 1. Tìm user theo email
    const student = await prisma.user.findUnique({
        where: { email: email }
    });

    if (!student) {
        throw new Error("Không tìm thấy người dùng với email này.");
    }

    // 2. Kiểm tra xem đã tham gia chưa
    const existingEnrollment = await prisma.enrollment.findUnique({
        where: {
            userId_courseId: {
                userId: student.id,
                courseId: parseInt(courseId)
            }
        }
    });

    if (existingEnrollment) {
        throw new Error("Học viên này đã tham gia khóa học.");
    }

    // 3. Tạo enrollment
    return await prisma.enrollment.create({
        data: {
            userId: student.id,
            courseId: parseInt(courseId),
            role: 'student'
        }
    });
};

// Xóa học sinh khỏi khóa học
const removeStudentFromCourse = async (courseId, studentId) => {
    return await prisma.enrollment.deleteMany({
        where: {
            userId: parseInt(studentId),
            courseId: parseInt(courseId)
        }
    });
};

// Lấy danh sách bài nộp và điểm của một Module (Assignment)
const getSubmissionsByModule = async (moduleId) => {
    // 1. Lấy thông tin module để biết assignmentId (contentId)
    const module = await prisma.courseModule.findUnique({
        where: { id: parseInt(moduleId) }
    });

    if (!module || module.moduleType !== 'assignment') {
        throw new Error("Module không hợp lệ hoặc không phải bài tập.");
    }

    // 2. Lấy danh sách học viên trong khóa học này
    // Cần lấy courseId từ module -> section -> course để query enrollment (hoặc query ngược)
    // Cách nhanh: Lấy tất cả user đã nộp bài HOẶC đã được chấm điểm
    
    // Ở đây ta lấy danh sách Submissions kèm theo thông tin User và Grade (nếu có)
    const submissions = await prisma.assignmentSubmission.findMany({
        where: {
            assignmentId: module.contentId
        },
        include: {
            user: {
                select: { id: true, username: true, email: true }
            }
        }
    });

    // Lấy bảng điểm riêng cho module này (vì có thể có user chưa nộp nhưng đã bị chấm 0 điểm)
    const grades = await prisma.grade.findMany({
        where: { moduleId: parseInt(moduleId) }
    });

    // Merge data: Submission + Grade
    // Trả về danh sách submission, map thêm điểm vào
    const result = submissions.map(sub => {
        const grade = grades.find(g => g.userId === sub.userId);
        return {
            ...sub,
            score: grade ? grade.score : null,
            feedback: grade ? grade.feedback : null
        };
    });

    return result;
};

// Chấm điểm (Tạo mới hoặc Cập nhật)
const updateGrade = async (graderId, moduleId, studentId, score, feedback) => {
    // Tìm module để lấy courseId (cần cho bảng Grade)
    const moduleInfo = await prisma.courseModule.findUnique({
        where: { id: parseInt(moduleId) },
        include: { section: true }
    });

    if (!moduleInfo) throw new Error("Module không tồn tại");

    return await prisma.grade.upsert({
        where: {
            userId_moduleId: {
                userId: parseInt(studentId),
                moduleId: parseInt(moduleId)
            }
        },
        update: {
            score: parseFloat(score),
            feedback: feedback,
            graderId: parseInt(graderId),
            gradedAt: new Date()
        },
        create: {
            courseId: moduleInfo.section.courseId,
            moduleId: parseInt(moduleId),
            userId: parseInt(studentId),
            score: parseFloat(score),
            feedback: feedback,
            graderId: parseInt(graderId),
            gradedAt: new Date()
        }
    });
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
    submitAssignment,
    getEnrolledCourses,
    getStudentsInCourse,
    addStudentToCourse,
    removeStudentFromCourse,
    getSubmissionsByModule,
    updateGrade,
};