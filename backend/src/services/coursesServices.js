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
    // moduleData.questions là mảng câu hỏi từ Frontend gửi lên
    content = await prisma.moduleQuiz.create({
      data: {
        description: moduleData.description || '',
        timeLimitMinutes: parseInt(moduleData.timeLimitMinutes) || null,
        gradePassing: moduleData.gradePassing || null,
        // Tạo luôn câu hỏi và đáp án lồng nhau
        questions: {
          create: moduleData.questions?.map((q, index) => ({
              questionText: q.questionText,
              type: q.type || 'multiple_choice',
              timeLimit: q.timeLimit || 20,
              points: q.points || 1000,
              orderIndex: index,
              options: {
                create: q.options.map(opt => ({
                  optionText: opt.optionText,
                  isCorrect: opt.isCorrect
                }))
              }
          }))
        }
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
        // include để lấy questions và options
        moduleContent = await prisma.moduleQuiz.findUnique({
            where: { id: parseInt(id) },
            include: {
                questions: {
                    orderBy: { orderIndex: 'asc' }, // Sắp xếp theo thứ tự
                    include: {
                        options: true // Lấy danh sách đáp án
                    }
                }
            }
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
        // 1. Tìm module để lấy contentId TRƯỚC KHI XÓA
        const moduleRecord = await prisma.courseModule.findUnique({
            where: { id: parseInt(moduleId) },
            select: { contentId: true },
        });

        if (!moduleRecord) {
            throw new Error("Bài học không tồn tại.");
        }

        const { contentId } = moduleRecord; // Lấy giá trị ID ra khỏi object

        // 2. Xoá CourseModule trước
        await prisma.courseModule.delete({
            where: { id: parseInt(moduleId) }
        });

        // 3. Xoá nội dung tương ứng (Resource/Assignment/Quiz)
        // Kiểm tra nếu có contentId hợp lệ
        if (contentId) {
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
        }
    } catch (error) {
        // Log lỗi chi tiết để debug nếu cần
        console.error("Delete Module Error Detail:", error);
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
    // 1. Lấy thông tin Module
    const moduleInfo = await prisma.courseModule.findUnique({
        where: { id: parseInt(moduleId) },
        include: { section: true }
    });

    if (!moduleInfo) throw new Error("Module không tồn tại.");

    // 2. Lấy tất cả học viên trong khóa học (để hiện cả người chưa nộp)
    const enrollments = await prisma.enrollment.findMany({
        where: {
            courseId: moduleInfo.section.courseId,
            role: 'student'
        },
        include: {
            user: { select: { id: true, username: true, email: true } }
        }
    });

    // 3. Lấy bảng điểm (Grade) của module này
    const grades = await prisma.grade.findMany({
        where: { moduleId: parseInt(moduleId) }
    });

    // 4. Lấy dữ liệu nộp bài (Nếu là Assignment)
    let submissions = [];
    if (moduleInfo.moduleType === 'assignment') {
        submissions = await prisma.assignmentSubmission.findMany({
            where: { assignmentId: moduleInfo.contentId }
        });
    } 
    // Nếu là Quiz, ta có thể lấy QuizAttempt để biết thời gian làm, nhưng Grade là đủ để hiện điểm

    // 5. Gộp dữ liệu (Map Students + Grade + Submission)
    const result = enrollments.map(enrollment => {
        const student = enrollment.user;
        const gradeRecord = grades.find(g => g.userId === student.id);
        const submissionRecord = submissions.find(s => s.userId === student.id);

        return {
            student: student, // Thông tin HS
            score: gradeRecord ? gradeRecord.score : null, // Điểm
            feedback: gradeRecord ? gradeRecord.feedback : null, // Nhận xét
            submittedAt: submissionRecord ? submissionRecord.submittedAt : null, // Thời gian nộp (Assignment)
            gradedAt: gradeRecord ? gradeRecord.gradedAt : null, // Thời gian chấm
            filePath: submissionRecord ? submissionRecord.filePath : null, // File (nếu có)
            isLate: submissionRecord ? submissionRecord.isLate : false
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

const submitQuiz = async (userId, moduleId, answers) => {
    // 1. Lấy thông tin Module để biết contentId (ID của Quiz) và CourseId
    const courseModule = await prisma.courseModule.findUnique({
        where: { id: parseInt(moduleId) },
        include: { section: true } // Để lấy courseId
    });

    if (!courseModule || courseModule.moduleType !== 'quiz') {
        throw new Error("Module không tồn tại hoặc không phải là Quiz");
    }

    // 2. Lấy chi tiết bài Quiz và đáp án đúng
    const quiz = await prisma.moduleQuiz.findUnique({
        where: { id: courseModule.contentId },
        include: { 
            questions: { 
                include: { options: true } 
            } 
        }
    });

    if (!quiz) throw new Error("Không tìm thấy dữ liệu câu hỏi");

    // 3. Tính điểm (Logic phía Server để bảo mật)
    let totalScore = 0;
    let maxScore = 0;
    const attemptAnswersData = [];

    quiz.questions.forEach(q => {
        const userOptionId = answers[q.id]; // ID đáp án user chọn gửi lên
        const correctOption = q.options.find(opt => opt.isCorrect);
        
        // Cộng điểm tối đa (nếu cần tính %)
        maxScore += (q.points || 0);

        // Kiểm tra đúng/sai
        if (userOptionId && correctOption && parseInt(userOptionId) === correctOption.id) {
            totalScore += (q.points || 0);
        }

        // Tạo dữ liệu lưu chi tiết câu trả lời
        if (userOptionId) {
            attemptAnswersData.push({
                questionId: q.id,
                selectedOptionId: parseInt(userOptionId)
            });
        }
    });

    // 4. Sử dụng Transaction để đảm bảo toàn vẹn dữ liệu
    return await prisma.$transaction(async (tx) => {
        // 4.1. Lưu lượt làm bài vào QuizAttempt
        const attempt = await tx.quizAttempt.create({
            data: {
                quizId: quiz.id,
                userId: userId,
                score: totalScore,
                startedAt: new Date(), // Giả sử bắt đầu lúc nộp (hoặc bạn có thể truyền từ client)
                completedAt: new Date(),
                answers: {
                    create: attemptAnswersData
                }
            }
        });

        // 4.2. Lưu/Cập nhật điểm vào bảng Grade (Để Teacher xem được)
        // Logic: Luôn lấy điểm cao nhất hoặc điểm mới nhất tùy bạn (Ở đây mình để cập nhật điểm mới nhất)
        
        // Kiểm tra xem đã có điểm chưa
        const existingGrade = await tx.grade.findUnique({
            where: {
                userId_moduleId: {
                    userId: userId,
                    moduleId: parseInt(moduleId)
                }
            }
        });

        // Nếu chưa có hoặc muốn ghi đè điểm
        await tx.grade.upsert({
            where: {
                userId_moduleId: {
                    userId: userId,
                    moduleId: parseInt(moduleId)
                }
            },
            update: {
                score: totalScore,
                gradedAt: new Date(),
                graderId: null // Hệ thống tự chấm
            },
            create: {
                userId: userId,
                moduleId: parseInt(moduleId),
                courseId: courseModule.section.courseId, // Quan trọng: Để biết điểm này thuộc khóa nào
                score: totalScore,
                gradedAt: new Date(),
                graderId: null
            }
        });

        return attempt;
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
    submitQuiz,
};