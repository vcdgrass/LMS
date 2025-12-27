import axiosClient from "./axiosClient";

const userApi = {
    getAllStudents: () => {
        return axiosClient.get('/users/students');
    }
};

export default userApi;