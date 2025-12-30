import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // [MỚI] Thêm useParams
import coursesApi from '../../api/coursesApi';
import categoryApi from '../../api/categoryApi';

const CreateCourse = () => {
    const navigate = useNavigate();
    const { schoolSlug } = useParams(); // [MỚI] Lấy slug trường từ URL (VD: ChuyenHT)

    const [courseData, setCourseData] = useState({
        title: '',
        description: '',
        categoryId: '',
        startDate: '',
        endDate: '',
        enrollmentKey: ''
    });

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await categoryApi.getAll();
                console.log("Loaded Categories:", data);
                setCategories(data.data);
            } catch (err) {
                console.error("Lỗi tải danh mục:", err);
            }
        };
        fetchCategories();
    }, []);

    const handleChange = (e) => {
        setCourseData({ ...courseData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await coursesApi.createCourses(courseData);
            
            // [SỬA LỖI TẠI ĐÂY]
            // Cũ: navigate('/teacher/dashboard'); -> Sai vì thiếu slug
            // Mới: Gắn thêm schoolSlug vào trước
            navigate(`/${schoolSlug}/teacher/dashboard`); 

        } catch (err) {
            const msg = err.response?.data?.message || "Tạo khóa học thất bại";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Tạo Khóa Học Mới</h1>
            
            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                    <p>{error}</p>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl">
                <form onSubmit={handleSubmit}>
                    {/* Tên khóa học */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Tên khóa học</label>
                        <input
                            type="text"
                            name="title"
                            value={courseData.title}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ví dụ: Toán Lớp 10A1"
                        />
                    </div>

                    {/* Danh mục */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Danh mục</label>
                        <select
                            name="categoryId"
                            value={courseData.categoryId}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">-- Chọn danh mục --</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>   
                            ))}
                        </select>
                    </div>

                    {/* Mô tả */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Mô tả</label>
                        <textarea
                            name="description"
                            value={courseData.description}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        ></textarea>
                    </div>

                    {/* Thời gian */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Ngày bắt đầu</label>
                            <input
                                type="date"
                                name="startDate"
                                value={courseData.startDate}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Ngày kết thúc</label>
                            <input
                                type="date"
                                name="endDate"
                                value={courseData.endDate}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Mã ghi danh */}
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Mã ghi danh (Tùy chọn)</label>
                        <input
                            type="text"
                            name="enrollmentKey"
                            value={courseData.enrollmentKey}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Mật khẩu để học sinh tự vào lớp"
                        />
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => navigate(`/${schoolSlug}/teacher/dashboard`)} // Nút Hủy cũng phải sửa link
                            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-6 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Đang tạo...' : 'Tạo Khóa Học'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateCourse;