import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosClient';

const TeacherDashboard = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                // Gọi API vừa tạo ở trên
                const res = await api.get('/courses/teaching');
                setCourses(res.data);
            } catch (error) {
                console.error("Lỗi:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    if (loading) return <div className="p-8 text-center">Đang tải dữ liệu lớp học...</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* --- HEADER --- */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Bảng điều khiển Giảng viên</h1>
                    <p className="text-gray-600">Quản lý các lớp học và chấm điểm.</p>
                </div>
                {/* Nút Tạo khóa học mới [cite: 22] */}
                <Link 
                    to="/teacher/create-course" 
                    className="bg-blue-600 text-white px-5 py-3 rounded-lg font-bold shadow hover:bg-blue-700 transition flex items-center"
                >
                    <span className="text-xl mr-2">+</span> Tạo Khóa Học
                </Link>
            </div>

            {/* --- DANH SÁCH KHÓA HỌC (GRID VIEW) --- */}
            <h2 className="text-xl font-bold mb-4 border-l-4 border-blue-500 pl-3">Khóa học đang dạy</h2>
            
            {courses.length === 0 ? (
                <div className="bg-white p-10 rounded shadow text-center">
                    <p className="text-gray-500 text-lg mb-4">Bạn chưa có khóa học nào.</p>
                    <Link to="/teacher/create-course" className="text-blue-600 font-semibold hover:underline">
                        Tạo khóa học đầu tiên ngay
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map(course => (
                        <div key={course.id} className="bg-white rounded-lg shadow hover:shadow-lg transition flex flex-col overflow-hidden">
                            {/* Banner giả lập (hoặc lấy từ DB nếu có upload ảnh) */}
                            <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl">
                                📚
                            </div>
                            
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded uppercase">
                                        {course.category?.name || 'Chưa phân loại'}
                                    </span>
                                    {/* Hiển thị số lượng học viên */}
                                    <span className="text-xs text-gray-500 flex items-center">
                                        👤 {course._count?.enrollments || 0} HV
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                                    {course.title}
                                </h3>
                                
                                <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">
                                    {course.description || "Chưa có mô tả."}
                                </p>

                                <div className="border-t pt-4 flex justify-between items-center mt-auto">
                                    {/* Nút Vào lớp để sửa nội dung/chấm điểm */}
                                    <Link 
                                        to={`/course/${course.id}`} 
                                        className="text-blue-600 font-semibold hover:text-blue-800 text-sm"
                                    >
                                        Truy cập lớp học &rarr;
                                    </Link>
                                    
                                    {/* Nút Cài đặt nhanh (Sửa tên/Key) */}
                                    <Link 
                                        to={`/course/${course.id}/settings`}
                                        className="text-gray-400 hover:text-gray-600"
                                        title="Cấu hình"
                                    >
                                        ⚙️
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TeacherDashboard;