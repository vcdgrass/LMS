const { prisma } = require('../utils/db');
const { getAllUserService } = require('../services/userService');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const csv = require('csv-parser');

const getAllUsers = async () => {
    return await getAllUserService();
};

const createUser = async (req, res) => {
    let { username, email, password, role } = req.body;
    if (!username || !email || !role) {
        return res.status(400).json({ error: 'Vui lòng nhập đủ username, email, password, và role.' });
    }
    if (!password) {
        password = 'Student@123'; // Mật khẩu mặc định nếu không cung cấp
    }

    try {
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { username }],
            },
        });
        if (existingUser) {
            return res.status(409).json({ error: 'Email hoặc Username đã tồn tại.' });
        }
        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                passwordHash,
                role,
                isLocked: false,
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

const importUsers = async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "Thiếu file CSV." });

    const results = [];
    const filePath = req.file.path;
    
    // Hash pass mặc định
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
                    passwordHash: defaultHash, //
                    isLocked: false            //
                });
            }
        })
        .on('end', async () => {
            try {
                if (results.length === 0) {
                    fs.unlinkSync(filePath);
                    return res.status(400).json({ message: "File rỗng." });
                }

                // createMany khớp với Model User mới
                const insertResult = await prisma.user.createMany({
                    data: results,
                    skipDuplicates: true, 
                });

                fs.unlinkSync(filePath);
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

module.exports = {
    getAllUsers,
    createUser,
    importUsers,
};