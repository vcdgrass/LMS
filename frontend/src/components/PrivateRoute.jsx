// frontend/src/components/PrivateRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';

// Component này nhận vào một mảng allowedRoles (ví dụ: ['admin', 'teacher'])
const PrivateRoute = ({ allowedRoles }) => {
    // 1. Lấy thông tin xác thực (Ví dụ lưu trong localStorage)
    const token = localStorage.getItem('access_token'); 
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    // 2. Kiểm tra: Chưa đăng nhập? -> Đá về trang Login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // 3. Kiểm tra quyền (Nếu route yêu cầu quyền cụ thể)
    // Ví dụ: Trang Admin thì student không được vào
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // Đã login nhưng sai quyền -> Đá về trang chủ hoặc trang báo lỗi
        return <Navigate to="/" replace />; // Hoặc trang 403
    }

    // 4. Nếu hợp lệ -> Cho phép hiển thị nội dung bên trong (Outlet)
    return <Outlet />;
};

export default PrivateRoute;