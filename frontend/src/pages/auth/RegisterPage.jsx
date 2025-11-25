import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axiosClient'; // Import client đã cấu hình interceptor

const RegisterPage = () => {
    const navigate = useNavigate();
    
    // State lưu dữ liệu form
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    // State hiển thị lỗi hoặc loading
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Xử lý thay đổi input
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Xóa lỗi khi người dùng bắt đầu gõ lại
        if (error) setError('');
    };

    // Xử lý submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // 1. Validation cơ bản phía Client
        if (formData.password !== formData.confirmPassword) {
            setError("Mật khẩu xác nhận không khớp!");
            return;
        }

        setLoading(true);

        try {
            // 2. Gọi API
            // Do trong axiosClient ta đã cấu hình interceptor trả về response.data
            // nên biến 'data' ở đây chính là cục JSON server trả về: { message: "Đăng ký thành công" }
            const data = await api.post('/auth/register', {
                username: formData.username,
                email: formData.email,
                password: formData.password
            });

            // 3. Dùng dữ liệu Server trả về để thông báo (Thay vì hardcode)
            // Lấy message từ Backend hoặc dùng câu mặc định
            alert(data.message || "Đăng ký thành công! Vui lòng đăng nhập.");
            
            navigate('/login');

        } catch (err) {
            // Xử lý lỗi
            const errorMsg = err.response?.data?.message || "Đăng ký thất bại.";
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Đăng ký Học viên</h2>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Username */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Tên đăng nhập</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ví dụ: nguyenvanan"
                        />
                    </div>

                    {/* Email */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="email@example.com"
                        />
                    </div>

                    {/* Password */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Mật khẩu</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="********"
                        />
                    </div>

                    {/* Confirm Password */}
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Xác nhận mật khẩu</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nhập lại mật khẩu"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {loading ? 'Đang xử lý...' : 'Đăng ký ngay'}
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-600">
                    Đã có tài khoản?{' '}
                    <Link to="/login" className="text-blue-600 hover:underline">
                        Đăng nhập
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;