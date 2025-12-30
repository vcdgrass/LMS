import React from 'react';
import { Link, useNavigate, Outlet, useLocation, useParams } from 'react-router-dom'; // Thêm useParams

const TeacherLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { schoolSlug } = useParams(); // [MỚI] Lấy slug trường

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // [MỚI] Logout xong về trang login của trường hiện tại
        navigate(`/${schoolSlug}/login`);
    };

    // [MỚI] Tạo prefix cho url
    const prefix = `/${schoolSlug}`;

    const menuItems = [
        { path: `${prefix}/teacher/dashboard`, label: 'Bảng điều khiển', icon: 'tj' },
        { path: `${prefix}/teacher/create-course`, label: 'Tạo khóa học mới', icon: '➕' },
        // Thêm các menu khác nếu có
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md flex flex-col">
                <div className="p-6 text-center border-b">
                    <h1 className="font-bold text-xl text-blue-600">Giảng Viên</h1>
                    <p className="text-xs text-gray-500 mt-1">Trường: {schoolSlug}</p>
                </div>
                
                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                                location.pathname === item.path 
                                    ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm' 
                                    : 'text-gray-600 hover:bg-gray-100'
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
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded transition"
                    >
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm p-4 flex justify-between items-center z-10">
                    <h2 className="text-lg font-medium text-gray-800">Khu vực quản lý giảng dạy</h2>
                    <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600">Hello, Teacher!</span>
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                            T
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

export default TeacherLayout;