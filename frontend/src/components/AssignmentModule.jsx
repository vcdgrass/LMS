import React, { useState, useEffect } from 'react';
import coursesApi from '../api/coursesApi';

const AssignmentModule = ({ module }) => {
  const [assignmentData, setAssignmentData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  // Lấy chi tiết bài tập
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

  // Xử lý khi chọn file
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setMessage('');
  };

  // Xử lý nộp bài
  const handleSubmit = async () => {
    if (!selectedFile) {
        alert("Vui lòng chọn file trước khi nộp!");
        return;
    }

    if (!window.confirm("Bạn có chắc chắn muốn nộp bài này?")) return;

    setUploading(true);
    try {
        // module.contentId chính là assignmentId trong DB (dựa trên logic tạo module)
        await coursesApi.submitAssignment(module.contentId, selectedFile);
        setMessage("✅ Nộp bài thành công!");
        setSelectedFile(null);
        // Có thể reload lại dữ liệu submission nếu cần
    } catch (error) {
        console.error(error);
        setMessage("❌ Nộp bài thất bại: " + (error.response?.data?.message || "Lỗi mạng"));
    } finally {
        setUploading(false);
    }
  };

  const formattedDate = assignmentData?.dueDate
    ? new Date(assignmentData.dueDate).toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : 'Không có hạn';

  return (
    <div className="mt-2 ml-0 md:ml-8 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="mb-3">
          <h5 className="font-bold text-gray-800 text-sm uppercase tracking-wide mb-1">
              Chi tiết bài tập
          </h5>
          <div className="text-gray-600 text-sm whitespace-pre-wrap">
              {assignmentData?.description || module?.description || 'Không có mô tả'}
          </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-gray-50 p-3 rounded">
          <div className="text-sm mb-2 sm:mb-0">
              <span className="font-semibold text-gray-700">Hạn nộp: </span> 
              <span className="text-red-600 font-medium">{formattedDate}</span>
          </div>

          {/* Form Upload */}
          <div className="flex items-center space-x-2">
              <input 
                  type="file" 
                  onChange={handleFileChange}
                  className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              <button 
                  onClick={handleSubmit}
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
      </div>
      
      {message && (
          <div className={`mt-3 text-sm font-medium ${message.includes('thành công') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
          </div>
      )}
    </div>
  );
};

export default AssignmentModule;