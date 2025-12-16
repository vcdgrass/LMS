import React, { useState, useEffect } from 'react';
import api from '../../api/axiosClient';

const UserManagement = () => {
    // --- STATE QUẢN LÝ ---
    const [activeTab, setActiveTab] = useState('list'); 
    const [users, setUsers] = useState([]); // State lưu danh sách user từ API
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', content: '' });

    // State cho Form
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: '',
        isLocked: ''
    });
    const [csvFile, setCsvFile] = useState(null);
    const [importResult, setImportResult] = useState(null);

    // --- LOGIC GỌI API ---

    // 1. Hàm lấy danh sách User
    const fetchUsers = async () => {
        setLoading(true);
        try {          
            const res = await api.get('/admin/users');
            setUsers(res.data);
        } catch (error) {
            console.error("Lỗi tải danh sách:", error);
            setMessage({ type: 'error', content: 'Không thể tải danh sách người dùng.' });
        } finally {
            setLoading(false);
        }
    };

    // Gọi API khi chuyển sang tab 'list'
    useEffect(() => {
        if (activeTab === 'list') {
            fetchUsers();
        }
    }, [activeTab]);

    // 2. Hàm xử lý Khóa / Mở khóa User 
    const handleToggleLock = async (userId, currentStatus) => {
        if (!window.confirm(`Bạn có chắc muốn ${currentStatus ? 'MỞ KHÓA' : 'KHÓA'} người dùng này?`)) return;

        try {
            // [FIX] Sửa body gửi lên khớp với logic backend (nếu backend nhận field này)
            // Tuy nhiên userController chưa có route update lock riêng lẻ, 
            // giả sử bạn sẽ bổ sung sau. Hiện tại cập nhật UI trước.
            
            // Nếu bạn chưa có API lock, đoạn này sẽ lỗi 404. 
            // Tạm thời comment API call hoặc đảm bảo route backend đã tồn tại.
            /* await api.patch(`/admin/users/${userId}/lock`, { 
                isLocked: !currentStatus 
            });
            */

            // Cập nhật lại UI ngay lập tức (không cần load lại trang)
            // [FIX] user.id và user.isLocked
            setUsers(users.map(user => 
                user.id === userId ? { ...user, isLocked: !currentStatus } : user
            ));

            setMessage({ type: 'success', content: 'Cập nhật trạng thái thành công (Demo UI)!' });
        } catch (error) {
            setMessage({ type: 'error', content: 'Lỗi khi cập nhật trạng thái user.' });
        }
    };

    // 3. Xử lý Create & Import (Giữ nguyên logic cũ)
    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/admin/users', formData);
            setMessage({ type: 'success', content: 'Tạo người dùng thành công!' });
            setFormData({ username: '', email: '', password: '', role: 'student' });
            fetchUsers(); // Refresh lại list nếu cần
        } catch (error) {
            setMessage({ type: 'error', content: error.response?.data?.message || 'Lỗi tạo user' });
        } finally {
            setLoading(false);
        }
    };

    const handleImportSubmit = async (e) => { 
        e.preventDefault();
        
        // 1. Validate file đầu vào
        if (!csvFile) {
            setMessage({ type: 'error', content: 'Vui lòng chọn file CSV trước khi bấm Import!' });
            return;
        }
        // Kiểm tra đuôi file đơn giản ở Client
        if (!csvFile.name.endsWith('.csv')) {
             setMessage({ type: 'error', content: 'Chỉ chấp nhận file định dạng .csv' });
             return;
        }
        setLoading(true);
        setImportResult(null); // Reset kết quả cũ
        setMessage({ type: '', content: '' });

        // 2. Tạo FormData (Bắt buộc khi upload file)
        const formData = new FormData();
        // Key 'file' phải khớp với backend: upload.single('file')
        formData.append('file', csvFile); 

        try {
            // 3. Gọi API
            const res = await api.post('/admin/users/import', formData);

            // 4. Xử lý kết quả thành công
            setMessage({ 
                type: 'success', 
                content: `Import hoàn tất!` 
            });
            setImportResult({
                total: res.totalRows,
                inserted: res.inserted,
                skipped: res.skipped
            });

            // Reset file input
            setCsvFile(null);
            document.getElementById('csvInput').value = ""; 

        } catch (error) {
            console.error("Import Error:", error);
            setMessage({ 
                type: 'error', 
                content: error.response?.data?.message || 'Lỗi kết nối khi upload file.' 
            });
        } finally {
            setLoading(false);
        }
    };


    // --- HÀM HỖ TRỢ RENDER UI ---
    
    // Hàm hiển thị màu sắc cho Role
    const getRoleBadge = (role) => {
        switch(role) {
            case 'admin': return <span className="px-2 py-1 rounded bg-purple-100 text-purple-700 text-xs font-bold">Admin</span>;
            case 'teacher': return <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-bold">Giảng viên</span>;
            default: return <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs font-bold">Học viên</span>;
        }
    };

    return (
        <div className="bg-white p-6 rounded shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Quản lý Người dùng</h2>

            {/* Thông báo lỗi/thành công */}
            {message.content && (
                <div className={`p-4 mb-4 rounded flex justify-between ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    <span>{message.content}</span>
                    <button onClick={() => setMessage({ type: '', content: '' })} className="font-bold">x</button>
                </div>
            )}

            {/* Tabs */}
            <div className="flex border-b mb-6">
                <button className={`px-4 py-2 font-semibold ${activeTab === 'list' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`} onClick={() => setActiveTab('list')}>Danh sách User</button>
                <button className={`px-4 py-2 font-semibold ${activeTab === 'create' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`} onClick={() => setActiveTab('create')}>+ Thêm thủ công</button>
                <button className={`px-4 py-2 font-semibold ${activeTab === 'import' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`} onClick={() => setActiveTab('import')}>📤 Import CSV</button>
            </div>

            {/* --- DANH SÁCH USER (UPDATED) --- */}
            {activeTab === 'list' && (
                <div className="overflow-x-auto">
                    {loading ? (
                        <p className="text-center text-gray-500 py-4">Đang tải dữ liệu...</p>
                    ) : users.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">Chưa có người dùng nào trong hệ thống.</p>
                    ) : (
                        <table className="min-w-full border collapse">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-3 text-left border text-sm font-semibold text-gray-600">ID</th>
                                    <th className="p-3 text-left border text-sm font-semibold text-gray-600">Username</th>
                                    <th className="p-3 text-left border text-sm font-semibold text-gray-600">Email</th>
                                    <th className="p-3 text-center border text-sm font-semibold text-gray-600">Vai trò</th>
                                    <th className="p-3 text-center border text-sm font-semibold text-gray-600">Trạng thái</th>
                                    <th className="p-3 text-center border text-sm font-semibold text-gray-600">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition">
                                        <td className="p-3 border text-sm text-gray-700">#{user.id}</td>
                                        <td className="p-3 border text-sm font-medium text-blue-600">{user.username}</td>
                                        <td className="p-3 border text-sm text-gray-600">{user.email}</td>
                                        <td className="p-3 border text-center">{getRoleBadge(user.role)}</td>
                                        <td className="p-3 border text-center">
                                            {user.isLocked ? (
                                                <span className="text-red-500 text-xs font-bold border border-red-200 bg-red-50 px-2 py-1 rounded">Locked</span>
                                            ) : (
                                                <span className="text-green-500 text-xs font-bold border border-green-200 bg-green-50 px-2 py-1 rounded">Active</span>
                                            )}
                                        </td>
                                        <td className="p-3 border text-center space-x-2">
                                            {/* [FIX] Truyền đúng tham số vào hàm toggle */}
                                            <button 
                                                onClick={() => handleToggleLock(user.id, user.isLocked)}
                                                className={`text-xs px-3 py-1 rounded border transition ${
                                                    user.isLocked 
                                                    ? 'bg-green-600 text-white hover:bg-green-700' 
                                                    : 'bg-yellow-500 text-white hover:bg-yellow-600'
                                                }`}
                                            >
                                                {user.isLocked ? 'Mở khóa' : 'Khóa'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* Form Create */}
            {activeTab === 'create' && (
                <form onSubmit={handleCreateSubmit} className="max-w-lg mt-4">
                     <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2">Username</label>
                        <input type="text" className="w-full border p-2 rounded" required 
                               value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                     </div>
                     <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2">Email</label>
                        <input type="email" className="w-full border p-2 rounded" required 
                               value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                     </div>
                     <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2">Role</label>
                        <select className="w-full border p-2 rounded" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                            <option value="admin">Admin</option>
                        </select>
                     </div>
                     <div className="mb-6">
                        <label className="block text-gray-700 font-bold mb-2">Password</label>
                        <input type="password" className="w-full border p-2 rounded" placeholder="Mặc định: Student@123"
                               value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                     </div>
                     <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
                        {loading ? 'Processing...' : 'Create User'}
                     </button>
                </form>
            )}

            {/* Form Import CSV */}
            {activeTab === 'import' && (
                <div className="max-w-xl mx-auto mt-8">
                    
                    {/* Hướng dẫn định dạng file */}
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                        <div className="flex">
                            <div className="flex-shrink-0">ℹ️</div>
                            <div className="ml-3">
                                <p className="text-sm text-blue-700 font-bold">Quy định định dạng File CSV:</p>
                                <p className="text-sm text-blue-700 mt-1">
                                    File cần có header (dòng đầu tiên) với các cột chính xác như sau:
                                </p>
                                <code className="block bg-blue-100 p-2 mt-2 rounded text-xs font-mono text-blue-900">
                                    username,email,role
                                </code>
                                <p className="text-xs text-blue-600 mt-2">
                                    * Role chấp nhận: <b>student, teacher, admin</b> (Nếu để trống mặc định là student).
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form Upload */}
                    <form onSubmit={handleImportSubmit} className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition">
                        <div className="space-y-4">
                            <div className="text-6xl">📂</div>
                            <label className="block text-gray-700 font-medium">
                                Chọn file CSV từ máy tính
                            </label>
                            
                            <input 
                                id="csvInput"
                                type="file" 
                                accept=".csv"
                                onChange={(e) => setCsvFile(e.target.files[0])}
                                className="block w-full text-sm text-gray-500
                                  file:mr-4 file:py-2 file:px-4
                                  file:rounded-full file:border-0
                                  file:text-sm file:font-semibold
                                  file:bg-blue-50 file:text-blue-700
                                  hover:file:bg-blue-100
                                  mx-auto max-w-xs
                                "
                            />
                            
                            {csvFile && (
                                <p className="text-sm text-green-600 font-semibold">
                                    Đã chọn: {csvFile.name} ({(csvFile.size / 1024).toFixed(2)} KB)
                                </p>
                            )}

                            <button 
                                type="submit" 
                                disabled={loading || !csvFile}
                                className={`w-full py-2 px-4 rounded shadow font-bold text-white transition ${
                                    loading || !csvFile 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-green-600 hover:bg-green-700'
                                }`}
                            >
                                {loading ? 'Đang tải lên...' : 'Bắt đầu Import'}
                            </button>
                        </div>
                    </form>

                    {/* Hiển thị Kết quả chi tiết sau khi Import xong */}
                    {importResult && (
                        <div className="mt-6 bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
                            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 font-bold text-gray-700">
                                Kết quả Import
                            </div>
                            <div className="p-4 grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <p className="text-gray-500 text-xs uppercase">Tổng số dòng</p>
                                    <p className="text-xl font-bold text-gray-800">{importResult.total}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs uppercase">Thêm mới</p>
                                    <p className="text-xl font-bold text-green-600">{importResult.inserted}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs uppercase">Bỏ qua (Trùng)</p>
                                    <p className="text-xl font-bold text-orange-500">{importResult.skipped}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default UserManagement;