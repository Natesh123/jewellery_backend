const express = require('express');
const router = express.Router();
const purityController = require('../controllers/purityController');
const authMiddleware = require('../middlewares/authMiddleware');

// Protect all routes with authentication
router.use(authMiddleware.protect);

// Purity CRUD operations
router.route('/')
  .post(purityController.createPurity)
  .get(purityController.getAllPurities);

router.route('/:id')
  .get(purityController.getPurity)
  .put(purityController.updatePurity)
  .delete(purityController.deletePurity);

// Additional purity routes
router.get('/search', purityController.searchPurities);
router.get('/options/status-options', purityController.getStatusOptions); // Updated
router.get('/options/metal-options', purityController.getMetalOptions); // Updated
router.get('/options/purity-standards', purityController.getPurityStandards); // Updated
router.get('/count', purityController.getPurityCount);

module.exports = router;