import React, { useState } from 'react';
import { Plus, Trash2, Save, X, ArrowRightLeft } from 'lucide-react';

const FlashcardCreator = ({ onSave, onCancel }) => {
    const defaultCard = { frontText: '', backText: '' };
    const [cards, setCards] = useState([ { ...defaultCard } ]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const updateCard = (index, field, value) => {
        const newCards = [...cards];
        newCards[index][field] = value;
        setCards(newCards);
    };

    const addCard = () => {
        setCards([...cards, { ...defaultCard }]);
    };

    const removeCard = (index) => {
        if (cards.length === 1) return;
        setCards(cards.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        if (!title.trim()) return alert("Vui lòng nhập tên bộ Flashcard!");
        const validCards = cards.filter(c => c.frontText.trim() && c.backText.trim());
        if (validCards.length === 0) return alert("Cần ít nhất 1 thẻ có nội dung!");

        onSave({ 
            title, 
            description,
            cards: validCards 
        });
    };

    return (
        <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col font-sans">
            {/* Header */}
            <div className="bg-white px-6 py-4 shadow-sm flex justify-between items-center border-b">
                <input 
                    className="font-bold text-xl outline-none border-b-2 border-transparent focus:border-indigo-500 transition px-2 py-1 w-1/3"
                    placeholder="Tên bộ Flashcard..."
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    autoFocus
                />
                <div className="flex gap-3">
                    <button onClick={onCancel} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Thoát</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded shadow hover:bg-indigo-700 flex items-center gap-2">
                        <Save size={18} /> Lưu
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center">
                <div className="w-full max-w-4xl space-y-6">
                    <input 
                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Mô tả ngắn (tùy chọn)..."
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                    />

                    {cards.map((card, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative group">
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-bold text-gray-400">Thẻ #{idx + 1}</span>
                                <button onClick={() => removeCard(idx)} className="text-gray-400 hover:text-red-500">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Mặt trước */}
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <label className="block text-sm font-bold text-blue-800 mb-2">Mặt trước (Câu hỏi)</label>
                                    
                                    <input 
                                        className="w-full mb-2 p-2 text-sm border rounded focus:ring-1 focus:ring-blue-300"
                                        placeholder="Link ảnh (nếu có)..."
                                        value={card.frontImage || ''}
                                        onChange={e => updateCard(idx, 'frontImage', e.target.value)}
                                    />
                                    
                                    <textarea 
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-200 outline-none text-lg font-medium"
                                        placeholder="Ví dụ: Con Mèo"
                                        rows={2}
                                        value={card.frontText}
                                        onChange={e => updateCard(idx, 'frontText', e.target.value)}
                                    />
                                </div>

                                {/* Mặt sau */}
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <label className="block text-sm font-bold text-green-800 mb-2">Mặt sau (Đáp án)</label>
                                    
                                    <input 
                                        className="w-full mb-2 p-2 text-sm border rounded focus:ring-1 focus:ring-green-300"
                                        placeholder="Link ảnh (nếu có)..."
                                        value={card.backImage || ''}
                                        onChange={e => updateCard(idx, 'backImage', e.target.value)}
                                    />

                                    <textarea 
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-200 outline-none text-lg font-medium"
                                        placeholder="Ví dụ: Cat"
                                        rows={2}
                                        value={card.backText}
                                        onChange={e => updateCard(idx, 'backText', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    <button onClick={addCard} className="w-full py-4 border-2 border-dashed border-gray-300 text-gray-500 rounded-xl hover:border-indigo-500 hover:text-indigo-600 font-bold flex justify-center items-center gap-2 transition">
                        <Plus size={20} /> Thêm thẻ mới
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FlashcardCreator;