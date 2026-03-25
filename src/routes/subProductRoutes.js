const express = require('express');
const router = express.Router();
const subProductController = require('../controllers/subProductController');
const authMiddleware = require('../middlewares/authMiddleware');

// Protect all routes with authentication
router.use(authMiddleware.protect);

// SubProduct CRUD operations
router.route('/')
  .post(subProductController.createSubProduct)
  .get(subProductController.getAllSubProducts);
  
router.route('/no-limit').get(subProductController.getAllSubProductsNoLimit);

router.route('/:id')
  .get(subProductController.getSubProduct)
  .put(subProductController.updateSubProduct)
  .delete(subProductController.deleteSubProduct);

// Additional sub-product routes
router.get('/search', subProductController.searchSubProducts);
router.get('/options/status-options', subProductController.getStatusOptions);
router.get('/options/product-options', subProductController.getProductOptions);
router.get('/count', subProductController.getSubProductCount);

module.exports = router;