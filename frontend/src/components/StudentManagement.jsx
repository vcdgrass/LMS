import React, { useState, useEffect } from 'react';
import coursesApi from '../api/coursesApi';

const StudentManagement = ({ courseId, canEdit }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    // Load danh sách học sinh
    const fetchStudents = async () => {
        try {
            const res = await coursesApi.getStudents(courseId);
            setStudents(res.data);
        } catch (error) {
            console.error("Lỗi tải danh sách học viên:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, [courseId]);

    // Xử lý thêm học sinh
    const handleAddStudent = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;

        setIsAdding(true);
        try {
            await coursesApi.addStudent(courseId, email);
            alert("Thêm học viên thành công!");
            setEmail('');
            fetchStudents(); // Reload list
        } catch (error) {
            alert(error.response?.data?.message || "Lỗi khi thêm học viên.");
        } finally {
            setIsAdding(false);
        }
    };

    // Xử lý xóa học sinh
    const handleRemove = async (studentId) => {
        if (!window.confirm("Bạn chắc chắn muốn xóa học viên này khỏi lớp?")) return;
        try {
            await coursesApi.removeStudent(courseId, studentId);
            fetchStudents();
        } catch (error) {
            alert("Lỗi khi xóa học viên.");
        }
    };

    if (loading) return <div className="text-gray-500 py-4">Đang tải danh sách...</div>;

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Danh sách thành viên</h3>

            {/* Form thêm học sinh (Chỉ Teacher/Admin thấy) */}
            {canEdit && (
                <div className="mb-8 bg-blue-50 p-4 rounded border border-blue-100">
                    <h4 className="font-bold text-blue-800 mb-2 text-sm uppercase">Thêm học viên vào lớp</h4>
                    <form onSubmit={handleAddStudent} className="flex gap-2">
                        <input 
                            type="email" 
                            className="flex-1 border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nhập email của học viên (VD: student@example.com)..."
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <button 
                            type="submit" 
                            disabled={isAdding}
                            className={`px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition ${isAdding ? 'opacity-50' : ''}`}
                        >
                            {isAdding ? 'Đang thêm...' : 'Thêm'}
                        </button>
                    </form>
                </div>
            )}

            {/* Danh sách Table */}
            {students.length === 0 ? (
                <p className="text-gray-500 italic text-center py-4">Lớp học chưa có học viên nào.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-gray-100 text-gray-600 uppercase font-medium">
                            <tr>
                                <th className="p-3">STT</th>
                                <th className="p-3">Tên đăng nhập</th>
                                <th className="p-3">Email</th>
                                {canEdit && <th className="p-3 text-right">Hành động</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {students.map((item, index) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="p-3 text-gray-500">{index + 1}</td>
                                    <td className="p-3 font-medium text-gray-800">{item.user.username}</td>
                                    <td className="p-3 text-gray-600">{item.user.email}</td>
                                    {canEdit && (
                                        <td className="p-3 text-right">
                                            <button 
                                                onClick={() => handleRemove(item.user.id)}
                                                className="text-red-500 hover:text-red-700 font-medium text-xs border border-red-200 px-2 py-1 rounded hover:bg-red-50"
                                            >
                                                Xóa khỏi lớp
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default StudentManagement;