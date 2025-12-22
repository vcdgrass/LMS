import React, { useState } from 'react';
import { Plus, Trash2, Image, Check, X, Clock, Award, Save } from 'lucide-react';

const QuizCreator = ({ onSave, onCancel }) => {
    const defaultQuestion = {
        questionText: '',
        timeLimit: 20,
        points: 1000,
        options: [
            { optionText: '', isCorrect: false, color: 'bg-red-500', placeholder: 'Đáp án 1 (Đỏ)' },
            { optionText: '', isCorrect: false, color: 'bg-blue-500', placeholder: 'Đáp án 2 (Xanh dương)' },
            { optionText: '', isCorrect: false, color: 'bg-yellow-500', placeholder: 'Đáp án 3 (Vàng)' },
            { optionText: '', isCorrect: false, color: 'bg-green-500', placeholder: 'Đáp án 4 (Xanh lá)' }
        ]
    };

    const [questions, setQuestions] = useState([{ ...defaultQuestion }]);
    const [activeQIndex, setActiveQIndex] = useState(0);
    const [title, setTitle] = useState('');

    const updateQuestionField = (field, value) => {
        const newQs = [...questions];
        newQs[activeQIndex][field] = value;
        setQuestions(newQs);
    };

    const updateOption = (optIndex, field, value) => {
        const newQs = [...questions];
        newQs[activeQIndex].options[optIndex][field] = value;
        setQuestions(newQs);
    };

    const addQuestion = () => {
        const newQ = JSON.parse(JSON.stringify(defaultQuestion));
        setQuestions([...questions, newQ]);
        setActiveQIndex(questions.length);
    };

    const removeQuestion = (index, e) => {
        e.stopPropagation();
        if (questions.length === 1) return alert("Phải có ít nhất 1 câu hỏi!");
        
        const newQs = questions.filter((_, i) => i !== index);
        setQuestions(newQs);
        if (activeQIndex >= newQs.length) setActiveQIndex(newQs.length - 1);
    };

    const handleSave = () => {
        if (!title.trim()) return alert("Vui lòng nhập tên bài kiểm tra!");
        
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.questionText.trim()) return alert(`Câu hỏi số ${i + 1} chưa có nội dung!`);
            const hasCorrect = q.options.some(o => o.isCorrect);
            if (!hasCorrect) return alert(`Câu hỏi số ${i + 1} chưa chọn đáp án đúng!`);
        }

        onSave({ title, questions });
    };

    const currentQ = questions[activeQIndex];

    return (
        <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col font-sans">
            {/* --- HEADER --- */}
            <div className="bg-white px-4 py-3 shadow-sm flex justify-between items-center border-b">
                <div className="flex items-center gap-4">
                    <input 
                        className="font-bold text-xl placeholder-gray-400 outline-none border-b-2 border-transparent focus:border-indigo-500 transition px-2 py-1"
                        placeholder="Nhập tên bài kiểm tra..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        autoFocus
                    />
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded"
                    >
                        Thoát
                    </button>
                    <button 
                        onClick={handleSave}
                        className="px-6 py-2 bg-indigo-600 text-white font-bold rounded shadow hover:bg-indigo-700 flex items-center gap-2"
                    >
                        <Save size={18} /> Lưu bài
                    </button>
                </div>
            </div>

            {/* --- BODY --- */}
            <div className="flex flex-1 overflow-hidden">
                
                {/* 1. SIDEBAR (Danh sách câu hỏi) */}
                <div className="w-64 bg-white border-r flex flex-col overflow-y-auto custom-scrollbar">
                    <div className="p-4 space-y-3">
                        {questions.map((q, idx) => (
                            <div 
                                key={idx}
                                onClick={() => setActiveQIndex(idx)}
                                className={`relative group p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                    idx === activeQIndex 
                                        ? 'border-indigo-500 bg-indigo-50 shadow-sm' 
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <div className="flex justify-between mb-1">
                                    <span className="text-xs font-bold text-gray-500">Câu {idx + 1}</span>
                                    <button 
                                        onClick={(e) => removeQuestion(idx, e)}
                                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <p className="text-sm font-medium text-gray-700 truncate">
                                    {q.questionText || <span className="text-gray-400 italic">Chưa nhập câu hỏi</span>}
                                </p>
                                <div className="mt-2 flex gap-1 justify-center">
                                    {/* Preview nhỏ các đáp án */}
                                    <div className="w-full h-1 bg-red-200 rounded"></div>
                                    <div className="w-full h-1 bg-blue-200 rounded"></div>
                                    <div className="w-full h-1 bg-yellow-200 rounded"></div>
                                    <div className="w-full h-1 bg-green-200 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="p-4 mt-auto border-t bg-gray-50 sticky bottom-0">
                        <button 
                            onClick={addQuestion}
                            className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold shadow hover:bg-blue-700 flex justify-center items-center gap-2"
                        >
                            <Plus size={20} /> Thêm câu hỏi
                        </button>
                    </div>
                </div>

                {/* 2. MAIN WORKSPACE (Khu vực soạn thảo) */}
                <div className="flex-1 bg-gray-100 p-8 overflow-y-auto flex flex-col items-center">
                    
                    {/* Ô nhập câu hỏi */}
                    <div className="w-full max-w-4xl mb-6">
                        <textarea 
                            className="w-full p-4 text-center text-2xl font-bold text-gray-800 shadow-sm rounded-xl border-none focus:ring-4 focus:ring-indigo-200 outline-none resize-none bg-white"
                            placeholder="Nhập câu hỏi của bạn ở đây..."
                            rows={2}
                            value={currentQ.questionText}
                            onChange={(e) => updateQuestionField('questionText', e.target.value)}
                        />
                    </div>

                    {/* Khu vực Media (Placeholder) */}
                    {/* <div className="w-full max-w-lg aspect-video bg-white rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center mb-8 text-gray-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50 transition cursor-pointer">
                        <Image size={64} className="mb-2 opacity-50" />
                        <span className="font-semibold">Thêm hình ảnh hoặc video</span>
                        <span className="text-xs">(Tính năng đang phát triển)</span>
                    </div> */}

                    {/* 4 Ô đáp án */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-5xl">
                        {currentQ.options.map((opt, idx) => (
                            <div 
                                key={idx} 
                                className={`${opt.color} p-4 rounded-lg shadow-md transition-transform transform hover:scale-[1.01] flex items-center relative group`}
                            >
                                {/* Biểu tượng hình học (giống Kahoot) */}
                                <div className="w-10 h-10 flex items-center justify-center bg-black bg-opacity-20 rounded shadow-inner mr-3 text-white font-bold text-lg">
                                    {idx === 0 && '▲'}
                                    {idx === 1 && '◆'}
                                    {idx === 2 && '●'}
                                    {idx === 3 && '■'}
                                </div>

                                <textarea 
                                    className="flex-1 bg-transparent text-white placeholder-white/80 text-xl font-bold outline-none resize-none border-none focus:ring-0"
                                    placeholder={opt.placeholder}
                                    rows={2}
                                    value={opt.optionText}
                                    onChange={(e) => updateOption(idx, 'optionText', e.target.value)}
                                />

                                {/* Nút chọn đáp án đúng */}
                                <div 
                                    onClick={() => updateOption(idx, 'isCorrect', !opt.isCorrect)}
                                    className={`
                                        w-12 h-12 rounded-full border-4 border-white cursor-pointer flex items-center justify-center transition-all
                                        ${opt.isCorrect ? 'bg-green-500 scale-110 shadow-lg' : 'bg-transparent opacity-50 hover:opacity-100'}
                                    `}
                                    title="Đánh dấu là đáp án đúng"
                                >

                                    chọn đáp án đúng
                                    {opt.isCorrect && <Check size={28} className="text-white font-bold" strokeWidth={4} />}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. SETTINGS SIDEBAR (Cột phải) */}
                <div className="w-72 bg-white border-l p-5 flex flex-col gap-6 overflow-y-auto">
                    <div>
                        <h3 className="text-gray-500 uppercase text-xs font-bold mb-3 flex items-center gap-2">
                            <Clock size={16} /> Thời gian
                        </h3>
                        <select 
                            className="w-full p-2 border rounded font-medium text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={currentQ.timeLimit}
                            onChange={(e) => updateQuestionField('timeLimit', parseInt(e.target.value))}
                        >
                            <option value={10}>10 giây</option>
                            <option value={20}>20 giây (Chuẩn)</option>
                            <option value={30}>30 giây</option>
                            <option value={60}>1 phút</option>
                            <option value={120}>2 phút</option>
                        </select>
                    </div>

                    <div>
                        <h3 className="text-gray-500 uppercase text-xs font-bold mb-3 flex items-center gap-2">
                            <Award size={16} /> Điểm số
                        </h3>
                        <select 
                            className="w-full p-2 border rounded font-medium text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={currentQ.points}
                            onChange={(e) => updateQuestionField('points', parseInt(e.target.value))}
                        >
                            <option value={0}>0 điểm</option>
                            <option value={1000}>1000 điểm (Chuẩn)</option>
                            <option value={2000}>2000 điểm (Nhân đôi)</option>
                        </select>
                    </div>

                    <div className="mt-auto p-4 bg-yellow-50 rounded border border-yellow-200 text-sm text-yellow-800">
                        <p>💡 <strong>Mẹo:</strong> Bạn có thể chọn nhiều đáp án đúng cho một câu hỏi.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuizCreator;