const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const upload = require('../middlewares/uploadMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');

// Protect all routes with authentication
router.use(authMiddleware.protect);

// Company CRUD operations
router.route('/')
  .post(upload.array('documents', 5), companyController.createCompany)
  .get(companyController.getAllCompanies);

router.route('/:id')
  .get(companyController.getCompany)
  .put(upload.array('documents', 5), companyController.updateCompany)
  .delete(companyController.deleteCompany);

// Additional company routes
router.get('/search/:query', companyController.searchCompanies);
router.get('/filter/state/:state', companyController.filterByState);
router.get('/filter/turnover/:turnover', companyController.filterByTurnover);

module.exports = router;