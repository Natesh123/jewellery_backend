const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branchController');
const upload = require('../middlewares/uploadMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');

// Protect all routes with authentication
router.use(authMiddleware.protect);

// Branch CRUD operations
router.route('/')
  .post(upload.array('documents', 5), branchController.createBranch)
  .get(branchController.getAllBranches);

router.route('/:id')
  .get(branchController.getBranch)
  .put(upload.array('documents', 5), branchController.updateBranch)
  .delete(branchController.deleteBranch);

router.route('/get-by-company/:companyId')
  .get(branchController.getBranchByCompany)

// Additional branch routes
router.get('/search/:query', branchController.searchBranches);
router.get('/filter/state/:state', branchController.filterByState);
router.get('/filter/company/:companyId', branchController.filterByCompany);

module.exports = router;