const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const upload = require('../middlewares/uploadMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const { validatePayment } = require('../middlewares/purchaseMiddleware');

// Protect all routes with authentication
router.use(authMiddleware.protect);
router.route('/regional-manager/:manager_id/:branch_id')
  .put(purchaseController.updatePurchaseReligionStatus)
  .get(purchaseController.getAllPurchasesRegional);
router.route('/sales').post(purchaseController.createSales)
router.route('/accounts/:accounts_id/:branch_id')
  .put(purchaseController.updatePurchaseAccountsStatus)
  .get(purchaseController.getAllPurchasesAccounts);
// Purchase CRUD operations
router.route('/')
  .post(
    upload.fields([
      { name: 'bill_copy', maxCount: 1 },
      { name: 'ornament_photo', maxCount: 1 },
      { name: 'user_capture', maxCount: 1 }
    ]),
    purchaseController.createPurchase
  )
  .get(purchaseController.getAllPurchases);



router.route('/verify-aadhar')
  .post(purchaseController.verifyAadhar);

router.route('/send-aadhar-otp')
  .post(purchaseController.sendAadharOtp);

router.route('/:id')
  .get(purchaseController.getPurchaseById)

  .put(
    upload.fields([
      { name: 'bill_copy', maxCount: 1 },
      { name: 'ornament_photo', maxCount: 1 }
    ]),
    purchaseController.updatePurchase
  )
  .delete(purchaseController.deletePurchase);

router.route('/qua/:id').get(purchaseController.getPurchaseByQuotationId)

// Payment related routes
router.route('/payment-methods')
  .get(purchaseController.getPaymentMethods);

router.route('/:id/record-payment')
  .post(validatePayment, purchaseController.recordPayment);

router.route('/:id/payment-history')
  .get(purchaseController.getPaymentHistory);

// Document generation routes
router.route('/:id/generate-bill')
  .get(purchaseController.generateBillPDF);

router.route('/:id/download-bill')
  .get(purchaseController.downloadBill);

// Barcode routes
router.route('/:id/generate-barcode')
  .get(purchaseController.generateBarcode);

router.route('/:id/download-barcode')
  .get(purchaseController.downloadBarcode);

// QR Code routes
router.route('/:id/generate-qrcode')
  .get(purchaseController.generateQRCode);

router.route('/:id/download-qrcode')
  .get(purchaseController.downloadQRCode);

// Search and filter
router.get('/search/:query', purchaseController.searchPurchases);
router.get('/filter/params', purchaseController.filterPurchases);

module.exports = router;