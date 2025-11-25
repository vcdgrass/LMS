const { prisma } = require('../utils/db');

// Lấy danh mục
const getAllCategories = async (req, res) => {
    try {
        console.log("here");
        const categories = await prisma.courseCategory.findMany({
            include: {
                children: true, 
                _count: { select: { courses: true } }
            },
            orderBy: { id: 'asc' }
        });
        return res.status(200).json(categories);
    } catch (error) {
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

// Tạo danh mục
const createCategory = async (req, res) => {
    try {
        const { name, parentId } = req.body; 
        const newCategory = await prisma.courseCategory.create({
            data: {
                name,
                parentId: parentId ? parseInt(parentId) : null
            }
        });

        return res.status(201).json({ message: "Tạo thành công", data: newCategory });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

// Cập nhật danh mục

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, parentId } = req.body;

        // Validation: Không thể đặt cha là chính mình
        if (parentId && parseInt(parentId) === parseInt(id)) {
            return res.status(400).json({ message: "Danh mục cha không hợp lệ." });
        }

        const updatedCategory = await prisma.courseCategory.update({
            where: { id: parseInt(id) },   // dùng đúng field "id" trong Prisma
            data: {
                name,
                parentId: parentId ? parseInt(parentId) : null
            }
        });

        return res.status(200).json({ message: "Cập nhật thành công", data: updatedCategory });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Lỗi cập nhật danh mục." });
    }
};


// 4. Xóa danh mục

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const catId = parseInt(id);

        // Kiểm tra ràng buộc dữ liệu
        const category = await prisma.courseCategory.findUnique({
            where: { id: catId },
            include: { 
                _count: { select: { courses: true, children: true } }
            }
        });

        if (!category) return res.status(404).json({ message: "Danh mục không tồn tại." });

        if (category._count.children > 0) {
            return res.status(400).json({ message: "Không thể xóa: Danh mục này đang chứa danh mục con." });
        }
        if (category._count.courses > 0) {
            return res.status(400).json({ message: "Không thể xóa: Danh mục này đang chứa khóa học." });
        }

        await prisma.courseCategory.delete({
            where: { id: catId }
        });

        return res.status(200).json({ message: "Xóa danh mục thành công." });

    } catch (error) {
        return res.status(500).json({ message: "Lỗi xóa danh mục." });
    }
};

module.exports = {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory
};