import React, { useEffect } from 'react';
import { Outlet, useParams } from 'react-router-dom';

const SchoolLayout = () => {
    // Lấy tham số :schoolSlug từ URL (do Route định nghĩa)
    const { schoolSlug } = useParams();

    useEffect(() => {
        if (schoolSlug) {
            // Lưu slug vào localStorage để axiosClient.js sử dụng
            localStorage.setItem('current_school_slug', schoolSlug);
            console.log("Current School:", schoolSlug);
        }
    }, [schoolSlug]);

    return (
        <div className="school-app-container">
            {/* Tại đây có thể thêm Header chung cho từng trường nếu muốn */}
            <Outlet /> 
        </div>
    );
};

export default SchoolLayout;