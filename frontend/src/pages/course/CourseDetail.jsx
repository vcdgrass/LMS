import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import coursesApi from '../../api/coursesApi';

const CourseDetail = () => {
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // State quản lý tab đang xem (Nội dung, Thành viên, Điểm số...)
    const [activeTab, setActiveTab] = useState('content');

    useEffect(() => {
        const fetchCourseDetail = async () => {
            try {
                const res = await coursesApi.getById(id);
                setCourse(res); // res là object course (do backend trả về json trực tiếp)
            } catch (error) {
                console.error("Lỗi tải khóa học:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourseDetail();
    }, [id]);

    if (loading) return <div className="p-8 text-center">Đang tải dữ liệu...</div>;
    if (!course) return <div className="p-8 text-center text-red-500">Không tìm thấy khóa học.</div>;

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* --- HEADER KHÓA HỌC --- */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-5xl mx-auto px-6 py-8">
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="text-sm font-bold text-indigo-600 uppercase tracking-wide">
                                {course.category?.name || 'Danh mục'}
                            </span>
                            <h1 className="text-3xl font-bold text-gray-900 mt-2 mb-2">
                                {course.title}
                            </h1>
                            <p className="text-gray-600 max-w-2xl">
                                {course.description || "Chưa có mô tả cho khóa học này."}
                            </p>
                        </div>
                        <div className="text-right">
                             <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-mono text-sm font-bold border border-blue-200">
                                Key: {course.enrollmentKey || 'Không có'}
                            </div>
                        </div>
                    </div>

                    {/* TABS NAVIGATION */}
                    <div className="flex space-x-8 mt-8 border-b border-gray-200">
                        {['content', 'students', 'grades', 'settings'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                                    activeTab === tab
                                        ? 'border-indigo-600 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {tab === 'content' && 'Nội dung bài học'}
                                {tab === 'students' && 'Thành viên'}
                                {tab === 'grades' && 'Sổ điểm'}
                                {tab === 'settings' && 'Cài đặt'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="max-w-5xl mx-auto px-6 py-8">
                
                {/* TAB: NỘI DUNG BÀI HỌC */}
                {activeTab === 'content' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Đề cương khóa học</h2>
                            {/* Nút dành cho Giảng viên */}
                            <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-sm font-bold">
                                + Thêm Chương mới
                            </button>
                        </div>

                        {/* Danh sách các chương (Sections) */}
                        {course.sections && course.sections.length > 0 ? (
                            <div className="space-y-4">
                                {course.sections.map((section) => (
                                    <div key={section.id} className="bg-white border rounded-lg shadow-sm overflow-hidden">
                                        {/* Section Header */}
                                        <div className="bg-gray-100 px-4 py-3 border-b flex justify-between items-center">
                                            <h3 className="font-bold text-gray-800">{section.title}</h3>
                                            <button className="text-xs text-indigo-600 hover:underline">+ Thêm bài</button>
                                        </div>

                                        {/* Modules List */}
                                        <ul className="divide-y divide-gray-100">
                                            {section.modules && section.modules.length > 0 ? (
                                                section.modules.map(module => (
                                                    <li key={module.id} className="px-4 py-3 hover:bg-gray-50 flex items-center cursor-pointer group">
                                                        <span className="mr-3 text-gray-400 text-xl">
                                                            {/* Icon tùy loại module */}
                                                            {module.moduleType === 'assignment' ? '📝' : 
                                                             module.moduleType === 'quiz' ? '❓' : '📄'}
                                                        </span>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-gray-700 group-hover:text-indigo-600">
                                                                {module.title}
                                                            </p>
                                                        </div>
                                                        <span className="text-xs text-gray-400">
                                                            {module.moduleType}
                                                        </span>
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="px-4 py-3 text-sm text-gray-400 italic">Chưa có bài học nào.</li>
                                            )}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white rounded border border-dashed border-gray-300">
                                <p className="text-gray-500 mb-4">Khóa học này chưa có nội dung.</p>
                                <button className="text-indigo-600 font-bold hover:underline">Tạo chương đầu tiên ngay</button>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB: THÀNH VIÊN (Placeholder) */}
                {activeTab === 'students' && (
                    <div className="bg-white p-6 rounded shadow text-center">
                        <p className="text-gray-500">Chức năng quản lý thành viên đang phát triển...</p>
                    </div>
                )}

                 {/* TAB: CÀI ĐẶT (Placeholder) */}
                 {activeTab === 'settings' && (
                    <div className="bg-white p-6 rounded shadow">
                         <h3 className="font-bold mb-4">Thông tin cơ bản</h3>
                         <div className="grid grid-cols-2 gap-4">
                             <div>
                                 <label className="block text-sm text-gray-600">Ngày bắt đầu</label>
                                 <p className="font-medium">{course.startDate ? new Date(course.startDate).toLocaleDateString() : 'N/A'}</p>
                             </div>
                             <div>
                                 <label className="block text-sm text-gray-600">Ngày kết thúc</label>
                                 <p className="font-medium">{course.endDate ? new Date(course.endDate).toLocaleDateString() : 'N/A'}</p>
                             </div>
                         </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseDetail;