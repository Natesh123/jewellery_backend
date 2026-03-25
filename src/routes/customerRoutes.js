const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const upload = require('../middlewares/uploadMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');

// Protect all routes with authentication
router.use(authMiddleware.protect);

// Customer CRUD operations  
router.route('/')
  .post(upload.fields([
    { name: 'customer_photo', maxCount: 1 },
    { name: 'aadhar_photo', maxCount: 1 },
    { name: 'pan_photo', maxCount: 1 }
  ]), customerController.createCustomer)
  .get(customerController.getAllCustomers);

router.route('/:id')
  .get(customerController.getCustomer)
  .put(upload.fields([
    { name: 'customer_photo', maxCount: 1 },
    { name: 'aadhar_photo', maxCount: 1 },
    { name: 'pan_photo', maxCount: 1 }
  ]), customerController.updateCustomer)
  .delete(customerController.deleteCustomer);

// Additional customer routes
router.get('/search/:query', customerController.searchCustomers);
router.get('/filter/state/:state', customerController.filterByState);
router.get('/filter/bank-account/:hasAccount', customerController.filterByBankAccount);

// Verification routes
router.post('/generate-otp', customerController.generateAadharOTP);
router.post('/verify-aadhar', customerController.verifyAadharOTP);

module.exports = router;