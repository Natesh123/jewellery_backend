const categoryService = require('../services/categoryService');
const { successResponse, errorResponse } = require('../utills/apiResponse');

const validateCategoryData = (data) => {
  if (!data.metal_id) {
    throw new Error('Metal ID is required');
  }
  if (!data.tax_type) {
    throw new Error('Tax type is required');
  }
  if (!data.category_name) {
    throw new Error('Category name is required');
  }
  if (!data.category_code) {
    throw new Error('Category code is required');
  }
  if (!['active', 'inactive'].includes(data.status)) {
    throw new Error('Invalid status value');
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { body, user } = req;
    
    // Validate input data
    validateCategoryData(body);
    
    // Add created_by
    const categoryData = {
      ...body,
      created_by: user.id
    };
    
    // Create category
    const category = await categoryService.createCategory(categoryData);
    
    successResponse(res, category, 201);
  } catch (error) {
    errorResponse(res, error.message, 400, error);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    if (!category) {
      return errorResponse(res, 'Category not found', 404);
    }
    successResponse(res, category);
  } catch (error) {
    errorResponse(res, 'Failed to fetch category', 500, error);
  }
};

const getAllCategories = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, metal, status } = req.query;
    
    const { categories, total } = await categoryService.getAllCategories({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      metal,
      status
    });
    
    successResponse(res, {
      categories,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    errorResponse(res, 'Failed to fetch categories', 500, error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { body, user } = req;
    
    // Validate input data
    validateCategoryData(body);
    
    // Add updated_by
    const categoryData = {
      ...body,
      updated_by: user.id
    };
    
    // Update category
    const updatedCategory = await categoryService.updateCategory(id, categoryData);
    successResponse(res, updatedCategory);
  } catch (error) {
    errorResponse(res, error.message, 400, error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Delete category
    await categoryService.deleteCategory(id);
    successResponse(res, { message: 'Category deleted successfully' });
  } catch (error) {
    errorResponse(res, error.message, 400, error);
  }
};

const searchCategories = async (req, res, next) => {
  try {
    const query = req.query.query;
    const categories = await categoryService.searchCategories(query);
    successResponse(res, categories);
  } catch (error) {
    errorResponse(res, 'Search failed', 500, error);
  }
};

const getStatusOptions = async (req, res, next) => {
  try {
    const options = await categoryService.getStatusOptions();
    successResponse(res, options);
  } catch (error) {
    errorResponse(res, 'Failed to get status options', 500, error);
  }
};

const getMetalOptions = async (req, res, next) => {
  try {
    const options = await categoryService.getMetalOptions();
    successResponse(res, options);
  } catch (error) {
    errorResponse(res, 'Failed to get metal options', 500, error);
  }
};

const getTaxOptions = async (req, res, next) => {
  try {
    const options = await categoryService.getTaxOptions();
    successResponse(res, options);
  } catch (error) {
    errorResponse(res, 'Failed to get tax options', 500, error);
  }
};

const getNextCategoryCode = async (req, res, next) => {
  try {
    const { metalId, taxType } = req.query;

    console.log('Generating next category code for:', { metalId, taxType });
    
    
    if (!metalId || !taxType) {
      return errorResponse(res, 'Metal ID and Tax Type are required', 400);
    }
    
    const code = await categoryService.getNextCategoryCode(metalId, taxType);
    successResponse(res, { code });
  } catch (error) {
    errorResponse(res, 'Failed to generate category code', 500, error);
  }
};

const generateCategoryName = async (req, res, next) => {
  try {
    const { metalId, taxType } = req.query;
    
    if (!metalId || !taxType) {
      return errorResponse(res, 'Metal ID and Tax Type are required', 400);
    }
    
    const result = await categoryService.generateCategoryName(metalId, taxType);
    successResponse(res, result);
  } catch (error) {
    errorResponse(res, 'Failed to generate category name', 500, error);
  }
};

module.exports = {
  createCategory,
  getCategoryById,
  getAllCategories,
  updateCategory,
  deleteCategory,
  searchCategories,
  getStatusOptions,
  getMetalOptions,
  getTaxOptions,
  getNextCategoryCode,
  generateCategoryName
};