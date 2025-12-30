import React from 'react';
import { Link, useNavigate, Outlet, useLocation, useParams } from 'react-router-dom';

const StudentLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { schoolSlug } = useParams(); // [MỚI]

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate(`/${schoolSlug}/login`);
    };

    const prefix = `/${schoolSlug}`;

    const menuItems = [
        { path: `${prefix}/student/dashboard`, label: 'Khóa học của tôi', icon: '📚' },
        // { path: `${prefix}/student/grades`, label: 'Bảng điểm', icon: '📝' },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            <aside className="w-64 bg-white shadow-lg flex flex-col z-20">
                <div className="p-6 border-b flex items-center justify-center flex-col">
                    <span className="text-2xl mb-1">🎓</span>
                    <h1 className="font-bold text-gray-800">Góc Học Tập</h1>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded mt-1">
                        {schoolSlug}
                    </span>
                </div>
                
                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                                location.pathname === item.path 
                                    ? 'bg-green-50 text-green-700 font-medium' 
                                    : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t">
                    <button 
                        onClick={handleLogout}
                        className="w-full px-4 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 transition text-sm"
                    >
                        Đăng xuất
                    </button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow p-4 flex justify-end items-center">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700">Học viên</span>
                        <div className="h-8 w-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold">
                            S
                        </div>
                    </div>
                </header>
                <div className="flex-1 overflow-auto p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default StudentLayout;