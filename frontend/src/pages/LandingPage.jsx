import React from 'react';
import { Link, useParams } from 'react-router-dom';

const LandingPage = () => {
    const { schoolSlug } = useParams();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
            <header className="container mx-auto px-6 py-6 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <span className="text-4xl">🏫</span>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">LMS Portal</h1>
                        <p className="text-sm text-blue-600 font-medium uppercase tracking-wider">
                            {schoolSlug ? schoolSlug.replace('-', ' ') : 'Platform'}
                        </p>
                    </div>
                </div>
                
                {/* Chỉ giữ nút Đăng nhập */}
                <div className="space-x-4">
                    <Link 
                        to={`/${schoolSlug}/login`} 
                        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 shadow-lg transition"
                    >
                        Đăng nhập
                    </Link>
                </div>
            </header>

            <main className="flex-1 container mx-auto px-6 flex flex-col md:flex-row items-center justify-center">
                <div className="md:w-1/2 mb-10 md:mb-0 text-center md:text-left">
                    <h2 className="text-5xl font-extrabold text-gray-900 leading-tight mb-6">
                        Cổng thông tin đào tạo <br/>
                        <span className="text-blue-600">Nội bộ & Chuyên nghiệp</span>
                    </h2>
                    <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto md:mx-0">
                        Chào mừng đến với hệ thống E-learning của <b>{schoolSlug}</b>. 
                        Vui lòng đăng nhập để truy cập tài liệu và bài tập được phân công.
                    </p>
                    <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                        <Link 
                            to={`/${schoolSlug}/login`}
                            className="px-8 py-4 bg-blue-600 text-white font-bold rounded-lg shadow-xl hover:bg-blue-700 transition"
                        >
                            Truy cập lớp học 🚀
                        </Link>
                    </div>
                </div>
                {/* ... Ảnh minh họa giữ nguyên ... */}
                 <div className="md:w-1/2 flex justify-center">
                    <img 
                        src="https://img.freepik.com/free-vector/online-learning-isometric-concept_1284-17947.jpg" 
                        alt="E-learning illustration" 
                        className="w-full max-w-lg rounded-xl shadow-2xl"
                    />
                </div>
            </main>
            
            <footer className="bg-white py-6 text-center text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} LMS Platform.
            </footer>
        </div>
    );
};

export default LandingPage;