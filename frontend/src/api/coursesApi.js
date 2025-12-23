import axiosClient from './axiosClient';

const coursesApi = {
    getTeachingCourses: () => {
        return axiosClient.get('/courses/teaching');
    },
    createCourses: (data) => {
        return axiosClient.post('/courses', data);
    },
    getById: (id) => {
        return axiosClient.get(`/courses/${id}`);
    },
    // Thêm Section mới
    createSection: (courseId, title) => {
        return axiosClient.post(`/courses/${courseId}/sections`, { title });
    },
    // Thêm Module mới
    createModule: (sectionId, data) => {
        // data: { title, moduleType: 'resource_url' | 'assignment' | ... }
        return axiosClient.post(`/courses/sections/${sectionId}/modules`, data);
    },
    deleteSection: (sectionId) => {
        return axiosClient.delete(`/courses/sections/${sectionId}`);
    },
    getModuleById: (moduleId, type) => {
        return axiosClient.get(`/courses/modules/${moduleId}`, {
            params: { type }
        });
    },
    deleteModule: (moduleId, type) => {
        return axiosClient.delete(`/courses/modules/${moduleId}`, {
            params: { type }
        });
    },
    submitAssignment: (assignmentId, file) => {
        const formData = new FormData();
        formData.append('file', file); // Key 'file' phải khớp với backend upload.single('file')

        return axiosClient.post(`/courses/assignments/${assignmentId}/submit`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    getEnrolledCourses: () => {
        return axiosClient.get(`/courses/my-courses`);
    },
    getStudents: (courseId) => {
        return axiosClient.get(`/courses/${courseId}/students`);
    },
    addStudent: (courseId, email) => {
        return axiosClient.post(`/courses/${courseId}/students`, { email });
    },
    removeStudent: (courseId, studentId) => {
        return axiosClient.delete(`/courses/${courseId}/students/${studentId}`);
    },
    getSubmissions: (moduleId) => {
        return axiosClient.get(`/courses/modules/${moduleId}/submissions`);
    },
    updateGrade: (moduleId, data) => {
        // data: { studentId, score, feedback }
        return axiosClient.post(`/courses/modules/${moduleId}/grade`, data);
    },
    submitQuiz: (moduleId, answers) => {
        return axiosClient.post(`/courses/modules/${moduleId}/quiz/submit`, { answers });
    },
};

export default coursesApi;