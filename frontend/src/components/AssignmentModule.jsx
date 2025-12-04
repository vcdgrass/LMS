import React, { useState, useEffect } from 'react';
import coursesApi from '../api/coursesApi';

const AssignmentModule = ({ module }) => {
  const [assignmentData, setAssignmentData] = useState(null);

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
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '--/--/----';

  return (
    <div>
      <div>Bài tập</div>
      {/* Dùng optional chaining + fallback */}
      <div>{assignmentData?.description || module?.description || 'Không có mô tả'}</div>
      <p>Hạn nộp: {formattedDate}</p>
      <button>Nộp bài / Chi tiết</button>
    </div>
  );
};

export default AssignmentModule;