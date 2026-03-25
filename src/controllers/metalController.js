const metalService = require('../services/metalServices');
const { successResponse, errorResponse } = require('../utills/apiResponse');
const { getCurrentFinancialYear } = require('../middlewares/currfinancialYear');

const validateMetalData = (data) => {
  if (!data.metalname) {
    throw new Error('Metal name is required');
  }
  if (!data.metal_code) {
    throw new Error('Metal code is required');
  }
  if (!['active', 'inactive'].includes(data.status)) {
    throw new Error('Invalid status value');
  }
};

const createMetal = async (req, res, next) => {
  try {
    const { body, user } = req;
    
    // Validate input data
    validateMetalData(body);
    
    // Get current financial year
    const currentFYId = await getCurrentFinancialYear();
    
    // Add created_by and financial_id
    const metalData = {
      ...body,
      created_by: user.id,
      financial_id: currentFYId
    };
    
    // Create metal
    const metal = await metalService.createMetal(metalData);
    
    successResponse(res, metal, 201);
  } catch (error) {
    errorResponse(res, error.message, 400, error);
  }
};

const getMetal = async (req, res, next) => {
  try {
    const metal = await metalService.getMetalById(req.params.id);
    if (!metal) {
      return errorResponse(res, 'Metal not found', 404);
    }
    successResponse(res, metal);
  } catch (error) {
    errorResponse(res, 'Failed to fetch metal', 500, error);
  }
};

const getAllMetals = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, metal, status } = req.query;
    
    const { metals, total } = await metalService.getAllMetals({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      metal,
      status
    });
    
    successResponse(res, {
      metals,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    errorResponse(res, 'Failed to fetch metals', 500, error);
  }
};

const updateMetal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { body, user } = req;
    
    // Validate input data
    validateMetalData(body);
    
    // Add updated_by
    const metalData = {
      ...body,
      updated_by: user.id
    };
    
    // Update metal
    const updatedMetal = await metalService.updateMetal(id, metalData);
    successResponse(res, updatedMetal);
  } catch (error) {
    errorResponse(res, error.message, 400, error);
  }
};

const deleteMetal = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Delete metal
    await metalService.deleteMetal(id);
    successResponse(res, { message: 'Metal deleted successfully' });
  } catch (error) {
    errorResponse(res, error.message, 400, error);
  }
};

const searchMetals = async (req, res, next) => {
  try {
    const query = req.query.query;
    const metals = await metalService.searchMetals(query);
    successResponse(res, metals);
  } catch (error) {
    errorResponse(res, 'Search failed', 500, error);
  }
};

const filterByStatus = async (req, res, next) => {
  try {
    const status = req.query.status;
    const metals = await metalService.filterMetalsByStatus(status);
    successResponse(res, metals);
  } catch (error) {
    errorResponse(res, 'Filter failed', 500, error);
  }
};

const getStatusOptions = async (req, res, next) => {
  try {
    const options = await metalService.getStatusOptions();
    successResponse(res, options);
  } catch (error) {
    errorResponse(res, 'Failed to get status options', 500, error);
  }
};

const getMetalOptions = async (req, res, next) => {
  try {
    const options = await metalService.getMetalOptions();
    successResponse(res, options);
  } catch (error) {
    errorResponse(res, 'Failed to get metal options', 500, error);
  }
};

const getMetalCount = async (req, res, next) => {
  try {
    const count = await metalService.getMetalCount();
    successResponse(res, { count });
  } catch (error) {
    errorResponse(res, 'Failed to get metal count', 500, error);
  }
};

module.exports = {
  createMetal,
  getMetal,
  getAllMetals,
  updateMetal,
  deleteMetal,
  searchMetals,
  filterByStatus,
  getStatusOptions,
  getMetalOptions,
  getMetalCount
};