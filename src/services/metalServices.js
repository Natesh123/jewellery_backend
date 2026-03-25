const pool = require('../config/db.config');
const { getCurrentFinancialYear } = require('../middlewares/currfinancialYear');

const createMetal = async (metalData) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();

    // Validate required fields
    if (!metalData.metalname || !metalData.metal_code) {
      throw new Error('Missing required metal fields');
    }

    // Insert metal
    const [result] = await connection.query(
      `INSERT INTO metals 
      (metalname, metal_code, status, created_by, financial_id) 
      VALUES (?, ?, ?, ?, ?)`,
      [
        metalData.metalname,
        metalData.metal_code,
        metalData.status || 'active',
        metalData.created_by,
        metalData.financial_id
      ]
    );

    const metalId = result.insertId;
    
    await connection.commit();
    return await getMetalById(metalId);
  } catch (error) {
    await connection.rollback();
    console.error('Error creating metal:', error);
    throw new Error(`Failed to create metal: ${error.message}`);
  } finally {
    connection.release();
  }
};

const getMetalById = async (id) => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT m.*, u.username as created_by_name 
       FROM metals m
       LEFT JOIN users u ON m.created_by = u.id
       WHERE m.id = ?`,
      [id]
    );
    
    if (rows.length === 0) return null;
    
    return rows[0];
  } catch (error) {
    console.error('Error getting metal by ID:', error);
    throw new Error(`Failed to get metal: ${error.message}`);
  } finally {
    connection.release();
  }
};

const getAllMetals = async ({ page = 1, limit = 10, search, metal, status }) => {
  const connection = await pool.promise().getConnection();
  try {
    const offset = (page - 1) * limit;
    let query = `FROM metals m LEFT JOIN users u ON m.created_by = u.id WHERE 1=1`;
    const params = [];
    
    // Apply filters
    if (search) {
      query += ` AND (m.metalname LIKE ? OR m.metal_code LIKE ? OR u.username LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (metal) {
      query += ` AND m.metalname = ?`;
      params.push(metal);
    }
    
    if (status) {
      query += ` AND m.status = ?`;
      params.push(status);
    }
    
    // Get total count
    const [countResult] = await connection.query(
      `SELECT COUNT(*) as total ${query}`,
      params
    );
    const total = countResult[0].total;
    
    // Get paginated results
    query += ` ORDER BY m.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);
    
    const [rows] = await connection.query(
      `SELECT m.*, u.username as created_by_name ${query}`,
      params
    );
    
    return { 
      metals: rows, 
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    console.error('Error getting all metals:', error);
    throw new Error(`Failed to get metals: ${error.message}`);
  } finally {
    connection.release();
  }
};

const updateMetal = async (id, updateData) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();
    
    // Validate required fields
    if (!updateData.metalname || !updateData.metal_code) {
      throw new Error('Missing required metal fields');
    }

    // Update metal
    await connection.query(
      `UPDATE metals SET 
       metalname = ?, metal_code = ?, status = ?, updated_by = ?
       WHERE id = ?`,
      [
        updateData.metalname,
        updateData.metal_code,
        updateData.status || 'active',
        updateData.updated_by,
        id
      ]
    );
    
    await connection.commit();
    return await getMetalById(id);
  } catch (error) {
    await connection.rollback();
    console.error('Error updating metal:', error);
    throw new Error(`Failed to update metal: ${error.message}`);
  } finally {
    connection.release();
  }
};

const deleteMetal = async (id) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();
    
    // First check if metal exists
    const metal = await getMetalById(id);
    if (!metal) {
      throw new Error('Metal not found');
    }
    
    // Then delete the metal
    await connection.query(
      `DELETE FROM metals WHERE id = ?`,
      [id]
    );
    
    await connection.commit();
    
    return { success: true, message: 'Metal deleted successfully' };
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting metal:', error);
    throw new Error(`Failed to delete metal: ${error.message}`);
  } finally {
    connection.release();
  }
};

const searchMetals = async (query, limit = 10) => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT m.id, m.metalname, m.metal_code, m.status, u.username as created_by_name
       FROM metals m
       LEFT JOIN users u ON m.created_by = u.id
       WHERE m.metalname LIKE ? OR m.metal_code LIKE ? OR u.username LIKE ?
       LIMIT ?`,
      [`%${query}%`, `%${query}%`, `%${query}%`, parseInt(limit)]
    );
    return rows;
  } catch (error) {
    console.error('Error searching metals:', error);
    throw new Error(`Failed to search metals: ${error.message}`);
  } finally {
    connection.release();
  }
};

const filterMetalsByStatus = async (status) => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT m.id, m.metalname, m.metal_code, m.status, u.username as created_by_name
       FROM metals m
       LEFT JOIN users u ON m.created_by = u.id
       WHERE m.status = ?`,
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
      `SELECT DISTINCT metalname as label, metalname as value 
       FROM metals 
       WHERE status = 'active'`
    );
    
    // Add colors for UI
    return rows.map(row => ({
      ...row,
      color: getMetalColor(row.value)
    }));
  } catch (error) {
    console.error('Error getting metal options:', error);
    throw new Error(`Failed to get metal options: ${error.message}`);
  } finally {
    connection.release();
  }
};

const getMetalColor = (metalName) => {
  const colors = {
    'Gold': '#FFD700',
    'Silver': '#C0C0C0',
    'Platinum': '#E5E4E2',
    'Palladium': '#B4B4B4',
    'Copper': '#B87333',
    'Bronze': '#CD7F32'
  };
  return colors[metalName] || '#666666';
};

const getMetalCount = async () => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT COUNT(*) as count FROM metals`
    );
    return rows[0].count;
  } catch (error) {
    console.error('Error getting metal count:', error);
    throw new Error(`Failed to get metal count: ${error.message}`);
  } finally {
    connection.release();
  }
};

module.exports = {
  createMetal,
  getMetalById,
  getAllMetals,
  updateMetal,
  deleteMetal,
  searchMetals,
  filterMetalsByStatus,
  getStatusOptions,
  getMetalOptions,
  getMetalCount
};