import React, { useState, useEffect, useRef } from 'react';
import coursesApi from '../api/coursesApi';
import userApi from '../api/userApi';

// --- CẤU TRÚC TRIE (PREFIX TREE) ---
// Dùng để tìm kiếm gợi ý email nhanh chóng O(k)
class TrieNode {
    constructor() {
        this.children = {};
        this.isEndOfWord = false;
        this.email = null;
    }
}

class Trie {
    constructor() {
        this.root = new TrieNode();
    }

    insert(word) {
        let node = this.root;
        for (let char of word) {
            if (!node.children[char]) {
                node.children[char] = new TrieNode();
            }
            node = node.children[char];
        }
        node.isEndOfWord = true;
        node.email = word;
    }

    searchPrefix(prefix) {
        let node = this.root;
        for (let char of prefix) {
            if (!node.children[char]) return [];
            node = node.children[char];
        }
        return this._dfs(node);
    }

    _dfs(node, result = []) {
        if (node.isEndOfWord) result.push(node.email);
        for (let char in node.children) {
            this._dfs(node.children[char], result);
        }
        return result;
    }
}

const StudentManagement = ({ courseId, canEdit }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    
    // State cho tính năng Autocomplete
    const [suggestions, setSuggestions] = useState([]);
    const [userTrie] = useState(new Trie());
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef(null);

    // Load danh sách học sinh trong lớp
    const fetchStudents = async () => {
        try {
            const res = await coursesApi.getStudents(courseId);
            setStudents(res.data);
        } catch (error) {
            console.error("Lỗi tải danh sách học viên:", error);
        } finally {
            setLoading(false);
        }
    };

    // Load danh sách tất cả user để xây dựng Trie
    useEffect(() => {
        const initTrie = async () => {
            try {
                // GỌI API THỰC TẾ
                const res = await userApi.getAllStudents(); 
                                console.log("here");
                const globalStudents = res.data; // Giả sử API trả về mảng [{email: '...'}, ...]

                // Reset Trie cũ (nếu cần) hoặc chỉ insert mới
                globalStudents.forEach(u => {
                    if (u.email) userTrie.insert(u.email);
                });
                
                console.log(`Đã load ${globalStudents.length} học viên vào bộ nhớ đệm.`);
            } catch (error) {
                console.error("Không thể tải danh sách gợi ý học viên:", error);
            }
        };
        
        // Chỉ gọi khi component mount và user có quyền edit (Teacher)
        if (canEdit) {
            initTrie();
        }
    }, [canEdit, userTrie]);

    useEffect(() => {
        fetchStudents();
        
        // Click outside để đóng gợi ý
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [courseId]);

    // Xử lý khi nhập email (Tìm kiếm trên Trie)
    const handleEmailChange = (e) => {
        const val = e.target.value;
        setEmail(val);

        if (val.length > 0) {
            const found = userTrie.searchPrefix(val);
            // Lọc bỏ những người đã có trong lớp rồi
            const existingEmails = students.map(s => s.user.email);
            const filtered = found.filter(email => !existingEmails.includes(email));
            
            setSuggestions(filtered.slice(0, 5)); // Lấy top 5
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    // Chọn gợi ý
    const handleSelectSuggestion = (val) => {
        setEmail(val);
        setShowSuggestions(false);
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;

        setIsAdding(true);
        try {
            await coursesApi.addStudent(courseId, email);
            alert("Thêm học viên thành công!");
            setEmail('');
            setSuggestions([]);
            fetchStudents(); 
        } catch (error) {
            alert(error.response?.data?.message || "Lỗi khi thêm học viên.");
        } finally {
            setIsAdding(false);
        }
    };

    const handleRemove = async (studentId) => {
        if (!window.confirm("Bạn chắc chắn muốn xóa học viên này khỏi lớp?")) return;
        try {
            await coursesApi.removeStudent(courseId, studentId);
            fetchStudents();
        } catch (error) {
            alert("Lỗi khi xóa học viên.");
        }
    };

    if (loading) return <div className="text-gray-500 py-4">Đang tải danh sách...</div>;

    return (
        <div className="bg-white rounded-lg shadow p-6" onClick={() => setShowSuggestions(false)}>
            <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Danh sách thành viên</h3>

            {/* Form thêm học sinh (Có Autocomplete) */}
            {canEdit && (
                <div className="mb-8 bg-blue-50 p-4 rounded border border-blue-100 relative">
                    <h4 className="font-bold text-blue-800 mb-2 text-sm uppercase">Thêm học viên vào lớp</h4>
                    <form onSubmit={handleAddStudent} className="flex gap-2 relative" ref={wrapperRef}>
                        <div className="flex-1 relative">
                            <input 
                                type="email" 
                                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nhập email của học viên..."
                                value={email}
                                onChange={handleEmailChange}
                                onFocus={() => email && setShowSuggestions(true)}
                                required
                                autoComplete="off"
                            />
                            
                            {/* Dropdown Gợi ý */}
                            {showSuggestions && suggestions.length > 0 && (
                                <ul className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg z-50 max-h-48 overflow-y-auto">
                                    {suggestions.map((s) => (
                                        <li 
                                            key={s}
                                            className="p-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 border-b last:border-0"
                                            onMouseDown={(e) => {
                                                // Dùng onMouseDown để chạy trước onBlur của input
                                                e.preventDefault(); 
                                                handleSelectSuggestion(s);
                                            }}
                                        >
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <button 
                            type="submit" 
                            disabled={isAdding}
                            className={`px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition ${isAdding ? 'opacity-50' : ''}`}
                        >
                            {isAdding ? 'Đang thêm...' : 'Thêm'}
                        </button>
                    </form>
                </div>
            )}

            {/* Danh sách Table */}
            {students.length === 0 ? (
                <p className="text-gray-500 italic text-center py-4">Lớp học chưa có học viên nào.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-gray-100 text-gray-600 uppercase font-medium">
                            <tr>
                                <th className="p-3">STT</th>
                                <th className="p-3">Tên đăng nhập</th>
                                <th className="p-3">Email</th>
                                {canEdit && <th className="p-3 text-right">Hành động</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {students.map((item, index) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="p-3 text-gray-500">{index + 1}</td>
                                    <td className="p-3 font-medium text-gray-800">{item.user.username}</td>
                                    <td className="p-3 text-gray-600">{item.user.email}</td>
                                    {canEdit && (
                                        <td className="p-3 text-right">
                                            <button 
                                                onClick={() => handleRemove(item.user.id)}
                                                className="text-red-500 hover:text-red-700 font-medium text-xs border border-red-200 px-2 py-1 rounded hover:bg-red-50"
                                            >
                                                Xóa khỏi lớp
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default StudentManagement;