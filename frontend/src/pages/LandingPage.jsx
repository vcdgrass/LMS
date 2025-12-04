// frontend/src/pages/LandingPage.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Giả sử bạn có context quản lý auth
import api from '../api/axiosClient';

const LandingPage = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);

    // 1. Logic Redirect: Nếu đã đăng nhập -> Đá sang Dashboard
    useEffect(() => {
        if (!loading && user) {
            if (user.role === 'admin') navigate('/admin/dashboard');
            else if (user.role === 'teacher') navigate('/teacher/dashboard');
            if(user.role === 'student') navigate('/student/dashboard');
        }
    }, [user, loading, navigate]);

    // 2. Lấy danh mục khóa học để hiển thị cho khách xem 
    useEffect(() => {
        api.get('/categories') // API lấy danh mục công khai
            .then(res => setCategories(res.data))
            .catch(err => console.error(err));
    }, []);

    if (loading) return <div>Đang tải...</div>;

    return (
        <div className="landing-container">
            {/* --- HEADER --- */}
            <header className="flex justify-between items-center p-4 shadow-md bg-white">
                <div className="logo font-bold text-xl text-blue-600">HUST LMS</div>
                <nav>
                    {/* Nút quan trọng nhất: Đăng nhập */}
                    <Link to="/login" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Đăng nhập
                    </Link>
                </nav>
            </header>

            {/* --- HERO SECTION --- */}
            <section className="hero bg-gray-100 py-20 text-center">
                <h1 className="text-4xl font-bold mb-4">Hệ thống Quản lý Học tập Trực tuyến</h1>
                <p className="text-gray-600 mb-8">Nền tảng hỗ trợ giảng dạy và học tập hiệu quả</p>
                <Link to="/login" className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold">
                    Bắt đầu học ngay
                </Link>
            </section>

            {/* --- COURSE CATEGORIES (Duyệt danh mục) ---  */}
            {/* <section className="categories py-10 px-4 max-w-6xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 border-b pb-2">Danh mục Đào tạo</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {categories.map(cat => (
                        <div key={cat.id_category} className="p-4 border rounded hover:shadow-lg transition">
                            <h3 className="font-bold text-lg">{cat.name}</h3>
                            {/* Nếu là danh mục cha, có thể hiển thị thêm info */}
                            {/* <Link to={`/category/${cat.id_category}`} className="text-blue-500 text-sm mt-2 block">
                                Xem các khóa học &rarr;
                            </Link>
                        </div>
                    ))}
                </div> */}
            {/* </section> */}

            {/* --- FOOTER ---
            <footer className="bg-gray-800 text-white p-6 text-center mt-10">
                <p>&copy; 2025 LMS Project. All rights reserved.</p>
            </footer> */}
        </div>
    );
};

export default LandingPage;