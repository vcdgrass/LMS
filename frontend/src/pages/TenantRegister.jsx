import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authApi from '../api/authApi'; // Import API vừa sửa ở bước 1
// Nếu bạn chưa sửa bước 1, hãy import axiosClient và dùng trực tiếp: import axiosClient from '../api/axiosClient';

const TenantRegister = () => {
    const navigate = useNavigate();
    
    // State lưu dữ liệu form
    const [formData, setFormData] = useState({
        schoolName: '',
        schoolSlug: '',
        username: '',
        email: '',
        password: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Hàm xử lý thay đổi input
    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Nếu đang nhập tên trường, tự động gợi ý slug
        if (name === 'schoolName' && !formData.schoolSlug) {
             const autoSlug = toSlug(value);
             setFormData(prev => ({ ...prev, schoolName: value, schoolSlug: autoSlug }));
        } else if (name === 'schoolSlug') {
            // Nếu nhập trực tiếp slug, ép về dạng chuẩn
            setFormData(prev => ({ ...prev, [name]: toSlug(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // Hàm tiện ích: Chuyển tên thành slug (VD: "Chuyên Hà Tĩnh" -> "chuyen-ha-tinh")
    const toSlug = (str) => {
        return str
            .toLowerCase()
            .normalize('NFD') // Tách dấu
            .replace(/[\u0300-\u036f]/g, '') // Xóa dấu
            .replace(/đ/g, 'd')
            .replace(/\s+/g, '-') // Space thành gạch ngang
            .replace(/[^a-z0-9-]/g, ''); // Bỏ ký tự đặc biệt
    };

    // Hàm submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);

        try {
            // Gọi API (Nếu chưa làm Bước 1, thay authApi.registerTenant bằng axiosClient.post('/auth/register-tenant', formData))
            const response = await authApi.registerTenant(formData);
            
            setSuccessMsg(`Đăng ký thành công! Đang chuyển hướng đến trường ${formData.schoolName}...`);
            
            // Sau 2 giây chuyển hướng sang trang login của trường mới
            setTimeout(() => {
                // Điều hướng sang: /:schoolSlug/login
                navigate(`/${formData.schoolSlug}/login`);
            }, 2000);

        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.error || "Có lỗi xảy ra, vui lòng thử lại.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden">
                <div className="px-6 py-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-800">Mở Trường Mới</h2>
                        <p className="text-gray-500 mt-2">Tạo không gian LMS riêng cho cơ sở của bạn</p>
                    </div>

                    {error && (
                        <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 text-sm">
                            {error}
                        </div>
                    )}

                    {successMsg && (
                        <div className="mb-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 text-sm">
                            {successMsg}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Phần 1: Thông tin Trường */}
                        <div className="mb-6 border-b pb-4">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">1. Thông tin Trường</h3>
                            
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Tên Trường</label>
                                <input
                                    type="text"
                                    name="schoolName"
                                    value={formData.schoolName}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="VD: THPT Chuyên Hà Tĩnh"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Đường dẫn (Slug)</label>
                                <div className="flex items-center">
                                    <span className="bg-gray-200 text-gray-600 px-3 py-2 rounded-l-lg border border-r-0 border-gray-300">
                                        /
                                    </span>
                                    <input
                                        type="text"
                                        name="schoolSlug"
                                        value={formData.schoolSlug}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="chuyen-ha-tinh"
                                        required
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Địa chỉ web sẽ là: domain.com/{formData.schoolSlug || '...'}
                                </p>
                            </div>
                        </div>

                        {/* Phần 2: Thông tin Quản trị viên */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">2. Tài khoản Admin</h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Username</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="admin"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="admin@school.edu"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Mật khẩu</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="******"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-300 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Đang khởi tạo...' : 'Hoàn tất Đăng ký'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TenantRegister;