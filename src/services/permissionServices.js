const pool = require('../config/db.config');
const { getCurrentFinancialYear } = require('../middlewares/currfinancialYear');

const createPermission = async (permissionData, userId) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();

    // Validate required fields
    if (!permissionData.roleId || !permissionData.permissions) {
      throw new Error('Missing required permission fields');
    }

    const currentFYId = await getCurrentFinancialYear();
    
    // Insert permission
    const [result] = await connection.query(
      `INSERT INTO role_permissions 
      (role_id, permissions, created_by, financial_id) 
      VALUES (?, ?, ?, ?)`,
      [
        permissionData.roleId,
        JSON.stringify(permissionData.permissions),
        userId || null,
        currentFYId || null
      ]
    );

    const permissionId = result.insertId;
    
    await connection.commit();
    return await getPermissionById(permissionId);
  } catch (error) {
    await connection.rollback();
    console.error('Error creating permission:', error);
    throw new Error(`Failed to create permission: ${error.message}`);
  } finally {
    connection.release();
  }
};

const getPermissionById = async (id) => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT * FROM role_permissions WHERE id = ?`,
      [id]
    );
    
    if (rows.length === 0) return null;
    
    // Parse permissions JSON
    const permission = rows[0];
    permission.permissions = JSON.parse(permission.permissions);
    
    return permission;
  } catch (error) {
    console.error('Error getting permission by ID:', error);
    throw new Error(`Failed to get permission: ${error.message}`);
  } finally {
    connection.release();
  }
};

const getAllPermissions = async ({ page = 1, limit = 10, search, roleId }) => {
  const connection = await pool.promise().getConnection();
  try {
    const offset = (page - 1) * limit;
    let query = `FROM role_permissions WHERE 1=1`;
    const params = [];
    
    // Apply filters
    if (search) {
      query += ` AND (role_id IN (SELECT id FROM roles WHERE name LIKE ?))`;
      params.push(`%${search}%`);
    }
    
    if (roleId) {
      query += ` AND role_id = ?`;
      params.push(roleId);
    }
    
    // Get total count
    const [countResult] = await connection.query(
      `SELECT COUNT(*) as total ${query}`,
      params
    );
    const total = countResult[0].total;
    
    // Get paginated results
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);
    
    const [rows] = await connection.query(
      `SELECT id, role_id, permissions, created_at, created_by ${query}`,
      params
    );
    
    // Parse permissions JSON for each row
    const permissions = rows.map(row => {
      return {
        ...row,
        permissions: JSON.parse(row.permissions)
      };
    });
    
    return { 
      permissions, 
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    console.error('Error getting all permissions:', error);
    throw new Error(`Failed to get permissions: ${error.message}`);
  } finally {
    connection.release();
  }
};

const updatePermission = async (id, permissionData, userId) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();
    
    // Validate required fields
    if (!permissionData.roleId || !permissionData.permissions) {
      throw new Error('Missing required permission fields');
    }

    // Update permission
    await connection.query(
      `UPDATE role_permissions SET 
       role_id = ?, permissions = ?, created_by = ?
       WHERE id = ?`,
      [
        permissionData.roleId,
        JSON.stringify(permissionData.permissions),
        userId,
        id
      ]
    );
    
    await connection.commit();
    return await getPermissionById(id);
  } catch (error) {
    await connection.rollback();
    console.error('Error updating permission:', error);
    throw new Error(`Failed to update permission: ${error.message}`);
  } finally {
    connection.release();
  }
};

const deletePermission = async (id) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();
    
    // First check if permission exists
    const permission = await getPermissionById(id);
    if (!permission) {
      throw new Error('Permission not found');
    }
    
    // Delete permission
    await connection.query(
      `DELETE FROM role_permissions WHERE id = ?`,
      [id]
    );
    
    await connection.commit();
    return { success: true, message: 'Permission deleted successfully' };
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting permission:', error);
    throw new Error(`Failed to delete permission: ${error.message}`);
  } finally {
    connection.release();
  }
};

const searchPermissions = async (query, limit = 10) => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT rp.id, r.name as role_name, rp.permissions
       FROM role_permissions rp
       JOIN roles r ON rp.role_id = r.id
       WHERE r.name LIKE ?
       LIMIT ?`,
      [`%${query}%`, parseInt(limit)]
    );
    
    // Parse permissions JSON for each row
    return rows.map(row => {
      return {
        ...row,
        permissions: JSON.parse(row.permissions)
      };
    });
  } catch (error) {
    console.error('Error searching permissions:', error);
    throw new Error(`Failed to search permissions: ${error.message}`);
  } finally {
    connection.release();
  }
};

const getPermissionsByRole = async (roleId) => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT id, permissions 
       FROM role_permissions 
       WHERE role_id = ?`,
      [roleId]
    );
    
    if (rows.length === 0) return null;
    
    // Parse permissions JSON
    const permission = rows[0];
    permission.permissions = JSON.parse(permission.permissions);
    
    return permission;
  } catch (error) {
    console.error('Error getting permissions by role:', error);
    throw new Error(`Failed to get permissions by role: ${error.message}`);
  } finally {
    connection.release();
  }
};

module.exports = {
  createPermission,
  getPermissionById,
  getAllPermissions,
  updatePermission,
  deletePermission,
  searchPermissions,
  getPermissionsByRole
};