const express = require('express');
const router = express.Router();
const meltController = require('../controllers/MeltingController');
const authMiddleware = require('../middlewares/authMiddleware');
const asyncHandler = require('../utills/asyncHandler');
router.use(authMiddleware.protect);


router.post("/", asyncHandler(meltController.createMeltingPurchase));
router.post("/create_melt", asyncHandler(meltController.createMeltProducts));
router.get("/create_melts", asyncHandler(meltController.getAllMeltProducts));
router.get("/create_melts_receipt", asyncHandler(meltController.getAllMeltReceiptProducts));
router.get("/acctounts_melt", asyncHandler(meltController.getAllkMeltingPurchases));
router.get("/sales_payments", asyncHandler(meltController.getAllSalesPayments));
router.put("/create_sales_payments/:melt_id", asyncHandler(meltController.createSalesPayments));
router.put("/create_melts_update/:id", asyncHandler(meltController.updateMeltProduct));
router.get("/read/", asyncHandler(meltController.getAllMeltPurchases));
router.get("/all_smith/", asyncHandler(meltController.getAllSmith));
router.get("/wages/", asyncHandler(meltController.getAllWages));
router.post("/wages/", asyncHandler(meltController.updateWages));


router.put('/accounts/:accounts_id/:branch_id', asyncHandler(meltController.updatePurchaseAccountsStatus));
router.put('/melt/:accounts_id/:branch_id', asyncHandler(meltController.updatePurchaseMeltingStatus));
router.put('/melt_product/:id/:branch_id', asyncHandler(meltController.updatePurchaseMeltingProduct));
router.put('/melt_details/:id', asyncHandler(meltController.updateMeltDetails));
router.put('/melt_wages/:id', asyncHandler(meltController.updateWagesDetails));

module.exports = router;
