const { prisma } = require('../utils/db');

// [MỚI] Nhận thêm teacherId và schoolId từ Controller
const createCourse = async (courseData, teacherId, schoolId) => {
    
    // Validate teacherId
    if (!teacherId || isNaN(parseInt(teacherId))) {
        throw new Error('Cần có thông tin giáo viên (userId) để tạo khóa học.');
    }

    if (!schoolId) {
        throw new Error('Thiếu thông tin trường học (schoolId).');
    }

    // Tạo Course và Link TeacherCourse
    const newCourse = await prisma.course.create({
        data: {
            title: courseData.title,
            description: courseData.description,
            categoryId: parseInt(courseData.categoryId, 10),
            startDate: courseData.startDate ? new Date(courseData.startDate) : null,
            endDate: courseData.endDate ? new Date(courseData.endDate) : null,
            enrollmentKey: courseData.enrollmentKey || null,
            
            // [QUAN TRỌNG] Gắn khóa học vào trường
            schoolId: parseInt(schoolId),

            // Tạo luôn bản ghi trong bảng TeacherCourse
            teacherCourses: {
                create: {
                    userId: parseInt(teacherId)
                }
            }
        }
    });

    return newCourse;
}

// [MỚI] Nhận thêm schoolId để lọc
const getTeachingCourses = async (teacherId, schoolId) => {
    const courses = await prisma.course.findMany({
        where: {
            schoolId: parseInt(schoolId), // <--- Lọc theo trường
            teacherCourses: {
                some: {
                    userId: parseInt(teacherId)
                }
            }
        },
        include: {
            category: true,
            _count: {
                select: { enrollments: true }
            }
        }
    });
    return courses;
};

// [MỚI] Nhận thêm schoolId để bảo mật
const getCourseById = async (courseId, schoolId) => {
    const whereCondition = { id: parseInt(courseId) };
    
    // Nếu có schoolId truyền vào, thêm điều kiện lọc để tránh xem trộm trường khác
    if (schoolId) {
        whereCondition.schoolId = parseInt(schoolId);
    }

    const course = await prisma.course.findUnique({
        where: whereCondition, // findFirst sẽ an toàn hơn nếu dùng composite check, nhưng findUnique id là đủ nếu id là unique toàn cục.
        // Tuy nhiên, để chặt chẽ ta dùng findFirst bên dưới nếu muốn
        // Ở đây dùng findFirst cho chắc chắn:
    });
    
    // Để dùng được findUnique với schoolId, bạn phải có composite index. 
    // Tạm thời dùng findFirst để an toàn:
    const safeCourse = await prisma.course.findFirst({
        where: {
            id: parseInt(courseId),
            ...(schoolId && { schoolId: parseInt(schoolId) })
        },
        include: {
            category: true,
            sections: {
                orderBy: { orderIndex: 'asc' },
                include: {
                    modules: {
                        orderBy: { orderIndex: 'asc' }
                    }
                }
            },
            _count: {
                select: { enrollments: true }
            }
        }
    });

    return safeCourse;
};

const createSection = async (courseId, titleInput) => {
    const title = (typeof titleInput === 'object' && titleInput.title) 
        ? titleInput.title 
        : titleInput;
    const lastSection = await prisma.courseSection.findFirst({
        where: { courseId: parseInt(courseId) },
        orderBy: { orderIndex: 'desc' }
    });
    const newOrder = lastSection ? (lastSection.orderIndex || 0) + 1 : 0;

    return await prisma.courseSection.create({
        data: {
            courseId: parseInt(courseId),
            title: title, // Lưu ý: controller gửi { title: "..." } nên ở đây là title.title hoặc title tùy cách gọi
            // Ở controller bạn gọi: createSection(id, title) -> title là string
            // Nên ở đây data: { title: title } là đúng
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

  // Tạo content tương ứng với type
  if (moduleData.type === 'resource_url' || moduleData.type === 'resource_file') {
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
        description: moduleData.description || '',
        timeLimitMinutes: parseInt(moduleData.timeLimitMinutes) || null,
        gradePassing: moduleData.gradePassing || null,
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
  } else if (moduleData.type === 'flashcard') {
    content = await prisma.moduleFlashcard.create({
      data: {
        description: moduleData.description || '',
        flashcards: {
          create: moduleData.cards?.map((card, index) => ({
            frontText: card.frontText,
            backText: card.backText,
            orderIndex: index
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
    const commonQuery = { where: { id: parseInt(id) } };

    if (type === 'resource_url' || type === 'resource_file') {
        moduleContent = await prisma.moduleResource.findUnique(commonQuery);
    } else if (type === 'assignment') {
        moduleContent = await prisma.moduleAssignment.findUnique(commonQuery);
    } else if (type === 'quiz') {
        moduleContent = await prisma.moduleQuiz.findUnique({
            where: { id: parseInt(id) },
            include: {
                questions: {
                    orderBy: { orderIndex: 'asc' },
                    include: { options: true }
                }
            }
        });
    } else if (type === 'flashcard') {
        moduleContent = await prisma.moduleFlashcard.findUnique({
            where: { id: parseInt(id) },
            include: {
                flashcards: { orderBy: { orderIndex: 'asc' } }
            }
        });
    }
    return moduleContent;
}

const deleteSection = async (sectionId) => {
    await prisma.courseSection.delete({ where: { id: parseInt(sectionId) } });
};

const deleteModule = async (moduleId, type) => {
    try {
        const moduleRecord = await prisma.courseModule.findUnique({
            where: { id: parseInt(moduleId) },
            select: { contentId: true },
        });

        if (!moduleRecord) throw new Error("Bài học không tồn tại.");
        const { contentId } = moduleRecord;

        // Xoá CourseModule trước
        await prisma.courseModule.delete({ where: { id: parseInt(moduleId) } });

        // Xoá nội dung tương ứng
        if (contentId) {
            if (type === 'resource_url' || type === 'resource_file') {
                await prisma.moduleResource.delete({ where: { id: parseInt(contentId) } });
            } else if (type === 'assignment') {
                await prisma.moduleAssignment.delete({ where: { id: parseInt(contentId) } });
            } else if (type === 'quiz') {
                await prisma.moduleQuiz.delete({ where: { id: parseInt(contentId) } });
            } else if (type === 'flashcard') {
                await prisma.moduleFlashcard.delete({ where: { id: parseInt(contentId) } });
            }
        }
    } catch (error) {
        console.error("Delete Module Error:", error);
        throw new Error('Lỗi khi xoá bài học: ' + error.message);
    }
};

const submitAssignment = async (userId, assignmentId, file) => {
    const assignment = await prisma.moduleAssignment.findUnique({
        where: { id: parseInt(assignmentId) }
    });

    if (!assignment) throw new Error("Bài tập không tồn tại.");

    let isLate = false;
    if (assignment.dueDate && new Date() > new Date(assignment.dueDate)) {
        isLate = true;
    }

    return await prisma.assignmentSubmission.create({
        data: {
            assignmentId: parseInt(assignmentId),
            userId: parseInt(userId),
            filePath: file.path,
            submittedAt: new Date(),
            isLate: isLate
        }
    });
};

// [MỚI] Nhận schoolId để lọc
const getEnrolledCourses = async (studentId, schoolId) => {
    const id = parseInt(studentId);
    if (isNaN(id)) throw new Error("Student ID không hợp lệ.");

    return await prisma.course.findMany({
        where: {
            schoolId: parseInt(schoolId), // <--- Lọc theo trường
            enrollments: {
                some: {
                    userId: id
                }
            }
        },
        include: {
            category: true,
            teacherCourses: {
                include: {
                    user: { select: { username: true, email: true } }
                }
            },
            _count: {
                select: { sections: true }
            }
        }
    });
};

const getStudentsInCourse = async (courseId) => {
    return await prisma.enrollment.findMany({
        where: {
            courseId: parseInt(courseId),
            role: 'student'
        },
        include: {
            user: {
                select: { id: true, username: true, email: true, isLocked: true }
            }
        }
    });
};

// [MỚI] Thêm check schoolId khi add student
const addStudentToCourse = async (courseId, email, schoolId) => {
    // 1. Tìm user theo email VÀ trong cùng trường
    const student = await prisma.user.findFirst({
        where: { 
            email: email,
            ...(schoolId && { schoolId: parseInt(schoolId) }) // Đảm bảo chỉ add HS trường mình
        }
    });

    if (!student) {
        throw new Error("Không tìm thấy học viên với email này trong trường.");
    }

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

    return await prisma.enrollment.create({
        data: {
            userId: student.id,
            courseId: parseInt(courseId),
            role: 'student'
        }
    });
};

const removeStudentFromCourse = async (courseId, studentId) => {
    return await prisma.enrollment.deleteMany({
        where: {
            userId: parseInt(studentId),
            courseId: parseInt(courseId)
        }
    });
};

const getSubmissionsByModule = async (moduleId) => {
    const moduleInfo = await prisma.courseModule.findUnique({
        where: { id: parseInt(moduleId) },
        include: { section: true }
    });

    if (!moduleInfo) throw new Error("Module không tồn tại.");

    const enrollments = await prisma.enrollment.findMany({
        where: {
            courseId: moduleInfo.section.courseId,
            role: 'student'
        },
        include: {
            user: { select: { id: true, username: true, email: true } }
        }
    });

    const grades = await prisma.grade.findMany({
        where: { moduleId: parseInt(moduleId) }
    });

    let submissions = [];
    if (moduleInfo.moduleType === 'assignment') {
        submissions = await prisma.assignmentSubmission.findMany({
            where: { assignmentId: moduleInfo.contentId }
        });
    } 

    const result = enrollments.map(enrollment => {
        const student = enrollment.user;
        const gradeRecord = grades.find(g => g.userId === student.id);
        const submissionRecord = submissions.find(s => s.userId === student.id);

        return {
            student: student,
            score: gradeRecord ? gradeRecord.score : null,
            feedback: gradeRecord ? gradeRecord.feedback : null,
            submittedAt: submissionRecord ? submissionRecord.submittedAt : null,
            gradedAt: gradeRecord ? gradeRecord.gradedAt : null,
            filePath: submissionRecord ? submissionRecord.filePath : null,
            isLate: submissionRecord ? submissionRecord.isLate : false
        };
    });

    return result;   
};

const updateGrade = async (graderId, moduleId, studentId, score, feedback) => {
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
    const courseModule = await prisma.courseModule.findUnique({
        where: { id: parseInt(moduleId) },
        include: { section: true }
    });

    if (!courseModule || courseModule.moduleType !== 'quiz') {
        throw new Error("Module không tồn tại hoặc không phải là Quiz");
    }

    const quiz = await prisma.moduleQuiz.findUnique({
        where: { id: courseModule.contentId },
        include: { questions: { include: { options: true } } }
    });

    if (!quiz) throw new Error("Không tìm thấy dữ liệu câu hỏi");

    let totalScore = 0;
    const attemptAnswersData = [];

    quiz.questions.forEach(q => {
        const userOptionId = answers[q.id];
        const correctOption = q.options.find(opt => opt.isCorrect);

        if (userOptionId && correctOption && parseInt(userOptionId) === correctOption.id) {
            totalScore += (q.points || 0);
        }

        if (userOptionId) {
            attemptAnswersData.push({
                questionId: q.id,
                selectedOptionId: parseInt(userOptionId)
            });
        }
    });

    return await prisma.$transaction(async (tx) => {
        const attempt = await tx.quizAttempt.create({
            data: {
                quizId: quiz.id,
                userId: userId,
                score: totalScore,
                startedAt: new Date(),
                completedAt: new Date(),
                answers: {
                    create: attemptAnswersData
                }
            }
        });

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
                graderId: null
            },
            create: {
                userId: userId,
                moduleId: parseInt(moduleId),
                courseId: courseModule.section.courseId,
                score: totalScore,
                gradedAt: new Date(),
                graderId: null
            }
        });

        return attempt;
    });
};

const getQuizLeaderboard = async (moduleId) => {
    return await prisma.grade.findMany({
        where: { moduleId: parseInt(moduleId) },
        include: {
            user: { select: { id: true, username: true } }
        },
        orderBy: [
            { score: 'desc' },
            { gradedAt: 'asc' }
        ],
        take: 20
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
    getQuizLeaderboard,
};