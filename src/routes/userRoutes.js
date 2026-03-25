const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { userUpload } = require('../middlewares/productUploadMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');

// Protect all routes with authentication
router.use(authMiddleware.protect);

// User CRUD operations
router.route('/')
  .post(userUpload, userController.createUser)
  .get(userController.getAllUsers);

router.route('/:id')
  .get(userController.getUserById)
  .put(userUpload, userController.updateUser)
  .delete(userController.deleteUser);

// Additional user routes
router.get('/search/:query', userController.searchUsers);
router.get('/count', userController.getUserCount);
router.get('/roles', userController.getRoles);
router.get('/companies', userController.getCompanies);
router.get('/branches/:companyId', userController.getBranchesByCompany);

module.exports = router;