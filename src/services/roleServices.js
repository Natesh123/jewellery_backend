

const pool = require('../config/db.config');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const { getCurrentFinancialYear } = require('../middlewares/currfinancialYear');

const unlinkAsync = promisify(fs.unlink);

const createRole = async (roleData, userId) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();

    // Validate required fields
    if (!roleData.name || !roleData.description || !roleData.status) {
      throw new Error('Missing required role fields');
    }

       const currentFYId = await getCurrentFinancialYear();
    // Insert role
    const [result] = await connection.query(
      `INSERT INTO roles 
      (name, description, status, created_by , financial_id) 
      VALUES (?, ?, ?, ? , ?)`,
      [
        roleData.name,
        roleData.description,
        roleData.status,
        userId || null,
        currentFYId || null
      ]
    );

    const roleId = result.insertId;
    
    await connection.commit();
    return await getRoleById(roleId);
  } catch (error) {
    await connection.rollback();
    console.error('Error creating role:', error);
    throw new Error(`Failed to create role: ${error.message}`);
  } finally {
    connection.release();
  }
};

const getRoleById = async (id) => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT * FROM roles WHERE id = ?`,
      [id]
    );
    
    if (rows.length === 0) return null;
    return rows[0];
  } catch (error) {
    console.error('Error getting role by ID:', error);
    throw new Error(`Failed to get role: ${error.message}`);
  } finally {
    connection.release();
  }
};

const getAllRoles = async ({ page = 1, limit = 10, search, status }) => {
  const connection = await pool.promise().getConnection();
  try {
    const offset = (page - 1) * limit;
    let query = `FROM roles WHERE 1=1`;
    const params = [];
    
    // Apply filters
    if (search) {
      query += ` AND (name LIKE ? OR description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (status) {
      query += ` AND status = ?`;
      params.push(status);
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
      `SELECT id, name, description, status, created_at , created_by ${query}`,
      params
    );
    
    return { 
      roles: rows, 
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    console.error('Error getting all roles:', error);
    throw new Error(`Failed to get roles: ${error.message}`);
  } finally {
    connection.release();
  }
};

const updateRole = async (id, roleData, userId) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();
    
    // Validate required fields
    if (!roleData.name || !roleData.description || !roleData.status) {
      throw new Error('Missing required role fields');
    }

    // Update role
    await connection.query(
      `UPDATE roles SET 
       name = ?, description = ?, status = ?, created_by = ?
       WHERE id = ?`,
      [
        roleData.name,
        roleData.description,
        roleData.status,
        userId,
        id
      ]
    );
    
    await connection.commit();
    return await getRoleById(id);
  } catch (error) {
    await connection.rollback();
    console.error('Error updating role:', error);
    throw new Error(`Failed to update role: ${error.message}`);
  } finally {
    connection.release();
  }
};

const deleteRole = async (id) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();
    
    // First check if role exists
    const role = await getRoleById(id);
    if (!role) {
      throw new Error('Role not found');
    }
    
    // Check if role is assigned to any users
    const [users] = await connection.query(
      `SELECT COUNT(*) as count FROM users WHERE role_id = ?`,
      [id]
    );
    
    if (users[0].count > 0) {
      throw new Error('Cannot delete role assigned to users');
    }
    
    // Delete role
    await connection.query(
      `DELETE FROM roles WHERE id = ?`,
      [id]
    );
    
    await connection.commit();
    return { success: true, message: 'Role deleted successfully' };
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting role:', error);
    throw new Error(`Failed to delete role: ${error.message}`);
  } finally {
    connection.release();
  }
};

const searchRoles = async (query, limit = 10) => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT id, name, description, status 
       FROM roles 
       WHERE name LIKE ? OR description LIKE ?
       LIMIT ?`,
      [`%${query}%`, `%${query}%`, parseInt(limit)]
    );
    return rows;
  } catch (error) {
    console.error('Error searching roles:', error);
    throw new Error(`Failed to search roles: ${error.message}`);
  } finally {
    connection.release();
  }
};

const filterRolesByStatus = async (status) => {
    
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT id, name, description, status 
       FROM roles 
       WHERE status = ?`,
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

module.exports = {
  createRole,
  getRoleById,
  getAllRoles,
  updateRole,
  deleteRole,
  searchRoles,
  filterRolesByStatus
};