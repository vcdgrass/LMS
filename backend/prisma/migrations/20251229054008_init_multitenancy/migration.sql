-- CreateEnum
CREATE TYPE "role_type" AS ENUM ('teacher', 'student');

-- CreateEnum
CREATE TYPE "module_type" AS ENUM ('assignment', 'quiz', 'resource_file', 'resource_url', 'page', 'flashcard');

-- CreateEnum
CREATE TYPE "question_type" AS ENUM ('multiple_choice', 'true_false');

-- CreateTable
CREATE TABLE "School" (
    "id_school" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(50) NOT NULL,
    "logo_url" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "School_pkey" PRIMARY KEY ("id_school")
);

-- CreateTable
CREATE TABLE "User" (
    "id_user" SERIAL NOT NULL,
    "school_id" INTEGER,
    "username" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" VARCHAR(50),
    "is_locked" BOOLEAN DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "CourseCategory" (
    "id_category" SERIAL NOT NULL,
    "school_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "parent_id" INTEGER,

    CONSTRAINT "CourseCategory_pkey" PRIMARY KEY ("id_category")
);

-- CreateTable
CREATE TABLE "Course" (
    "id_course" SERIAL NOT NULL,
    "school_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "start_date" DATE,
    "end_date" DATE,
    "enrollment_key" VARCHAR(50),

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id_course")
);

-- CreateTable
CREATE TABLE "Teacher_Course" (
    "id_teacher_course" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,

    CONSTRAINT "Teacher_Course_pkey" PRIMARY KEY ("id_teacher_course")
);

-- CreateTable
CREATE TABLE "Enrollment" (
    "id_enrollment" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "role" "role_type" NOT NULL,

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id_enrollment")
);

-- CreateTable
CREATE TABLE "CourseSection" (
    "id_section" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "order_index" INTEGER DEFAULT 0,

    CONSTRAINT "CourseSection_pkey" PRIMARY KEY ("id_section")
);

-- CreateTable
CREATE TABLE "CourseModule" (
    "id_module" SERIAL NOT NULL,
    "section_id" INTEGER NOT NULL,
    "module_type" "module_type" NOT NULL,
    "content_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "order_index" INTEGER DEFAULT 0,

    CONSTRAINT "CourseModule_pkey" PRIMARY KEY ("id_module")
);

-- CreateTable
CREATE TABLE "Module_Assignment" (
    "id_assignment" SERIAL NOT NULL,
    "description" TEXT,
    "due_date" TIMESTAMPTZ(6),

    CONSTRAINT "Module_Assignment_pkey" PRIMARY KEY ("id_assignment")
);

-- CreateTable
CREATE TABLE "Module_Quiz" (
    "id_quiz" SERIAL NOT NULL,
    "description" TEXT,
    "time_limit_minutes" INTEGER,
    "grade_passing" DECIMAL(5,2),

    CONSTRAINT "Module_Quiz_pkey" PRIMARY KEY ("id_quiz")
);

-- CreateTable
CREATE TABLE "Module_Flashcard" (
    "id_flashcard" SERIAL NOT NULL,
    "description" TEXT,

    CONSTRAINT "Module_Flashcard_pkey" PRIMARY KEY ("id_flashcard")
);

-- CreateTable
CREATE TABLE "Flashcard" (
    "id_card" SERIAL NOT NULL,
    "flashcard_id" INTEGER NOT NULL,
    "front_text" TEXT NOT NULL,
    "back_text" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "front_image" TEXT,
    "back_image" TEXT,

    CONSTRAINT "Flashcard_pkey" PRIMARY KEY ("id_card")
);

-- CreateTable
CREATE TABLE "Module_Resource" (
    "id_resource" SERIAL NOT NULL,
    "description" TEXT,
    "file_path_or_url" TEXT NOT NULL,

    CONSTRAINT "Module_Resource_pkey" PRIMARY KEY ("id_resource")
);

-- CreateTable
CREATE TABLE "Assignment_Submission" (
    "id_submission" SERIAL NOT NULL,
    "assignment_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "submitted_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "file_path" TEXT,
    "is_late" BOOLEAN DEFAULT false,
    "grade" DECIMAL(5,2),
    "feedback" TEXT,

    CONSTRAINT "Assignment_Submission_pkey" PRIMARY KEY ("id_submission")
);

-- CreateTable
CREATE TABLE "Quiz_Question" (
    "id_question" SERIAL NOT NULL,
    "quiz_id" INTEGER NOT NULL,
    "question_text" TEXT NOT NULL,
    "type" "question_type" NOT NULL DEFAULT 'multiple_choice',
    "image_url" TEXT,
    "time_limit" INTEGER NOT NULL DEFAULT 20,
    "points" INTEGER NOT NULL DEFAULT 1000,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Quiz_Question_pkey" PRIMARY KEY ("id_question")
);

-- CreateTable
CREATE TABLE "Question_Option" (
    "id_option" SERIAL NOT NULL,
    "question_id" INTEGER NOT NULL,
    "option_text" TEXT NOT NULL,
    "is_correct" BOOLEAN DEFAULT false,

    CONSTRAINT "Question_Option_pkey" PRIMARY KEY ("id_option")
);

-- CreateTable
CREATE TABLE "Quiz_Attempt" (
    "id_attempt" SERIAL NOT NULL,
    "quiz_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "started_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ(6),
    "score" DECIMAL(10,2),

    CONSTRAINT "Quiz_Attempt_pkey" PRIMARY KEY ("id_attempt")
);

-- CreateTable
CREATE TABLE "Attempt_Answer" (
    "id_answer" SERIAL NOT NULL,
    "attempt_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "selected_option_id" INTEGER,

    CONSTRAINT "Attempt_Answer_pkey" PRIMARY KEY ("id_answer")
);

-- CreateTable
CREATE TABLE "Grade" (
    "id_grade" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "module_id" INTEGER NOT NULL,
    "score" DECIMAL(10,2),
    "feedback" TEXT,
    "grader_id" INTEGER,
    "graded_at" TIMESTAMPTZ(6),

    CONSTRAINT "Grade_pkey" PRIMARY KEY ("id_grade")
);

-- CreateTable
CREATE TABLE "Module_Completion" (
    "id_completion" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "module_id" INTEGER NOT NULL,
    "completed_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Module_Completion_pkey" PRIMARY KEY ("id_completion")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id_notification" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "url_target" VARCHAR(255),
    "is_read" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id_notification")
);

-- CreateIndex
CREATE UNIQUE INDEX "School_slug_key" ON "School"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_school_id_key" ON "User"("username", "school_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_school_id_key" ON "User"("email", "school_id");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_Course_user_id_course_id_key" ON "Teacher_Course"("user_id", "course_id");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_user_id_course_id_key" ON "Enrollment"("user_id", "course_id");

-- CreateIndex
CREATE UNIQUE INDEX "Grade_user_id_module_id_key" ON "Grade"("user_id", "module_id");

-- CreateIndex
CREATE UNIQUE INDEX "Module_Completion_user_id_module_id_key" ON "Module_Completion"("user_id", "module_id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id_school") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseCategory" ADD CONSTRAINT "CourseCategory_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "CourseCategory"("id_category") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseCategory" ADD CONSTRAINT "CourseCategory_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id_school") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id_school") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "CourseCategory"("id_category") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teacher_Course" ADD CONSTRAINT "Teacher_Course_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teacher_Course" ADD CONSTRAINT "Teacher_Course_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id_course") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id_course") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseSection" ADD CONSTRAINT "CourseSection_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id_course") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseModule" ADD CONSTRAINT "CourseModule_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "CourseSection"("id_section") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flashcard" ADD CONSTRAINT "Flashcard_flashcard_id_fkey" FOREIGN KEY ("flashcard_id") REFERENCES "Module_Flashcard"("id_flashcard") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment_Submission" ADD CONSTRAINT "Assignment_Submission_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "Module_Assignment"("id_assignment") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment_Submission" ADD CONSTRAINT "Assignment_Submission_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz_Question" ADD CONSTRAINT "Quiz_Question_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "Module_Quiz"("id_quiz") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question_Option" ADD CONSTRAINT "Question_Option_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "Quiz_Question"("id_question") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz_Attempt" ADD CONSTRAINT "Quiz_Attempt_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "Module_Quiz"("id_quiz") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz_Attempt" ADD CONSTRAINT "Quiz_Attempt_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt_Answer" ADD CONSTRAINT "Attempt_Answer_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "Quiz_Attempt"("id_attempt") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt_Answer" ADD CONSTRAINT "Attempt_Answer_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "Quiz_Question"("id_question") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt_Answer" ADD CONSTRAINT "Attempt_Answer_selected_option_id_fkey" FOREIGN KEY ("selected_option_id") REFERENCES "Question_Option"("id_option") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id_course") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_grader_id_fkey" FOREIGN KEY ("grader_id") REFERENCES "User"("id_user") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "CourseModule"("id_module") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Module_Completion" ADD CONSTRAINT "Module_Completion_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "CourseModule"("id_module") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Module_Completion" ADD CONSTRAINT "Module_Completion_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;
