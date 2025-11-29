const router = require('express').Router();
const { getAllUsers, createUser, importUsers } = require('../controllers/userController');
const { uploadCsv } = require('../middlewares/uploadMiddleware');
const { verifyToken , isAdmin } = require('../middlewares/authMiddleware');

router.get('/users', async (req, res) => {
    try {
        const users = await getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách người dùng:', error);
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ.' });
    }
});

router.post('/users/import', verifyToken, isAdmin, uploadCsv.single('file'), importUsers);
router.post('/users', createUser);


module.exports = router;