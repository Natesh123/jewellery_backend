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

module.exports = router;
