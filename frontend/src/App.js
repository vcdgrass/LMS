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

// Component bảo vệ Route
import PrivateRoute from './components/PrivateRoute'; 

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Nhóm tất cả route dưới prefix /ChuyenHT */}
                    <Route path="/ChuyenHT">
                        {/* Trang khởi đầu */}
                        <Route index element={<LandingPage />} />

                        {/* Public Routes */}
                        <Route path="login" element={<LoginPage />} />
                        <Route path="register" element={<RegisterPage />} />

                        {/* ADMIN ROUTES */}
                        <Route element={<PrivateRoute allowedRoles={['admin']} />}>
                            <Route path="admin" element={<AdminLayout />}>
                                <Route path="dashboard" element={<AdminDashboard />} />
                                <Route path="users" element={<UserManagement />} />
                                <Route path="categories" element={<CategoryManagement />} />
                            </Route>
                        </Route>

                        {/* TEACHER ROUTES */}
                        <Route element={<PrivateRoute allowedRoles={['teacher']} />}>
                            <Route path="teacher" element={<TeacherLayout />}>
                                <Route path="dashboard" element={<TeacherDashboard />} />
                                <Route path="create-course" element={<CreateCourse />} />
                            </Route>
                            <Route path="course/:id" element={<CourseDetail />} />
                        </Route>

                        {/* STUDENT ROUTES */}
                        <Route element={<PrivateRoute allowedRoles={['student']} />}>
                            <Route path="student" element={<StudentLayout />}>
                                <Route path="dashboard" element={<StudentDashboard />} />
                                <Route index element={<Navigate to="/ChuyenHT/student/dashboard" replace />} />
                            </Route>
                            <Route path="course/:id" element={<CourseDetail />} /> 
                        </Route>
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;