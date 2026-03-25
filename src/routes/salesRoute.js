const express = require('express');
const router = express.Router();
const meltController = require('../controllers/MeltingController');
const authMiddleware = require('../middlewares/authMiddleware');
const asyncHandler = require('../utills/asyncHandler');
router.use(authMiddleware.protect);

router.get("/sales_report",asyncHandler)

module.exports = router;
