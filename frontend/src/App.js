import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Import Layout mới
import SchoolLayout from './layouts/SchoolLayout'; 

// Các Import cũ giữ nguyên
import LandingPagePlatform from './pages/LandingPagePlatform';
import LoginPage from './pages/auth/LoginPage';
import LandingPage from './pages/LandingPage';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import CategoryManagement from './pages/admin/CategoryManagement';
import TeacherLayout from './layouts/TeacherLayout';
import TeacherDashboard from './pages/teacher/Dashboard';
import CreateCourse from './pages/teacher/CreateCourse';
import CourseDetail from './pages/course/CourseDetail';
import StudentDashboard from './pages/student/Dashboard';
import StudentLayout from './layouts/StudentLayout';
import PrivateRoute from './components/PrivateRoute';
import TenantRegister from './pages/TenantRegister';

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* 1. TRANG CHỦ CỦA PLATFORM (ví dụ: mylms.com) */}
                    {/* Bạn có thể tạo một trang giới thiệu chung ở đây, hoặc redirect tạm */}
                    <Route path="/" element={<LandingPagePlatform />} />

                    {/* TRANG ĐĂNG KÝ TRƯỜNG MỚI (Thêm vào đây) */}
                    <Route path="/create-school" element={<TenantRegister />} />

                    {/* 2. CÁC TRANG CỦA TỪNG TRƯỜNG (Bắt đầu bằng /:schoolSlug) */}
                    <Route path="/:schoolSlug" element={<SchoolLayout />}>
                        
                        {/* Trang Landing riêng của trường */}
                        <Route index element={<LandingPage />} />

                        {/* Auth Routes */}
                        <Route path="login" element={<LoginPage />} />

                        {/* --- CÁC ROUTE BẢO VỆ (ADMIN/TEACHER/STUDENT) --- */}
                        {/* Lưu ý: PrivateRoute cần sửa nhẹ để redirect đúng link có slug, nhưng tạm thời giữ nguyên vẫn chạy được nếu user không F5 */}
                        
                        {/* ADMIN */}
                        <Route element={<PrivateRoute allowedRoles={['admin']} />}>
                            <Route path="admin" element={<AdminLayout />}>
                                <Route path="dashboard" element={<AdminDashboard />} />
                                <Route path="users" element={<UserManagement />} />
                                <Route path="categories" element={<CategoryManagement />} />
                            </Route>
                        </Route>

                        {/* TEACHER */}
                        <Route element={<PrivateRoute allowedRoles={['teacher']} />}>
                            <Route path="teacher" element={<TeacherLayout />}>
                                <Route path="dashboard" element={<TeacherDashboard />} />
                                <Route path="create-course" element={<CreateCourse />} />
                            </Route>
                            <Route path="course/:id" element={<CourseDetail />} />
                        </Route>

                        {/* STUDENT */}
                        <Route element={<PrivateRoute allowedRoles={['student']} />}>
                            <Route path="student" element={<StudentLayout />}>
                                <Route path="dashboard" element={<StudentDashboard />} />
                                {/* Redirect thông minh: Luôn giữ lại slug */}
                                {/* <Route index element={<Navigate to="dashboard" replace />} /> */}
                            </Route>
                            <Route path="course/:id" element={<CourseDetail />} /> 
                        </Route>

                    </Route> {/* Kết thúc Route SchoolLayout */}
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;