import React from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Hàm xử lý đăng xuất
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    // Danh sách menu
    const menuItems = [
        { path: '/admin/dashboard', label: 'Tổng quan', icon: '📊' },
        { path: '/admin/users', label: 'Quản lý Người dùng', icon: '👥' }, // [cite: 2]
        { path: '/admin/categories', label: 'Danh mục Khóa học', icon: '📂' }, // [cite: 11]
        { path: '/admin/settings', label: 'Cài đặt hệ thống', icon: '⚙️' },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* --- SIDEBAR --- */}
            <aside className="w-64 bg-gray-800 text-white flex flex-col">
                <div className="p-6 text-center font-bold text-2xl border-b border-gray-700">
                    Admin Portal
                </div>
                
                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center space-x-3 px-4 py-3 rounded transition-colors ${
                                location.pathname === item.path 
                                    ? 'bg-blue-600 text-white' 
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`}
                        >
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-700">
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm transition"
                    >
                        <span>🚪</span>
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </aside>

            {/* --- MAIN CONTENT AREA --- */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header nhỏ phía trên */}
                <header className="bg-white shadow p-4 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Hệ thống Quản lý Học tập (LMS)
                    </h2>
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                            A
                        </div>
                        <span className="text-gray-600 text-sm">Administrator</span>
                    </div>
                </header>

                {/* Nội dung thay đổi của từng trang sẽ hiện ở đây */}
                <div className="flex-1 overflow-auto p-6">
                    <Outlet /> 
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;