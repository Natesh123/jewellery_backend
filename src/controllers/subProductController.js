const subProductService = require('../services/subProductServices');
const { successResponse, errorResponse } = require('../utills/apiResponse');
const { getCurrentFinancialYear } = require('../middlewares/currfinancialYear');

const validateSubProductData = (data) => {
  if (!data.product_name) {
    throw new Error('Product ID is required');
  }
  if (!data.sub_product_name) {
    throw new Error('Sub-product name is required');
  }
  if (!data.sub_product_code) {
    throw new Error('Sub-product code is required');
  }
  if (!['active', 'inactive'].includes(data.status)) {
    throw new Error('Invalid status value');
  }
};

const createSubProduct = async (req, res, next) => {
  try {
    const { body, user } = req;
    
    // Validate input data
    validateSubProductData(body);
    
    // Get current financial year
    const currentFYId = await getCurrentFinancialYear();
    
    // Add created_by and financial_id
    const subProductData = {
      ...body,
      created_by: user.id,
      financial_id: currentFYId
    };
    
    // Create sub-product
    const subProduct = await subProductService.createSubProduct(subProductData);
    
    successResponse(res, subProduct, 201);
  } catch (error) {
    errorResponse(res, error.message, 400, error);
  }
};

const getSubProduct = async (req, res, next) => {
  try {
    const subProduct = await subProductService.getSubProductById(req.params.id);
    if (!subProduct) {
      return errorResponse(res, 'Sub-product not found', 404);
    }
    successResponse(res, subProduct);
  } catch (error) {
    errorResponse(res, 'Failed to fetch sub-product', 500, error);
  }
};

const getAllSubProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, product, status } = req.query;
    
    const { subProducts, total } = await subProductService.getAllSubProducts({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      product,
      status
    });
    
    successResponse(res, {
      subProducts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    errorResponse(res, 'Failed to fetch sub-products', 500, error);
  }
};

const getAllSubProductsNoLimit = async (req, res, next) => {
  try {    
    const { subProducts } = await subProductService.getAllSubProductsNoLimit();
    
    successResponse(res, {
      subProducts
    });
  } catch (error) {
    errorResponse(res, 'Failed to fetch sub-products', 500, error);
  }
};

const updateSubProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { body, user } = req;
    
    // Validate input data
    validateSubProductData(body);
    
    // Add updated_by
    const subProductData = {
      ...body,
      updated_by: user.id
    };
    
    // Update sub-product
    const updatedSubProduct = await subProductService.updateSubProduct(id, subProductData);
    successResponse(res, updatedSubProduct);
  } catch (error) {
    errorResponse(res, error.message, 400, error);
  }
};

const deleteSubProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Delete sub-product
    await subProductService.deleteSubProduct(id);
    successResponse(res, { message: 'Sub-product deleted successfully' });
  } catch (error) {
    errorResponse(res, error.message, 400, error);
  }
};

const searchSubProducts = async (req, res, next) => {
  try {
    const query = req.query.query;
    const subProducts = await subProductService.searchSubProducts(query);
    successResponse(res, subProducts);
  } catch (error) {
    errorResponse(res, 'Search failed', 500, error);
  }
};

const getStatusOptions = async (req, res, next) => {
  try {
    const options = await subProductService.getStatusOptions();
    successResponse(res, options);
  } catch (error) {
    errorResponse(res, 'Failed to get status options', 500, error);
  }
};

const getProductOptions = async (req, res, next) => {
  try {
    const options = await subProductService.getProductOptions();
    successResponse(res, options);
  } catch (error) {
    errorResponse(res, 'Failed to get product options', 500, error);
  }
};

const getSubProductCount = async (req, res, next) => {
  try {
    const count = await subProductService.getSubProductCount();
    successResponse(res, { count });
  } catch (error) {
    errorResponse(res, 'Failed to get sub-product count', 500, error);
  }
};

module.exports = {
  createSubProduct,
  getSubProduct,
  getAllSubProducts,
  getAllSubProductsNoLimit,
  updateSubProduct,
  deleteSubProduct,
  searchSubProducts,
  getStatusOptions,
  getProductOptions,
  getSubProductCount
};