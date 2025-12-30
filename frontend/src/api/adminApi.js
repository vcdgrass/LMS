// frontend/src/api/adminApi.js
import axiosClient from "./axiosClient";

const adminApi = {
    getStats: () => {
        return axiosClient.get('/admin/stats');
    }
};

export default adminApi;