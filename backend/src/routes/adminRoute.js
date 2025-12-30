const router = require('express').Router();
const { getAllUsers, createUser, importUsers, toggleLockUser } = require('../controllers/userController');
const { uploadCsv } = require('../middlewares/uploadMiddleware');
const { verifyToken , isAdmin } = require('../middlewares/authMiddleware');
const adminController = require('../controllers/adminController');


router.get('/users', getAllUsers);
router.post('/users/import', verifyToken, isAdmin, uploadCsv.single('file'), importUsers);
router.post('/users', createUser);
router.patch('/users/:id/lock', verifyToken, isAdmin, toggleLockUser);

router.get('/stats', adminController.getDashboardStats);

module.exports = router;