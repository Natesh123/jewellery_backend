const express = require('express');
const router = express.Router();
const metalPricesApiController = require('../controllers/metalPricesApiController');
const authMiddleware = require('../middlewares/authMiddleware');

// Protect all routes with authentication
router.use(authMiddleware.protect);

// Metal CRUD operations
router.route('/')
  .get(metalPricesApiController.getMetalPrices);

// This route is only for testing the CRON job. 
// It should be be direcly called from external sources.
// router.route('/api')
//   .get(metalPricesApiController.fetchMetalPricesFromAPI);

module.exports = router;