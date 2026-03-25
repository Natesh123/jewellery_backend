const pool = require('../config/db.config');
const { getCurrentFinancialYear } = require('../middlewares/currfinancialYear');

const createProduct = async (productData) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();

    // Validate required fields
    if (!productData.metal_name || !productData.category_name || 
        !productData.product_name || !productData.product_code ||
        !productData.hsn_code) {
      throw new Error('Missing required product fields');
    }
  

    const currentFYId = await getCurrentFinancialYear();
    const [result] = await connection.query(
      `INSERT INTO products 
      (metal_id, category_id, product_name, product_code, sub_product, 
       hsn_code, status, created_by, financial_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        productData.metal_name,
        productData.category_name
,
        productData.product_name,
        productData.product_code,
        productData.sub_product || 'no',
        productData.hsn_code,
        productData.status || 'active',
        productData.created_by,
        currentFYId
      ]
    );

    const productId = result.insertId;
    
    await connection.commit();
    return await getProductById(productId);
  } catch (error) {
    await connection.rollback();
    console.error('Error creating product:', error);
    throw new Error(`Failed to create product: ${error.message}`);
  } finally {
    connection.release();
  }
};

const getProductById = async (id) => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT p.*, 
       m.metalname as metal_name, 
       c.category_name as category_name,
       u.username as created_by_name
       FROM products p
       LEFT JOIN metals m ON p.metal_id = m.id
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN users u ON p.created_by = u.id
       WHERE p.id = ?`,
      [id]
    );
    
    if (rows.length === 0) return null;
    
    return rows[0];
  } catch (error) {
    console.error('Error getting product by ID:', error);
    throw new Error(`Failed to get product: ${error.message}`);
  } finally {
    connection.release();
  }
};

const getAllProducts = async ({ page = 1, limit = 10, search, metal, status }) => {
  const connection = await pool.promise().getConnection();
  try {
    const offset = (page - 1) * limit;
    let query = `FROM products p 
                 LEFT JOIN metals m ON p.metal_id = m.id 
                 LEFT JOIN categories c ON p.category_id = c.id
                 LEFT JOIN users u ON p.created_by = u.id 
                 WHERE 1=1`;
    const params = [];
    
    // Apply filters
    if (search) {
      query += ` AND (p.product_name LIKE ? OR p.product_code LIKE ? OR m.metalname LIKE ? OR c.category_name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (metal) {
      query += ` AND p.metal_id = ?`;
      params.push(metal);
    }
    
    if (status) {
      query += ` AND p.status = ?`;
      params.push(status);
    }
    
    // Get total count
    const [countResult] = await connection.query(
      `SELECT COUNT(*) as total ${query}`,
      params
    );
    const total = countResult[0].total;
    
    // Get paginated results
    query += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);
    
    const [rows] = await connection.query(
      `SELECT p.*, m.metalname as metal_name, c.category_name, u.username as created_by_name ${query}`,
      params
    );
    
    return { 
      products: rows, 
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    console.error('Error getting all products:', error);
    throw new Error(`Failed to get products: ${error.message}`);
  } finally {
    connection.release();
  }
};

const getAllProductsNoLimit = async () => {
  const connection = await pool.promise().getConnection();
  try {
    let query = `FROM products p 
                 LEFT JOIN metals m ON p.metal_id = m.id 
                 LEFT JOIN categories c ON p.category_id = c.id
                 LEFT JOIN users u ON p.created_by = u.id 
                 WHERE 1=1`;
    const params = [];
    
    // Get total count
    const [countResult] = await connection.query(
      `SELECT COUNT(*) as total ${query}`,
      params
    );
    const total = countResult[0].total;
    
    const [rows] = await connection.query(
      `SELECT p.*, m.metalname as metal_name, c.category_name, u.username as created_by_name ${query}`,
      params
    );
    
    return { 
      products: rows
    };
  } catch (error) {
    console.error('Error getting all products:', error);
    throw new Error(`Failed to get products: ${error.message}`);
  } finally {
    connection.release();
  }
};

const updateProduct = async (id, updateData) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();
    
    // Validate required fields
    if (!updateData.metal_name || !updateData.category_name || 
        !updateData.product_name || !updateData.product_code ||
        !updateData.hsn_code) {
      throw new Error('Missing required product fields');
    }

    // Update product
    await connection.query(
      `UPDATE products SET 
       metal_id = ?, category_id = ?, product_name = ?, product_code = ?,
       sub_product = ?, hsn_code = ?, status = ?, updated_by = ?
       WHERE id = ?`,
      [
        updateData.metal_name,
        updateData.category_name,
        updateData.product_name,
        updateData.product_code,
        updateData.sub_product || 'no',
        updateData.hsn_code,
        updateData.status || 'active',
        updateData.updated_by,
        id
      ]
    );
    
    await connection.commit();
    return await getProductById(id);
  } catch (error) {
    await connection.rollback();
    console.error('Error updating product:', error);
    throw new Error(`Failed to update product: ${error.message}`);
  } finally {
    connection.release();
  }
};

const deleteProduct = async (id) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();
    
    // First check if product exists
    const product = await getProductById(id);
    if (!product) {
      throw new Error('Product not found');
    }
    
    // Then delete the product
    await connection.query(
      `DELETE FROM products WHERE id = ?`,
      [id]
    );
    
    await connection.commit();
    
    return { success: true, message: 'Product deleted successfully' };
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting product:', error);
    throw new Error(`Failed to delete product: ${error.message}`);
  } finally {
    connection.release();
  }
};

const searchProducts = async (query, limit = 10) => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT p.id, p.product_name, p.product_code, m.metalname as metal_name, 
       c.category_name, p.status 
       FROM products p
       LEFT JOIN metals m ON p.metal_id = m.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.product_name LIKE ? OR p.product_code LIKE ? OR m.metalname LIKE ? OR c.category_name LIKE ?
       LIMIT ?`,
      [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, parseInt(limit)]
    );
    return rows;
  } catch (error) {
    console.error('Error searching products:', error);
    throw new Error(`Failed to search products: ${error.message}`);
  } finally {
    connection.release();
  }
};

const getStatusOptions = async () => {
  return [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ];
};

const getMetalOptions = async () => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT id as value, metalname as label FROM metals WHERE status = 'active'`
    );
    return rows;
  } catch (error) {
    console.error('Error getting metal options:', error);
    throw new Error(`Failed to get metal options: ${error.message}`);
  } finally {
    connection.release();
  }
};

const getCategoryOptions = async () => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT id as value, category_name as label FROM categories WHERE status = 'active'`
    );
    return rows;
  } catch (error) {
    console.error('Error getting category options:', error);
    throw new Error(`Failed to get category options: ${error.message}`);
  } finally {
    connection.release();
  }
};

const getSubProductOptions = async () => {
  return [
    { label: 'Yes', value: 'yes' },
    { label: 'No', value: 'no' },
  ];
};

const getProductCount = async () => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT COUNT(*) as count FROM products`
    );
    return rows[0].count;
  } catch (error) {
    console.error('Error getting product count:', error);
    throw new Error(`Failed to get product count: ${error.message}`);
  } finally {
    connection.release();
  }
};

module.exports = {
  createProduct,
  getProductById,
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