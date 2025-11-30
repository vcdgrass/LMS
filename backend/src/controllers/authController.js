const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { prisma } = require('../utils/db');

// Đăng ký Admin
const registerAdmin = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Vui lòng nhập đủ username, email, và password.' });
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

    const adminUser = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        role: 'admin',
        isLocked: false,
      },
    });

    const { passwordHash: _, ...userResult } = adminUser;
    res.status(201).json(userResult);

  } catch (error) {
    console.error('Lỗi khi đăng ký Admin:', error);
    res.status(500).json({ error: 'Lỗi máy chủ nội bộ.' });
  }
};

// Đăng nhập
const login = async (req, res) => {
  const { username, password } = req.body;

  console.log("Đang login với username:", username);

  if (!username || !password) {
    return res.status(400).json({ error: 'Vui lòng nhập username và password.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(401).json({ error: 'Username hoặc mật khẩu không đúng.' });
    }

    if (user.isLocked) {
      return res.status(403).json({ error: 'Tài khoản của bạn đã bị khóa.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Username hoặc mật khẩu không đúng.' });
    }

    const token = jwt.sign(
      { 
        userId: user.id, 
        role: user.role,
        email: user.email,
        username: user.username
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
      }
    });

  } catch (error) {
    console.error('Lỗi khi đăng nhập:', error);
    res.status(500).json({ error: 'Lỗi máy chủ nội bộ.' });
  }
};

const getMe = async (req, res) => {
  try {
    // req.user được tạo ra từ middleware verifyToken
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isLocked: true
        // KHÔNG select passwordHash
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng.' });
    }

    if (user.isLocked) {
      return res.status(403).json({ error: 'Tài khoản đã bị khóa.' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Lỗi getMe:', error);
    res.status(500).json({ error: 'Lỗi máy chủ.' });
  }
};

module.exports = {
  registerAdmin,
  login,
  getMe,
};
