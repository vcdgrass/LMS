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
};

export default coursesApi;