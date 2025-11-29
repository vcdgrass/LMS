import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;