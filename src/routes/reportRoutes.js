const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware.protect);

router.get('/stock-report', reportController.getStockReport);
router.get('/smith-payment-report', reportController.getSmithPaymentReport);
router.get('/day-book-report', reportController.getDayBookReport);
router.get('/ledger-report', reportController.getLedgerReport);
router.get('/trial-balance', reportController.getTrialBalance);
router.get('/profit-and-loss', reportController.getProfitAndLoss);

module.exports = router;
