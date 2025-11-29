import React from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';

const TeacherLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Lấy thông tin user để hiển thị tên
    const user = JSON.parse(localStorage.getItem('user')) || { username: 'Giảng viên' };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    // Menu dành riêng cho Giảng viên
    const menuItems = [
        { path: '/teacher/dashboard', label: 'Lớp học của tôi', icon: '📚' }, // [cite: 18] Xem danh sách lớp
        // { path: '/teacher/grading', label: 'Sổ điểm & Cần chấm', icon: '📝' }, // [cite: 42] Chức năng chấm điểm (Future)
        { path: '/teacher/profile', label: 'Hồ sơ cá nhân', icon: '👤' },
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            {/* --- SIDEBAR (Màu Indigo để khác với Admin) --- */}
            <aside className="w-64 bg-indigo-900 text-white flex flex-col shadow-xl">
                <div className="p-6 text-center font-bold text-2xl border-b border-indigo-800 flex items-center justify-center space-x-2">
                    <span>🎓</span>
                    <span>Teacher Portal</span>
                </div>
                
                <nav className="flex-1 p-4 space-y-2">
                    {/* Nút Tạo khóa học nổi bật */}
                    <Link 
                        to="/teacher/create-course" 
                        className="flex items-center justify-center space-x-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 rounded text-white font-bold shadow mb-6 transition"
                    >
                        <span>+</span>
                        <span>Tạo Khóa Học Mới</span> 
                    </Link>

                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center space-x-3 px-4 py-3 rounded transition-colors ${
                                location.pathname === item.path 
                                    ? 'bg-indigo-700 text-white border-l-4 border-indigo-300' 
                                    : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
                            }`}
                        >
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-indigo-800">
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm transition text-white"
                    >
                        <span>🚪</span>
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white shadow-sm p-4 flex justify-between items-center z-10">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Hệ thống Giảng dạy Trực tuyến
                    </h2>
                    
                    <div className="flex items-center space-x-4">
                        {/* Notification Bell (Mockup) */}
                        <button className="relative p-2 text-gray-400 hover:text-gray-600">
                            🔔
                            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">2</span>
                        </button>

                        <div className="flex items-center space-x-2 border-l pl-4">
                            <div className="text-right hidden md:block">
                                <div className="text-sm font-bold text-gray-700">{user.username}</div>
                                <div className="text-xs text-indigo-600">Giảng viên</div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-lg">
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Nội dung thay đổi (Outlet) */}
                <div className="flex-1 overflow-auto p-6 bg-gray-50 scroll-smooth">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default TeacherLayout;