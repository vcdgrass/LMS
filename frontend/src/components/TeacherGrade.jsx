import React, { useState, useEffect } from 'react';
import { 
    Search, FileText, CheckSquare, Filter, 
    ChevronRight, Download, Clock 
} from 'lucide-react';
import coursesApi from '../api/coursesApi';

const TeacherGrade = ({ courseId }) => {
    const [modules, setModules] = useState([]);
    const [activeModuleId, setActiveModuleId] = useState(null);
    const [studentData, setStudentData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // 1. Lấy cấu trúc khóa học để lọc ra các bài Quiz/Assignment
    useEffect(() => {
        const fetchCourseStructure = async () => {
            try {
                const res = await coursesApi.getCourseDetail(courseId);
                const course = res.data;
                
                // Flat map để lấy tất cả modules từ các sections
                const gradableModules = [];
                if (course.sections) {
                    course.sections.forEach(section => {
                        if (section.modules) {
                            section.modules.forEach(mod => {
                                // Chỉ lấy Quiz và Assignment
                                if (['quiz', 'assignment'].includes(mod.moduleType)) {
                                    gradableModules.push({
                                        id: mod.id,
                                        title: mod.title,
                                        type: mod.moduleType,
                                        sectionTitle: section.title
                                    });
                                }
                            });
                        }
                    });
                }
                setModules(gradableModules);
                // Mặc định chọn bài đầu tiên
                if (gradableModules.length > 0) setActiveModuleId(gradableModules[0].id);
            } catch (error) {
                console.error("Lỗi tải khóa học:", error);
            }
        };
        fetchCourseStructure();
    }, [courseId]);

    // 2. Lấy bảng điểm khi chọn Module
    useEffect(() => {
        if (!activeModuleId) return;

        const fetchGrades = async () => {
            setLoading(true);
            try {
                // API này giờ đã trả về full danh sách học viên (Backend vừa sửa)
                const res = await coursesApi.getModuleSubmissions(activeModuleId);
                setStudentData(res.data);
            } catch (error) {
                console.error("Lỗi tải bảng điểm:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchGrades();
    }, [activeModuleId]);

    const activeModule = modules.find(m => m.id === activeModuleId);

    // Filter tìm kiếm module bên trái
    const filteredModules = modules.filter(m => 
        m.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex h-[calc(100vh-140px)] bg-white border rounded-xl overflow-hidden shadow-sm font-sans mt-6">
            
            {/* --- CỘT TRÁI: DANH SÁCH BÀI TẬP (35%) --- */}
            <div className="w-[35%] border-r border-gray-200 bg-white flex flex-col">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <h2 className="font-bold text-lg text-gray-800 mb-3">Sổ điểm</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Tìm bài tập, quiz..." 
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {filteredModules.map((mod) => (
                        <div 
                            key={mod.id}
                            onClick={() => setActiveModuleId(mod.id)}
                            className={`
                                group flex items-center p-4 rounded-lg cursor-pointer transition-all duration-200 border
                                ${activeModuleId === mod.id 
                                    ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                                    : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200'}
                            `}
                        >
                            <div className={`
                                w-10 h-10 rounded-full flex items-center justify-center mr-3 shrink-0
                                ${mod.type === 'assignment' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}
                            `}>
                                {mod.type === 'assignment' ? <FileText size={20} /> : <CheckSquare size={20} />}
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className={`font-semibold text-sm truncate ${activeModuleId === mod.id ? 'text-indigo-700' : 'text-gray-700'}`}>
                                    {mod.title}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">
                                    {mod.sectionTitle}
                                </p>
                            </div>

                            {activeModuleId === mod.id && <ChevronRight size={16} className="text-indigo-500" />}
                        </div>
                    ))}
                    {filteredModules.length === 0 && (
                        <div className="p-4 text-center text-gray-400 text-sm">Không tìm thấy bài tập nào.</div>
                    )}
                </div>
            </div>

            {/* --- CỘT PHẢI: CHI TIẾT ĐIỂM SỐ (65%) --- */}
            <div className="w-[65%] bg-gray-50 flex flex-col">
                {activeModule ? (
                    <>
                        {/* Header */}
                        <div className="px-6 py-4 bg-white border-b border-gray-200 flex justify-between items-center shadow-sm z-10">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${activeModule.type === 'assignment' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                        {activeModule.type === 'quiz' ? 'Trắc nghiệm' : 'Tự luận'}
                                    </span>
                                    <span className="text-gray-400 text-xs">• {studentData.length} Học viên</span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-800 truncate max-w-md" title={activeModule.title}>
                                    {activeModule.title}
                                </h2>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition" title="Lọc kết quả">
                                    <Filter size={20} />
                                </button>
                                <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg shadow hover:bg-indigo-700 transition flex items-center gap-2">
                                    <Download size={18} /> Xuất Excel
                                </button>
                            </div>
                        </div>

                        {/* Table Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {loading ? (
                                <div className="flex justify-center items-center h-full text-gray-500">Đang tải dữ liệu...</div>
                            ) : (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-3 text-xs uppercase text-gray-500 font-bold">Học viên</th>
                                                <th className="px-6 py-3 text-xs uppercase text-gray-500 font-bold">Trạng thái</th>
                                                <th className="px-6 py-3 text-xs uppercase text-gray-500 font-bold text-center">Điểm số</th>
                                                <th className="px-6 py-3 text-xs uppercase text-gray-500 font-bold">Chi tiết</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {studentData.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                    {/* Cột 1: Học viên */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center">
                                                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs mr-3">
                                                                {item.student?.username?.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-gray-800 text-sm">{item.student?.username}</div>
                                                                <div className="text-xs text-gray-500">{item.student?.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Cột 2: Trạng thái */}
                                                    <td className="px-6 py-4">
                                                        {item.score !== null ? (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                Đã chấm
                                                            </span>
                                                        ) : item.submittedAt ? (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                                Chờ chấm
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                                Chưa nộp
                                                            </span>
                                                        )}
                                                        
                                                        {/* Hiển thị thời gian nộp/làm bài */}
                                                        {(item.submittedAt || item.gradedAt) && (
                                                            <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                                                <Clock size={10} />
                                                                {new Date(item.submittedAt || item.gradedAt).toLocaleDateString('vi-VN')}
                                                            </div>
                                                        )}
                                                    </td>

                                                    {/* Cột 3: Điểm số */}
                                                    <td className="px-6 py-4 text-center">
                                                        {item.score !== null ? (
                                                            <span className={`text-lg font-bold ${Number(item.score) >= 5 ? 'text-gray-800' : 'text-red-500'}`}>
                                                                {item.score}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-300 text-2xl font-light">-</span>
                                                        )}
                                                    </td>

                                                    {/* Cột 4: Chi tiết / File */}
                                                    <td className="px-6 py-4">
                                                        {activeModule.type === 'assignment' && item.filePath && (
                                                            <a 
                                                                href={`http://localhost:5000/${item.filePath}`} 
                                                                target="_blank" 
                                                                rel="noreferrer"
                                                                className="text-blue-600 hover:underline text-xs font-medium"
                                                            >
                                                                Xem bài làm
                                                            </a>
                                                        )}
                                                        {activeModule.type === 'quiz' && item.score !== null && (
                                                            <span className="text-xs text-gray-500">Auto-graded</span>
                                                        )}
                                                        {item.feedback && (
                                                            <p className="text-xs text-gray-500 mt-1 italic max-w-xs truncate">
                                                                " {item.feedback} "
                                                            </p>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            
                                            {studentData.length === 0 && (
                                                <tr>
                                                    <td colSpan="4" className="p-8 text-center text-gray-500">
                                                        Lớp học chưa có học viên nào.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                        <FileText size={64} className="mb-4 opacity-10" />
                        <p className="font-medium">Chọn một bài tập để xem bảng điểm</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherGrade;