const pool = require('../config/db.config');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

const { getCurrentFinancialYear } = require('../middlewares/currfinancialYear');

const unlinkAsync = promisify(fs.unlink);

const createCompany = async (companyData, userId) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();

    // Get current financial year ID
    const currentFYId = await getCurrentFinancialYear();

    // Validate required fields
    if (!companyData.company_name || !companyData.gst_no || !companyData.address1 || 
        !companyData.city || !companyData.state || !companyData.state_code) {
      throw new Error('Missing required company fields');
    }

    // Insert company basic info
    const [result] = await connection.query(
      `INSERT INTO companies 
      (company_name, company_code, gst_no, address1, address2, area, city, 
       pincode, district, state, state_code, phoneno, email, turnover, financial_id, updated_by) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        companyData.company_name,
        companyData.company_code || null,
        companyData.gst_no,
        companyData.address1,
        companyData.address2 || null,
        companyData.area || null,
        companyData.city,
        companyData.pincode || null,
        companyData.district || null,
        companyData.state,
        companyData.state_code,
        companyData.phoneno || null,
        companyData.email || null,
        companyData.turnover || null,
        currentFYId || null,
        userId || null
      ]
    );

    const companyId = result.insertId;
    
    // Insert documents if any
    if (companyData.documents && companyData.documents.length > 0) {
      const documentPromises = companyData.documents.map(doc => 
        connection.query(
          `INSERT INTO company_documents 
          (company_id, name, url) 
          VALUES (?, ?, ?)`,
          [companyId, doc.name, doc.url]
        )
      );
      await Promise.all(documentPromises);
    }
    
    await connection.commit();
    return await getCompanyById(companyId);
  } catch (error) {
    await connection.rollback();
    console.error('Error creating company:', error);
    throw new Error(`Failed to create company: ${error.message}`);
  } finally {
    connection.release();
  }
};



const getCompanyById = async (id) => {
  const connection = await pool.promise().getConnection();
  try {
    // Get company basic info
    const [companyRows] = await connection.query(
      `SELECT * FROM companies WHERE id = ?`,
      [id]
    );
    
    if (companyRows.length === 0) return null;
    
    const company = companyRows[0];
    
    // Get company documents
    const [documentRows] = await connection.query(
      `SELECT id, name, url FROM company_documents WHERE company_id = ?`,
      [id]
    );
    
    company.documents = documentRows;
    
    return company;
  } catch (error) {
    console.error('Error getting company by ID:', error);
    throw new Error(`Failed to get company: ${error.message}`);
  } finally {
    connection.release();
  }
};

const getAllCompanies = async ({ page = 1, limit = 10, search, state, turnover }) => {
  const connection = await pool.promise().getConnection();
  try {
    const offset = (page - 1) * limit;
    let query = `FROM companies WHERE 1=1`;
    const params = [];
    
    // Apply filters
    if (search) {
      query += ` AND (company_name LIKE ? OR company_code LIKE ? OR gst_no LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (state) {
      query += ` AND state = ?`;
      params.push(state);
    }
    
    if (turnover) {
      query += ` AND turnover = ?`;
      params.push(turnover);
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
      `SELECT id, company_name, company_code, gst_no, city, state, 
       phoneno, email, turnover ${query}`,
      params
    );
    
    return { 
      companies: rows, 
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    console.error('Error getting all companies:', error);
    throw new Error(`Failed to get companies: ${error.message}`);
  } finally {
    connection.release();
  }
};

const updateCompany = async (id, updateData, userId) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();
    
    // Validate required fields
    if (!updateData.company_name || !updateData.gst_no || !updateData.address1 || 
        !updateData.city || !updateData.state || !updateData.state_code) {
      throw new Error('Missing required company fields');
    }

    // Update company basic info
    await connection.query(
      `UPDATE companies SET 
       company_name = ?, company_code = ?, gst_no = ?, address1 = ?, address2 = ?, area = ?, 
       city = ?, pincode = ?, district = ?, state = ?, state_code = ?, 
       phoneno = ?, email = ?, turnover = ?, updated_by = ?
       WHERE id = ?`,
      [
        updateData.company_name,
        updateData.company_code || null,
        updateData.gst_no,
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
        updateData.turnover || null,
        userId,
        id
      ]
    );
    
    // Handle documents update if provided
    if (updateData.documents) {
      await connection.query(
        `DELETE FROM company_documents WHERE company_id = ?`,
        [id]
      );
      
      if (updateData.documents.length > 0) {
        const documentPromises = updateData.documents.map(doc => 
          connection.query(
            `INSERT INTO company_documents 
            (company_id, name, url) 
            VALUES (?, ?, ?)`,
            [id, doc.name, doc.url]
          )
        );
        await Promise.all(documentPromises);
      }
    }
    
    await connection.commit();
    return await getCompanyById(id);
  } catch (error) {
    await connection.rollback();
    console.error('Error updating company:', error);
    throw new Error(`Failed to update company: ${error.message}`);
  } finally {
    connection.release();
  }
};

const deleteCompany = async (id) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();
    
    // First get company documents to potentially delete files later
    const [documents] = await connection.query(
      `SELECT url FROM company_documents WHERE company_id = ?`,
      [id]
    );
    
    // Delete all documents
    await connection.query(
      `DELETE FROM company_documents WHERE company_id = ?`,
      [id]
    );
    
    // Then delete the company
    await connection.query(
      `DELETE FROM companies WHERE id = ?`,
      [id]
    );
    
    await connection.commit();
    
    // Optionally delete associated files
    if (documents.length > 0) {
      await Promise.all(
        documents.map(doc => 
          unlinkAsync(path.join(__dirname, '../uploads', doc.url))
            .catch(err => console.error('Error deleting file:', err))
        )
      );
    }
    
    return { success: true, message: 'Company deleted successfully' };
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting company:', error);
    throw new Error(`Failed to delete company: ${error.message}`);
  } finally {
    connection.release();
  }
};

const searchCompanies = async (query, limit = 10) => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT id, company_name, company_code, gst_no, city, state 
       FROM companies 
       WHERE company_name LIKE ? OR company_code LIKE ? OR gst_no LIKE ?
       LIMIT ?`,
      [`%${query}%`, `%${query}%`, `%${query}%`, parseInt(limit)]
    );
    return rows;
  } catch (error) {
    console.error('Error searching companies:', error);
    throw new Error(`Failed to search companies: ${error.message}`);
  } finally {
    connection.release();
  }
};

const filterByState = async (state) => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT id, company_name, company_code, gst_no, city, state 
       FROM companies 
       WHERE state = ?`,
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

const filterByTurnover = async (turnover) => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT id, company_name, company_code, gst_no, city, state 
       FROM companies 
       WHERE turnover = ?`,
      [turnover]
    );
    return rows;
  } catch (error) {
    console.error('Error filtering by turnover:', error);
    throw new Error(`Failed to filter by turnover: ${error.message}`);
  } finally {
    connection.release();
  }
};

module.exports = {
  createCompany,
  getCompanyById,
  getAllCompanies,
  updateCompany,
  deleteCompany,
  searchCompanies,
  filterByState,
  filterByTurnover
};