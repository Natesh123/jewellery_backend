const productService = require('../services/productServices');
const { successResponse, errorResponse } = require('../utills/apiResponse');
const { getCurrentFinancialYear } = require('../middlewares/currfinancialYear');

const validateProductData = (data) => {
  if (!data.metal_name) {
    throw new Error('Metal ID is required');
  }
  if (!data.category_name) {
    throw new Error('Category ID is required');
  }
  if (!data.product_name) {
    throw new Error('Product name is required');
  }
  if (!data.product_code) {
    throw new Error('Product code is required');
  }
  if (!data.hsn_code) {
    throw new Error('HSN code is required');
  }
  if (!['yes', 'no'].includes(data.sub_product)) {
    throw new Error('Invalid sub product value');
  }
  if (!['active', 'inactive'].includes(data.status)) {
    throw new Error('Invalid status value');
  }
};

const createProduct = async (req, res, next) => {
  try {
    const { body, user } = req;
    
    // Validate input data
    validateProductData(body);
    
    // Get current financial year
    const currentFYId = await getCurrentFinancialYear();
    
    // Add created_by and financial_id
    const productData = {
      ...body,
      created_by: user.id,
      financial_id: currentFYId
    };
    
    // Create product
    const product = await productService.createProduct(productData);
    
    successResponse(res, product, 201);
  } catch (error) {
    errorResponse(res, error.message, 400, error);
  }
};

const getProduct = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      return errorResponse(res, 'Product not found', 404);
    }
    successResponse(res, product);
  } catch (error) {
    errorResponse(res, 'Failed to fetch product', 500, error);
  }
};

const getAllProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, metal, status } = req.query;
    
    const { products, total } = await productService.getAllProducts({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      metal,
      status
    });
    
    successResponse(res, {
      products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    errorResponse(res, 'Failed to fetch products', 500, error);
  }
};

const getAllProductsNoLimit = async (req, res, next) => {
  try {
    
    const { products } = await productService.getAllProductsNoLimit();
    
    successResponse(res, {
      products
    });
  } catch (error) {
    errorResponse(res, 'Failed to fetch products', 500, error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { body, user } = req;
    
    // Validate input data
    validateProductData(body);
    
    // Add updated_by
    const productData = {
      ...body,
      updated_by: user.id
    };
    
    // Update product
    const updatedProduct = await productService.updateProduct(id, productData);
    successResponse(res, updatedProduct);
  } catch (error) {
    errorResponse(res, error.message, 400, error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Delete product
    await productService.deleteProduct(id);
    successResponse(res, { message: 'Product deleted successfully' });
  } catch (error) {
    errorResponse(res, error.message, 400, error);
  }
};

const searchProducts = async (req, res, next) => {
  try {
    const query = req.query.query;
    const products = await productService.searchProducts(query);
    successResponse(res, products);
  } catch (error) {
    errorResponse(res, 'Search failed', 500, error);
  }
};

const getStatusOptions = async (req, res, next) => {
  try {
    const options = await productService.getStatusOptions();
    successResponse(res, options);
  } catch (error) {
    errorResponse(res, 'Failed to get status options', 500, error);
  }
};

const getMetalOptions = async (req, res, next) => {
  try {
    const options = await productService.getMetalOptions();
    successResponse(res, options);
  } catch (error) {
    errorResponse(res, 'Failed to get metal options', 500, error);
  }
};

const getCategoryOptions = async (req, res, next) => {
  try {
    const options = await productService.getCategoryOptions();
    successResponse(res, options);
  } catch (error) {
    errorResponse(res, 'Failed to get category options', 500, error);
  }
};

const getSubProductOptions = async (req, res, next) => {
  try {
    const options = await productService.getSubProductOptions();
    successResponse(res, options);
  } catch (error) {
    errorResponse(res, 'Failed to get sub product options', 500, error);
  }
};

const getProductCount = async (req, res, next) => {
  try {
    const count = await productService.getProductCount();
    successResponse(res, { count });
  } catch (error) {
    errorResponse(res, 'Failed to get product count', 500, error);
  }
};

module.exports = {
  createProduct,
  getProduct,
  getAllProducts,
  getAllProductsNoLimit,
  updateProduct,
  deleteProduct,
  searchProducts,
  getStatusOptions,
  getMetalOptions,
  getCategoryOptions,
  getSubProductOptions,
  getProductCount
};