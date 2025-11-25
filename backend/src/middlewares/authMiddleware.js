// Chứa các middleware để kiểm tra xác thực và phân quyền (CommonJS)

const jwt = require('jsonwebtoken');

// Middleware kiểm tra token (sẽ dùng cho các route cần bảo vệ)
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // Định dạng: "Bearer <TOKEN>"
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ error: 'Chưa cung cấp token xác thực.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token không hợp lệ hoặc đã hết hạn.' });
    }
    
    // Gán thông tin user (đã giải mã từ token) vào request
    req.user = user; 
    next(); // Cho phép đi tiếp
  });
};

// Middleware kiểm tra vai trò Admin (sẽ dùng sau)
const isAdmin = (req, res, next) => {
  // Middleware này phải chạy *sau* verifyToken
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ error: 'Yêu cầu quyền Admin.' });
  }
};

// Export các hàm
module.exports = {
  verifyToken,
  isAdmin,
};