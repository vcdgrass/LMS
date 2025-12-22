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
module.exports = {
    getAllUserService,
    updateUserLockStatus,
};