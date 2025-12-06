// frontend/src/pages/student/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import coursesApi from '../../api/coursesApi';

const StudentDashboard = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyCourses = async () => {
            try {
                const res = await coursesApi.getEnrolledCourses();
                setCourses(res.data);
            } catch (error) {
                console.error("Lỗi tải khóa học:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMyCourses();
    }, []);

    if (loading) return <div className="p-10 text-center text-gray-500">Đang tải khóa học của bạn...</div>;

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Khóa học của tôi</h1>
                <p className="text-gray-600">Tiếp tục hành trình học tập của bạn.</p>
            </div>

            {courses.length === 0 ? (
                <div className="bg-white p-12 rounded-lg shadow text-center">
                    <div className="text-4xl mb-4">📭</div>
                    <h3 className="text-lg font-semibold text-gray-700">Bạn chưa ghi danh khóa học nào</h3>
                    <p className="text-gray-500 mt-2">Hãy liên hệ giảng viên hoặc quản trị viên để được thêm vào lớp học.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map(course => (
                        <div key={course.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-200 overflow-hidden flex flex-col h-full">
                            {/* Course Image Placeholder */}
                            <div className="h-32 bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center">
                                <span className="text-4xl">📖</span>
                            </div>
                            
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="mb-2">
                                    <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded uppercase tracking-wide">
                                        {course.category?.name || 'Chung'}
                                    </span>
                                </div>
                                
                                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2" title={course.title}>
                                    {course.title}
                                </h3>
                                
                                <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1">
                                    {course.description || "Không có mô tả cho khóa học này."}
                                </p>

                                <div className="border-t pt-4 mt-auto">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="text-xs text-gray-500">
                                            GV: {course.teacherCourses?.[0]?.user?.username || 'N/A'}
                                        </div>
                                        {/* Có thể thêm thanh tiến độ ở đây sau này */}
                                    </div>
                                    
                                    <Link 
                                        to={`/course/${course.id}`} 
                                        className="block w-full text-center bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded transition"
                                    >
                                        Vào học ngay
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

export default StudentDashboard;