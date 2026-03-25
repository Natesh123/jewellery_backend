const express = require('express');
const router = express.Router();
const metalController = require('../controllers/metalController');
const authMiddleware = require('../middlewares/authMiddleware');

// Protect all routes with authentication
router.use(authMiddleware.protect);

// Metal CRUD operations
router.route('/')
  .post(metalController.createMetal)
  .get(metalController.getAllMetals);

router.route('/:id')
  .get(metalController.getMetal)
  .put(metalController.updateMetal)
  .delete(metalController.deleteMetal);

// Additional metal routes
router.get('/search', metalController.searchMetals);
router.get('/filter/status', metalController.filterByStatus);
router.get('/options/status', metalController.getStatusOptions);
router.get('/options/metals', metalController.getMetalOptions);
router.get('/count', metalController.getMetalCount);

module.exports = router;