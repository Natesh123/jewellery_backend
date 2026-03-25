const { getMetalPriceFromDatabase,getMetalPriceFromDatabase2, fetchAndStoreMetalPrices } = require('../services/metalPricesApiService');
const { successResponse, errorResponse } = require('../utills/apiResponse');

const getMetalPrices = async (_, res) => {
    try {
        const data = await getMetalPriceFromDatabase();

        return successResponse(res, data, 200);
    } catch (error) {
        return errorResponse(res, error.message, 400, error);
    }
}

const fetchMetalPricesFromAPI = async (_, res) => {
    try {
        const data = await fetchAndStoreMetalPrices();
        return successResponse(res, data, 200);
    } catch (error) {
        return errorResponse(res, error.message, 400, error);
    }
}

module.exports = {
  getMetalPrices,
  fetchMetalPricesFromAPI
};