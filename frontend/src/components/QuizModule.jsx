import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Clock, CheckCircle, Play, ArrowRight } from 'lucide-react'; // Đã bỏ các icon không dùng để code gọn hơn
import coursesApi from '../api/coursesApi';

const QuizModule = ({ module }) => {
    const [quizData, setQuizData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('intro'); // intro | playing | result
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [score, setScore] = useState(0);

    const [showFeedback, setShowFeedback] = useState(false);
    const [isCorrectEntry, setIsCorrectEntry] = useState(false);
    const [randomMsg, setRandomMsg] = useState("");

    // State lưu thời gian còn lại
    const [timeLeft, setTimeLeft] = useState(0);

    // Ref để lưu hàm handleNext mới nhất
    const handleNextRef = useRef(null);

    // 1. Lấy dữ liệu Quiz
    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const res = await coursesApi.getModuleById(module.contentId, 'quiz');
                // Kiểm tra kỹ cấu trúc dữ liệu trả về từ API
                setQuizData(res.data || res); 
            } catch (error) {
                console.error("Lỗi tải quiz:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [module.contentId]);

    // 2. Hàm nộp bài
    // Sửa hàm handleSubmit để chấp nhận tham số đầu vào (override)
const handleSubmit = useCallback(async (finalAnswers = null) => {
    // Ưu tiên dùng finalAnswers truyền vào, nếu không có mới dùng state selectedAnswers
    const answersToSubmit = finalAnswers || selectedAnswers;

    setLoading(true);

    try {
        const res = await coursesApi.submitQuiz(module.id, answersToSubmit);
        
        // Xử lý kết quả trả về từ server
        const serverResult = res.data.data; 
        const serverScore = Number(serverResult.score);

        setScore(serverScore);
        setStatus('result');

        // Âm thanh chúc mừng
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => {});

    } catch (error) {
        console.error("Lỗi nộp bài:", error);
        alert("Lỗi kết nối! Vui lòng thử nộp lại.");
    } finally {
        setLoading(false);
    }
}, [module.id, selectedAnswers]);

    // 3. Hàm chuyển câu (được bọc useCallback)
    const handleNext = useCallback(() => {
        if (!quizData?.questions) return;

        if (currentQIndex < quizData.questions.length - 1) {
            setCurrentQIndex(prev => prev + 1);
        } else {
            handleSubmit();
        }
    }, [currentQIndex, quizData, handleSubmit]);

    // Cập nhật ref mỗi khi handleNext thay đổi
    useEffect(() => {
        handleNextRef.current = handleNext;
    }, [handleNext]);

    // Danh sách lời động viên
    const encouragement = {
        correct: ["Quá siêu luôn! 🌟", "Đúng rồi, con giỏi lắm! 🎉", "Tuyệt vời! ☀️", "Thông minh quá! 💎"],
        wrong: ["Tiếc quá, thử lại nhé! 💪", "Cố gắng lên! 🌈", "Không sao đâu! ✨", "Bình tĩnh nhé! 🎈"]
    };

    const playFeedbackSound = (isCorrect) => {
        try {
            const audio = new Audio(
                isCorrect
                    ? 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'
                    : 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3'
            );
            audio.volume = 0.5;
            audio.play().catch(e => console.log("Audio play blocked:", e));
        } catch (e) {
            console.error("Audio error", e);
        }
    };

    // 4.1. Effect 1: RESET thời gian khi đổi câu hỏi
    useEffect(() => {
        if (status === 'playing' && quizData?.questions?.[currentQIndex]) {
            const time = quizData.questions[currentQIndex].timeLimit || 20;
            setTimeLeft(time);
        }
    }, [currentQIndex, status, quizData]);

    // 4.2. Effect 2: Đếm ngược
    useEffect(() => {
        if (status !== 'playing') return;

        const timerId = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerId);
                    // Gọi qua Ref an toàn
                    if (handleNextRef.current) {
                        handleNextRef.current();
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerId);
    }, [status]);

    // 5. Xử lý chọn đáp án
    const handleSelectOption = (questionId, optionId) => {
        if (showFeedback || !quizData?.questions) return;

        // 1. Tạo object đáp án mới ngay lập tức (để dùng cho logic nộp bài)
        const newAnswers = { ...selectedAnswers, [questionId]: optionId };
        
        // 2. Cập nhật state (để hiển thị UI)
        setSelectedAnswers(newAnswers);

        const currentQ = quizData.questions[currentQIndex];
        const selectedOption = currentQ.options.find(opt => opt.id === optionId);
        const isCorrect = selectedOption?.isCorrect;

        // 3. Phản hồi âm thanh & hình ảnh
        setIsCorrectEntry(isCorrect); // Nhớ mở comment state này ở trên
        const msgList = isCorrect ? encouragement.correct : encouragement.wrong;
        setRandomMsg(msgList[Math.floor(Math.random() * msgList.length)]);
        setShowFeedback(true);
        playFeedbackSound(isCorrect);

        // 4. Chuyển câu hoặc NỘP BÀI sau 1.5s
        setTimeout(() => {
            setShowFeedback(false);
            
            if (currentQIndex < quizData.questions.length - 1) {
                // Nếu chưa phải câu cuối -> Qua câu tiếp
                setCurrentQIndex(prev => prev + 1);
            } else {
                // Nếu là câu cuối -> TỰ ĐỘNG NỘP BÀI
                // Truyền newAnswers vào để đảm bảo có đáp án vừa chọn
                handleSubmit(newAnswers);
            }
        }, 1500);
    };

    // Helper UI Class
    const getOptionClass = (q, opt) => {
        const isSelected = selectedAnswers[q.id] === opt.id;
        const isCorrect = opt.isCorrect;

        if (status === 'result') {
            if (isCorrect) return 'bg-green-100 border-green-500 text-green-800';
            if (isSelected && !isCorrect) return 'bg-red-100 border-red-500 text-red-800';
            return 'bg-gray-50 border-gray-200 opacity-50';
        }

        if (isSelected) return 'bg-indigo-100 border-indigo-500 ring-1 ring-indigo-500';
        return 'bg-white border-gray-200 hover:bg-gray-50';
    };

    // --- RENDER ---
    if (loading) return <div className="p-8 text-center text-gray-500">Đang tải đề thi...</div>;
    if (!quizData) return <div className="p-8 text-center text-red-500">Không tìm thấy dữ liệu.</div>;

    // --- INTRO SCREEN ---
    if (status === 'intro') {
        return (
            <div className="flex flex-col items-center justify-center p-10 bg-white rounded-xl shadow-sm text-center border border-gray-100">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                    <Play size={40} className="text-indigo-600 ml-1" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{module.title}</h2>
                <p className="text-gray-500 max-w-md mb-6">{quizData.description || "Sẵn sàng thử thách?"}</p>
                <button
                    onClick={() => setStatus('playing')}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-full font-bold shadow-lg hover:bg-indigo-700 transition"
                >
                    Bắt đầu ngay
                </button>
            </div>
        );
    }

    // --- RESULT SCREEN ---
    if (status === 'result') {
        const questions = quizData.questions || [];
        const totalQ = questions.length;
        const correctCount = questions.filter(q => selectedAnswers[q.id] === q.options.find(o => o.isCorrect)?.id).length;

        return (
            <div className="p-6 bg-white rounded-lg shadow-sm">
                <div className="text-center mb-8 border-b pb-6">
                    <h3 className="text-2xl font-bold text-gray-800">Kết quả</h3>
                    <div className="text-5xl font-black text-indigo-600 my-4">{score} điểm</div>
                    <p className="text-gray-600">Đúng {correctCount} / {totalQ} câu</p>
                    <button
                        onClick={() => { setStatus('intro'); setSelectedAnswers({}); setScore(0); setCurrentQIndex(0); }}
                        className="mt-4 text-indigo-600 font-bold hover:underline"
                    >
                        Làm lại
                    </button>
                </div>
                <div className="space-y-6">
                    {questions.map((q, idx) => (
                        <div key={q.id} className="border-b border-gray-100 pb-6 last:border-0">
                            <h4 className="font-bold text-gray-800 mb-3"><span className="text-indigo-500">Câu {idx + 1}:</span> {q.questionText}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {q.options.map(opt => (
                                    <div key={opt.id} className={`p-3 rounded border text-sm font-medium flex justify-between ${getOptionClass(q, opt)}`}>
                                        {opt.optionText}
                                        {opt.isCorrect && <CheckCircle size={16} />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // --- PLAYING SCREEN (SAFE RENDER) ---
    // Kiểm tra an toàn: Nếu không có câu hỏi thì không render tiếp
    if (!quizData.questions || quizData.questions.length === 0) {
        return <div className="p-8 text-center text-yellow-500">Đề thi chưa có câu hỏi nào.</div>;
    }

    const currentQ = quizData.questions[currentQIndex];

    // Double check: Nếu currentQ undefined (lỗi index), render fallback
    if (!currentQ) {
        return <div className="p-8 text-center text-red-500">Lỗi hiển thị câu hỏi.</div>;
    }

    const totalTime = currentQ.timeLimit || 20;
    const progressPercent = (timeLeft / totalTime) * 100;
    
    // Logic màu sắc thanh progress
    let progressColor = 'bg-green-500';
    if (progressPercent < 50) progressColor = 'bg-yellow-500';
    if (progressPercent < 20) progressColor = 'bg-red-500';

    const brightColors = [
        'bg-red-500 hover:bg-red-600 border-red-700 text-white',
        'bg-blue-500 hover:bg-blue-600 border-blue-700 text-white',
        'bg-yellow-400 hover:bg-yellow-500 border-yellow-500 text-gray-900',
        'bg-green-500 hover:bg-green-600 border-green-700 text-white'
    ];

    return (
        <div className="flex flex-col h-full bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 relative">
            {/* Feedback Overlay */}
            {showFeedback && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-40 animate-in fade-in duration-200">
                    <div className="bg-white px-8 py-6 rounded-2xl shadow-2xl transform scale-110 text-center">
                        <div className="text-4xl mb-2">{isCorrectEntry ? '🎉' : '😢'}</div>
                        <h3 className="text-2xl font-black text-indigo-600">{randomMsg}</h3>
                    </div>
                </div>
            )}

            {/* Header: Progress Bar */}
            <div className="bg-gray-50 pt-4 px-6 pb-2 border-b">
                <div className="flex justify-between items-end mb-2">
                    <div className="text-sm font-bold text-gray-500">
                        Câu {currentQIndex + 1} <span className="font-normal text-gray-400">/ {quizData.questions.length}</span>
                    </div>
                    <div className="flex items-center gap-1 font-bold text-gray-700">
                        <Clock size={16} /> {timeLeft}s
                    </div>
                </div>

                <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${progressColor} transition-all duration-1000 ease-linear`}
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* Question Content */}
            <div className="flex-1 p-6 md:p-10 flex flex-col items-center">
                {currentQ.imageUrl && (
                    <img src={currentQ.imageUrl} alt="Quiz visual" className="max-h-56 rounded-lg shadow-sm mb-6 object-contain" />
                )}

                <h3 className="text-xl md:text-2xl font-bold text-gray-800 text-center mb-8">
                    {currentQ.questionText}
                </h3>

                {/* Options Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
                    {currentQ.options.map((opt, idx) => {
                        const isSelected = selectedAnswers[currentQ.id] === opt.id;
                        return (
                            <button
                                key={opt.id}
                                onClick={() => handleSelectOption(currentQ.id, opt.id)}
                                disabled={showFeedback} // Disable khi đang hiện feedback
                                className={`
                                    p-6 text-left rounded-2xl shadow-lg border-b-4 transition-all duration-200 
                                    flex items-center min-h-[100px] relative overflow-hidden group
                                    ${brightColors[idx % 4]} 
                                    ${isSelected
                                        ? 'ring-4 ring-offset-2 ring-indigo-500 transform scale-[1.02] z-10'
                                        : 'hover:scale-[1.01] hover:brightness-110'}
                                    ${showFeedback ? 'cursor-not-allowed opacity-90' : ''}
                                `}
                            >
                                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-black bg-opacity-20 rounded-full mr-4 text-2xl">
                                    {idx === 0 && '▲'}
                                    {idx === 1 && '◆'}
                                    {idx === 2 && '●'}
                                    {idx === 3 && '■'}
                                </div>

                                <span className="font-black text-xl md:text-2xl break-words w-full">
                                    {opt.optionText}
                                </span>

                                {isSelected && (
                                    <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                                        <CheckCircle size={20} className="text-indigo-600" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50 flex justify-end items-center gap-3">
                <button
                    onClick={handleNext}
                    disabled={showFeedback}
                    className="px-6 py-2 bg-indigo-600 text-white rounded font-bold hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
                >
                    {currentQIndex < quizData.questions.length - 1 ? 'Câu tiếp theo' : 'Nộp bài'} <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default QuizModule;