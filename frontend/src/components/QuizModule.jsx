import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, Play, ArrowRight } from 'lucide-react';
import coursesApi from '../api/coursesApi';

const QuizModule = ({ module }) => {
    const [quizData, setQuizData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('intro'); // intro | playing | result
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionId]: optionId }
    const [score, setScore] = useState(0);

    // 1. Lấy dữ liệu Quiz từ API
    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                // module.contentId là ID của bảng Module_Quiz
                const res = await coursesApi.getModuleById(module.contentId, 'quiz');
                setQuizData(res.data);
            } catch (error) {
                console.error("Lỗi tải quiz:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [module.contentId]);

    // 2. Xử lý khi chọn đáp án
    const handleSelectOption = (questionId, optionId) => {
        // Chỉ cho chọn nếu đang làm bài (chưa nộp)
        if (status !== 'result') {
            setSelectedAnswers(prev => ({
                ...prev,
                [questionId]: optionId
            }));
        }
    };

    // 3. Nộp bài và tính điểm (Logic đơn giản tại Client để demo)
    const handleSubmit = () => {
        if (!window.confirm("Bạn chắc chắn muốn nộp bài?")) return;
        
        let correctCount = 0;
        let totalPoints = 0;

        quizData.questions.forEach(q => {
            const userAnsId = selectedAnswers[q.id];
            const correctOpt = q.options.find(o => o.isCorrect);
            
            if (userAnsId === correctOpt?.id) {
                correctCount++;
                totalPoints += (q.points || 0);
            }
        });

        setScore(totalPoints);
        setStatus('result');
    };

    // Helper: Lấy màu nền cho Option khi hiển thị kết quả
    const getOptionClass = (q, opt) => {
        const isSelected = selectedAnswers[q.id] === opt.id;
        const isCorrect = opt.isCorrect;

        if (status === 'result') {
            if (isCorrect) return 'bg-green-100 border-green-500 text-green-800'; // Đáp án đúng
            if (isSelected && !isCorrect) return 'bg-red-100 border-red-500 text-red-800'; // Chọn sai
            return 'bg-gray-50 border-gray-200 opacity-50'; // Các câu còn lại
        }

        // Trạng thái đang làm bài
        if (isSelected) return 'bg-indigo-100 border-indigo-500 ring-1 ring-indigo-500';
        return 'bg-white border-gray-200 hover:bg-gray-50';
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Đang tải đề thi...</div>;
    if (!quizData) return <div className="p-8 text-center text-red-500">Không tìm thấy dữ liệu.</div>;

    // --- MÀN HÌNH CHÀO (INTRO) ---
    if (status === 'intro') {
        return (
            <div className="flex flex-col items-center justify-center p-10 bg-white rounded-xl shadow-sm text-center border border-gray-100">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                    <Play size={40} className="text-indigo-600 ml-1" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{module.title}</h2>
                <p className="text-gray-500 max-w-md mb-6">{quizData.description || "Hãy sẵn sàng để thử thách kiến thức của bạn!"}</p>
                
                <div className="flex gap-8 mb-8 text-sm text-gray-600 font-medium bg-gray-50 px-6 py-3 rounded-lg">
                    <div className="flex items-center gap-2"><AlertCircle size={18} /> {quizData.questions.length} Câu hỏi</div>
                    <div className="flex items-center gap-2"><Clock size={18} /> {quizData.timeLimitMinutes || 15} Phút</div>
                </div>

                <button 
                    onClick={() => setStatus('playing')}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
                >
                    Bắt đầu làm bài
                </button>
            </div>
        );
    }

    // --- MÀN HÌNH KẾT QUẢ ---
    if (status === 'result') {
        const totalQ = quizData.questions.length;
        const correctCount = quizData.questions.filter(q => selectedAnswers[q.id] === q.options.find(o => o.isCorrect)?.id).length;
        
        return (
            <div className="p-6 bg-white rounded-lg shadow-sm">
                <div className="text-center mb-8 border-b pb-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Kết quả bài làm</h3>
                    <div className="text-6xl font-black text-indigo-600 mb-2">{score} <span className="text-xl text-gray-400 font-normal">điểm</span></div>
                    <p className="text-gray-600 font-medium">
                        Bạn đã trả lời đúng <span className="text-green-600">{correctCount}</span> / {totalQ} câu hỏi
                    </p>
                    <button 
                        onClick={() => {setStatus('intro'); setSelectedAnswers({}); setScore(0); setCurrentQIndex(0)}}
                        className="mt-4 text-indigo-600 hover:underline text-sm font-semibold"
                    >
                        Làm lại bài này
                    </button>
                </div>
                
                {/* Review lại đáp án */}
                <div className="space-y-6">
                    {quizData.questions.map((q, idx) => (
                        <div key={q.id} className="border-b border-gray-100 pb-6 last:border-0">
                            <h4 className="font-bold text-gray-800 mb-3 flex gap-2">
                                <span className="text-indigo-500">Câu {idx + 1}:</span> {q.questionText}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {q.options.map(opt => (
                                    <div key={opt.id} className={`p-3 rounded border text-sm font-medium flex justify-between items-center ${getOptionClass(q, opt)}`}>
                                        {opt.optionText}
                                        {opt.isCorrect && <CheckCircle size={16} />}
                                        {(selectedAnswers[q.id] === opt.id && !opt.isCorrect) && <XCircle size={16} />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // --- MÀN HÌNH LÀM BÀI (PLAYING) ---
    const currentQ = quizData.questions[currentQIndex];

    return (
        <div className="flex flex-col h-full bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            {/* Header: Progress & Timer */}
            <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                <div className="text-sm font-bold text-gray-500">
                    Câu hỏi {currentQIndex + 1} <span className="font-normal text-gray-400">/ {quizData.questions.length}</span>
                </div>
                <div className="flex items-center gap-2 text-orange-600 font-bold bg-orange-50 px-3 py-1 rounded-full text-xs">
                    <Clock size={14} /> {currentQ.timeLimit || 20}s
                </div>
            </div>

            {/* Question Content */}
            <div className="flex-1 p-6 md:p-10 flex flex-col items-center">
                {/* Ảnh minh họa (nếu có) */}
                {currentQ.imageUrl && (
                    <img src={currentQ.imageUrl} alt="Quiz visual" className="max-h-64 rounded-lg shadow-sm mb-6 object-contain" />
                )}
                
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 text-center mb-8">
                    {currentQ.questionText}
                </h3>

                {/* Options Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
                    {currentQ.options.map((opt, idx) => {
                        const isSelected = selectedAnswers[currentQ.id] === opt.id;
                        // Màu sắc giả lập Kahoot cho 4 đáp án
                        const kahootColors = [
                            'border-l-8 border-l-red-500', 
                            'border-l-8 border-l-blue-500', 
                            'border-l-8 border-l-yellow-500', 
                            'border-l-8 border-l-green-500'
                        ];
                        
                        return (
                            <button
                                key={opt.id}
                                onClick={() => handleSelectOption(currentQ.id, opt.id)}
                                className={`
                                    p-6 text-left rounded-lg shadow-sm border transition-all duration-200 flex items-center
                                    ${kahootColors[idx % 4]}
                                    ${isSelected 
                                        ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500 transform scale-[1.02]' 
                                        : 'bg-white border-gray-200 hover:shadow-md hover:bg-gray-50'}
                                `}
                            >
                                <span className="font-bold text-lg text-gray-700">{opt.optionText}</span>
                                {isSelected && <CheckCircle className="ml-auto text-indigo-600" size={20} />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Footer Navigation */}
            <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
                <button 
                    onClick={() => setCurrentQIndex(Math.max(0, currentQIndex - 1))}
                    disabled={currentQIndex === 0}
                    className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded disabled:opacity-50"
                >
                    Quay lại
                </button>

                {currentQIndex < quizData.questions.length - 1 ? (
                    <button 
                        onClick={() => setCurrentQIndex(currentQIndex + 1)}
                        className="px-6 py-2 bg-indigo-600 text-white rounded font-bold hover:bg-indigo-700 flex items-center gap-2"
                    >
                        Câu tiếp theo <ArrowRight size={18} />
                    </button>
                ) : (
                    <button 
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700 shadow-md"
                    >
                        Nộp bài
                    </button>
                )}
            </div>
        </div>
    );
};

export default QuizModule;