import axiosClient from './axiosClient';

const authApi = {
    register: (data) => {
        // data: { username, email, password, role }
        return axiosClient.post('/auth/register', data);
    },
    login: (data) => {
        // data: { username, password }
        return axiosClient.post('/auth/login', data);
    },
    getMe: () => {
        // Lấy thông tin user hiện tại dựa trên token
        return axiosClient.get('/auth/me');
    },
    registerTenant: (data) => {
        const url = '/auth/register-tenant';
        return axiosClient.post(url, data);
    },
    findSchool: (schoolName) => {    
        return axiosClient.post('/auth/find-school', { schoolName });
    },
};

export default authApi;