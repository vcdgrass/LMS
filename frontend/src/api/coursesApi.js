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
};

export default coursesApi;