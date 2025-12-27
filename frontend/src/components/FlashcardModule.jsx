import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, RotateCw, Volume2, Sparkles, RefreshCcw } from 'lucide-react';
import coursesApi from '../api/coursesApi';
import confetti from 'canvas-confetti';

const FlashcardModule = ({ module }) => {
    const [data, setData] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    // State lưu ngôn ngữ đang chọn
    const [voiceLang, setVoiceLang] = useState('vi-VN'); 
    // [MỚI] State lưu danh sách giọng đọc thực tế của máy
    const [availableVoices, setAvailableVoices] = useState([]);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await coursesApi.getModuleById(module.contentId, 'flashcard');
                setData(res.data || res);
            } catch (error) {
                console.error("Lỗi tải flashcard:", error);
            }
        };
        fetchContent();
    }, [module]);

    // [QUAN TRỌNG] Hàm load giọng chuẩn, đảm bảo chạy trên mọi trình duyệt
    useEffect(() => {
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                console.log("Danh sách giọng tìm thấy:", voices.map(v => `${v.lang} - ${v.name}`)); // Log để kiểm tra
                setAvailableVoices(voices);
            }
        };

        // Thử load ngay
        loadVoices();

        // Nếu chưa có thì chờ sự kiện onvoiceschanged (quan trọng cho Chrome/Android)
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, []);

    const speak = (text, e) => {
    e.stopPropagation(); 
    if (!text) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Lấy danh sách giọng hiện tại
    const voices = window.speechSynthesis.getVoices();

        let selectedVoice = null;

        if (voiceLang === 'vi-VN') {
            // --- LOGIC MỚI: TÌM KIẾM RỘNG HƠN ---
            // 1. Tìm giọng tiếng Việt bất kỳ (không quan tâm hãng nào)
            selectedVoice = voices.find(v => v.lang.includes('vi')) || 
                            voices.find(v => v.name.includes('Vietnamese')) || 
                            voices.find(v => v.name.includes('Tiếng Việt'));
            
            // Mẹo: Giọng Microsoft trên Edge thường rất hay, nên nếu tìm thấy nhiều giọng, ưu tiên giọng có chữ "Natural"
            if (!selectedVoice) {
                const naturalVoice = voices.find(v => v.name.includes('Vietnamese') && v.name.includes('Natural'));
                if (naturalVoice) selectedVoice = naturalVoice;
            }

            utterance.rate = 0.8; 
        } else {
            // Tiếng Anh
            selectedVoice = voices.find(v => v.lang.includes('en-US') && v.name.includes('Google')) || // Ưu tiên Google
                            voices.find(v => v.name.includes('Microsoft') && v.lang.includes('en-US')) || // Rồi đến Microsoft
                            voices.find(v => v.lang.includes('en')); // Cuối cùng là bất kỳ
            utterance.rate = 0.9;
        }

        if (selectedVoice) {
            console.log("Đang đọc bằng giọng:", selectedVoice.name); // Xem log để biết nó chọn giọng nào
            utterance.voice = selectedVoice;
            utterance.lang = selectedVoice.lang;
        }

        utterance.pitch = 1.1;
        window.speechSynthesis.speak(utterance);
    };

    const handleNext = () => {
        setIsFlipped(false);
        if (currentIndex < cards.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setIsCompleted(true);
            fireConfetti();
        }
    };

    const handlePrev = () => {
        setIsFlipped(false);
        setIsCompleted(false);
        setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    };

    const handleRestart = () => {
        setIsCompleted(false);
        setCurrentIndex(0);
        setIsFlipped(false);
    };

    const fireConfetti = () => {
        confetti({
            particleCount: 150, spread: 70, origin: { y: 0.6 },
            colors: ['#FFD700', '#FF69B4', '#00BFFF', '#32CD32']
        });
    };

    if (!data) return <div className="p-8 text-center text-gray-500">Đang tải bài học...</div>;
    const cards = data.flashcards || [];
    const currentCard = cards[currentIndex];

    if (isCompleted) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px] bg-white rounded-2xl shadow-lg p-8 text-center animate-in fade-in zoom-in">
                <div className="mb-4 text-6xl">🎉 🌟 🏆</div>
                <h2 className="text-3xl font-bold text-indigo-600 mb-2">Con làm tốt lắm!</h2>
                <button onClick={handleRestart} className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full font-bold shadow-lg flex items-center gap-2 mt-4 transform transition hover:scale-105">
                    <RefreshCcw size={20} /> Học lại nhé
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center max-w-3xl mx-auto font-sans">
            
            {/* Header + Chọn ngôn ngữ */}
            <div className="w-full flex flex-col md:flex-row justify-between items-center mb-6 px-4 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-700">{module.title}</h2>
                    <p className="text-sm text-gray-400">Thẻ {currentIndex + 1} / {cards.length}</p>
                </div>

                <div className="bg-white p-1 rounded-full border shadow-sm flex items-center">
                    <button 
                        onClick={() => setVoiceLang('vi-VN')}
                        className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${
                            voiceLang === 'vi-VN' ? 'bg-red-500 text-white shadow' : 'text-gray-500 hover:bg-gray-100'
                        }`}
                    >
                        🇻🇳 Tiếng Việt
                    </button>
                    <button 
                        onClick={() => setVoiceLang('en-US')}
                        className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${
                            voiceLang === 'en-US' ? 'bg-blue-500 text-white shadow' : 'text-gray-500 hover:bg-gray-100'
                        }`}
                    >
                        🇺🇸 English
                    </button>
                </div>
            </div>

            {/* Debug Info (Chỉ hiện nếu không tìm thấy giọng nào) */}
            {availableVoices.length === 0 && (
                <div className="text-xs text-red-500 mb-2">
                    ⚠️ Chưa tải được giọng đọc. Hãy thử tải lại trang hoặc đổi trình duyệt (Khuyên dùng Chrome/Edge).
                </div>
            )}

            {/* Card Area */}
            <div 
                className="relative w-full aspect-[4/3] max-h-[450px] cursor-pointer perspective-1000 group"
                onClick={() => setIsFlipped(!isFlipped)}
            >
                <div className={`w-full h-full transition-all duration-700 transform preserve-3d relative ${isFlipped ? 'rotate-y-180' : ''}`} style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                    
                    {/* Mặt trước */}
                    <div className="absolute inset-0 bg-white border-4 border-indigo-100 rounded-3xl shadow-xl flex flex-col items-center justify-center p-6 backface-hidden" style={{ backfaceVisibility: 'hidden' }}>
                        <button 
                            onClick={(e) => speak(currentCard?.frontText, e)}
                            className="absolute top-4 right-4 p-3 bg-indigo-50 rounded-full text-indigo-500 hover:bg-indigo-100 hover:scale-110 transition z-10 shadow-sm"
                        >
                            <Volume2 size={28} />
                        </button>

                        <div className="flex-1 flex flex-col items-center justify-center gap-4">
                            {currentCard?.frontImage && (
                                <img src={currentCard.frontImage} alt="Flashcard" className="max-h-48 object-contain rounded-lg shadow-sm" />
                            )}
                            <p className={`${currentCard?.frontImage ? 'text-2xl' : 'text-5xl'} font-black text-gray-800 text-center`}>
                                {currentCard?.frontText}
                            </p>
                        </div>
                         <div className="mt-auto text-indigo-300 text-sm font-bold flex items-center gap-1 animate-pulse">
                            <RotateCw size={16} /> Lật thẻ
                        </div>
                    </div>

                    {/* Mặt sau */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 text-white rounded-3xl shadow-xl flex flex-col items-center justify-center p-6 backface-hidden" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                         <button 
                            onClick={(e) => speak(currentCard?.backText, e)}
                            className="absolute top-4 right-4 p-3 bg-white/20 rounded-full text-white hover:bg-white/30 transition z-10 shadow-sm"
                        >
                            <Volume2 size={28} />
                        </button>

                        <div className="flex-1 flex flex-col items-center justify-center gap-4">
                             {currentCard?.backImage && (
                                <img src={currentCard.backImage} alt="Answer" className="max-h-48 object-contain rounded-lg bg-white p-1" />
                            )}
                            <p className={`${currentCard?.backImage ? 'text-2xl' : 'text-5xl'} font-black text-white text-center drop-shadow-md`}>
                                {currentCard?.backText}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between w-full mt-8 px-8">
                <button 
                    onClick={handlePrev} 
                    disabled={currentIndex === 0}
                    className={`p-4 rounded-full border-2 ${currentIndex === 0 ? 'opacity-30 border-gray-200' : 'border-indigo-100 bg-white text-indigo-600 hover:bg-indigo-50 shadow-md'} transition`}
                >
                    <ChevronLeft size={32} />
                </button>
                <div className="flex-1 mx-4 bg-gray-200 rounded-full h-3 overflow-hidden">
                     <div className="bg-yellow-400 h-full transition-all duration-500 ease-out" style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }} />
                </div>
                <button 
                    onClick={handleNext} 
                    className="p-4 rounded-full bg-indigo-500 border-2 border-indigo-500 text-white shadow-lg hover:bg-indigo-600 hover:scale-110 transition-transform"
                >
                    {currentIndex === cards.length - 1 ? <Sparkles size={32} /> : <ChevronRight size={32} />}
                </button>
            </div>
        </div>
    );
};

export default FlashcardModule;