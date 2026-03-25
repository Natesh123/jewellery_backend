const pool = require('../config/db.config');
const { getCurrentFinancialYear } = require('../middlewares/currfinancialYear');

const createCategory = async (categoryData) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();

    // Validate required fields
    if (!categoryData.metal_id || !categoryData.tax_type ||
      !categoryData.category_name || !categoryData.category_code) {
      throw new Error('Missing required category fields');
    }

    const [result] = await connection.query(
      `INSERT INTO categories 
      (metal_id, tax_type, category_name, category_code, cgst, sgst, igst, 
       status, created_by, financial_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        categoryData.metal_id,
        categoryData.tax_type,
        categoryData.category_name,
        categoryData.category_code,
        categoryData.cgst || 0,
        categoryData.sgst || 0,
        categoryData.igst || 0,
        categoryData.status || 'active',
        categoryData.created_by,
        await getCurrentFinancialYear()
      ]
    );

    const categoryId = result.insertId;
    for(let i of categoryData.title_names){
      const sql = `INSERT INTO account_head_creation (gst_type,state,state_code,head_name,group_name,group_code,account_code) VALUES (?,?,?,?,?,?,?)`;
      await connection.query(sql, [
        "Regular",
        "Tamilnadu",
        33,
        i.name,
        categoryData.category_name,
        categoryData.category_code,
        i.code
      ]);
    }
    
    await connection.commit();
    return await getCategoryById(categoryId);
  } catch (error) {
    await connection.rollback();
    console.error('Error creating category:', error);
    throw new Error(`Failed to create category: ${error.message}`);
  } finally {
    connection.release();
  }
};

const getCategoryById = async (id) => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT c.*, m.metalname as metal_name, u.username as created_by_name
       FROM categories c
       LEFT JOIN metals m ON c.metal_id = m.id
       LEFT JOIN users u ON c.created_by = u.id
       WHERE c.id = ?`,
      [id]
    );

    if (rows.length === 0) return null;

    return rows[0];
  } catch (error) {
    console.error('Error getting category by ID:', error);
    throw new Error(`Failed to get category: ${error.message}`);
  } finally {
    connection.release();
  }
};

const getAllCategories = async ({ page = 1, limit = 10, search, metal, status }) => {
  const connection = await pool.promise().getConnection();
  try {
    const offset = (page - 1) * limit;
    let query = `FROM categories c 
                 LEFT JOIN metals m ON c.metal_id = m.id 
                 LEFT JOIN users u ON c.created_by = u.id 
                 WHERE 1=1`;
    const params = [];

    // Apply filters
    if (search) {
      query += ` AND (c.category_name LIKE ? OR c.category_code LIKE ? OR m.metalname LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (metal) {
      query += ` AND c.metal_id = ?`;
      params.push(metal);
    }

    if (status) {
      query += ` AND c.status = ?`;
      params.push(status);
    }

    // Get total count
    const [countResult] = await connection.query(
      `SELECT COUNT(*) as total ${query}`,
      params
    );
    const total = countResult[0].total;

    // Get paginated results
    query += ` ORDER BY c.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [rows] = await connection.query(
      `SELECT c.*, m.metalname as metal_name, u.username as created_by_name ${query}`,
      params
    );

    return {
      categories: rows,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    console.error('Error getting all categories:', error);
    throw new Error(`Failed to get categories: ${error.message}`);
  } finally {
    connection.release();
  }
};

const updateCategory = async (id, updateData) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();

    // Validate required fields
    if (!updateData.metal_id || !updateData.tax_type ||
      !updateData.category_name || !updateData.category_code) {
      throw new Error('Missing required category fields');
    }

    // Update category
    await connection.query(
      `UPDATE categories SET 
       metal_id = ?, tax_type = ?, category_name = ?, category_code = ?,
       cgst = ?, sgst = ?, igst = ?, status = ?, updated_by = ?
       WHERE id = ?`,
      [
        updateData.metal_id,
        updateData.tax_type,
        updateData.category_name,
        updateData.category_code,
        updateData.cgst || 0,
        updateData.sgst || 0,
        updateData.igst || 0,
        updateData.status || 'active',
        updateData.updated_by,
        id
      ]
    );

    await connection.commit();
    return await getCategoryById(id);
  } catch (error) {
    await connection.rollback();
    console.error('Error updating category:', error);
    throw new Error(`Failed to update category: ${error.message}`);
  } finally {
    connection.release();
  }
};

const deleteCategory = async (id) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();

    // First check if category exists
    const category = await getCategoryById(id);
    if (!category) {
      throw new Error('Category not found');
    }

    // Then delete the category
    await connection.query(
      `DELETE FROM categories WHERE id = ?`,
      [id]
    );

    await connection.commit();

    return { success: true, message: 'Category deleted successfully' };
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting category:', error);
    throw new Error(`Failed to delete category: ${error.message}`);
  } finally {
    connection.release();
  }
};

const searchCategories = async (query, limit = 10) => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT c.id, c.category_name, c.category_code, m.metalname as metal_name, c.status 
       FROM categories c
       LEFT JOIN metals m ON c.metal_id = m.id
       WHERE c.category_name LIKE ? OR c.category_code LIKE ? OR m.metalname LIKE ?
       LIMIT ?`,
      [`%${query}%`, `%${query}%`, `%${query}%`, parseInt(limit)]
    );
    return rows;
  } catch (error) {
    console.error('Error searching categories:', error);
    throw new Error(`Failed to search categories: ${error.message}`);
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

const getTaxOptions = async () => {
  return [
    { label: 'Taxable', value: 'taxable' },
    { label: 'Non-Taxable', value: 'non-taxable' },
  ];
};

const getNextCategoryCode = async (metalId, taxType) => {
  const connection = await pool.promise().getConnection();
  try {
    // Get metal abbreviation (first letter)
    const [metalRows] = await connection.query(
      `SELECT metalname FROM metals WHERE id = ?`,
      [metalId]
    );

    if (metalRows.length === 0) {
      throw new Error('Metal not found');
    }

    const metalCode = metalRows[0].metalname.charAt(0).toUpperCase();

    // Get tax code (T for taxable, N for non-taxable)
    const taxCode = taxType === 'taxable' ? 'T' : 'N';
    const prefix = `${metalCode}${taxCode}`;

    // Find the highest existing code with this prefix
    const [codeRows] = await connection.query(
      `SELECT category_code 
       FROM categories 
       WHERE category_code LIKE ? 
       ORDER BY category_code DESC 
       LIMIT 1`,
      [`${prefix}%`]
    );

    // Generate next code - always starts with 0001 if no existing codes found
    let nextNumber = 1;
    if (codeRows.length > 0) {
      const lastCode = codeRows[0].category_code;
      const numPart = lastCode.replace(prefix, '');
      nextNumber = parseInt(numPart, 10) + 1;
    }

    // Pad with leading zeros to make 4 digits
    const nextCode = `${prefix}${nextNumber.toString().padStart(4, '0')}`;

    return nextCode;
  } catch (error) {
    console.error('Error generating next category code:', error);
    throw new Error(`Failed to generate category code: ${error.message}`);
  } finally {
    connection.release();
  }
};

const generateCategoryName = async (metalId, taxType) => {
  const connection = await pool.promise().getConnection();
  try {
    // Get metal name
    const [metalRows] = await connection.query(
      `SELECT metalname FROM metals WHERE id = ?`,
      [metalId]
    );

    if (metalRows.length === 0) {
      throw new Error('Metal not found');
    }

    const metalName = metalRows[0].metalname;
    const taxLabel = taxType === 'taxable' ? 'Taxable' : 'Non-Taxable';

    // Generate category name
    const categoryName = `${metalName} ${taxLabel} Ornaments`;

    return { name: categoryName };
  } catch (error) {
    console.error('Error generating category name:', error);
    throw new Error(`Failed to generate category name: ${error.message}`);
  } finally {
    connection.release();
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