// roleRoutes.js
const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const authMiddleware = require('../middlewares/authMiddleware');


// Protect all routes with authentication
router.use(authMiddleware.protect);

// Role CRUD operations
router.route('/')
  .post(roleController.createRole)
  .get(roleController.getAllRoles);

router.route('/:id')
  .get(roleController.getRole)
  .put(roleController.updateRole)
  .delete(roleController.deleteRole);

// Additional role routes
router.get('/search', roleController.searchRoles);
router.get('/filter/status/', roleController.filterByStatus);

module.exports = router;