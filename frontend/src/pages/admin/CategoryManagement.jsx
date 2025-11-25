import React, { useState, useEffect } from 'react';
import categoryApi from '../../api/categoryApi';

const CategoryManagement = () => {
    // --- STATE ---
    const [categories, setCategories] = useState([]); // Danh sách gốc từ API
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', content: '' });

    // State cho Modal (Thêm / Sửa)
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        parentId: '' // Lưu ý: Backend dùng parentId (camelCase)
    });

    // --- LOGIC CALL API ---
    
    // 1. Load danh mục
    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await categoryApi.getAll();
            setCategories(res.data);
        } catch (error) {
            console.error("Lỗi tải danh mục:", error);
            setMessage({ type: 'error', content: 'Không thể tải danh mục.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // 2. Xử lý Submit (Tạo mới / Cập nhật)
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Chuẩn bị payload (chuyển parentId rỗng thành null)
        const payload = {
            name: formData.name,
            parentId: formData.parentId ? parseInt(formData.parentId) : null
        };

        try {
            if (isEditing) {
                await categoryApi.update(currentId, payload);
                setMessage({ type: 'success', content: 'Cập nhật thành công!' });
            } else {
                await categoryApi.create(payload);
                setMessage({ type: 'success', content: 'Tạo danh mục mới thành công!' });
            }
            
            // Reset và reload
            setShowModal(false);
            fetchCategories();

        } catch (error) {
            const msg = error.response?.data?.message || 'Có lỗi xảy ra.';
            setMessage({ type: 'error', content: msg });
        }
    };

    // 3. Xử lý Xóa
    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa danh mục này?")) return;
        
        try {
            await categoryApi.delete(id);
            setMessage({ type: 'success', content: 'Đã xóa danh mục.' });
            fetchCategories();
        } catch (error) {
            // Backend sẽ chặn xóa nếu có con hoặc khóa học
            const msg = error.response?.data?.message || 'Không thể xóa danh mục này.';
            alert(msg); 
        }
    };

    // 4. Mở Modal
    const openCreateModal = () => {
        setIsEditing(false);
        setFormData({ name: '', parentId: '' });
        setShowModal(true);
    };

    const openEditModal = (cat) => {
        setIsEditing(true);
        setCurrentId(cat.id);
        setFormData({ 
            name: cat.name, 
            parentId: cat.parentId || '' 
        });
        setShowModal(true);
    };

    // --- LOGIC RENDER CÂY (RECURSIVE) ---
    // Hàm này giúp hiển thị phân cấp: Cha -> Con -> Cháu
    const renderCategoryTree = (cats, parentId = null, level = 0) => {
        // Lọc ra các node con của parentId hiện tại
        const filtered = cats.filter(c => c.parentId === parentId);
        
        if (filtered.length === 0) return null;

        return (
            <div className={`mt-2 ${level > 0 ? 'ml-6 border-l-2 border-gray-200 pl-4' : ''}`}>
                {filtered.map(cat => (
                    <div key={cat.id} className="mb-2">
                        <div className="flex items-center justify-between bg-white p-3 rounded shadow-sm border hover:shadow-md transition">
                            <div className="flex items-center">
                                {/* Icon thay đổi theo level */}
                                <span className="mr-2 text-gray-500">
                                    {level === 0 ? '📂' : '↳ 📁'}
                                </span>
                                <div>
                                    <h4 className="font-semibold text-gray-800">{cat.name}</h4>
                                    <span className="text-xs text-gray-400">ID: {cat.id} • {cat._count?.courses || 0} khóa học</span>
                                </div>
                            </div>
                            
                            <div className="flex space-x-2">
                                <button 
                                    onClick={() => openEditModal(cat)}
                                    className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                                >
                                    Sửa
                                </button>
                                <button 
                                    onClick={() => handleDelete(cat.id)}
                                    className="px-3 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                        {/* Gọi lại chính nó để render cấp con (Children) */}
                        {renderCategoryTree(cats, cat.id, level + 1)}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Quản lý Danh mục</h2>
                <button 
                    onClick={openCreateModal}
                    className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 flex items-center"
                >
                    <span className="mr-2">+</span> Tạo Danh mục
                </button>
            </div>

            {/* Thông báo */}
            {message.content && (
                <div className={`p-4 mb-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.content} <button onClick={() => setMessage({type:'', content:''})} className="float-right font-bold">x</button>
                </div>
            )}

            {/* Tree View Content */}
            {loading ? (
                <div className="text-center text-gray-500">Đang tải dữ liệu...</div>
            ) : (
                <div className="bg-gray-50 p-4 rounded min-h-[400px]">
                    {/* Bắt đầu render từ Root (parentId = null) */}
                    {renderCategoryTree(categories, null)}
                    
                    {categories.length === 0 && <p className="text-center text-gray-400">Chưa có danh mục nào.</p>}
                </div>
            )}

            {/* --- MODAL FORM --- */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">
                            {isEditing ? `Cập nhật Danh mục #${currentId}` : 'Tạo Danh mục Mới'}
                        </h3>
                        
                        <form onSubmit={handleSubmit}>
                            {/* Tên danh mục */}
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Tên Danh mục</label>
                                <input 
                                    type="text" 
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    required
                                    placeholder="VD: Công nghệ thông tin"
                                />
                            </div>

                            {/* Chọn Danh mục Cha */}
                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Thuộc Danh mục (Optional)
                                </label>
                                <select 
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.parentId}
                                    onChange={(e) => setFormData({...formData, parentId: e.target.value})}
                                >
                                    <option value="">-- Là Danh mục Gốc (Root) --</option>
                                    {/* Loại bỏ chính nó khỏi danh sách cha (tránh loop) */}
                                    {categories
                                        .filter(c => c.id !== currentId) 
                                        .map(cat => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name} (ID: {cat.id})
                                            </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    Để trống nếu đây là danh mục lớn nhất.
                                </p>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end space-x-3">
                                <button 
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                                >
                                    Hủy
                                </button>
                                <button 
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    {isEditing ? 'Lưu thay đổi' : 'Tạo mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryManagement;