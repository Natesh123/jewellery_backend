const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permissionController');
const authMiddleware = require('../middlewares/authMiddleware');

// Protect all routes with authentication
router.use(authMiddleware.protect);

// Permission CRUD operations
router.route('/')
  .post(permissionController.createPermission)
  .get(permissionController.getAllPermissions);

router.route('/:id')
  .get(permissionController.getPermission)
  .put(permissionController.updatePermission)
  .delete(permissionController.deletePermission);

// Additional permission routes
router.get('/search', permissionController.searchPermissions);
router.get('/by-role/:roleId', permissionController.getPermissionsByRole);

module.exports = router;