const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middlewares/authMiddleware');

// Protect all routes with authentication
router.use(authMiddleware.protect);

// Category CRUD operations
router.route('/')
  .post(categoryController.createCategory)
  .get(categoryController.getAllCategories);

router.route('/:id')
  .get(categoryController.getCategoryById)
  .put(categoryController.updateCategory)
  .delete(categoryController.deleteCategory);

// Additional category routes
router.get('/search', categoryController.searchCategories);
router.get('/options/status', categoryController.getStatusOptions);
router.get('/options/metal-options', categoryController.getMetalOptions);
router.get('/options/tax-options', categoryController.getTaxOptions);
router.get('/next-code', categoryController.getNextCategoryCode);
router.get('/generate-name', categoryController.generateCategoryName);
module.exports = router;