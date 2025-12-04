import React, { useState, useEffect } from 'react';
import coursesApi from '../api/coursesApi';

const ResourseModule = ({ module }) => {
  const [resourseData, setResourseData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await coursesApi.getModuleById(module.contentId, 'resource_url');
        setResourseData(res.data);
      } catch (error) {
        console.error("Lỗi lấy nội dung bài giảng:", error);
      }
    };
    fetchData();
  }, [module.contentId]);

  return (
    <div>
      <div>Bài giảng</div>
      <div>{resourseData?.description || module?.description || 'Không có mô tả'}</div>
    </div>
  );
};

export default ResourseModule;  