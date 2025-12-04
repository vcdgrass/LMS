import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import coursesApi from '../../api/coursesApi';
import { useAuth } from '../../contexts/AuthContext';

const CourseDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('content');

    // --- STATE QUẢN LÝ CHẾ ĐỘ CHỈNH SỬA ---
    const [isEditing, setIsEditing] = useState(false);

    // --- MODAL STATES ---
    const [showSectionModal, setShowSectionModal] = useState(false);
    const [showActivitySelector, setShowActivitySelector] = useState(false);
    const [showModuleForm, setShowModuleForm] = useState(false);

    // Dữ liệu tạm
    const [newSectionTitle, setNewSectionTitle] = useState('');
    const [activeSectionId, setActiveSectionId] = useState(null);
    
    const [moduleData, setModuleData] = useState({
        type: '', // 'resource_url', 'resource_file', 'assignment', 'quiz'
        title: '',
        url: '',
        description: '',
        dueDate: ''
    });

    const [submitting, setSubmitting] = useState(false);

 
    const fetchCourseDetail = async () => {
        try {
            const res = await coursesApi.getById(id);
            setCourse(res.data ? res.data : res); 
        } catch (error) {
            console.error("Lỗi tải khóa học:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourseDetail();
    }, [id]);

    const toggleEditMode = () => {
        setIsEditing(!isEditing);
    };

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

    const handleDeleteSection = async (sectionId) => {
        if (!window.confirm("Bạn có chắc muốn xóa chương này?")) return;
        try {
            await coursesApi.deleteSection(sectionId);
            alert("Xóa chương thành công!");
            fetchCourseDetail();
        } catch (error) {
            console.error(error);
            alert("Lỗi khi xóa chương.");
        }
    };


    const openActivitySelector = (sectionId) => {
        setActiveSectionId(sectionId);
        setShowActivitySelector(true);
    };


    const handleSelectType = (type) => {
        setModuleData({ type, title: '', url: '', description: '', dueDate: '' });
        setShowActivitySelector(false);
        setShowModuleForm(true);
    };


    const handleSubmitModule = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {

            await coursesApi.createModule(activeSectionId, moduleData);
            
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


    const renderModuleContent = (module) => {
        const descriptionContent = module.description ? (
            <div className="mt-2 ml-0 md:ml-8 text-sm text-gray-600 italic whitespace-pre-wrap border-l-2 border-gray-300 pl-3">
                {module.description}
            </div>
        ) : null;

        let specificContent = null;

        if (module.moduleType === 'resource_url') {
            specificContent = (
                <div className="mt-2 ml-0 md:ml-8 p-3 bg-blue-50 rounded border border-blue-100">
                    <div className="flex items-center space-x-2">
                        <span className="text-lg text-blue-500"></span>
                        <a 
                            href={module.resource?.filePathOrUrl || module.url || '#'} 
                            className="text-blue-700 hover:underline break-all text-sm font-medium"
                            target="_blank" 
                            rel="noopener noreferrer"
                        >
                            {module.resource?.filePathOrUrl || module.url || 'Truy cập liên kết'}
                        </a>
                    </div>
                </div>
            );
        } else if (module.moduleType === 'resource_file') {
            specificContent = (
                <div className="mt-2 ml-0 md:ml-8">
                    <button className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 text-sm border transition">
                        <span className="mr-2 text-lg">⬇</span> Tải xuống tài liệu
                    </button>
                </div>
            );
        } else if (module.moduleType === 'assignment') {
            const formattedDate = module.dueDate 
                ? new Date(module.dueDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                : '--/--/----';

            specificContent = (
                <div className="mt-2 ml-0 md:ml-8 p-3 bg-orange-50 border-l-4 border-orange-400 rounded-r flex items-center justify-between shadow-sm">
                     <div>
                        <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-orange-600 uppercase tracking-wide">Bài tập</span>
                            {isEditing && <span className="text-xs text-gray-400">(ID: {module.contentId})</span>}
                        </div>
                        <p className="text-sm text-gray-700 mt-1">
                            <span className="font-semibold">Hạn nộp:</span> {formattedDate}
                        </p>
                     </div>
                     <button className="px-4 py-2 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 font-bold shadow transition">
                        Nộp bài / Chi tiết
                     </button>
                </div>
            );
        }

        return (
            <div className="mb-2">
                {descriptionContent}
                {specificContent}
            </div>
        );
    };

    const canEdit = user && (user.role === 'teacher' || user.role === 'admin');

    if (loading) return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu khóa học...</div>;
    if (!course) return <div className="p-8 text-center text-red-500">Không tìm thấy khóa học hoặc bạn không có quyền truy cập.</div>;

    return (
        <div className="bg-gray-50 min-h-screen relative pb-20">
            {/* --- HEADER KHÓA HỌC --- */}
            <div className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-6 py-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div>
                            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide bg-indigo-50 px-2 py-1 rounded">
                                {course.category?.name || 'Danh mục chung'}
                            </span>
                            <h1 className="text-3xl font-bold text-gray-900 mt-2 mb-2">
                                {course.title}
                            </h1>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span className="flex items-center"><span className="mr-1">👤</span> GV: {user?.username}</span>
                            </div>
                        </div>
                        
                        {/* NÚT BẬT/TẮT CHỈNH SỬA */}
                        {canEdit && (
                            <button 
                                onClick={toggleEditMode}
                                className={`px-5 py-2 rounded-lg font-bold shadow transition flex items-center transform hover:scale-105 ${
                                    isEditing 
                                    ? 'bg-red-100 text-red-600 border border-red-200 hover:bg-red-200' 
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                }`}
                            >
                                {isEditing ? ' Tắt chế độ chỉnh sửa' : ' Bật chế độ chỉnh sửa'}
                            </button>
                        )}
                    </div>

                    {/* TABS */}
                    <div className="flex space-x-8 mt-8 border-b border-gray-200">
                        {['content', 'students', 'grades'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                                    activeTab === tab
                                        ? 'border-indigo-600 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {tab === 'content' && 'Nội dung'}
                                {tab === 'students' && 'Thành viên'}
                                {tab === 'grades' && 'Điểm số'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="max-w-5xl mx-auto px-6 py-8">
                {activeTab === 'content' && (
                    <div>
                        {/* Nút thêm chương chỉ hiện khi đang Edit */}
                        {isEditing && (
                            <div className="mb-6 text-right animate-fade-in">
                                <button 
                                    onClick={() => setShowSectionModal(true)}
                                    className="text-indigo-600 font-bold hover:underline text-sm bg-indigo-50 px-3 py-2 rounded border border-indigo-100 hover:bg-indigo-100 transition"
                                >
                                    + Thêm Chủ đề mới
                                </button>
                            </div>
                        )}

                        {/* Loop Sections */}
                        <div className="space-y-6">
                            {course.sections?.map((section) => (
                                <div key={section.id} className="bg-white border rounded-lg shadow-sm overflow-hidden relative transition hover:shadow-md">
                                    {/* Section Header */}
                                    <div className="bg-gray-50 px-5 py-4 border-b flex justify-between items-center">
                                        <h3 className="font-bold text-gray-800 text-lg flex items-center"> {section.title} </h3>
                                        {isEditing && (
                                            <div className="flex space-x-2">
                                                <button 
                                                    onClick={() => handleDeleteSection(section.id)}
                                                    className="p-1 text-gray-400 hover:text-red-600" title="Xóa chương">
                                                    xoá
                                                </button>
                                            </div>
                                        )}

                                    </div>

                                    {/* Modules List */}
                                    <ul className="divide-y divide-gray-100">
                                        {section.modules?.length > 0 ? (
                                            section.modules.map(module => (
                                                <li key={module.id} className="px-5 py-5 hover:bg-gray-50 flex items-start group flex-col md:flex-row transition">
                                                    {/* Icon & Title Row */}
                                                    <div className="flex items-start w-full">
                                                        <div className="mr-4 mt-1 text-2xl opacity-80" title={module.moduleType}>
                                                            {module.moduleType === 'resource_url' && ''}
                                                            {module.moduleType === 'resource_file' && ''}
                                                            {module.moduleType === 'assignment' && ''}
                                                            {module.moduleType === 'quiz' && ''}
                                                        </div>
                                                        
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-start">
                                                                <div className="w-full">
                                                                    <h4 className="font-medium text-gray-800 text-base hover:text-indigo-600 cursor-pointer transition-colors">
                                                                        {module.title}
                                                                    </h4>
                                                                    
                                                                    {/* Render Content Chi tiết (bao gồm mô tả) */}
                                                                    {renderModuleContent(module)}
                                                                </div>
                                                                
                                                                {/* Nút sửa module chỉ hiện khi Edit Mode */}
                                                                {isEditing && (
                                                                    <div className="text-sm text-gray-400 space-x-3 hidden group-hover:flex ml-4 bg-white px-2 py-1 rounded shadow-sm border">
                                                                        <button className="hover:text-blue-600 font-medium text-xs">Sửa</button>
                                                                        <div className="border-l h-3 my-auto"></div>
                                                                        <button className="hover:text-red-600 font-medium text-xs">Xóa</button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))
                                        ) : (
                                            <li className="p-8 text-gray-400 italic text-sm text-center bg-gray-50">
                                                {isEditing ? 'Chưa có nội dung. Bấm nút thêm bên dưới để bắt đầu.' : 'Chương này chưa có nội dung.'}
                                            </li>
                                        )}
                                    </ul>

                                    {/* NÚT THÊM HOẠT ĐỘNG (CHỈ HIỆN KHI EDIT MODE) */}
                                    {isEditing && (
                                        <div className="p-3 text-right bg-gray-50 border-t border-dashed border-gray-300">
                                            <button 
                                                onClick={() => openActivitySelector(section.id)}
                                                className="text-sm font-bold text-indigo-600 hover:bg-indigo-100 px-4 py-2 rounded transition flex items-center justify-end ml-auto border border-indigo-200 bg-white shadow-sm"
                                            >
                                                <span className="mr-2 text-lg font-normal">+</span> Thêm hoạt động hoặc tài nguyên
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            
                            {/* Empty State */}
                            {(!course.sections || course.sections.length === 0) && (
                                <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-lg bg-white">
                                    <div className="text-4xl mb-4"></div>
                                    <p className="text-gray-500 mb-4 text-lg">Khóa học này chưa có chương nào.</p>
                                    {/* {isEditing && (
                                        <button 
                                            onClick={() => setShowSectionModal(true)}
                                            className="bg-indigo-600 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-indigo-700 transition transform hover:-translate-y-1"
                                        >
                                            Tạo chương đầu tiên ngay
                                        </button>
                                    )} */}
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {activeTab === 'students' && (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <h3 className="text-xl font-bold text-gray-700 mb-4">Danh sách thành viên</h3>
                        <p className="text-gray-500">Tính năng đang phát triển...</p>
                    </div>
                )}
            </div>

            {/* --- MODAL 1: SELECT ACTIVITY TYPE --- */}
            {showActivitySelector && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-fade-in-up">
                        <div className="p-4 border-b flex justify-between items-center bg-indigo-600 text-white rounded-t-lg">
                            <h3 className="font-bold text-lg">Thêm hoạt động hoặc tài nguyên</h3>
                            <button onClick={() => setShowActivitySelector(false)} className="text-2xl font-bold hover:text-gray-200">&times;</button>
                        </div>
                        
                        <div className="flex-1 overflow-auto p-6 bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Cột 1: Tài nguyên */}
                                <div>
                                    <h4 className="text-gray-500 uppercase text-xs font-bold mb-3 tracking-wider border-b pb-1">Tài nguyên (Resources)</h4>
                                    <div className="space-y-3">
                                        <button onClick={() => handleSelectType('resource_url')} className="w-full text-left p-4 rounded bg-white shadow-sm hover:shadow-md hover:bg-blue-50 flex items-center border border-gray-200 transition">
                                            <span className="text-2xl mr-4 bg-blue-100 p-2 rounded-full w-12 h-12 flex items-center justify-center">🔗</span>
                                            <div>
                                                <div className="font-bold text-gray-800">URL / Link</div>
                                                <div className="text-xs text-gray-500 mt-1">Liên kết đến web hoặc video ngoài</div>
                                            </div>
                                        </button>
                                        <button onClick={() => handleSelectType('resource_file')} className="w-full text-left p-4 rounded bg-white shadow-sm hover:shadow-md hover:bg-green-50 flex items-center border border-gray-200 transition">
                                            <span className="text-2xl mr-4 bg-green-100 p-2 rounded-full w-12 h-12 flex items-center justify-center">📄</span>
                                            <div>
                                                <div className="font-bold text-gray-800">File tài liệu</div>
                                                <div className="text-xs text-gray-500 mt-1">Tải lên PDF, Word, Excel...</div>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* Cột 2: Hoạt động */}
                                <div>
                                    <h4 className="text-gray-500 uppercase text-xs font-bold mb-3 tracking-wider border-b pb-1">Hoạt động (Activities)</h4>
                                    <div className="space-y-3">
                                        <button onClick={() => handleSelectType('assignment')} className="w-full text-left p-4 rounded bg-white shadow-sm hover:shadow-md hover:bg-orange-50 flex items-center border border-gray-200 transition">
                                            <span className="text-2xl mr-4 bg-orange-100 p-2 rounded-full w-12 h-12 flex items-center justify-center">📝</span>
                                            <div>
                                                <div className="font-bold text-gray-800">Bài tập (Assignment)</div>
                                                <div className="text-xs text-gray-500 mt-1">Giao bài tập, nộp file, chấm điểm</div>
                                            </div>
                                        </button>
                                        <button onClick={() => handleSelectType('quiz')} className="w-full text-left p-4 rounded bg-white shadow-sm hover:shadow-md hover:bg-purple-50 flex items-center border border-gray-200 transition">
                                            <span className="text-2xl mr-4 bg-purple-100 p-2 rounded-full w-12 h-12 flex items-center justify-center">❓</span>
                                            <div>
                                                <div className="font-bold text-gray-800">Trắc nghiệm (Quiz)</div>
                                                <div className="text-xs text-gray-500 mt-1">Kiểm tra online tự động chấm</div>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-4 border-t bg-white text-right rounded-b-lg">
                            <button onClick={() => setShowActivitySelector(false)} className="px-6 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded font-medium transition">Đóng</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL 2: FORM NHẬP LIỆU (DYNAMIC) --- */}
            {showModuleForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg animate-fade-in-up">
                        <h3 className="text-2xl font-bold mb-6 text-indigo-700 border-b pb-3">
                            {moduleData.type === 'resource_url' && ' Thêm Đường dẫn mới'}
                            {moduleData.type === 'resource_file' && ' Upload Tài liệu'}
                                {moduleData.type === 'assignment' && ' Tạo Bài tập mới'}
                            {moduleData.type === 'quiz' && 's Tạo Bài kiểm tra'}
                        </h3>
                        
                        <form onSubmit={handleSubmitModule}>
                            {/* Tiêu đề chung */}
                            <div className="mb-5">
                                <label className="block text-sm font-bold mb-2 text-gray-700">Tiêu đề <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition shadow-sm"
                                    required
                                    value={moduleData.title}
                                    onChange={e => setModuleData({...moduleData, title: e.target.value})}
                                    placeholder="Nhập tên nội dung..."
                                    autoFocus
                                />
                            </div>

                            {/* Mô tả chung */}
                            <div className="mb-5">
                                <label className="block text-sm font-bold mb-2 text-gray-700">Mô tả / Hướng dẫn</label>
                                <textarea 
                                    className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition shadow-sm bg-gray-50"
                                    rows="4"
                                    value={moduleData.description}
                                    onChange={e => setModuleData({...moduleData, description: e.target.value})}
                                    placeholder="Nhập mô tả chi tiết (tùy chọn)..."
                                ></textarea>
                            </div>

                            {/* --- FIELD RIÊNG CHO TỪNG LOẠI --- */}
                            
                            {/* 1. URL */}
                            {moduleData.type === 'resource_url' && (
                                <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                                    <label className="block text-sm font-bold mb-2 text-blue-800">Đường dẫn (URL) <span className="text-red-500">*</span></label>
                                    <input 
                                        type="url" 
                                        className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                        required
                                        value={moduleData.url}
                                        onChange={e => setModuleData({...moduleData, url: e.target.value})}
                                        placeholder="https://example.com"
                                    />
                                </div>
                            )}

                            {/* 2. File (Placeholder) */}
                            {moduleData.type === 'resource_file' && (
                                <div className="mb-6 bg-green-50 p-4 rounded-lg border border-green-100">
                                    <label className="block text-sm font-bold mb-2 text-green-800">Chọn File</label>
                                    <input type="file" className="w-full border p-2 rounded bg-white" disabled />
                                    <p className="text-xs text-green-600 mt-2 font-medium italic">⚠️ Chức năng upload đang phát triển. Vui lòng quay lại sau.</p>
                                </div>
                            )}

                            {/* 3. Assignment */}
                            {moduleData.type === 'assignment' && (
                                <div className="mb-6 bg-orange-50 p-4 rounded-lg border border-orange-100">
                                    <label className="block text-sm font-bold mb-2 text-orange-800">Hạn nộp bài (Due Date)</label>
                                    <input 
                                        type="datetime-local" 
                                        className="w-full border p-3 rounded focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                                        value={moduleData.dueDate}
                                        onChange={e => setModuleData({...moduleData, dueDate: e.target.value})}
                                    />
                                </div>
                            )}

                            <div className="flex justify-end space-x-4 mt-8 pt-4 border-t">
                                <button 
                                    type="button" 
                                    onClick={() => setShowModuleForm(false)} 
                                    className="px-6 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition"
                                >
                                    Hủy
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={submitting} 
                                    className="px-8 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold shadow-lg transition transform hover:-translate-y-0.5"
                                >
                                    {submitting ? 'Đang lưu...' : 'Lưu nội dung'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL TẠO CHƯƠNG --- */}
            {showSectionModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md animate-fade-in-up">
                        <h3 className="text-2xl font-bold mb-6 text-gray-800">Tạo Chương / Chủ đề Mới</h3>
                        <form onSubmit={handleCreateSection}>
                            <div className="mb-6">
                                <label className="block text-sm font-bold mb-2 text-gray-700">Tên chương <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                                    placeholder="VD: Chương 1: Giới thiệu"
                                    value={newSectionTitle}
                                    onChange={(e) => setNewSectionTitle(e.target.value)}
                                    autoFocus
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button type="button" onClick={() => setShowSectionModal(false)} className="px-6 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition">Hủy</button>
                                <button type="submit" className="px-8 py-2 bg-indigo-600 text-white rounded-lg font-bold shadow-lg hover:bg-indigo-700 transition transform hover:-translate-y-0.5">Tạo mới</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseDetail;