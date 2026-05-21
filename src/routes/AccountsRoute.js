const express = require('express');
const router = express.Router();
const accountsController = require('../controllers/AccountsController');
const authMiddleware = require('../middlewares/authMiddleware');
const asyncHandler = require('../utills/asyncHandler');

router.use(authMiddleware.protect);

// ✅ Wrap all async controller calls
router.post("/create_master", asyncHandler(accountsController.createMasterGrouping));
router.get("/get_master", asyncHandler(accountsController.getMasterGroupings));
router.post("/create_account_head", asyncHandler(accountsController.createAccountHead));
router.get("/get_account_head", asyncHandler(accountsController.getAllAccountHeads));
router.post("/create_receipt", asyncHandler(accountsController.createReceipt));
router.get("/get_receipt", asyncHandler(accountsController.getAllReceipts));
router.post("/create_state", asyncHandler(accountsController.createState));
router.get("/get_state", asyncHandler(accountsController.getAllState));
router.post("/create_opening_balance", asyncHandler(accountsController.createOpeningBalance));
router.get("/get_opening_balance", asyncHandler(accountsController.getAllOpeningBalances));
router.put("/update_opening_balance/:id", asyncHandler(accountsController.updateOpeningBalance));
router.delete("/delete_opening_balance/:id", asyncHandler(accountsController.deleteOpeningBalance));
router.post("/create_opening_stock", asyncHandler(accountsController.createOpeningStock));
router.get("/get_opening_stock", asyncHandler(accountsController.getAllOpeningStocks));
router.put("/update_opening_stock/:id", asyncHandler(accountsController.updateOpeningStock));
router.delete("/delete_opening_stock/:id", asyncHandler(accountsController.deleteOpeningStock));

module.exports = router;
