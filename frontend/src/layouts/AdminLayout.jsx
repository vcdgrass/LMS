import React from 'react';
import { Link, useNavigate, Outlet, useLocation, useParams } from 'react-router-dom'; // Thêm useParams

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { schoolSlug } = useParams(); // [MỚI]

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // [MỚI] Về trang login của trường hiện tại
        navigate(`/${schoolSlug}/login`);
    };

    // [MỚI] Prefix cho tất cả các đường dẫn
    const prefix = `/${schoolSlug}`;

    const menuItems = [
        { path: `${prefix}/admin/dashboard`, label: 'Tổng quan', icon: '📊' },
        { path: `${prefix}/admin/users`, label: 'Quản lý Người dùng', icon: '👥' },
        { path: `${prefix}/admin/categories`, label: 'Danh mục Khóa học', icon: '📂' },
        // { path: `${prefix}/admin/settings`, label: 'Cài đặt hệ thống', icon: '⚙️' },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            <aside className="w-64 bg-gray-800 text-white flex flex-col">
                <div className="p-6 text-center font-bold text-2xl border-b border-gray-700">
                    Admin Portal
                    {/* Hiển thị tên slug cho dễ nhận biết */}
                    <div className="text-xs font-normal text-gray-400 mt-1">Trường: {schoolSlug}</div>
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

            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow p-4 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Hệ thống Quản lý Học tập
                    </h2>
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                            A
                        </div>
                        <span className="text-gray-600 text-sm">Administrator</span>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-6">
                    <Outlet /> 
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;