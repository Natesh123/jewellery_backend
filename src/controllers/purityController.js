const purityService = require('../services/purityServices');
const { successResponse, errorResponse } = require('../utills/apiResponse');
const { getCurrentFinancialYear } = require('../middlewares/currfinancialYear');

const validatePurityData = (data) => {
  if (!data.metal_id) {
    throw new Error('Metal ID is required');
  }
  if (!data.purity_standard) {
    throw new Error('Purity standard is required');
  }
  if (!data.purity_name) {
    throw new Error('Purity name is required');
  }
  if (!data.purity_code) {
    throw new Error('Purity code is required');
  }
  if (!['active', 'inactive'].includes(data.status)) {
    throw new Error('Invalid status value');
  }
};

const createPurity = async (req, res, next) => {
  try {
    const { body, user } = req;
    
    // Validate input data
    validatePurityData(body);
    
    // Get current financial year
    const currentFYId = await getCurrentFinancialYear();
    
    // Add created_by and financial_id
    const purityData = {
      ...body,
      created_by: user.id,
      financial_id: currentFYId
    };
    
    // Create purity
    const purity = await purityService.createPurity(purityData);
    
    successResponse(res, purity, 201);
  } catch (error) {
    errorResponse(res, error.message, 400, error);
  }
};

const getPurity = async (req, res, next) => {
  try {
    const purity = await purityService.getPurityById(req.params.id);
    if (!purity) {
      return errorResponse(res, 'Purity not found', 404);
    }
    successResponse(res, purity);
  } catch (error) {
    errorResponse(res, 'Failed to fetch purity', 500, error);
  }
};

const getAllPurities = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, metal, status } = req.query;
    
    const { purities, total } = await purityService.getAllPurities({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      metal,
      status
    });
    
    successResponse(res, {
      purities,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    errorResponse(res, 'Failed to fetch purities', 500, error);
  }
};

const updatePurity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { body, user } = req;
    
    // Validate input data
    validatePurityData(body);
    
    // Add updated_by
    const purityData = {
      ...body,
      updated_by: user.id
    };
    
    // Update purity
    const updatedPurity = await purityService.updatePurity(id, purityData);
    successResponse(res, updatedPurity);
  } catch (error) {
    errorResponse(res, error.message, 400, error);
  }
};

const deletePurity = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Delete purity
    await purityService.deletePurity(id);
    successResponse(res, { message: 'Purity deleted successfully' });
  } catch (error) {
    errorResponse(res, error.message, 400, error);
  }
};

const searchPurities = async (req, res, next) => {
  try {
    const query = req.query.query;
    const purities = await purityService.searchPurities(query);
    successResponse(res, purities);
  } catch (error) {
    errorResponse(res, 'Search failed', 500, error);
  }
};

const filterByStatus = async (req, res, next) => {
  try {
    const status = req.query.status;
    const purities = await purityService.filterPuritiesByStatus(status);
    successResponse(res, purities);
  } catch (error) {
    errorResponse(res, 'Filter failed', 500, error);
  }
};

const getStatusOptions = async (req, res, next) => {
  try {
    const options = await purityService.getStatusOptions();
    successResponse(res, options);
  } catch (error) {
    errorResponse(res, 'Failed to get status options', 500, error);
  }
};

const getMetalOptions = async (req, res, next) => {
  try {
    const options = await purityService.getMetalOptions();
    successResponse(res, options);
  } catch (error) {
    errorResponse(res, 'Failed to get metal options', 500, error);
  }
};

const getPurityStandards = async (req, res, next) => {
  try {
    const options = await purityService.getPurityStandards();
    successResponse(res, options);
  } catch (error) {
    errorResponse(res, 'Failed to get purity standards', 500, error);
  }
};

const getPurityCount = async (req, res, next) => {
  try {
    const count = await purityService.getPurityCount();
    successResponse(res, { count });
  } catch (error) {
    errorResponse(res, 'Failed to get purity count', 500, error);
  }
};

module.exports = {
  createPurity,
  getPurity,
  getAllPurities,
  updatePurity,
  deletePurity,
  searchPurities,
  filterByStatus,
  getStatusOptions,
  getMetalOptions,
  getPurityStandards,
  getPurityCount
};