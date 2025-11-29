import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosClient';
import categoryApi from '../../api/categoryApi'; // Tận dụng API category đã viết

const CreateCourse = () => {
    const navigate = useNavigate();
    
    // State dữ liệu form
    const [formData, setFormData] = useState({
        title: '',
        categoryId: '',
        description: '',
        startDate: '',
        endDate: '',
        enrollmentKey: '' //  Mật khẩu lớp
    });

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // 1. Load danh mục khóa học để hiển thị dropdown [cite: 11-16]
    useEffect(() => {
        const fetchCats = async () => {
            try {
                const res = await categoryApi.getAll();
                // Nếu backend trả về dạng cây, bạn có thể cần làm phẳng hoặc chỉ lấy danh mục con
                // Ở đây giả sử lấy list phẳng
                setCategories(res.data);
            } catch (err) {
                console.error("Lỗi tải danh mục:", err);
            }
        };
        fetchCats();
    }, []);

    // 2. Xử lý Input thay đổi
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 3. Submit Form [cite: 20-25]
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/courses', formData);
            alert("Tạo khóa học thành công!");
            // Chuyển hướng về Dashboard để thấy khóa học mới
            navigate('/teacher/dashboard');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Có lỗi xảy ra khi tạo khóa học.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3">📝</span>
                Tạo Khóa Học Mới
            </h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-8">
                
                {/* --- PHẦN 1: THÔNG TIN CƠ BẢN --- */}
                <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">1. Thông tin chung</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Tên khóa học  */}
                    <div className="md:col-span-2">
                        <label className="block text-gray-700 font-bold mb-2">Tên khóa học <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Ví dụ: Lập trình Web với Node.js"
                        />
                    </div>

                    {/* Danh mục  */}
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">Danh mục <span className="text-red-500">*</span></label>
                        <select 
                            name="categoryId"
                            value={formData.categoryId}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        >
                            <option value="">-- Chọn danh mục --</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Enrollment Key [cite: 24, 105] */}
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">
                            Mật khẩu lớp (Enrollment Key) <span className="text-red-500">*</span>
                        </label>
                        <input 
                            type="text" 
                            name="enrollmentKey"
                            value={formData.enrollmentKey}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-yellow-50"
                            placeholder="VD: K65-CNTT"
                        />
                        <p className="text-xs text-gray-500 mt-1">Sinh viên cần mã này để tự ghi danh vào lớp.</p>
                    </div>
                </div>

                {/* --- PHẦN 2: THỜI GIAN & MÔ TẢ --- */}
                <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2 mt-8">2. Thời gian & Nội dung</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Ngày bắt đầu  */}
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">Ngày bắt đầu</label>
                        <input 
                            type="date" 
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleChange}
                            className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Ngày kết thúc  */}
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">Ngày kết thúc</label>
                        <input 
                            type="date" 
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleChange}
                            className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                {/* Mô tả  */}
                <div className="mb-8">
                    <label className="block text-gray-700 font-bold mb-2">Mô tả khóa học</label>
                    <textarea 
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                        className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Giới thiệu sơ lược về nội dung giảng dạy..."
                    ></textarea>
                </div>

                {/* BUTTON ACTIONS */}
                <div className="flex items-center justify-end space-x-4">
                    <button 
                        type="button"
                        onClick={() => navigate('/teacher/dashboard')}
                        className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded hover:bg-gray-300 transition"
                    >
                        Hủy bỏ
                    </button>
                    <button 
                        type="submit"
                        disabled={loading}
                        className={`px-8 py-3 bg-indigo-600 text-white font-bold rounded shadow hover:bg-indigo-700 transition ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {loading ? 'Đang tạo...' : 'Hoàn tất & Tạo khóa học'}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default CreateCourse;