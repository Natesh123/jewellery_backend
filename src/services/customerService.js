const pool = require('../config/db.config');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const { getCurrentFinancialYear } = require('../middlewares/currfinancialYear');

const unlinkAsync = promisify(fs.unlink);

const createCustomer = async (customerData) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();

    // Validate required fields
    if (!customerData.customer_name || !customerData.aadhar_no || 
        !customerData.address_1 || !customerData.city || 
        !customerData.state || !customerData.phoneno) {
      throw new Error('Missing required customer fields');
    }

    const currentFYId = await getCurrentFinancialYear();

    // Insert customer basic info
    const [result] = await connection.query(
      `INSERT INTO customers 
      (customer_id, customer_name, aadhar_no, pan_no, address_1, address_2, area, city, 
       pincode, district, state, state_code, phoneno, phoneno2, office_address, reference_details, 
       remarks, has_bank_account, aadhar_verified, created_by, updated_by, financial_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,?)`,
      [
        customerData.customer_id || null,
        customerData.customer_name,
        customerData.aadhar_no,
        customerData.pan_no || null,
        customerData.address_1,
        customerData.address_2 || null,
        customerData.area || null,
        customerData.city,
        customerData.pincode || null,
        customerData.district || null,
        customerData.state,
        customerData.state_code || null,
        customerData.phoneno,
        customerData.phoneno2 || null,
        customerData.office_address || null,
        customerData.reference_details || null,
        customerData.remarks || null,
        customerData.has_bank_account || false,
        Number(customerData.aadhar_verified) || 0,
        customerData.created_by,
        customerData.updated_by,
        currentFYId
      ]
    );

    const customerId = result.insertId;
    await connection.commit();
    return await getCustomerById(customerId);
  } catch (error) {
    await connection.rollback();
    console.error('Error creating customer:', error);
    throw new Error(`Failed to create customer: ${error.message}`);
  } finally {
    connection.release();
  }
};

const getCustomerById = async (id) => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT * FROM customers WHERE id = ?`,
      [id]
    );
    
    if (rows.length === 0) return null;
    return rows[0];
  } catch (error) {
    console.error('Error getting customer by ID:', error);
    throw new Error(`Failed to get customer: ${error.message}`);
  } finally {
    connection.release();
  }
};

const getAllCustomers = async ({ page = 1, limit = 10, search, state, hasBankAccount }) => {
  const connection = await pool.promise().getConnection();
  try {
    const offset = (page - 1) * limit;
    let query = `FROM customers WHERE 1=1`;
    const params = [];
    
    // Apply filters
    if (search) {
      query += ` AND (customer_name LIKE ? OR customer_id LIKE ? OR aadhar_no LIKE ? OR pan_no LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (state) {
      query += ` AND state = ?`;
      params.push(state);
    }
    
    if (hasBankAccount !== undefined) {
      query += ` AND has_bank_account = ?`;
      params.push(hasBankAccount);
    }
    
    // Get total count
    const [countResult] = await connection.query(
      `SELECT COUNT(*) as total ${query}`,
      params
    );
    const total = countResult[0].total;
    
    // Get paginated results
    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);
    
    const [rows] = await connection.query(
      `SELECT * ${query}`,
      params
    );
    
    return { 
      customers: rows, 
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    console.error('Error getting all customers:', error);
    throw new Error(`Failed to get customers: ${error.message}`);
  } finally {
    connection.release();
  }
};

const updateCustomer = async (id, updateData) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();

    // Validate required fields
    if (!updateData.customer_name || !updateData.aadhar_no || 
        !updateData.address_1 || !updateData.city || 
        !updateData.state || !updateData.phoneno) {
      throw new Error('Missing required customer fields');
    }

    // Get current customer data to preserve existing file paths if not updated
    const currentCustomer = await getCustomerById(id);
    if (!currentCustomer) {
      throw new Error('Customer not found');
    }

    // Prepare the update query dynamically
    let setClause = `
      customer_id = ?,
      customer_name = ?,
      aadhar_no = ?,
      pan_no = ?,
      address_1 = ?,
      address_2 = ?,
      area = ?,
      city = ?,
      pincode = ?,
      district = ?,
      state = ?,
      state_code = ?,
      phoneno = ?,
      phoneno2 = ?,
      office_address = ?,
      reference_details = ?,
      remarks = ?,
      has_bank_account = ?,
      aadhar_verified = ?,
      updated_by = ?,
      updated_at = CURRENT_TIMESTAMP
    `;

    const values = [
      updateData.customer_id || null,
      updateData.customer_name,
      updateData.aadhar_no,
      updateData.pan_no || null,
      updateData.address_1,
      updateData.address_2 || null,
      updateData.area || null,
      updateData.city,
      updateData.pincode || null,
      updateData.district || null,
      updateData.state,
      updateData.state_code || null,
      updateData.phoneno,
      updateData.phoneno2 || null,
      updateData.office_address || null,
      updateData.reference_details || null,
      updateData.remarks || null,
      updateData.has_bank_account  || false,
      updateData.aadhar_verified || false,
      updateData.updated_by
    ];

    // Handle file fields - only update if new value is provided
    const fileFields = ['customer_photo', 'aadhar_photo', 'pan_photo'];
    fileFields.forEach(field => {
      if (updateData[field] !== undefined && updateData[field] !== null) {
        setClause += `, ${field} = ?`;
        values.push(updateData[field]);
      } else {
        setClause += `, ${field} = ${field}`; // Keep existing value
      }
    });

    values.push(id); // Add ID for WHERE clause

    // Execute the update
    await connection.query(
      `UPDATE customers SET ${setClause} WHERE id = ?`,
      values
    );

    await connection.commit();
    return await getCustomerById(id);
  } catch (error) {
    await connection.rollback();
    console.error('Error updating customer:', error);
    throw new Error(`Failed to update customer: ${error.message}`);
  } finally {
    connection.release();
  }
};

const deleteCustomer = async (id) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();
    
    // First get customer to potentially delete files later
    const customer = await getCustomerById(id);
    if (!customer) {
      throw new Error('Customer not found');
    }
    
    // Delete the customer
    await connection.query(
      `DELETE FROM customers WHERE id = ?`,
      [id]
    );
    
    await connection.commit();
    
    // Delete associated files
    const uploadDir = path.join(__dirname, '../public/uploads/customers', id.toString());
    if (fs.existsSync(uploadDir)) {
      fs.rmSync(uploadDir, { recursive: true, force: true });
    }
    
    return { success: true, message: 'Customer deleted successfully' };
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting customer:', error);
    throw new Error(`Failed to delete customer: ${error.message}`);
  } finally {
    connection.release();
  }
};

const searchCustomers = async (query, limit = 10) => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT id, customer_id, customer_name, aadhar_no, pan_no, city, state 
       FROM customers 
       WHERE customer_name LIKE ? OR customer_id LIKE ? OR aadhar_no LIKE ? OR pan_no LIKE ?
       LIMIT ?`,
      [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, parseInt(limit)]
    );
    return rows;
  } catch (error) {
    console.error('Error searching customers:', error);
    throw new Error(`Failed to search customers: ${error.message}`);
  } finally {
    connection.release();
  }
};

const filterByState = async (state) => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT id, customer_id, customer_name, aadhar_no, pan_no, city, state 
       FROM customers 
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

const filterByBankAccount = async (hasBankAccount) => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT id, customer_id, customer_name, aadhar_no, pan_no, city, state 
       FROM customers 
       WHERE has_bank_account = ?`,
      [hasBankAccount]
    );
    return rows;
  } catch (error) {
    console.error('Error filtering by bank account:', error);
    throw new Error(`Failed to filter by bank account: ${error.message}`);
  } finally {
    connection.release();
  }
};

const generateAadharOTP = async (aadharNo) => {
  const connection = await pool.promise().getConnection();
  try {
    // In a real implementation, this would send an OTP to the registered mobile
    // For demo purposes, we'll just generate a random OTP and store it temporarily
    
    // Check if customer exists with this Aadhar
    const [rows] = await connection.query(
      `SELECT id FROM customers WHERE aadhar_no = ?`,
      [aadharNo]
    );
    
    if (rows.length === 0) {
      throw new Error('No customer found with this Aadhar number');
    }
    
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in database (in a real app, you might want to use Redis with TTL)
    await connection.query(
      `UPDATE customers SET aadhar_otp = ?, otp_expiry = DATE_ADD(NOW(), INTERVAL 5 MINUTE) 
       WHERE aadhar_no = ?`,
      [otp, aadharNo]
    );
    
    return otp; // In production, don't return the OTP, just send it via SMS/email
  } catch (error) {
    console.error('Error generating Aadhar OTP:', error);
    throw new Error(`Failed to generate OTP: ${error.message}`);
  } finally {
    connection.release();
  }
};

const verifyAadharOTP = async (aadharNo, otp) => {
  const connection = await pool.promise().getConnection();
  try {
    // Verify OTP
    const [rows] = await connection.query(
      `SELECT id FROM customers 
       WHERE aadhar_no = ? AND aadhar_otp = ? AND otp_expiry > NOW()`,
      [aadharNo, otp]
    );
    
    if (rows.length === 0) {
      throw new Error('Invalid OTP or OTP expired');
    }
    
    // Update verification status
    await connection.query(
      `UPDATE customers SET aadhar_verified = TRUE WHERE aadhar_no = ?`,
      [aadharNo]
    );
    
    return { success: true, message: 'Aadhar verified successfully' };
  } catch (error) {
    console.error('Error verifying Aadhar OTP:', error);
    throw new Error(`Failed to verify OTP: ${error.message}`);
  } finally {
    connection.release();
  }
};

const updateCustomerUploads = async (customerId, updateData) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();

    // Validate that we're only updating file-related fields
    const allowedFields = ['customer_photo', 'aadhar_photo', 'pan_photo'];
    const updateFields = Object.keys(updateData).filter(field => allowedFields.includes(field));
    
    if (updateFields.length === 0) {
      throw new Error('No valid file fields to update');
    }

    // Build the SET clause dynamically
    const setClause = updateFields.map(field => `${field} = ?`).join(', ');
    const values = updateFields.map(field => updateData[field]);
    values.push(customerId);

    // Update only the specified file fields
    await connection.query(
      `UPDATE customers 
       SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      values
    );

    await connection.commit();
    
    // Return the updated file URLs
    const result = {};
    updateFields.forEach(field => {
      result[field] = updateData[field];
    });
    return result;
  } catch (error) {
    await connection.rollback();
    console.error('Error updating customer uploads:', error);
    throw new Error(`Failed to update customer uploads: ${error.message}`);
  } finally {
    connection.release();
  }
};

module.exports = {
  createCustomer,
  getCustomerById,
  getAllCustomers,
  updateCustomer,
  deleteCustomer,
  searchCustomers,
  filterByState,
  filterByBankAccount,
  generateAadharOTP,
  verifyAadharOTP,
  updateCustomerUploads
};