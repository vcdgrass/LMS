import React, { useState, useEffect } from 'react';
import coursesApi from '../api/coursesApi';

const TeacherGrading = ({ module }) => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load danh sách bài nộp
    const fetchSubmissions = async () => {
        try {
            const res = await coursesApi.getSubmissions(module.id);
            setSubmissions(res.data);
        } catch (error) {
            console.error("Lỗi lấy bài nộp:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubmissions();
    }, [module.id]);

    // Xử lý chấm điểm
    const handleGrade = async (studentId, score, feedback) => {
        try {
            await coursesApi.updateGrade(module.id, {
                studentId,
                score,
                feedback
            });
            alert("Đã lưu điểm!");
            // Không cần reload toàn bộ, chỉ cần update state cục bộ nếu muốn UX mượt hơn
            // Ở đây ta gọi lại API cho chắc chắn
            fetchSubmissions(); 
        } catch (error) {
            alert("Lỗi khi lưu điểm: " + error.response?.data?.message);
        }
    };

    if (loading) return <div>Đang tải danh sách bài nộp...</div>;

    return (
        <div className="mt-4 bg-white border rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gray-100 p-3 border-b font-bold text-gray-700">
                Danh sách bài nộp ({submissions.length})
            </div>
            
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-3 text-left">Học viên</th>
                            <th className="p-3 text-left">Thời gian nộp</th>
                            <th className="p-3 text-left">File bài làm</th>
                            <th className="p-3 text-left">Điểm số (0-10)</th>
                            <th className="p-3 text-left">Nhận xét</th>
                            <th className="p-3 text-center">Tác vụ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {submissions.length === 0 ? (
                            <tr><td colSpan="6" className="p-4 text-center text-gray-500">Chưa có bài nộp nào.</td></tr>
                        ) : submissions.map((sub) => (
                            <GradingRow key={sub.id} submission={sub} onSave={handleGrade} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Tách ra component con để quản lý state input của từng dòng
const GradingRow = ({ submission, onSave }) => {
    // Sửa: Lấy thông tin từ thuộc tính 'student' thay vì 'user'
    const student = submission.student || {}; 

    const [score, setScore] = useState(submission.score !== null ? submission.score : '');
    const [feedback, setFeedback] = useState(submission.feedback || '');
    const [isChanged, setIsChanged] = useState(false);

    const handleSave = () => {
        if (score === '' || score < 0 || score > 10) {
            alert("Điểm không hợp lệ (0-10)");
            return;
        }
        // Sửa: Dùng student.id thay vì submission.user.id
        onSave(student.id, score, feedback);
        setIsChanged(false);
    };

    return (
        <tr className="hover:bg-gray-50">
            <td className="p-3">
                {/* Sửa: Dùng biến student đã khai báo ở trên hoặc optional chaining */}
                <div className="font-medium">{student?.username || "Không tên"}</div>
                <div className="text-xs text-gray-500">{student?.email}</div>
            </td>
            <td className="p-3">
                {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString('vi-VN') : "Chưa nộp"}
                {submission.isLate && <span className="ml-2 text-xs text-red-500 font-bold">(Muộn)</span>}
            </td>
            <td className="p-3">
                {submission.filePath ? (
                    <a 
                        href={`http://localhost:5000/${submission.filePath}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                    Tải về
                    </a>
                ) : (
                    <span className="text-gray-400 text-xs">Không có file</span>
                )}
            </td>
            <td className="p-3">
                <input 
                    type="number" 
                    min="0" max="10" step="0.1"
                    className="w-16 border rounded p-1 text-center"
                    value={score}
                    onChange={(e) => { setScore(e.target.value); setIsChanged(true); }}
                />
            </td>
            <td className="p-3">
                <input 
                    type="text" 
                    className="w-full border rounded p-1"
                    placeholder="Nhập nhận xét..."
                    value={feedback}
                    onChange={(e) => { setFeedback(e.target.value); setIsChanged(true); }}
                />
            </td>
            <td className="p-3 text-center">
                <button 
                    onClick={handleSave}
                    disabled={!isChanged}
                    className={`px-3 py-1 rounded text-white text-xs font-bold transition ${isChanged ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300 cursor-not-allowed'}`}
                >
                    Lưu
                </button>
            </td>
        </tr>
    );
};

export default TeacherGrading;