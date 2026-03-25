const pool = require('../config/db.config');
const { getCurrentFinancialYear } = require('../middlewares/currfinancialYear');

const createSubProduct = async (subProductData) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();

    // Validate required fields
    if (!subProductData.product_name
      || !subProductData.sub_product_name ||
      !subProductData.sub_product_code) {
      throw new Error('Missing required sub-product fields');
    }

    const currentFYId = await getCurrentFinancialYear();

    // Insert sub-product
    const [result] = await connection.query(
      `INSERT INTO sub_products 
      (product_id, sub_product_name, sub_product_code, description, 
       status, created_by, financial_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        subProductData.product_name,
        subProductData.sub_product_name,
        subProductData.sub_product_code,
        subProductData.description || null,
        subProductData.status || 'active',
        subProductData.created_by,
        currentFYId
      ]
    );

    const subProductId = result.insertId;

    await connection.commit();
    return await getSubProductById(subProductId);
  } catch (error) {
    await connection.rollback();
    console.error('Error creating sub-product:', error);
    throw new Error(`Failed to create sub-product: ${error.message}`);
  } finally {
    connection.release();
  }
};

const getSubProductById = async (id) => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT sp.*, p.product_name, p.product_code, u.username as created_by_name
       FROM sub_products sp
       LEFT JOIN products p ON sp.product_id = p.id
       LEFT JOIN users u ON sp.created_by = u.id
       WHERE sp.id = ?`,
      [id]
    );

    if (rows.length === 0) return null;

    return rows[0];
  } catch (error) {
    console.error('Error getting sub-product by ID:', error);
    throw new Error(`Failed to get sub-product: ${error.message}`);
  } finally {
    connection.release();
  }
};

const getAllSubProducts = async ({ page = 1, limit = 10, search, product, status }) => {
  const connection = await pool.promise().getConnection();
  try {
    const offset = (page - 1) * limit;
    let query = `FROM sub_products sp 
                 LEFT JOIN products p ON sp.product_id = p.id 
                 LEFT JOIN users u ON sp.created_by = u.id 
                 WHERE 1=1`;
    const params = [];

    // Apply filters
    if (search) {
      query += ` AND (sp.sub_product_name LIKE ? OR sp.sub_product_code LIKE ? OR p.product_name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (product) {
      query += ` AND sp.product_id = ?`;
      params.push(product);
    }

    if (status) {
      query += ` AND sp.status = ?`;
      params.push(status);
    }

    // Get total count
    const [countResult] = await connection.query(
      `SELECT COUNT(*) as total ${query}`,
      params
    );
    const total = countResult[0].total;

    // Get paginated results
    query += ` ORDER BY sp.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [rows] = await connection.query(
      `SELECT sp.*, p.product_name, p.product_code, u.username as created_by_name ${query}`,
      params
    );

    return {
      subProducts: rows,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    console.error('Error getting all sub-products:', error);
    throw new Error(`Failed to get sub-products: ${error.message}`);
  } finally {
    connection.release();
  }
};

const getAllSubProductsNoLimit = async () => {
  const connection = await pool.promise().getConnection();
  try {
    let query = `FROM sub_products sp 
                 LEFT JOIN products p ON sp.product_id = p.id 
                 LEFT JOIN users u ON sp.created_by = u.id 
                 WHERE 1=1`;
    const params = [];

    // Get total count
    const [countResult] = await connection.query(
      `SELECT COUNT(*) as total ${query}`,
      params
    );
    const total = countResult[0].total;

    const [rows] = await connection.query(
      `SELECT sp.*, p.product_name, p.product_code, u.username as created_by_name ${query}`,
      params
    );

    return {
      subProducts: rows
    };
  } catch (error) {
    console.error('Error getting all sub-products:', error);
    throw new Error(`Failed to get sub-products: ${error.message}`);
  } finally {
    connection.release();
  }
}

const updateSubProduct = async (id, updateData) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();

    // Validate required fields
    if (!updateData.product_name || !updateData.sub_product_name ||
      !updateData.sub_product_code) {
      throw new Error('Missing required sub-product fields');
    }

    // Update sub-product
    await connection.query(
      `UPDATE sub_products SET 
       product_id = ?, sub_product_name = ?, sub_product_code = ?,
       description = ?, status = ?, updated_by = ?
       WHERE id = ?`,
      [
        updateData.product_name,
        updateData.sub_product_name,
        updateData.sub_product_code,
        updateData.description || null,
        updateData.status || 'active',
        updateData.updated_by,
        id
      ]
    );

    await connection.commit();
    return await getSubProductById(id);
  } catch (error) {
    await connection.rollback();
    console.error('Error updating sub-product:', error);
    throw new Error(`Failed to update sub-product: ${error.message}`);
  } finally {
    connection.release();
  }
};

const deleteSubProduct = async (id) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();

    // First check if sub-product exists
    const subProduct = await getSubProductById(id);
    if (!subProduct) {
      throw new Error('Sub-product not found');
    }

    // Then delete the sub-product
    await connection.query(
      `DELETE FROM sub_products WHERE id = ?`,
      [id]
    );

    await connection.commit();

    return { success: true, message: 'Sub-product deleted successfully' };
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting sub-product:', error);
    throw new Error(`Failed to delete sub-product: ${error.message}`);
  } finally {
    connection.release();
  }
};

const searchSubProducts = async (query, limit = 10) => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT sp.id, sp.sub_product_name, sp.sub_product_code, 
       p.product_name, sp.status 
       FROM sub_products sp
       LEFT JOIN products p ON sp.product_id = p.id
       WHERE sp.sub_product_name LIKE ? OR sp.sub_product_code LIKE ? OR p.product_name LIKE ?
       LIMIT ?`,
      [`%${query}%`, `%${query}%`, `%${query}%`, parseInt(limit)]
    );
    return rows;
  } catch (error) {
    console.error('Error searching sub-products:', error);
    throw new Error(`Failed to search sub-products: ${error.message}`);
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

const getProductOptions = async () => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT id as value, product_name as label FROM products WHERE status = 'active'`
    );
    return rows;
  } catch (error) {
    console.error('Error getting product options:', error);
    throw new Error(`Failed to get product options: ${error.message}`);
  } finally {
    connection.release();
  }
};

const getSubProductCount = async () => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT COUNT(*) as count FROM sub_products`
    );
    return rows[0].count;
  } catch (error) {
    console.error('Error getting sub-product count:', error);
    throw new Error(`Failed to get sub-product count: ${error.message}`);
  } finally {
    connection.release();
  }
};

module.exports = {
  createSubProduct,
  getSubProductById,
  getAllSubProducts,
  getAllSubProductsNoLimit,
  updateSubProduct,
  deleteSubProduct,
  searchSubProducts,
  getStatusOptions,
  getProductOptions,
  getSubProductCount
};