const pool = require('../config/db.config');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const { getCurrentFinancialYear } = require('../middlewares/currfinancialYear');

const unlinkAsync = promisify(fs.unlink);

const createBankAccount = async (bankAccountData) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();

    // Validate required fields
    if (!bankAccountData.customer_id || !bankAccountData.bank_name || 
        !bankAccountData.account_number || !bankAccountData.ifsc_code || 
        !bankAccountData.branch_name || !bankAccountData.account_type) {
      throw new Error('Missing required bank account fields');
    }

    const currentFYId = await getCurrentFinancialYear();

    // Check if this is the first account for customer (set as primary if true)
    const [existingAccounts] = await connection.query(
      `SELECT id FROM customer_bank_accounts WHERE customer_id = ?`,
      [bankAccountData.customer_id]
    );

    const isPrimary = existingAccounts.length === 0 || bankAccountData.is_primary;

    // Insert bank account
    const [result] = await connection.query(
      `INSERT INTO customer_bank_accounts 
      (customer_id, bank_name, account_number, ifsc_code, branch_name, 
       account_type, is_primary, documents, created_by, updated_by, financial_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bankAccountData.customer_id,
        bankAccountData.bank_name,
        bankAccountData.account_number,
        bankAccountData.ifsc_code,
        bankAccountData.branch_name,
        bankAccountData.account_type,
        isPrimary,
        JSON.stringify(bankAccountData.documents || []),
        bankAccountData.created_by,
        bankAccountData.updated_by,
        currentFYId
      ]
    );

    const bankAccountId = result.insertId;

    // If this is primary, update all other accounts for this customer to not primary
    if (isPrimary) {
      await connection.query(
        `UPDATE customer_bank_accounts 
         SET is_primary = FALSE 
         WHERE customer_id = ? AND id != ?`,
        [bankAccountData.customer_id, bankAccountId]
      );
    }

    // Update customer's has_bank_account flag
    await connection.query(
      `UPDATE customers 
       SET has_bank_account = TRUE 
       WHERE id = ?`,
      [bankAccountData.customer_id]
    );

    await connection.commit();
    return await getBankAccountById(bankAccountId);
  } catch (error) {
    await connection.rollback();
    console.error('Error creating bank account:', error);
    throw new Error(`Failed to create bank account: ${error.message}`);
  } finally {
    connection.release();
  }
};

const getBankAccountById = async (id) => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT * FROM customer_bank_accounts WHERE id = ?`,
      [id]
    );
    
    if (rows.length === 0) return null;
    
    // Parse documents JSON if exists
    const account = rows[0];
    if (account.documents) {
      account.documents = JSON.parse(account.documents);
    } else {
      account.documents = [];
    }
    
    return account;
  } catch (error) {
    console.error('Error getting bank account by ID:', error);
    throw new Error(`Failed to get bank account: ${error.message}`);
  } finally {
    connection.release();
  }
};

const getAllBankAccounts = async ({ page = 1, limit = 10, search, bankName }) => {
  const connection = await pool.promise().getConnection();
  try {
    const offset = (page - 1) * limit;
    let query = `FROM customer_bank_accounts WHERE 1=1`;
    const params = [];
    
    // Apply filters
    if (search) {
      query += ` AND (bank_name LIKE ? OR account_number LIKE ? OR ifsc_code LIKE ? OR branch_name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (bankName) {
      query += ` AND bank_name = ?`;
      params.push(bankName);
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
    
    // Parse documents for each account
    const bankAccounts = rows.map(account => {
      if (account.documents) {
        account.documents = JSON.parse(account.documents);
      } else {
        account.documents = [];
      }
      return account;
    });
    
    return { 
      bankAccounts, 
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    console.error('Error getting all bank accounts:', error);
    throw new Error(`Failed to get bank accounts: ${error.message}`);
  } finally {
    connection.release();
  }
};

const getBankAccountsByCustomer = async (customerId) => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT * FROM customer_bank_accounts 
       WHERE customer_id = ? 
       ORDER BY is_primary DESC, created_at DESC`,
      [customerId]
    );
    
    // Parse documents for each account
    return rows.map(account => {
      if (account.documents) {
        account.documents = JSON.parse(account.documents);
      } else {
        account.documents = [];
      }
      return account;
    });
  } catch (error) {
    console.error('Error getting customer bank accounts:', error);
    throw new Error(`Failed to get customer bank accounts: ${error.message}`);
  } finally {
    connection.release();
  }
};

const updateBankAccount = async (id, updateData) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();

    // Validate required fields
    if ( !updateData.bank_name || 
        !updateData.account_number || !updateData.ifsc_code || 
        !updateData.branch_name || !updateData.account_type) {
      throw new Error('Missing required bank account fields');
    }

    // Get current bank account data
    const currentAccount = await getBankAccountById(id);
    if (!currentAccount) {
      throw new Error('Bank account not found');
    }

    // Prepare the update query
    const [result] = await connection.query(
      `UPDATE customer_bank_accounts SET
        bank_name = ?,
        account_number = ?,
        ifsc_code = ?,
        branch_name = ?,
        account_type = ?,
        is_primary = ?,
        documents = ?,
        updated_by = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        updateData.bank_name,
        updateData.account_number,
        updateData.ifsc_code,
        updateData.branch_name,
        updateData.account_type,
        updateData.is_primary || false,
        JSON.stringify(updateData.documents || currentAccount.documents || []),
        updateData.updated_by,
        id
      ]
    );

    // If set as primary, update all other accounts for this customer
    if (updateData.is_primary) {
      await connection.query(
        `UPDATE customer_bank_accounts 
         SET is_primary = FALSE 
         WHERE customer_id = ? AND id != ?`,
        [updateData.customer_id, id]
      );
    }

    await connection.commit();
    return await getBankAccountById(id);
  } catch (error) {
    await connection.rollback();
    console.error('Error updating bank account:', error);
    throw new Error(`Failed to update bank account: ${error.message}`);
  } finally {
    connection.release();
  }
};

const deleteBankAccount = async (id) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();
    
    // First get bank account to potentially delete documents later
    const bankAccount = await getBankAccountById(id);
    if (!bankAccount) {
      throw new Error('Bank account not found');
    }
    
    // Check if this is the primary account
    if (bankAccount.is_primary) {
      throw new Error('Cannot delete primary bank account. Set another account as primary first.');
    }
    
    // Delete the bank account
    await connection.query(
      `DELETE FROM customer_bank_accounts WHERE id = ?`,
      [id]
    );
    
    // Check if customer has any remaining bank accounts
    const [remainingAccounts] = await connection.query(
      `SELECT COUNT(*) as count FROM customer_bank_accounts 
       WHERE customer_id = ?`,
      [bankAccount.customer_id]
    );
    
    // Update customer's has_bank_account flag if no accounts left
    if (remainingAccounts[0].count === 0) {
      await connection.query(
        `UPDATE customers 
         SET has_bank_account = FALSE 
         WHERE id = ?`,
        [bankAccount.customer_id]
      );
    }
    
    await connection.commit();
    
    // Delete associated documents
    const uploadDir = path.join(__dirname, '../public/uploads/bank-accounts', id.toString());
    if (fs.existsSync(uploadDir)) {
      fs.rmSync(uploadDir, { recursive: true, force: true });
    }
    
    return { success: true, message: 'Bank account deleted successfully' };
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting bank account:', error);
    throw new Error(`Failed to delete bank account: ${error.message}`);
  } finally {
    connection.release();
  }
};

const setPrimaryBankAccount = async (id) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();

    // Get the bank account to be set as primary
    const bankAccount = await getBankAccountById(id);
    if (!bankAccount) {
      throw new Error('Bank account not found');
    }

    // First set all accounts for this customer as not primary
    await connection.query(
      `UPDATE customer_bank_accounts 
       SET is_primary = FALSE 
       WHERE customer_id = ?`,
      [bankAccount.customer_id]
    );

    // Then set the specified account as primary
    await connection.query(
      `UPDATE customer_bank_accounts 
       SET is_primary = TRUE, 
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [id]
    );

    await connection.commit();
    return await getBankAccountById(id);
  } catch (error) {
    await connection.rollback();
    console.error('Error setting primary bank account:', error);
    throw new Error(`Failed to set primary bank account: ${error.message}`);
  } finally {
    connection.release();
  }
};

const searchBankAccounts = async (query, limit = 10) => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT id, customer_id, bank_name, account_number, ifsc_code, branch_name 
       FROM customer_bank_accounts 
       WHERE bank_name LIKE ? OR account_number LIKE ? OR ifsc_code LIKE ? OR branch_name LIKE ?
       LIMIT ?`,
      [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, parseInt(limit)]
    );
    return rows;
  } catch (error) {
    console.error('Error searching bank accounts:', error);
    throw new Error(`Failed to search bank accounts: ${error.message}`);
  } finally {
    connection.release();
  }
};

const filterByBankName = async (bankName) => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT id, customer_id, bank_name, account_number, ifsc_code, branch_name 
       FROM customer_bank_accounts 
       WHERE bank_name = ?`,
      [bankName]
    );
    return rows;
  } catch (error) {
    console.error('Error filtering by bank name:', error);
    throw new Error(`Failed to filter by bank name: ${error.message}`);
  } finally {
    connection.release();
  }
};

module.exports = {
  createBankAccount,
  getBankAccountById,
  getAllBankAccounts,
  getBankAccountsByCustomer,
  updateBankAccount,
  deleteBankAccount,
  setPrimaryBankAccount,
  searchBankAccounts,
  filterByBankName
};