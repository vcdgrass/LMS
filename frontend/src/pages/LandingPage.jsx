// frontend/src/pages/LandingPage.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axiosClient';

const LandingPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'teacher') navigate('/teacher/dashboard');
      else if (user.role === 'student') navigate('/student/dashboard');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    api.get('/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.error(err));
  }, []);

  if (loading) return <div className="text-center py-10">Đang tải...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 via-white to-green-100">
        {/* HEADER */}
        <header className="flex justify-between items-center px-6 py-4 shadow-sm bg-white/80 backdrop-blur">
            <div className="text-2xl font-bold text-green-700">HUST LMS</div>
            <nav>
            <Link
                to="/login"
                className="px-5 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition"
            >
                Đăng nhập
            </Link>
            </nav>
        </header>

        {/* HERO */}
        <section className="flex flex-col items-center justify-center text-center py-24 px-6">
            <h1 className="text-5xl font-extrabold text-gray-800 mb-6">
            Hệ thống Quản lý Học tập Trực tuyến
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl">
            Nền tảng hỗ trợ giảng dạy và học tập hiệu quả, hiện đại và dễ sử dụng.
            </p>
            <Link
            to="/login"
            className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold shadow hover:bg-green-700 transition"
            >
            Bắt đầu học ngay
            </Link>
        </section>

        {/* CATEGORY SECTION */}
        <section className="px-6 py-16 max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
            Danh mục khóa học
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map(cat => (
                <div
                key={cat.id}
                className="bg-white border border-green-100 rounded-lg p-6 shadow-sm hover:shadow-md transition"
                >
                <h3 className="text-lg font-semibold text-green-700 mb-2">{cat.name}</h3>
                <p className="text-gray-500 text-sm">{cat.description}</p>
                </div>
            ))}
            </div>
        </section>
    </div>
  );
};

export default LandingPage;