const { getLiveRatesFromDB, updateLiveRateInDB } = require('../services/liveRateService');
const { successResponse, errorResponse } = require('../utills/apiResponse');

// GET /api/live-rates
const getAllLiveRates = async (req, res) => {
  try {
    const rates = await getLiveRatesFromDB();
    return successResponse(res, rates, 200);
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
};

// PUT /api/live-rates/:id
const updateLiveRate = async (req, res) => {
  try {
    const { id } = req.params;
    const { live_rate, discount } = req.body;

    if (live_rate < 0 || discount < 0)
      return errorResponse(res, 'Rate or Discount cannot be negative', 400);

    const updated = await updateLiveRateInDB(id, live_rate, discount);
    return successResponse(res, updated, 200);
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
};

module.exports = {
  getAllLiveRates,
  updateLiveRate
};
