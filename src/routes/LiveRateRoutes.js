const express = require('express');
const router = express.Router();
const { getAllLiveRates, updateLiveRate } = require('../controllers/liveRateController');
const authMiddleware = require('../middlewares/authMiddleware');

// Protect all routes
router.use(authMiddleware.protect);

// Get all live rates
router.get('/', getAllLiveRates);

// Update a specific metal rate
router.put('/:id', updateLiveRate);

module.exports = router;
