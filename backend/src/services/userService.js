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

module.exports = {
    getAllUserService,
};