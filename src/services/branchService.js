const pool = require('../config/db.config');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const { getCurrentFinancialYear } = require('../middlewares/currfinancialYear');


const unlinkAsync = promisify(fs.unlink);

const createBranch = async (branchData) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();

    // Validate required fields
    if (!branchData.company_id || !branchData.branch_name || !branchData.address1 || 
        !branchData.city || !branchData.state || !branchData.state_code) {
      throw new Error('Missing required branch fields');
    }

        const currentFYId = await getCurrentFinancialYear();
        const userId = 1;

    // Insert branch basic info
    const [result] = await connection.query(
      `INSERT INTO branches 
      (company_id, company_name, branch_name, branch_id, address1, address2, area, city, 
       pincode, district, state, state_code, phoneno, email, updated_by ,financial_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`,
      [
        branchData.company_id,
        branchData.company_name || null,
        branchData.branch_name,
        branchData.branch_id || null,
        branchData.address1,
        branchData.address2 || null,
        branchData.area || null,
        branchData.city,
        branchData.pincode || null,
        branchData.district || null,
        branchData.state,
        branchData.state_code,
        branchData.phoneno || null,
        branchData.email || null,
        userId || null,
        currentFYId 
      ]
    );

    const branchId = result.insertId;
    
    // Insert documents if any
    if (branchData.documents && branchData.documents.length > 0) {
      const documentPromises = branchData.documents.map(doc => 
        connection.query(
          `INSERT INTO branch_documents 
          (branch_id, name, url) 
          VALUES (?, ?, ?)`,
          [branchId, doc.name, doc.url]
        )
      );
      await Promise.all(documentPromises);
    }
    
    await connection.commit();
    return await getBranchById(branchId);
  } catch (error) {
    await connection.rollback();
    console.error('Error creating branch:', error);
    throw new Error(`Failed to create branch: ${error.message}`);
  } finally {
    connection.release();
  }
};

const getBranchById = async (id) => {
  const connection = await pool.promise().getConnection();
  try {
    // Get branch basic info
    const [branchRows] = await connection.query(
      `SELECT b.*, c.company_name as company_name 
       FROM branches b
       LEFT JOIN companies c ON b.company_id = c.id
       WHERE b.id = ?`,
      [id]
    );
    
    if (branchRows.length === 0) return null;
    
    const branch = branchRows[0];
    
    // Get branch documents
    const [documentRows] = await connection.query(
      `SELECT id, name, url FROM branch_documents WHERE branch_id = ?`,
      [id]
    );
    
    branch.documents = documentRows;
    
    return branch;
  } catch (error) {
    console.error('Error getting branch by ID:', error);
    throw new Error(`Failed to get branch: ${error.message}`);
  } finally {
    connection.release();
  }
};


const getBranchByCompanyId = async (id) => {
  const connection = await pool.promise().getConnection();
  try {
    // Get all branches
    const [branchRows] = await connection.query(
      `SELECT * FROM branches WHERE company_id = ?`,
      [id]
    );

    if (branchRows.length === 0) return [];

    // For each branch, get documents
    for (const branch of branchRows) {
      const [documentRows] = await connection.query(
        `SELECT id, name, url FROM branch_documents WHERE branch_id = ?`,
        [branch.id]
      );
      branch.documents = documentRows;
    }

    return branchRows; // return all branches with docs
  } catch (error) {
    console.error('Error getting branch by company ID:', error);
    throw new Error(`Failed to get branches: ${error.message}`);
  } finally {
    connection.release();
  }
};



const getAllBranches = async ({ page = 1, limit = 10, search, state, company }) => {
  const connection = await pool.promise().getConnection();
  try {
    const offset = (page - 1) * limit;
    let query = `FROM branches b LEFT JOIN companies c ON b.company_id = c.id WHERE 1=1`;
    const params = [];
    
    // Apply filters
    if (search) {
      query += ` AND (b.branch_name LIKE ? OR b.branch_id LIKE ? OR c.company_name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (state) {
      query += ` AND b.state = ?`;
      params.push(state);
    }
    
    if (company) {
      query += ` AND b.company_id = ?`;
      params.push(company);
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
      `SELECT b.id, b.branch_name, b.branch_id, b.company_id, c.company_name, 
       b.city, b.state, b.phoneno, b.email ${query}`,
      params
    );
    
    return { 
      branches: rows, 
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    console.error('Error getting all branches:', error);
    throw new Error(`Failed to get branches: ${error.message}`);
  } finally {
    connection.release();
  }
};

const updateBranch = async (id, updateData) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();
    
    // Validate required fields
    if (!updateData.company_id || !updateData.branch_name || !updateData.address1 || 
        !updateData.city || !updateData.state || !updateData.state_code) {
      throw new Error('Missing required branch fields');
    }

    const userId = updateData.updated_by || 1;

    // Update branch basic info
    await connection.query(
      `UPDATE branches SET 
       company_id = ?, company_name = ?, branch_name = ?, branch_id = ?, 
       address1 = ?, address2 = ?, area = ?, city = ?, pincode = ?, 
       district = ?, state = ?, state_code = ?, phoneno = ?, email = ?, 
       updated_by = ?
       WHERE id = ?`,
      [
        updateData.company_id,
        updateData.company_name || null,
        updateData.branch_name,
        updateData.branch_id || null,
        updateData.address1,
        updateData.address2 || null,
        updateData.area || null,
        updateData.city,
        updateData.pincode || null,
        updateData.district || null,
        updateData.state,
        updateData.state_code,
        updateData.phoneno || null,
        updateData.email || null,
        userId || 1,
        id
      ]
    );
    
    // Handle documents update if provided
    if (updateData.documents) {
      await connection.query(
        `DELETE FROM branch_documents WHERE branch_id = ?`,
        [id]
      );
      
      if (updateData.documents.length > 0) {
        const documentPromises = updateData.documents.map(doc => 
          connection.query(
            `INSERT INTO branch_documents 
            (branch_id, name, url) 
            VALUES (?, ?, ?)`,
            [id, doc.name, doc.url]
          )
        );
        await Promise.all(documentPromises);
      }
    }
    
    await connection.commit();
    return await getBranchById(id);
  } catch (error) {
    await connection.rollback();
    console.error('Error updating branch:', error);
    throw new Error(`Failed to update branch: ${error.message}`);
  } finally {
    connection.release();
  }
};

const deleteBranch = async (id) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();
    
    // First get branch documents to potentially delete files later
    const [documents] = await connection.query(
      `SELECT url FROM branch_documents WHERE branch_id = ?`,
      [id]
    );
    
    // Delete all documents
    await connection.query(
      `DELETE FROM branch_documents WHERE branch_id = ?`,
      [id]
    );
    
    // Then delete the branch
    await connection.query(
      `DELETE FROM branches WHERE id = ?`,
      [id]
    );
    
    await connection.commit();
    
    // Optionally delete associated files
    if (documents.length > 0) {
      await Promise.all(
        documents.map(doc => 
          unlinkAsync(path.join(__dirname, '../public/uploads', doc.url))
            .catch(err => console.error('Error deleting file:', err))
        )
      );
    }
    
    return { success: true, message: 'Branch deleted successfully' };
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting branch:', error);
    throw new Error(`Failed to delete branch: ${error.message}`);
  } finally {
    connection.release();
  }
};

const searchBranches = async (query, limit = 10) => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT b.id, b.branch_name, b.branch_id, c.company_name, b.city, b.state 
       FROM branches b
       LEFT JOIN companies c ON b.company_id = c.id
       WHERE b.branch_name LIKE ? OR b.branch_id LIKE ? OR c.company_name LIKE ?
       LIMIT ?`,
      [`%${query}%`, `%${query}%`, `%${query}%`, parseInt(limit)]
    );
    return rows;
  } catch (error) {
    console.error('Error searching branches:', error);
    throw new Error(`Failed to search branches: ${error.message}`);
  } finally {
    connection.release();
  }
};

const filterByState = async (state) => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT b.id, b.branch_name, b.branch_id, c.company_name, b.city, b.state 
       FROM branches b
       LEFT JOIN companies c ON b.company_id = c.id
       WHERE b.state = ?`,
      [state]
    );
    return rows;
  } catch (error) {
    console.error('Error filtering by state:', error);
    throw new Error(`Failed to filter by state: ${error.message}`);
  } finally {
    connection.release();
  }
};

const filterByCompany = async (companyId) => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT b.id, b.branch_name, b.branch_id, c.company_name, b.city, b.state 
       FROM branches b
       LEFT JOIN companies c ON b.company_id = c.id
       WHERE b.company_id = ?`,
      [companyId]
    );
    return rows;
  } catch (error) {
    console.error('Error filtering by company:', error);
    throw new Error(`Failed to filter by company: ${error.message}`);
  } finally {
    connection.release();
  }
};

module.exports = {
  createBranch,
  getBranchById,
  getAllBranches,
  updateBranch,
  deleteBranch,
  searchBranches,
  filterByState,
  filterByCompany,
  getBranchByCompanyId
};