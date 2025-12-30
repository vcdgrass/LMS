const { prisma } = require('../utils/db');
const bcrypt = require('bcrypt');
const fs = require('fs');
const csv = require('csv-parser');

// 1. Lấy danh sách tất cả User (Chỉ trong trường hiện tại)
const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            where: {
                schoolId: req.schoolId // <--- QUAN TRỌNG: Lọc theo trường
            },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                isLocked: true,
                schoolId: true // Có thể trả về để debug
            }
        });
        return res.status(200).json(users);
    } catch (error) {
        console.error("Lỗi getAllUsers:", error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
};

// 2. Tạo User mới (Gắn vào trường hiện tại)
const createUser = async (req, res) => {
    let { username, email, password, role } = req.body;
    const schoolId = req.schoolId; // Lấy từ Middleware

    if (!username || !email || !role) {
        return res.status(400).json({ error: 'Vui lòng nhập đủ username, email, và role.' });
    }
    if (!password) {
        password = 'Student@123'; 
    }

    try {
        // Kiểm tra trùng lặp (Chỉ trong phạm vi trường này)
        const existingUser = await prisma.user.findFirst({
            where: {
                schoolId: schoolId,
                OR: [{ email }, { username }],
            },
        });

        if (existingUser) {
            return res.status(409).json({ error: 'Email hoặc Username đã tồn tại trong trường này.' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                passwordHash,
                role,
                isLocked: false,
                schoolId: schoolId, // <--- QUAN TRỌNG
            },
        });

        const { passwordHash: _, ...userResult } = newUser;
        res.status(201).json(userResult);
    }
    catch (error) {
        console.error('Lỗi khi tạo người dùng mới:', error);
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ.' });
    }
};

// 3. Import Users từ CSV (Gắn hàng loạt vào trường hiện tại)
const importUsers = async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "Thiếu file CSV." });
    
    const schoolId = req.schoolId; // Lấy từ Middleware
    const results = [];
    const filePath = req.file.path;
    
    const salt = await bcrypt.genSalt(10);
    const defaultHash = await bcrypt.hash('Student@123', salt);

    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
            if (data.username && data.email) {
                results.push({
                    username: data.username.trim(),
                    email: data.email.trim(),
                    role: data.role ? data.role.trim().toLowerCase() : 'student',
                    passwordHash: defaultHash,
                    isLocked: false,
                    schoolId: schoolId // <--- QUAN TRỌNG: Gắn user vào trường
                });
            }
        })
        .on('end', async () => {
            try {
                if (results.length === 0) {
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                    return res.status(400).json({ message: "File rỗng hoặc không đúng định dạng." });
                }

                // createMany bỏ qua các bản ghi trùng lặp (dựa vào @@unique([username, schoolId]))
                const insertResult = await prisma.user.createMany({
                    data: results,
                    skipDuplicates: true, 
                });

                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                return res.status(200).json({
                    message: "Import hoàn tất",
                    totalRows: results.length,
                    inserted: insertResult.count,
                    skipped: results.length - insertResult.count
                });
            } catch (error) {
                console.error("Import DB Error:", error);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                return res.status(500).json({ message: "Lỗi Database" });
            }
        });
};

// 4. Khóa/Mở khóa User (Phải check xem user có thuộc trường mình không)
const toggleLockUser = async (req, res) => {
    const { id } = req.params;
    const { isLocked } = req.body;
    const schoolId = req.schoolId;

    try {
        // Tìm user trước để đảm bảo an toàn
        const user = await prisma.user.findFirst({
            where: {
                id: parseInt(id),
                schoolId: schoolId // <--- QUAN TRỌNG: Không cho phép khóa user trường khác
            }
        });

        if (!user) {
            return res.status(404).json({ error: "Người dùng không tồn tại hoặc không thuộc trường này." });
        }

        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { isLocked }
        });

        return res.status(200).json({
            message: "Cập nhật trạng thái thành công.",
            user: updatedUser
        });
    } catch (error) {
        console.error("Lỗi khi khóa/mở khóa user:", error);
        return res.status(500).json({ error: "Lỗi máy chủ nội bộ." });
    }
};

// 5. Lấy danh sách Học viên (Student) của trường
const getAllStudentsController = async (req, res) => {
    try {
        const students = await prisma.user.findMany({
            where: {
                role: 'student',
                schoolId: req.schoolId // <--- QUAN TRỌNG
            },
            select: {
                id: true,
                username: true,
                email: true,
                isLocked: true
            }
        });
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy danh sách học viên", error: error.message });
    }
};

module.exports = {
    getAllUsers,
    createUser,
    importUsers,
    toggleLockUser,
    getAllStudentsController,
};