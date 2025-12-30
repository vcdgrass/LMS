const { prisma } = require('../utils/db');

const tenantMiddleware = async (req, res, next) => {
    // Các route đặc biệt không cần xác định trường (ví dụ: Đăng ký mở trường mới)
    const publicPaths = [
        '/auth/register-tenant',
        '/auth/find-school'
    ];
    if (publicPaths.includes(req.path)) {
        return next();
    }

    // Lấy slug từ Header (Frontend sẽ gửi lên)
    const schoolSlug = req.headers['x-school-slug'];

    if (!schoolSlug) {
        return res.status(400).json({ 
            error: "Yêu cầu thiếu 'x-school-slug' header. Bạn đang truy cập trường nào?" 
        });
    }

    try {
        const school = await prisma.school.findUnique({
            where: { slug: schoolSlug }
        });

        if (!school) {
            return res.status(404).json({ error: "Trường học không tồn tại (Invalid Slug)." });
        }

        // Gắn schoolId vào request để các Controller bên dưới sử dụng
        req.schoolId = school.id;
        req.school = school;
        
        next();
    } catch (error) {
        console.error("Tenant Middleware Error:", error);
        res.status(500).json({ error: "Lỗi kiểm tra danh tính trường học." });
    }
};

module.exports = tenantMiddleware;