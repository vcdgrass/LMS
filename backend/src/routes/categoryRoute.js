const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController.js');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware.js');


router.get('/', categoryController.getAllCategories);
router.post('/', verifyToken, isAdmin, categoryController.createCategory);
router.put('/:id', verifyToken, isAdmin, categoryController.updateCategory);
router.delete('/:id', verifyToken, isAdmin, categoryController.deleteCategory);

module.exports = router;