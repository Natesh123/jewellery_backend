const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middlewares/authMiddleware');

// Protect all routes with authentication
router.use(authMiddleware.protect);

// Product CRUD operations
router.route('/')
  .post(productController.createProduct)
  .get(productController.getAllProducts);
  
router.route('/no-limit').get(productController.getAllProductsNoLimit);

router.route('/:id')
  .get(productController.getProduct)
  .put(productController.updateProduct)
  .delete(productController.deleteProduct);

// Additional product routes
router.get('/search', productController.searchProducts);
router.get('/options/status-options', productController.getStatusOptions);
router.get('/options/metal-options', productController.getMetalOptions);
router.get('/options/category-options', productController.getCategoryOptions);
router.get('/options/subproduct-options', productController.getSubProductOptions);
router.get('/count', productController.getProductCount);

module.exports = router;