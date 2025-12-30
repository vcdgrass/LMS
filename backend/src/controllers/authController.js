const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { prisma } = require('../utils/db');

// --- 1. ĐĂNG KÝ MỞ TRƯỜNG MỚI (Tenant) ---
const registerTenant = async (req, res) => {
    const { 
        schoolName, schoolSlug,
        username, email, password 
    } = req.body;

    if (!schoolName || !schoolSlug || !username || !email || !password) {
        return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin.' });
    }

    try {
        const existingSchool = await prisma.school.findUnique({ where: { slug: schoolSlug } });
        if (existingSchool) return res.status(409).json({ error: 'Đường dẫn (slug) này đã tồn tại.' });

        const passwordHash = await bcrypt.hash(password, 10);

        // Transaction: Tạo School -> Tạo Admin gắn với School đó
        const result = await prisma.$transaction(async (prisma) => {
            const newSchool = await prisma.school.create({
                data: { name: schoolName, slug: schoolSlug }
            });

            const newAdmin = await prisma.user.create({
                data: {
                    username,
                    email,
                    passwordHash,
                    role: 'admin',
                    schoolId: newSchool.id, // <--- QUAN TRỌNG: Gắn Admin vào trường
                    isLocked: false,
                }
            });

            return { school: newSchool, admin: newAdmin };
        });

        res.status(201).json({ message: "Tạo trường thành công!", school: result.school });

    } catch (error) {
        console.error('Lỗi Register Tenant:', error);
        res.status(500).json({ error: 'Lỗi máy chủ.' });
    }
};

// --- 2. ĐĂNG KÝ USER (Nội bộ trường) ---
const registerAdmin = async (req, res) => {
    const { username, email, password } = req.body;
    const schoolId = req.schoolId; // Lấy từ Middleware

    if (!username || !email || !password) return res.status(400).json({ error: 'Thiếu thông tin.' });

    try {
        // Kiểm tra trùng lặp CHỈ TRONG TRƯỜNG NÀY
        const existingUser = await prisma.user.findFirst({
            where: {
                schoolId: schoolId, 
                OR: [{ email }, { username }]
            }
        });

        if (existingUser) return res.status(409).json({ error: 'User đã tồn tại trong trường này.' });

        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                username, email, passwordHash,
                role: 'admin',
                isLocked: false,
                schoolId: schoolId // <--- Gắn user vào trường
            }
        });

        const { passwordHash: _, ...userResult } = newUser;
        res.status(201).json(userResult);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi server.' });
    }
};

// --- 3. ĐĂNG NHẬP (SỬA LỖI QUAN TRỌNG TẠI ĐÂY) ---
const login = async (req, res) => {
    const { username, password } = req.body;
    const schoolId = req.schoolId; // Bắt buộc phải có từ Middleware
    console.log("Login attempt for username:", username, "in schoolId:", schoolId);

    if (!username || !password) return res.status(400).json({ error: 'Nhập username/password.' });

    try {
        // [QUAN TRỌNG] Thay findUnique bằng findFirst
        // Điều kiện: Username trùng VÀ schoolId phải khớp với trường đang truy cập
        const user = await prisma.user.findFirst({
            where: { 
                username: username,
                schoolId: schoolId // <--- Chốt chặn bảo mật
            },
        });

        // Nếu user tồn tại ở trường khác nhưng không có ở trường này -> user là null
        if (!user) {
            return res.status(401).json({ error: 'Tài khoản không tồn tại ở trường này.' });
        }

        if (user.isLocked) return res.status(403).json({ error: 'Tài khoản đã bị khóa.' });

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) return res.status(401).json({ error: 'Sai mật khẩu.' });

        // Tạo token
        const token = jwt.sign(
            { 
                userId: user.id, 
                role: user.role,
                schoolId: user.schoolId // Gắn schoolId vào token để check sau này
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            message: 'Đăng nhập thành công!',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                schoolId: user.schoolId
            }
        });

    } catch (error) {
        console.error('Lỗi login:', error);
        res.status(500).json({ error: 'Lỗi server.' });
    }
};

// --- 4. LẤY THÔNG TIN USER (GET ME) ---
const getMe = async (req, res) => {
    try {
        const userId = req.user.userId;
        const currentSchoolId = req.schoolId; // Trường đang truy cập

        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) return res.status(404).json({ error: 'User not found' });

        // [QUAN TRỌNG] Ngăn chặn dùng Token trường A để gọi API trường B
        if (user.schoolId !== currentSchoolId) {
            return res.status(403).json({ error: 'Token không hợp lệ cho trường này (Cross-Tenant Access Denied).' });
        }

        const { passwordHash, ...userInfo } = user;
        res.status(200).json({ user: userInfo });
    } catch (e) {
        res.status(500).json({ error: 'Server error' });
    }
};

// --- 5. TÌM TRƯỜNG (PUBLIC) ---
const findSchool = async (req, res) => {
    const { schoolName } = req.body;
    if (!schoolName) return res.status(400).json({ error: "Nhập tên trường." });

    try {
        const school = await prisma.school.findFirst({
            where: { name: { equals: schoolName, mode: 'insensitive' } },
            select: { slug: true }
        });

        if (!school) return res.status(404).json({ error: "Không tìm thấy trường." });
        return res.status(200).json({ slug: school.slug });
    } catch (error) {
        return res.status(500).json({ error: "Lỗi máy chủ." });
    }
};

module.exports = {
    registerTenant,
    registerAdmin,
    login,
    getMe,
    findSchool,
};