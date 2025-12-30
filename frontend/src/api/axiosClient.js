import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:5000', // Đảm bảo port đúng với backend
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor: Tự động đính kèm Token và School Slug vào mỗi request
axiosClient.interceptors.request.use(async (config) => {
    const token = localStorage.getItem('access_token');
    const schoolSlug = localStorage.getItem('current_school_slug'); // <--- MỚI

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // Gửi kèm Slug trường để Backend biết đang thao tác ở trường nào
    if (schoolSlug) {
        config.headers['x-school-slug'] = encodeURIComponent(schoolSlug);
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

export default axiosClient;