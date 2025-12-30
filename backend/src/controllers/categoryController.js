const { prisma } = require('../utils/db');

// Lấy danh sách danh mục (Chỉ của trường hiện tại)
const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.courseCategory.findMany({
      where: {
        schoolId: req.schoolId // <--- QUAN TRỌNG: Chỉ lấy của trường này
      },
      include: {
        children: true, // Lấy kèm danh mục con (nếu có)
      },
    });
    res.status(200).json(categories);
  } catch (error) {
    console.error('Lỗi lấy danh mục:', error);
    res.status(500).json({ error: 'Lỗi máy chủ.' });
  }
};

// Tạo danh mục mới (Gắn vào trường hiện tại)
const createCategory = async (req, res) => {
  try {
    const { name, parentId } = req.body;
    const schoolId = req.schoolId; // Lấy từ Middleware

    if (!name) {
      return res.status(400).json({ error: 'Tên danh mục là bắt buộc.' });
    }

    const newCategory = await prisma.courseCategory.create({
      data: {
        name,
        parentId: parentId ? parseInt(parentId) : null, // Xử lý nếu parentId gửi lên là string hoặc null
        schoolId: schoolId // <--- SỬA LỖI TẠI ĐÂY: Gắn schoolId vào
      },
    });

    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Lỗi tạo danh mục:', error);
    res.status(500).json({ error: 'Lỗi máy chủ.' });
  }
};

// Cập nhật danh mục
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, parentId } = req.body;
    const schoolId = req.schoolId;

    // Kiểm tra xem danh mục này có thuộc trường của mình không trước khi sửa
    const existingCategory = await prisma.courseCategory.findFirst({
        where: { id: parseInt(id), schoolId }
    });

    if (!existingCategory) {
        return res.status(404).json({ error: "Danh mục không tồn tại hoặc không thuộc trường này." });
    }

    const updatedCategory = await prisma.courseCategory.update({
      where: { id: parseInt(id) },
      data: {
        name,
        parentId: parentId ? parseInt(parentId) : null,
      },
    });

    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error('Lỗi cập nhật danh mục:', error);
    res.status(500).json({ error: 'Lỗi máy chủ.' });
  }
};

// Xóa danh mục
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.schoolId;

    // Kiểm tra quyền sở hữu
    const existingCategory = await prisma.courseCategory.findFirst({
        where: { id: parseInt(id), schoolId }
    });

    if (!existingCategory) {
        return res.status(404).json({ error: "Danh mục không tồn tại hoặc không thuộc trường này." });
    }

    await prisma.courseCategory.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: 'Xóa danh mục thành công.' });
  } catch (error) {
    console.error('Lỗi xóa danh mục:', error);
    res.status(500).json({ error: 'Lỗi máy chủ.' });
  }
};

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};