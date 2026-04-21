const purchaseService = require('../services/MeltingService');
const { successResponse, errorResponse } = require('../utills/apiResponse');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const bwipjs = require('bwip-js');
const puppeteer = require('puppeteer');
const Mustache = require('mustache');
const { getCurrentFinancialYear } = require('../middlewares/currfinancialYear');
const { getCustomerById } = require('../services/customerService');
const { getUserById } = require('../services/userService');


const createMeltingPurchase = async (req, res, next) => {
  try {
    const result = await purchaseService.createMeltingPurchase(req.body.id);
    successResponse(res, result, 201);
  } catch (error) {
    console.error('Error in createMeltingPurchase:', error);
    errorResponse(res, error.message, 400, error);
  }
};




const createMeltProducts = async (req, res, next) => {
  try {
    const result = await purchaseService.createMeltProducts(req.body);
    successResponse(res, result, 201);
  } catch (error) {
    console.error('Error in createMeltProducts:', error);
    errorResponse(res, error.message, 400, error);
  }
};


const updateMeltProduct = async (req, res, next) => {
  try {
    const result = await purchaseService.updateMeltProduct(req.params.id, req.body);
    successResponse(res, result, 201);
  } catch (error) {
    console.error('Error in updateMeltProduct:', error);
    errorResponse(res, error.message, 400, error);
  }
};

const getAllMeltPurchases = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, metal, status } = req.query;

    // Call a new service function that fetches data from `melting_purchase`
    const { purchases, total } = await purchaseService.getAllMeltPurchases({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      metal,
      status
    });

    successResponse(res, {
      purchases,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching melting purchases:', error);
    errorResponse(res, 'Failed to fetch melting purchases', 500, error);
  }
};


const getAllkMeltingPurchases = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, metal, status } = req.query;

    // Call a new service function that fetches data from `melting_purchase`
    const { purchases, total } = await purchaseService.getAllkMeltingPurchases({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      metal,
      status
    });

    successResponse(res, {
      purchases,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching melting purchases:', error);
    errorResponse(res, 'Failed to fetch melting purchases', 500, error);
  }
};

const getAllSmith = async (req, res, next) => {
  try {
    const result = await purchaseService.getAllSmith()
    successResponse(res, result, 200)
  } catch (error) {
    console.error("Error in get All Smith Controller:", error)
    errorResponse(res, 'Error in get All Smith Controller', 500, error);
  }
}


const getAllWages = async (req, res, next) => {
  try {
    const result = await purchaseService.getAllWages(req.query)
    successResponse(res, result, 200)
  } catch (error) {
    console.error("Error in get All Smith Controller:", error)
    errorResponse(res, 'Error in get All Smith Controller', 500, error);
  }
}

const updateWages = async (req, res, next) => {
  try {
    const result = await purchaseService.updateWages(req.body)
    successResponse(res, result, 200)
  } catch (error) {
    console.error("Error in get All Smith Controller:", error)
    errorResponse(res, 'Error in get All Smith Controller', 500, error);
  }
}


const getAllMeltProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      metal,
      status,
      startDate,
      endDate
    } = req.query;

    const { purchases, total } = await purchaseService.getAllMeltProducts({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      metal,
      status,
      startDate,
      endDate
    });

    successResponse(res, {
      purchases,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching melting purchases:', error);
    errorResponse(res, 'Failed to fetch melting purchases', 500, error);
  }
};

const getAllMeltReceiptProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      metal,
      status,
      startDate,
      endDate
    } = req.query;

    const { purchases, total } = await purchaseService.getAllMeltReceiptProducts({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      metal,
      status,
      startDate,
      endDate
    });

    successResponse(res, {
      purchases,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching melting purchases:', error);
    errorResponse(res, 'Failed to fetch melting purchases', 500, error);
  }
};

const getAllSalesPayments = async (req, res, next) => {
  try {
    const { metal } = req.query;

    const { purchases, total } = await purchaseService.getAllSalesPayments({

      metal,
    });

    successResponse(res, {
      purchases,
      pagination: {
        total,

      }
    });
  } catch (error) {
    console.error('Error fetching melting purchases:', error);
    errorResponse(res, 'Failed to fetch melting purchases', 500, error);
  }
};
const createSalesPayments = async (req, res, next) => {
  try {
    const id = req.params.melt_id;
    await purchaseService.createSalesPayment(id, req.body);
    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error("Error updating purchase:", error);
    return errorResponse(res, error.message, 400, error);
  }
};
const updatePurchaseAccountsStatus = async (req, res, next) => {
  try {
    const id = req.params.accounts_id;
    await purchaseService.updatePurchaseAccountsStatus(id, req.body);
    const updatedPurchase = await purchaseService.getMeltPurchaseById(id);
    return res.status(200).json({
      success: true,
      data: updatedPurchase,
    });
  } catch (error) {
    console.error("Error updating purchase:", error);
    return errorResponse(res, error.message, 400, error);
  }
};

const updatePurchaseMeltingStatus = async (req, res, next) => {
  try {
    const id = req.params.accounts_id;
    await purchaseService.updatePurchaseMeltingStatus(id, req.body);
    const updatedPurchase = await purchaseService.getMeltPurchaseById(id);
    return res.status(200).json({
      success: true,
      data: updatedPurchase,
    });
  } catch (error) {
    console.error("Error updating purchase:", error);
    return errorResponse(res, error.message, 400, error);
  }

};

const updatePurchaseMeltingProduct = async (req, res, next) => {
  try {
    const id = req.params.id;
    await purchaseService.updatePurchaseMeltingStatus(id, req.body);
    const updatedPurchase = await purchaseService.getMeltPurchaseById(id);
    return res.status(200).json({
      success: true,
      data: updatedPurchase,
    });
  } catch (error) {
    console.error("Error updating purchase:", error);
    return errorResponse(res, error.message, 400, error);
  }
};

const updateMeltDetails = async (req, res, next) => {
  try {
    const id = req.params.id;
    await purchaseService.updateMeltDetails(id, req.body);
    return res.status(200).json({
      success: true
    });
  } catch (error) {
    console.error("Error updated melt details: ", error);
    return errorResponse(res, error.message, 400, error);
  }
};

const updateWagesDetails = async (req, res, next) => {
  try {
    const id = req.params.id;
    await purchaseService.updateWagesDetails(id, req.body);
    return res.status(200).json({
      success: true
    });
  } catch (error) {
    console.error("Error updated melt wages details: ", error);
    return errorResponse(res, error.message, 400, error);
  }
}

module.exports = {
  createMeltingPurchase,
  getAllMeltPurchases,
  updatePurchaseAccountsStatus,
  updatePurchaseMeltingStatus,
  updatePurchaseMeltingProduct,
  createMeltProducts,
  getAllMeltProducts,
  updateMeltProduct,
  getAllSalesPayments,
  createSalesPayments,
  getAllkMeltingPurchases,
  updateMeltDetails,
  updateWagesDetails,
  getAllMeltReceiptProducts,
  getAllSmith,
  getAllWages,
  updateWages
};