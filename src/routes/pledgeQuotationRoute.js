const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/pledgeQuotationController');
const upload = require('../middlewares/uploadMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const { validateMarginChange } = require('../middlewares/quotationMiddleware');

// Protect all routes with authentication
router.use(authMiddleware.protect);

router.get('/purchase_quotation', quotationController.getAllQuotationsForPurchase);
router.get('/final_quotation', quotationController.getAllFinalQuotations);
router.route('/final_quotation/:id').get(quotationController.getPledgeFinalQuotationById)
router.get('/mcx-rates', quotationController.getMCXRates);
router.get('/mcx_rates_all', quotationController.getMCXRatesAll);
router.put("/mcx_rates/:id", quotationController.updateMCXRate);
router.delete("/mcx_rates/:id", quotationController.deleteMCXRate);
// Quotation CRUD operations
router.route('/')
    .post(upload.fields([
        { name: 'bill_copy', maxCount: 1 },
        { name: 'ornament_photo', maxCount: 1 }
    ]), quotationController.createQuotation)
    .get(quotationController.getAllQuotations);

router.route('/customer/:customerId')
    .post(upload.fields([
        { name: 'bill_copy', maxCount: 1 },
        { name: 'ornament_photo', maxCount: 1 }
    ]), quotationController.createQuotationForCustomer);

router.route('/:id')
    .get(quotationController.getQuotationById)
    .put(upload.fields([
        { name: 'bill_copy', maxCount: 1 },
        { name: 'ornament_photo', maxCount: 1 }
    ]), quotationController.updateQuotation)
    .delete(quotationController.deleteQuotation);

// Additional routes
router.get('/search/:query', quotationController.searchQuotations);
router.get('/filter/params', quotationController.filterQuotations);
router.get('/:id/generate-pdf', quotationController.generateQuotationPDF);


// Configuration routes
router.get('/metals', quotationController.getMetalOptions);
router.get('/products', quotationController.getProductOptions);
router.get('/subproducts/:product', quotationController.getSubProductOptions);



// Approval workflow routes
router.post('/:id/request-approval', quotationController.requestMarginApproval);
router.post('/:id/approve-margin', authMiddleware.restrictTo('manager', 'admin'), quotationController.approveMarginChange);
router.post('/:id/reject-margin', authMiddleware.restrictTo('manager', 'admin'), quotationController.rejectMarginChange);
router.get('/pending-approvals', authMiddleware.restrictTo('manager', 'admin'), quotationController.getPendingApprovals);

// Analysis routes
router.get('/analysis/monthly', quotationController.getMonthlyAnalysis);
router.get('/analysis/product-wise', quotationController.getProductWiseAnalysis);
router.get('/analysis/metal-wise', quotationController.getMetalWiseAnalysis);

module.exports = router;
