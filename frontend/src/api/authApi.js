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
    }
};

export default authApi;