import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosClient';
import adminApi from '../../api/adminApi';

const Dashboard = () => {
    // State lưu thống kê (Mock data ban đầu để tránh lỗi nếu chưa có API)
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalCourses: 0,
        activeStudents: 0
    });
    const [loading, setLoading] = useState(true);

    // Giả lập gọi API lấy thống kê
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await adminApi.getStats();
                console.log("Thống kê Dashboard:", data);
                setStats(data.data);
            } catch (error) {
                console.error("Không thể tải thống kê:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div>Đang tải dữ liệu...</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Tổng quan hệ thống</h1>

            {/* --- 1. THẺ THỐNG KÊ (STATS CARDS) --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Card User */}
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-500 text-sm">Tổng người dùng</p>
                            <h3 className="text-3xl font-bold text-gray-800">{stats.totalUsers}</h3>
                        </div>
                        <span className="text-3xl">👥</span>
                    </div>
                </div>

                {/* Card Courses */}
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-500 text-sm">Khóa học hiện có</p>
                            <h3 className="text-3xl font-bold text-gray-800">{stats.totalCourses}</h3>
                        </div>
                        <span className="text-3xl">📚</span>
                    </div>
                </div>

                {/* Card Active Students
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-500 text-sm">Học viên đang online</p>
                            <h3 className="text-3xl font-bold text-gray-800">{stats.activeStudents}</h3>
                        </div>
                        <span className="text-3xl">🟢</span>
                    </div>
                </div> */}
            </div>

            {/* --- 2. HÀNH ĐỘNG NHANH (QUICK ACTIONS) --- */}
            {/* Dựa trên use-case: Admin cần thêm user và tạo danh mục [cite: 7, 15] */}
            <h2 className="text-xl font-bold mb-4">Thao tác nhanh</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link to="/admin/users" className="bg-white p-4 rounded shadow hover:shadow-md transition flex items-center space-x-3 group">
                    <div className="bg-blue-100 p-3 rounded-full text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                        ➕
                    </div>
                    <div>
                        <p className="font-semibold">Thêm User mới</p>
                        <p className="text-xs text-gray-500">Tạo tài khoản lẻ hoặc Import CSV</p>
                    </div>
                </Link>

                <Link to="/admin/categories" className="bg-white p-4 rounded shadow hover:shadow-md transition flex items-center space-x-3 group">
                    <div className="bg-green-100 p-3 rounded-full text-green-600 group-hover:bg-green-600 group-hover:text-white transition">
                        📂
                    </div>
                    <div>
                        <p className="font-semibold">Tạo Danh mục</p>
                        <p className="text-xs text-gray-500">Sắp xếp cây thư mục khóa học</p>
                    </div>
                </Link>
                
                {/* Placeholder cho các tính năng khác
                <div className="bg-white p-4 rounded shadow hover:shadow-md transition flex items-center space-x-3 opacity-60 cursor-not-allowed">
                    <div className="bg-gray-100 p-3 rounded-full text-gray-600">
                        ⚙️
                    </div>
                    <div>
                        <p className="font-semibold">Bảo trì hệ thống</p>
                        <p className="text-xs text-gray-500">Tính năng đang phát triển</p>
                    </div>
                </div> */}
            </div>
        </div>
    );
};

export default Dashboard;