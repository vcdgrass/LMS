import axiosClient from './axiosClient';

const coursesApi = {
    getTeachingCourses: () => {
        return axiosClient.get('/courses/teaching');
    },
    createCourses: (data) => {
        return axiosClient.post('/courses', data);
    }
};

export default coursesApi;