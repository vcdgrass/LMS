import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';

const LoginPage = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const { schoolSlug } = useParams();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const result = await login(formData.username, formData.password);
        if (result.success) {
            const prefix = `/${schoolSlug}`;
            switch(result.role) {
                case 'admin': navigate(`${prefix}/admin/dashboard`); break;
                case 'teacher': navigate(`${prefix}/teacher/dashboard`); break;
                case 'student': navigate(`${prefix}/student/dashboard`); break;
                default: navigate(prefix);
            }
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-96">
                <h2 className="text-2xl font-bold mb-2 text-center text-blue-600">Đăng nhập</h2>
                {/* Hiển thị tên trường */}
                <p className="text-center text-gray-500 mb-6 font-medium uppercase text-sm">
                    {schoolSlug}
                </p>
                
                {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm text-center">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Tên đăng nhập</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nhập username"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Mật khẩu</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="******"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-200"
                    >
                        Đăng nhập
                    </button>
                </form>

                {/* Thông báo hỗ trợ thay vì link đăng ký */}
                <div className="mt-4 text-center text-xs text-gray-500">
                    <p>Quên mật khẩu hoặc chưa có tài khoản?</p>
                    <p>Vui lòng liên hệ Admin nhà trường.</p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;