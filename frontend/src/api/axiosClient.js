import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:5000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor: Tự động đính kèm Token vào mỗi request nếu đã đăng nhập
axiosClient.interceptors.request.use(async (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default axiosClient;