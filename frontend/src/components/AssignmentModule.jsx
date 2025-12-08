// frontend/src/components/AssignmentModule.jsx
import React, { useState, useEffect } from 'react';
import coursesApi from '../api/coursesApi';
import { useAuth } from '../contexts/AuthContext'; // Import AuthContext
import TeacherGrading from './TeacherGrading'; // Import component mới tạo

const AssignmentModule = ({ module }) => {
  const { user } = useAuth(); // Lấy user hiện tại
  const [assignmentData, setAssignmentData] = useState(null);
  
  // ... (giữ nguyên state upload file của Student) ...
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  // Lấy chi tiết đề bài
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await coursesApi.getModuleById(module.contentId, 'assignment');
        setAssignmentData(res.data);
      } catch (error) {
        console.error("Lỗi lấy nội dung assignment:", error);
      }
    };
    fetchData();
  }, [module.contentId]);

  const formattedDate = assignmentData?.dueDate
    ? new Date(assignmentData.dueDate).toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : 'Không có hạn';

  // --- LOGIC GIAO DIỆN ---
  
  return (
    <div className="mt-2 ml-0 md:ml-8 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* 1. Đề bài (Ai cũng thấy) */}
      <div className="mb-4 border-b pb-4">
          <h5 className="font-bold text-gray-800 text-sm uppercase tracking-wide mb-1">
              Yêu cầu bài tập
          </h5>
          <div className="text-gray-600 text-sm whitespace-pre-wrap mb-2">
              {assignmentData?.description || module?.description || 'Không có mô tả'}
          </div>
          <div className="text-sm">
              <span className="font-semibold text-gray-700">Hạn nộp: </span> 
              <span className="text-red-600 font-medium">{formattedDate}</span>
          </div>
      </div>

      {/* 2. Phân quyền hiển thị */}
      {(user.role === 'teacher' || user.role === 'admin') ? (
          // --- VIEW CHO GIẢNG VIÊN ---
          <TeacherGrading module={module} />
      ) : (
          // --- VIEW CHO HỌC VIÊN (Form nộp bài cũ) ---
          <div className="bg-gray-50 p-4 rounded border border-gray-200">
              <h5 className="font-bold text-gray-800 text-sm mb-2">Nộp bài làm của bạn</h5>
              
              <div className="flex items-center space-x-2">
                  <input 
                      type="file" 
                      onChange={(e) => {setSelectedFile(e.target.files[0]); setMessage('')}}
                      className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  <button 
                      onClick={async () => {
                          if (!selectedFile) return alert("Chọn file đi!");
                          if (!window.confirm("Nộp bài nhé?")) return;
                          setUploading(true);
                          try {
                              await coursesApi.submitAssignment(module.contentId, selectedFile);
                              setMessage("✅ Nộp bài thành công!");
                              setSelectedFile(null);
                          } catch (error) {
                              setMessage("❌ Lỗi: " + (error.response?.data?.message || "Mạng lỗi"));
                          } finally {
                              setUploading(false);
                          }
                      }}
                      disabled={uploading || !selectedFile}
                      className={`px-4 py-2 text-sm text-white rounded font-bold transition shadow ${
                          uploading || !selectedFile 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                  >
                      {uploading ? 'Đang nộp...' : 'Nộp bài'}
                  </button>
              </div>
              {message && <div className="mt-2 text-sm font-medium">{message}</div>}
          </div>
      )}
    </div>
  );
};

export default AssignmentModule;