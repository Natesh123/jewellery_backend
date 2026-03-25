const express = require('express');
const router = express.Router();
const customerBankController = require('../controllers/customerBankController');
const upload = require('../middlewares/uploadMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');

// Protect all routes with authentication
router.use(authMiddleware.protect);

// Customer Bank Account CRUD operations
router.route('/')
  .post(upload.array('documents', 5), customerBankController.createBankAccount)
  .get(customerBankController.getAllBankAccounts);

router.route('/:id')
  .get(customerBankController.getBankAccount)
  .put(upload.array('documents', 5), customerBankController.updateBankAccount)
  .delete(customerBankController.deleteBankAccount);

// Customer-specific bank accounts
router.get('/customer/:customerId', customerBankController.getBankAccountsByCustomer);

// Bank account operations
router.patch('/:id/set-primary', customerBankController.setPrimaryBankAccount);
router.get('/search/:query', customerBankController.searchBankAccounts);
router.get('/filter/bank/:bankName', customerBankController.filterByBankName);

module.exports = router;