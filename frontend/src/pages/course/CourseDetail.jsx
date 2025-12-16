import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronDown, ChevronRight, FileText, Video, CheckSquare, Plus, Trash2, Edit } from 'lucide-react'; // Import icons
import coursesApi from '../../api/coursesApi';
import { useAuth } from '../../contexts/AuthContext';
import QuizCreator from '../../components/QuizCreator';
import QuizModule from '../../components/QuizModule';

// Import các component hiển thị nội dung
import AssignmentModule from '../../components/AssignmentModule';
import ResourseModule from '../../components/ResourseModule';
import StudentManagement from '../../components/StudentManagement';

const CourseDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    
    // --- STATE DỮ LIỆU ---
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // --- STATE GIAO DIỆN ---
    const [activeTab, setActiveTab] = useState('content');
    const [isEditing, setIsEditing] = useState(false);
    
    // State cho Accordion (Mở rộng/Thu gọn chương)
    // Lưu dạng object { [sectionId]: boolean } (true là mở, false là đóng)
    const [expandedSections, setExpandedSections] = useState({});
    
    // State cho bài học đang chọn (Hiển thị bên phải)
    const [activeModule, setActiveModule] = useState(null);

    // --- STATE MODAL & FORM (Giữ nguyên logic cũ) ---
    const [showSectionModal, setShowSectionModal] = useState(false);
    const [showActivitySelector, setShowActivitySelector] = useState(false);
    const [showModuleForm, setShowModuleForm] = useState(false);
    const [createModuleTab, setCreateModuleTab] = useState('');
    const [showQuizCreator, setShowQuizCreator] = useState(false);
    
    const [newSectionTitle, setNewSectionTitle] = useState('');
    const [activeSectionId, setActiveSectionId] = useState(null);
    const [moduleData, setModuleData] = useState({
        type: '',
        title: '',
        url: '',
        description: '',
        dueDate: '',
        timeLimitMinutes: '',
    });
    const [submitting, setSubmitting] = useState(false);

    // --- FETCH DATA ---
    const fetchCourseDetail = async () => {
        try {
            const res = await coursesApi.getById(id);
            setCourse(res.data ? res.data : res);
            
            // Mặc định mở tất cả các chương khi mới load
            if (res.data?.sections) {
                const defaultExpanded = {};
                res.data.sections.forEach(sec => defaultExpanded[sec.id] = true);
                setExpandedSections(defaultExpanded);
            }
        } catch (error) {
            console.error("Lỗi tải khóa học:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourseDetail();
    }, [id]);

    // --- HANDLERS ---

    const toggleEditMode = () => setIsEditing(!isEditing);

    // Toggle expand/collapse section
    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    // Xử lý Input Form
    const handleChange = (e) => {
        const { name, value } = e.target;
        setModuleData(prev => ({ ...prev, [name]: value }));
    };

    // Xử lý Tạo Chương
    const handleCreateSection = async (e) => {
        e.preventDefault();
        if (!newSectionTitle.trim()) return;
        setSubmitting(true);
        try {
            await coursesApi.createSection(id, { title: newSectionTitle });
            setNewSectionTitle('');
            setShowSectionModal(false);
            fetchCourseDetail();
        } catch (error) {
            alert("Lỗi khi tạo chương.");
        } finally {
            setSubmitting(false);
        }
    };

    // Xử lý Xóa Chương
    const handleDeleteSection = async (sectionId, e) => {
        e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài (tránh toggle accordion)
        if (!window.confirm("Bạn có chắc muốn xóa chương này? Mọi bài học bên trong sẽ bị xóa!")) return;
        try {
            await coursesApi.deleteSection(sectionId);
            fetchCourseDetail();
            // Nếu bài học đang xem thuộc chương này, reset activeModule
            if (activeModule && course.sections.find(s => s.id === sectionId)?.modules.find(m => m.id === activeModule.id)) {
                setActiveModule(null);
            }
        } catch (error) {
            console.error(error);
            alert("Lỗi khi xóa chương.");
        }
    };

    // Xử lý Xóa Module
    const handleDeleteModule = async (moduleId, type, e) => {
        e.stopPropagation();
        if (!window.confirm("Bạn có chắc muốn xóa bài học này?")) return;
        try {
            await coursesApi.deleteModule(moduleId, type);
            if (activeModule?.id === moduleId) setActiveModule(null); // Reset view nếu đang xem bài này
            fetchCourseDetail();
        } catch (error) {
            console.error(error);
            alert("Lỗi khi xoá bài học.");
        }
    };

    // Mở Modal chọn loại hoạt động
    const openActivitySelector = (sectionId) => {
        setActiveSectionId(sectionId);
        setShowActivitySelector(true);
    };

    // Chọn loại hoạt động -> Mở Form nhập liệu
    const handleSelectType = (type) => {
        if (type === 'quiz') {
            setShowActivitySelector(false);
            setShowQuizCreator(true); // Bật chế độ tạo Quiz Kahoot
        } else {
            // Logic cũ cho resource/assignment
            setModuleData({ type, title: '', url: '', description: '', dueDate: '' });
            setCreateModuleTab(type);
            setShowActivitySelector(false);
            setShowModuleForm(true);
        }
    };

    const handleSaveQuiz = async (quizData) => {
        // quizData nhận từ QuizCreator: { title, questions: [...] }
        setSubmitting(true);
        try {
            const payload = {
                title: quizData.title,
                type: 'quiz',
                description: `Bài kiểm tra gồm ${quizData.questions.length} câu hỏi.`,
                questions: quizData.questions // Gửi mảng câu hỏi xuống backend
            };
            
            // Gọi API tạo module
            await coursesApi.createModule(activeSectionId, payload);
            
            alert("Tạo bài kiểm tra thành công!");
            setShowQuizCreator(false); // Đóng giao diện Quiz
            fetchCourseDetail();       // Tải lại dữ liệu khóa học
        } catch (error) {
            console.error("Lỗi tạo quiz:", error);
            alert("Lỗi khi tạo quiz: " + (error.response?.data?.message || "Lỗi không xác định"));
        } finally {
            setSubmitting(false);
        }
    };

    // Submit tạo Module mới
    const handleSubmitModule = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // moduleData.type cần được gán đúng
            const payload = { ...moduleData, type: createModuleTab }; 
            await coursesApi.createModule(activeSectionId, payload);
            alert("Thêm nội dung thành công!");
            setShowModuleForm(false);
            fetchCourseDetail();
        } catch (error) {
            console.error(error);
            alert("Lỗi khi thêm module.");
        } finally {
            setSubmitting(false);
        }
    };

    // Helper render icon cho module
    const getModuleIcon = (type) => {
        switch(type) {
            case 'resource_file': return <FileText size={18} className="text-blue-500" />;
            case 'resource_url': return <Video size={18} className="text-red-500" />; // Ví dụ url video
            case 'assignment': return <Edit size={18} className="text-orange-500" />;
            case 'quiz': return <CheckSquare size={18} className="text-green-500" />;
            default: return <FileText size={18} className="text-gray-500" />;
        }
    };

    const canEdit = user && (user.role === 'teacher' || user.role === 'admin');

    if (loading) return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu khóa học...</div>;
    if (!course) return <div className="p-8 text-center text-red-500">Không tìm thấy khóa học.</div>;

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {/* --- HEADER --- */}
            <header className="bg-white shadow px-6 py-4 flex justify-between items-center z-10 shrink-0">
                <div>
                    <h1 className="text-xl font-bold text-gray-800 truncate">{course.title}</h1>
                    <p className="text-sm text-gray-500">{course.category?.name || 'Chưa phân loại'}</p>
                </div>
                
                <div className="flex space-x-3">
                    {/* Tabs chuyển đổi Content / Students */}
                    <div className="bg-gray-100 p-1 rounded-lg flex space-x-1">
                        <button 
                            onClick={() => setActiveTab('content')}
                            className={`px-3 py-1.5 text-sm rounded-md font-medium transition ${activeTab === 'content' ? 'bg-white text-blue-600 shadow' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Nội dung
                        </button>
                        <button 
                            onClick={() => setActiveTab('student')}
                            className={`px-3 py-1.5 text-sm rounded-md font-medium transition ${activeTab === 'student' ? 'bg-white text-blue-600 shadow' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Học viên
                        </button>
                        <button 
                            onClick={() => setActiveTab('grade')}
                            className={`px-3 py-1.5 text-sm rounded-md font-medium transition ${activeTab === 'grade' ? 'bg-white text-blue-600 shadow' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Điểm số
                        </button>
                    </div>

                    {canEdit && (
                        <button 
                            onClick={toggleEditMode}
                            className={`px-4 py-2 text-sm font-bold rounded border transition ${isEditing ? 'bg-red-50 text-red-600 border-red-200' : 'bg-indigo-50 text-indigo-600 border-indigo-200'}`}
                        >
                            {isEditing ? 'Tắt chỉnh sửa' : 'Bật chỉnh sửa'}
                        </button>
                    )}
                </div>
            </header>

            {/* --- BODY CONTENT (FLEX LAYOUT) --- */}
            <div className="flex flex-1 overflow-hidden">
                
                {/* === TAB NỘI DUNG === */}
                {activeTab === 'content' && (
                    <>
                        {/* 1. SIDEBAR (Cột trái 35%) */}
                        <div className="w-[35%] bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
                            {/* Nút thêm chương (chỉ hiện khi edit) */}
                            {isEditing && (
                                <div className="p-4 border-b border-gray-100 bg-gray-50 sticky top-0 z-10">
                                    <button 
                                        onClick={() => setShowSectionModal(true)}
                                        className="w-full py-2 border-2 border-dashed border-indigo-300 text-indigo-600 rounded hover:bg-indigo-50 font-medium flex items-center justify-center"
                                    >
                                        <Plus size={16} className="mr-1"/> Thêm Chủ đề mới
                                    </button>
                                </div>
                            )}

                            {/* Danh sách các Sections */}
                            <div className="p-2 space-y-2">
                                {course.sections?.length === 0 && <p className="text-center text-gray-400 p-4">Chưa có chương nào.</p>}
                                
                                {course.sections?.map(section => (
                                    <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                        {/* Section Header (Accordion Trigger) */}
                                        <div 
                                            className="bg-gray-50 p-3 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition select-none"
                                            onClick={() => toggleSection(section.id)}
                                        >
                                            <div className="flex items-center font-semibold text-gray-700">
                                                {expandedSections[section.id] ? <ChevronDown size={18} className="mr-2"/> : <ChevronRight size={18} className="mr-2"/>}
                                                {section.title}
                                            </div>
                                            {/* Nút Xóa & Thêm module cho Section (Edit mode) */}
                                            {isEditing && (
                                                <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                                                    <button 
                                                        onClick={() => openActivitySelector(section.id)} 
                                                        title="Thêm bài học"
                                                        className="p-1 text-blue-500 hover:bg-blue-100 rounded"
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={(e) => handleDeleteSection(section.id, e)}
                                                        title="Xóa chương" 
                                                        className="p-1 text-red-500 hover:bg-red-100 rounded"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Module List (Collapsible) */}
                                        {expandedSections[section.id] && (
                                            <div className="bg-white">
                                                {section.modules?.length === 0 && <div className="p-3 text-xs text-gray-400 italic pl-8">Trống</div>}
                                                
                                                {section.modules?.map(module => (
                                                    <div 
                                                        key={module.id}
                                                        onClick={() => setActiveModule(module)}
                                                        className={`p-3 pl-8 flex justify-between items-center cursor-pointer border-l-4 transition
                                                            ${activeModule?.id === module.id 
                                                                ? 'bg-blue-50 border-blue-500' 
                                                                : 'border-transparent hover:bg-gray-50 hover:border-gray-300'}`}
                                                    >
                                                        <div className="flex items-center text-sm text-gray-700">
                                                            <span className="mr-3">{getModuleIcon(module.moduleType)}</span>
                                                            <span className={activeModule?.id === module.id ? 'font-bold text-blue-700' : ''}>{module.title}</span>
                                                        </div>

                                                        {/* Nút xóa module */}
                                                        {isEditing && (
                                                            <button 
                                                                onClick={(e) => handleDeleteModule(module.id, module.moduleType, e)}
                                                                className="text-gray-400 hover:text-red-500 p-1"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 2. MAIN CONTENT (Cột phải 65%) */}
                        <div className="w-[65%] bg-gray-50 p-8 overflow-y-auto">
                            {activeModule ? (
                                <div className="bg-white rounded-xl shadow-sm p-8 min-h-full">
                                    <div className="border-b pb-4 mb-6">
                                        <div className="flex items-center space-x-2 text-gray-500 text-sm uppercase font-bold mb-1">
                                            {getModuleIcon(activeModule.moduleType)}
                                            <span>{activeModule.moduleType.replace('_', ' ')}</span>
                                        </div>
                                        <h2 className="text-3xl font-bold text-gray-800">{activeModule.title}</h2>
                                    </div>

                                    {/* Render Content chi tiết dựa trên loại */}
                                    <div className="prose max-w-none">
                                        {activeModule.moduleType === 'assignment' && (
                                            <AssignmentModule module={activeModule} />
                                        )}
                                        
                                        {(activeModule.moduleType === 'resource_file' || activeModule.moduleType === 'resource_url') && (
                                            <ResourseModule module={activeModule} />
                                        )}
                                        
                                        {activeModule.moduleType === 'quiz' && (
                                            <QuizModule module={activeModule} />
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                    <div className="text-6xl mb-4">📚</div>
                                    <p className="text-lg">Chọn một bài học từ danh sách bên trái để bắt đầu.</p>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* === TAB HỌC VIÊN & ĐIỂM (Full width) === */}
                {activeTab === 'student' && (
                    <div className="w-full p-8 overflow-y-auto">
                        <StudentManagement courseId={course.id} canEdit={canEdit} />
                    </div>
                )}
                {activeTab === 'grade' && (
                    <div className="w-full p-8 overflow-y-auto text-center text-gray-500">
                        Tính năng Bảng điểm đang phát triển...
                    </div>
                )}

            </div>

            {/* --- CÁC MODAL (Section, Activity, Form) --- */}
            {/* 1. Modal Tạo Chương */}
            {showSectionModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <form onSubmit={handleCreateSection} className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h3 className="font-bold text-lg mb-4">Tạo Chủ đề Mới</h3>
                        <input 
                            className="w-full border p-2 rounded mb-4" 
                            placeholder="Tên chủ đề..." 
                            value={newSectionTitle}
                            onChange={e => setNewSectionTitle(e.target.value)}
                            autoFocus
                        />
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setShowSectionModal(false)} className="px-4 py-2 bg-gray-200 rounded">Hủy</button>
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Tạo</button>
                        </div>
                    </form>
                </div>
            )}

            {/* 2. Modal Chọn Loại Module (Chỉ hiện khi bấm + ở sidebar) */}
            {showActivitySelector && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-[500px]">
                        <h3 className="font-bold text-xl mb-4">Thêm hoạt động mới</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => handleSelectType('resource_file')} className="p-4 border rounded hover:bg-blue-50 flex flex-col items-center gap-2">
                                <FileText size={32} className="text-blue-500"/> <span>Tài liệu / Bài giảng</span>
                            </button>
                            <button onClick={() => handleSelectType('resource_url')} className="p-4 border rounded hover:bg-red-50 flex flex-col items-center gap-2">
                                <Video size={32} className="text-red-500"/> <span>Video / Link URL</span>
                            </button>
                            <button onClick={() => handleSelectType('assignment')} className="p-4 border rounded hover:bg-orange-50 flex flex-col items-center gap-2">
                                <Edit size={32} className="text-orange-500"/> <span>Bài tập về nhà</span>
                            </button>
                            <button onClick={() => handleSelectType('quiz')} className="p-4 border rounded hover:bg-green-50 flex flex-col items-center gap-2">
                                <CheckSquare size={32} className="text-green-500"/> <span>Trắc nghiệm</span>
                            </button>
                        </div>
                        <button onClick={() => setShowActivitySelector(false)} className="mt-6 w-full py-2 bg-gray-100 rounded text-gray-600">Đóng</button>
                    </div>
                </div>
            )}

            {/* 3. Modal Nhập liệu Module */}
            {showModuleForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <form onSubmit={handleSubmitModule} className="bg-white p-8 rounded-lg shadow-xl w-[600px]">
                        <h3 className="font-bold text-xl mb-6 border-b pb-2">
                            Nhập thông tin: {createModuleTab.replace('_', ' ').toUpperCase()}
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">Tiêu đề <span className="text-red-500">*</span></label>
                                <input name="title" value={moduleData.title} onChange={handleChange} required className="w-full border p-2 rounded" />
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-1">Mô tả</label>
                                <textarea name="description" value={moduleData.description} onChange={handleChange} rows="3" className="w-full border p-2 rounded" />
                            </div>

                            {(createModuleTab === 'resource_url' || createModuleTab === 'resource_file') && (
                                <div>
                                    <label className="block text-sm font-bold mb-1">Liên kết / URL</label>
                                    <input type="url" name="url" value={moduleData.url} onChange={handleChange} className="w-full border p-2 rounded" placeholder="https://..." />
                                </div>
                            )}

                            {createModuleTab === 'assignment' && (
                                <div>
                                    <label className="block text-sm font-bold mb-1">Hạn nộp bài</label>
                                    <input type="datetime-local" name="dueDate" value={moduleData.dueDate} onChange={handleChange} className="w-full border p-2 rounded" />
                                </div>
                            )}

                            {createModuleTab === 'quiz' && (
                                <div>
                                    <label className="block text-sm font-bold mb-1">Thời gian làm bài (phút)</label>
                                    <input type="number" name="timeLimitMinutes" value={moduleData.timeLimitMinutes} onChange={handleChange} className="w-full border p-2 rounded" />
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
                            <button type="button" onClick={() => setShowModuleForm(false)} className="px-4 py-2 bg-gray-200 rounded">Hủy</button>
                            <button type="submit" disabled={submitting} className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-bold">
                                {submitting ? 'Đang lưu...' : 'Tạo mới'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
            {showQuizCreator && (
                <QuizCreator 
                    onSave={handleSaveQuiz} 
                    onCancel={() => setShowQuizCreator(false)} 
                />
            )}
        </div>
    );
};

export default CourseDetail;