import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import coursesApi from '../../api/coursesApi';
import { useAuth } from '../../contexts/AuthContext';
import AssignmentModule from '../../components/AssignmentModule';
import ResourseModule from '../../components/ResourseModule';

const CourseDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('content');
    const [createModuleTab, setCreateModuleTab] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const [showSectionModal, setShowSectionModal] = useState(false);
    const [showActivitySelector, setShowActivitySelector] = useState(false);
    const [showModuleForm, setShowModuleForm] = useState(false);

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setModuleData((prevData) => ({
        ...prevData,
        [name]: value
        }));
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

    const handleDeleteModule = async (moduleId, type) => {
        if (!window.confirm("Bạn có chắc muốn xóa bài học này?")) return;
        try {
            await coursesApi.deleteModule(moduleId, type);
            alert("Xóa bài học thành công!");
            fetchCourseDetail();
        } catch (error) {
            console.error(error);
            alert("Lỗi khi xoá bài học.");
        }
    };

    const openActivitySelector = (sectionId) => {
        setActiveSectionId(sectionId);
        setShowActivitySelector(!showActivitySelector);
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
            console.log(moduleData);
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
        let specificContent = null;

        if (module.moduleType === 'resource_url' || module.moduleType === 'resource_file') {   
            specificContent = <ResourseModule module={module} />;      
        } else if (module.moduleType === 'assignment') {
            specificContent = <AssignmentModule module={module} />;
        }

        return <div>{specificContent}</div>;
    };

    const canEdit = user && (user.role === 'teacher' || user.role === 'admin');

    if (loading) return <div>Đang tải dữ liệu khóa học...</div>;
    if (!course) return <div>Không tìm thấy khóa học hoặc bạn không có quyền truy cập.</div>;

    return (
        <div>
            <h2>{course.title}</h2>
            <div> {canEdit && <button onClick={toggleEditMode}>{isEditing ? 'Tắt chỉnh sửa' : 'Bật chỉnh sửa'}</button>} </div>
            <div>
              <button onClick={() => setActiveTab('content')}>Nội dung khoá học</button>
              <button onClick={() => setActiveTab('student')}>Học sinh</button>
              <button onClick={() => setActiveTab('grade')}>Điểm</button>
            </div>
            {activeTab === 'content' && (
                <div>
                    {isEditing && <button onClick={() => setShowSectionModal(true)}>+ Thêm Chủ đề mới</button>}
                    {course.sections?.map(section => (
                        <div key={section.id}>
                            <h3>{section.title}</h3>
                            {isEditing && <button onClick={() => handleDeleteSection(section.id)}>Xóa chương</button>}
                            <ul>
                                {section.modules?.map(module => (
                                    <li key={module.id}>
                                        <h4>{module.title}</h4>
                                        {renderModuleContent(module)}
                                        {isEditing && <button onClick={() => handleDeleteModule(module.id, module.moduleType)}>Xóa module</button>}
                                    </li>
                                ))}
                            </ul>
                            {isEditing && <button onClick={() => openActivitySelector(section.id)}>+ Thêm hoạt động</button>}
                            {showActivitySelector && (
                              <div>
                                <div>
                                  <button onClick={() => {
                                    handleSelectType('resource_file');   // gọi hàm với tham số
                                    setCreateModuleTab('resource_file'); // cập nhật tab
                                    }}>
                                    Bài giảng</button>
                                  <button onClick={() => {
                                    handleSelectType('assignment');   // gọi hàm với tham số
                                    setCreateModuleTab('assignment'); // cập nhật tab
                                    }}>Bài tập</button>
                                  <button onClick={() => {
                                    handleSelectType('quiz');   // gọi hàm với tham số
                                    setCreateModuleTab('quiz'); // cập nhật tab
                                    }}>Quiz</button>
                                </div>
                                {createModuleTab === 'resource_file' && (
                                  <div>
                                    <form onSubmit={handleSubmitModule}>
                                      <label htmlFor="title">Tiêu đề:</label>
                                      <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        value={moduleData.title}
                                        onChange={handleChange}
                                        required
                                      />

                                      <label htmlFor="description">Mô tả:</label>
                                      <textarea
                                        id="description"
                                        name="description"
                                        value={moduleData.description}
                                        onChange={handleChange}
                                        required
                                      />

                                      <label htmlFor="url">Liên kết (URL):</label>
                                      <input
                                        type="url"
                                        id="url"
                                        name="url"
                                        value={moduleData.url}
                                        onChange={handleChange}
                                        // required
                                      />
                                      <button type="submit">Tạo Module</button>
                                    </form>
                                  </div>
                                )}
                              </div>
                            )}
                            {createModuleTab === 'assignment' && (
                                <div>
                                    <form onSubmit={handleSubmitModule}>
                                      <label htmlFor="title">Tiêu đề:</label>
                                      <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        value={moduleData.title}
                                        onChange={handleChange}
                                        required
                                      />

                                      <label htmlFor="description">Mô tả:</label>
                                      <textarea
                                        id="description"
                                        name="description"
                                        value={moduleData.description}
                                        onChange={handleChange}
                                        required
                                      />

                                      <label htmlFor="dueDate">Hạn nộp:</label>
                                        <input
                                        type="datetime-local"
                                        id="dueDate"
                                        name="dueDate"              
                                        value={moduleData.dueDate} 
                                        onChange={handleChange}
                                        />
                                      <button type="submit">Tạo Module</button>
                                    </form>
                                </div>
                            )}
                            {createModuleTab === 'quiz' && (
                                <div>
                                    <form onSubmit={handleSubmitModule}>
                                      <label htmlFor="timeLimitMinutes">Tiêu đề:</label>
                                      <input
                                        type="time"
                                        id="timeLimitMinutes"
                                        name="timeLimitMinutes"
                                        value={moduleData.timeLimitMinutes}
                                        onChange={handleChange}
                                        required
                                      />

                                      <label htmlFor="description">Mô tả:</label>
                                      <textarea
                                        id="description"
                                        name="description"
                                        value={moduleData.description}
                                        onChange={handleChange}
                                        required
                                      />

                                      <button type="submit">Tạo Module</button>
                                    </form>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CourseDetail;
