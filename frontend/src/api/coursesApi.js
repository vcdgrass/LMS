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
    createSection: (courseId, data) => {
        return axiosClient.post(`/courses/${courseId}/sections`, data);
    },
    createModule: (sectionId, data) => {
        // data: { title, url, type: 'resource_url' }
        return axiosClient.post(`/courses/sections/${sectionId}/modules`, data);
    },
};

export default coursesApi;