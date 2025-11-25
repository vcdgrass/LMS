import React, { createContext, useState, useEffect, useContext } from 'react';
import authApi from '../api/authApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Lưu thông tin user (id, role, name)
    const [loading, setLoading] = useState(true);

    // Check đăng nhập khi F5 lại trang
    useEffect(() => {
        const checkLogin = async () => {
            const token = localStorage.getItem('access_token');
            if (token) {
                try {
                    const response = await authApi.getMe();
                    setUser(response.data);
                } catch (error) {
                    console.error("Token hết hạn hoặc lỗi:", error);
                    logout();
                }
            }
            setLoading(false);
        };
        checkLogin();
    }, []);

    const login = async (username, password) => {
        try {
            const res = await authApi.login({ username, password });
            // Giả sử server trả về: { token: '...', user: { ... } }
            localStorage.setItem('access_token', res.data.token);
            setUser(res.data.user);
            return { success: true, role: res.data.user.role };
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.message  || "Lỗi đăng nhập" 
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// Hook custom để dùng nhanh ở các component khác
export const useAuth = () => useContext(AuthContext);