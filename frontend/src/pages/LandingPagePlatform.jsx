import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authApi from '../api/authApi'; // Import API

const LandingPagePlatform = () => {
    const navigate = useNavigate();
    const [schoolName, setSchoolName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Khi vào trang chủ Platform, xóa thông tin trường cũ đi
        // để tránh gửi header rác gây lỗi
        localStorage.removeItem('current_school_slug');
    }, []);

    // Hàm xử lý tìm trường
    const handleFindSchool = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!schoolName.trim()) {
            setError("Vui lòng nhập tên trường.");
            return;
        }

        setLoading(true);
        try {
            // Gọi API Backend để tìm slug từ tên trường
            const response = await authApi.findSchool(schoolName.trim());
            // Nếu tìm thấy (Backend trả về { slug: "..." })
            if (response.data.slug) {
                navigate(`/${response.data.slug}/login`);
            }
        } catch (err) {
            // Xử lý lỗi từ Backend (404 hoặc 500)
            console.error("Lỗi tìm trường:", err);
            const msg = err.response?.data?.error || "Có lỗi xảy ra, vui lòng thử lại.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* ... HEADER GIỮ NGUYÊN ... */}
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
                        <span className="text-3xl">🌐</span>
                        <span className="text-2xl font-bold text-gray-800 tracking-tight">VCD LMS Platform</span>
                    </div>
                    <div>
                        <Link to="/create-school" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-full transition duration-300 shadow-md">
                            + Mở Trường Mới
                        </Link>
                    </div>
                </div>
            </header>

            {/* --- HERO SECTION --- */}
            <main className="flex-1">
                <div className="container mx-auto px-6 py-16 md:py-24 flex flex-col-reverse md:flex-row items-center">
                    {/* ... Text & Image phần Hero giữ nguyên ... */}
                    <div className="md:w-1/2 md:pr-12 text-center md:text-left">
                        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
                            Xây dựng trường học số <br />
                            <span className="text-blue-600">trong tầm tay bạn</span>
                        </h1>
                        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                            Nền tảng LMS toàn diện giúp bạn quản lý giáo dục trực tuyến dễ dàng.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                            <Link to="/create-school" className="px-8 py-4 bg-blue-600 text-white text-lg font-bold rounded-lg shadow-lg hover:bg-blue-700 transition">
                                Đăng ký Mở Trường Ngay
                            </Link>
                            <a href="#find-school" className="px-8 py-4 bg-white text-gray-700 text-lg font-bold rounded-lg border border-gray-200 hover:bg-gray-50 transition shadow-sm">
                                Đã có trường?
                            </a>
                        </div>
                    </div>
                    <div className="md:w-1/2 mb-10 md:mb-0">
                        <img src="https://img.freepik.com/free-vector/learning-concept-illustration_114360-6186.jpg" alt="LMS Illustration" className="w-full h-auto max-w-lg mx-auto" />
                    </div>
                </div>

                {/* --- QUICK ACCESS (TÌM TRƯỜNG - ĐÃ SỬA) --- */}
                <div id="find-school" className="bg-indigo-900 py-16">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-3xl font-bold text-white mb-8">Truy cập vào trường của bạn</h2>
                        
                        <div className="max-w-xl mx-auto">
                            <div className="bg-white p-2 rounded-lg shadow-2xl flex relative">
                                <span className="flex items-center pl-4 pr-2 text-2xl">🏫</span>
                                <form onSubmit={handleFindSchool} className="flex-1 flex">
                                    <input 
                                        type="text" 
                                        placeholder="Nhập tên trường của bạn (VD: THPT Chuyên Hà Tĩnh)" 
                                        className="flex-1 p-3 outline-none text-gray-700 font-medium"
                                        value={schoolName}
                                        onChange={(e) => {
                                            setSchoolName(e.target.value);
                                            setError(''); // Xóa lỗi khi gõ lại
                                        }}
                                    />
                                    <button 
                                        type="submit"
                                        disabled={loading}
                                        className={`font-bold py-3 px-8 rounded-md transition duration-300 ${loading ? 'bg-indigo-400 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                                    >
                                        {loading ? 'Đang tìm...' : 'Vào Lớp ➔'}
                                    </button>
                                </form>
                            </div>
                            
                            {/* Hiển thị lỗi nếu có */}
                            {error && (
                                <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative animate-bounce">
                                    <span className="block sm:inline">{error}</span>
                                </div>
                            )}

                            <p className="text-indigo-200 mt-4 text-sm">
                                * Nhập chính xác tên trường bạn đã đăng ký để hệ thống chuyển hướng.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ... Features & Footer giữ nguyên ... */}
                 <div className="container mx-auto px-6 py-20">
                    <div className="text-center mb-16">
                         <h2 className="text-3xl font-bold text-gray-800">Tính năng nổi bật</h2>
                    </div>
                    {/* (Giữ lại phần Features như cũ) */}
                </div>
            </main>
             <footer className="bg-gray-800 text-gray-300 py-10">
                <div className="container mx-auto px-6 text-center">
                    <p>&copy; {new Date().getFullYear()} VCD LMS Platform.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPagePlatform;