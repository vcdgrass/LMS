const { prisma } = require('../utils/db');

const getAllUserService = async () => {
    return await prisma.user.findMany({
        select: {
            id: true,
            username: true,
            email: true,
            role: true,
            isLocked: true,
        },
    });
};

const updateUserLockStatus = async (userId, isLocked) => {
    return await prisma.user.update({
        where: { id: parseInt(userId) },
        data: { isLocked: isLocked },
        select: {
            id: true,
            username: true,
            email: true,
            role: true,
            isLocked: true,
        }
    });
};

const getAllStudents = async () => {
    try {
        // Chỉ lấy những trường cần thiết để tối ưu hiệu năng (id, email, username)
        const students = await prisma.user.findMany({
            where: {
                role: 'student' // Giả sử trong DB bạn lưu role là 'STUDENT'
            },
            select: {
                id: true,
                email: true,
                username: true
            }
        });
        return students;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getAllUserService,
    updateUserLockStatus,
    getAllStudents,
};