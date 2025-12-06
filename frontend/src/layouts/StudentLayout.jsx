// frontend/src/layouts/StudentLayout.jsx
import React from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';

const StudentLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Giả sử user được lưu trong localStorage khi login
    const user = JSON.parse(localStorage.getItem('user')) || { username: 'Học viên' };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const menuItems = [
        { path: '/student/dashboard', label: 'Khóa học của tôi', icon: '📚' },
        // { path: '/student/grades', label: 'Bảng điểm', icon: '🏆' }, // Phát triển sau
        // { path: '/student/profile', label: 'Hồ sơ', icon: '👤' },
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            {/* SIDEBAR - Màu xanh lá hoặc teal để phân biệt với Teacher/Admin */}
            <aside className="w-64 bg-teal-800 text-white flex flex-col shadow-xl">
                <div className="p-6 text-center font-bold text-2xl border-b border-teal-700 flex items-center justify-center space-x-2">
                    <span>🎓</span>
                    <span>Student Portal</span>
                </div>
                
                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center space-x-3 px-4 py-3 rounded transition-colors ${
                                location.pathname === item.path 
                                    ? 'bg-teal-600 text-white border-l-4 border-teal-300' 
                                    : 'text-teal-100 hover:bg-teal-700 hover:text-white'
                            }`}
                        >
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-teal-700">
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded text-sm transition text-white"
                    >
                        <span>🚪</span>
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm p-4 flex justify-between items-center z-10">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Hệ thống Học tập Trực tuyến
                    </h2>
                    <div className="flex items-center space-x-3">
                        <span className="text-gray-600">Xin chào, <b>{user.username}</b></span>
                        <div className="w-8 h-8 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-bold">
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-6 bg-gray-100">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default StudentLayout;