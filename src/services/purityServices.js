const pool = require('../config/db.config');
const { getCurrentFinancialYear } = require('../middlewares/currfinancialYear');

const createPurity = async (purityData) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();

    // Validate required fields
    if (!purityData.metal_id || !purityData.purity_standard || 
        !purityData.purity_name || !purityData.purity_code) {
      throw new Error('Missing required purity fields');
    }

    const currentFYId = await getCurrentFinancialYear();

    // Insert purity
    const [result] = await connection.query(
      `INSERT INTO purities 
      (metal_id, purity_standard, purity_name, purity_code, purity_percentage, 
       status, created_by, financial_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        purityData.metal_id,
        purityData.purity_standard,
        purityData.purity_name,
        purityData.purity_code,
        purityData.purity_percentage || 0,
        purityData.status || 'active',
        purityData.created_by,
        currentFYId
      ]
    );

    const purityId = result.insertId;
    
    await connection.commit();
    return await getPurityById(purityId);
  } catch (error) {
    await connection.rollback();
    console.error('Error creating purity:', error);
    throw new Error(`Failed to create purity: ${error.message}`);
  } finally {
    connection.release();
  }
};

const getPurityById = async (id) => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT p.*, m.metalname as metal_name, u.username as created_by_name
       FROM purities p
       LEFT JOIN metals m ON p.metal_id = m.id
       LEFT JOIN users u ON p.created_by = u.id
       WHERE p.id = ?`,
      [id]
    );
    
    if (rows.length === 0) return null;
    
    return rows[0];
  } catch (error) {
    console.error('Error getting purity by ID:', error);
    throw new Error(`Failed to get purity: ${error.message}`);
  } finally {
    connection.release();
  }
};

const getAllPurities = async ({ page = 1, limit = 10, search, metal, status }) => {
  const connection = await pool.promise().getConnection();
  try {
    const offset = (page - 1) * limit;
    let query = `FROM purities p 
                 LEFT JOIN metals m ON p.metal_id = m.id 
                 LEFT JOIN users u ON p.created_by = u.id 
                 WHERE 1=1`;
    const params = [];
    
    // Apply filters
    if (search) {
      query += ` AND (p.purity_name LIKE ? OR p.purity_code LIKE ? OR m.metalname LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
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
      `SELECT p.*, m.metalname as metal_name, u.username as created_by_name ${query}`,
      params
    );
    
    return { 
      purities: rows, 
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    console.error('Error getting all purities:', error);
    throw new Error(`Failed to get purities: ${error.message}`);
  } finally {
    connection.release();
  }
};

const updatePurity = async (id, updateData) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();
    
    // Validate required fields
    if (!updateData.metal_id || !updateData.purity_standard || 
        !updateData.purity_name || !updateData.purity_code) {
      throw new Error('Missing required purity fields');
    }

    // Update purity
    await connection.query(
      `UPDATE purities SET 
       metal_id = ?, purity_standard = ?, purity_name = ?, purity_code = ?,
       purity_percentage = ?, status = ?, updated_by = ?
       WHERE id = ?`,
      [
        updateData.metal_id,
        updateData.purity_standard,
        updateData.purity_name,
        updateData.purity_code,
        updateData.purity_percentage || 0,
        updateData.status || 'active',
        updateData.updated_by,
        id
      ]
    );
    
    await connection.commit();
    return await getPurityById(id);
  } catch (error) {
    await connection.rollback();
    console.error('Error updating purity:', error);
    throw new Error(`Failed to update purity: ${error.message}`);
  } finally {
    connection.release();
  }
};

const deletePurity = async (id) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();
    
    // First check if purity exists
    const purity = await getPurityById(id);
    if (!purity) {
      throw new Error('Purity not found');
    }
    
    // Then delete the purity
    await connection.query(
      `DELETE FROM purities WHERE id = ?`,
      [id]
    );
    
    await connection.commit();
    
    return { success: true, message: 'Purity deleted successfully' };
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting purity:', error);
    throw new Error(`Failed to delete purity: ${error.message}`);
  } finally {
    connection.release();
  }
};

const searchPurities = async (query, limit = 10) => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT p.id, p.purity_name, p.purity_code, m.metalname as metal_name, p.status 
       FROM purities p
       LEFT JOIN metals m ON p.metal_id = m.id
       WHERE p.purity_name LIKE ? OR p.purity_code LIKE ? OR m.metalname LIKE ?
       LIMIT ?`,
      [`%${query}%`, `%${query}%`, `%${query}%`, parseInt(limit)]
    );
    return rows;
  } catch (error) {
    console.error('Error searching purities:', error);
    throw new Error(`Failed to search purities: ${error.message}`);
  } finally {
    connection.release();
  }
};

const filterPuritiesByStatus = async (status) => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT p.id, p.purity_name, p.purity_code, m.metalname as metal_name, p.status 
       FROM purities p
       LEFT JOIN metals m ON p.metal_id = m.id
       WHERE p.status = ?`,
      [status]
    );
    return rows;
  } catch (error) {
    console.error('Error filtering by status:', error);
    throw new Error(`Failed to filter by status: ${error.message}`);
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

const getPurityStandards = async () => {
  return [
    { label: '24K (99.9%)', value: '24k', percentage: 99.9 },
    { label: '22K (91.6%)', value: '22k', percentage: 91.6 },
    { label: '18K (75%)', value: '18k', percentage: 75 },
    { label: '14K (58.3%)', value: '14k', percentage: 58.3 },
    { label: '10K (41.7%)', value: '10k', percentage: 41.7 },
  ];
};

const getPurityCount = async () => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT COUNT(*) as count FROM purities`
    );
    return rows[0].count;
  } catch (error) {
    console.error('Error getting purity count:', error);
    throw new Error(`Failed to get purity count: ${error.message}`);
  } finally {
    connection.release();
  }
};

module.exports = {
  createPurity,
  getPurityById,
  getAllPurities,
  updatePurity,
  deletePurity,
  searchPurities,
  filterPuritiesByStatus,
  getStatusOptions,
  getMetalOptions,
  getPurityStandards,
  getPurityCount
};