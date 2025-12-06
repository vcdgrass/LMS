import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
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


// Ví dụ về component bảo vệ Route (chỉ cho phép user đã login)
import PrivateRoute from './components/PrivateRoute'; 

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Trang khởi đầu */}
                    <Route path="/" element={<LandingPage />} />

                    {/* Public Routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* ADMIN ROUTES */}
                    <Route element={<PrivateRoute allowedRoles={['admin']} />}>

                        {/* AdminLayout sẽ bao bọc tất cả các route con bên trong */}
                        <Route path="/admin" element={<AdminLayout />}>
                            <Route path="dashboard" element={<AdminDashboard />} />
                            <Route path="users" element={<UserManagement />} />
                            <Route path="categories" element={<CategoryManagement />} />
                        </Route>
                        
                    </Route>

                    <Route element={<PrivateRoute allowedRoles={['teacher']} />}>
                        <Route path="/teacher" element={<TeacherLayout />}>
                            
                            {/* Mặc định vào /teacher/dashboard */}
                            <Route path="dashboard" element={<TeacherDashboard />} />
                            
                            {/* Route tạo khóa học */}
                            <Route path="create-course" element={<CreateCourse />} />

                        </Route>
                        <Route path="/course/:id" element={<CourseDetail />} />
                    </Route>

                    <Route element={<PrivateRoute allowedRoles={['student']} />}>
                        <Route path="/student" element={<StudentLayout />}>
                            <Route path="dashboard" element={<StudentDashboard />} />
                            {/* Mặc định redirect về dashboard nếu vào /student */}
                            <Route index element={<Navigate to="/student/dashboard" replace />} />
                        </Route>
                        {/* Reuse CourseDetail cho student xem nội dung */}
                        {/* Lưu ý: Cần đảm bảo CourseDetail xử lý logic hiển thị phù hợp cho student */}
                        <Route path="/course/:id" element={<CourseDetail />} /> 
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;