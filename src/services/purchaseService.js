const pool = require('../config/db.config');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const bwipjs = require('bwip-js');
const { getCustomerById } = require('../services/customerService');
const { createMeltingPurchase } = require('../services/MeltingService');
const { getUserById } = require('../services/userService');
const { x } = require('pdfkit');

const unlinkAsync = promisify(fs.unlink);

const createPurchase = async (purchaseData) => {
  const connection = await pool.promise().getConnection();
  const digits = "1234567890";
  let code = "";

  for (let i = 0; i < 7; i++) {
    code += digits.charAt(Math.floor(Math.random() * digits.length));
  }

  try {
    await connection.beginTransaction();

    console.log("purchaseData created_by==>", purchaseData.created_by);

    // Get user details
    const [user_rows] = await connection.query(
      `SELECT * FROM user_details WHERE user_id=?`,
      [purchaseData.created_by]
    );

    if (!user_rows || user_rows.length === 0) {
      throw new Error('User not found');
    }

    const user = user_rows[0];
    console.log("User data==>", JSON.stringify(user));

    // Get company details
    const [company_rows] = await connection.query(
      `SELECT * FROM companies WHERE id=?`,
      [user.company_id]
    );

    if (!company_rows || company_rows.length === 0) {
      throw new Error('Company not found');
    }
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // 🔹 Determine financial year (e.g., 2025–2026)
    const startYear = currentMonth >= 4 ? currentYear : currentYear - 1;
    const endYear = startYear + 1;
    const financialYearCode = `Y${String(startYear).slice(2)}${String(endYear).slice(2)}`; // Y2526
    const [lastPurchase] = await connection.query(
      `SELECT purchase_id FROM purchases 
       WHERE purchase_id LIKE ? 
       ORDER BY id DESC LIMIT 1`,
      [`PUR%${financialYearCode}`]
    );
    let newPurchaseNumber = 1;
    if (lastPurchase.length > 0) {
      const lastNum = parseInt(lastPurchase[0].purchase_id.match(/PUR(\d+)/)[1]);
      newPurchaseNumber = lastNum + 1;
    }
    const purchase_id = `PUR${String(newPurchaseNumber).padStart(2, '0')}${financialYearCode}`;


    const company = company_rows[0];
    console.log("Company data==>", JSON.stringify(company));
    // 1️⃣ Get last quotation for this financial year
    let quotation_row;
    if (purchaseData.pledge_status) {
      [quotation_row] = await connection.query(
        `SELECT * FROM pledge_final_quotation WHERE quotation_id=?`,
        [purchaseData.quotation_id]
      );
    } else {
      [quotation_row] = await connection.query(
        `SELECT * FROM quotations WHERE quotation_id=?`,
        [purchaseData.quotation_id]
      );
    }


    // Validate products data
    if (!Array.isArray(purchaseData.products)) {
      throw new Error('Products must be an array');
    }

    // const [quot_rows]=await connection.query(`SELECT * FROM quotations WHERE quotation_id=?`,[purchaseData.quotation_id])
    // Insert purchase record
    const [purchaseResult] = await connection.query(
      `INSERT INTO purchases 
      (purchase_id, customer_id, customer_name, aadhar_no, pan_no, 
       products, total_amount, final_amount, bill_copy, ornament_photo, reference, 
       reference_person, other_reference, remarks, status, margin_percent,
       payment_method, created_by, updated_by, financial_id, quotation_id, user_capture, bref_no, payment_details, pledge_status,company_code,branch_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)`,
      [
        purchase_id,
        purchaseData.customer_id || null,
        purchaseData.customer_name,
        purchaseData.aadhar_no,
        purchaseData.pan_no,
        JSON.stringify(purchaseData.products),
        purchaseData.final_amount,
        quotation_row[0].total_amount,
        purchaseData.bill_copy,
        purchaseData.ornament_photo,
        purchaseData.reference,
        purchaseData.reference_person,
        purchaseData.other_reference,
        purchaseData.remarks,
        purchaseData.status || 'pending_payment',
        purchaseData.margin_percent,
        purchaseData.payment_method,
        purchaseData.created_by,
        purchaseData.updated_by,
        purchaseData.financial_id,
        purchaseData.quotation_id || null,
        purchaseData.user_capture,
        `BREF${code}`,
        JSON.stringify(purchaseData.payment_details),
        purchaseData.pledge_status,
        company.company_code,
        user_rows[0].branch_id
      ]
    );
    // Insert individual products into stock
    for (let product of purchaseData.products) {
      await connection.query(
        `INSERT INTO stock 
        (purchase_id, customer_id, customer_name, aadhar_no, pan_no, 
         products, total_amount, final_amount, bill_copy, ornament_photo, reference, 
         reference_person, other_reference, remarks, status, margin_percent,
         payment_method, created_by, updated_by, financial_id, quotation_id, user_capture, issrcc, bref_no) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          purchase_id,
          purchaseData.customer_id || null,
          purchaseData.customer_name,
          purchaseData.aadhar_no,
          purchaseData.pan_no,
          JSON.stringify(product),
          purchaseData.final_amount,
          quotation_row[0].total_amount,
          purchaseData.bill_copy,
          purchaseData.ornament_photo,
          purchaseData.reference,
          purchaseData.reference_person,
          purchaseData.other_reference,
          purchaseData.remarks,
          purchaseData.status || 'pending_payment',
          purchaseData.margin_percent,
          purchaseData.payment_method,
          purchaseData.created_by,
          purchaseData.updated_by,
          purchaseData.financial_id,
          purchaseData.quotation_id || null,
          purchaseData.user_capture,
          "D",
          `BREF${code}`
        ]
      );
    }

    // Insert into collections
    await connection.query(
      `INSERT INTO collections 
      (purchase_id, customer_id, customer_name, aadhar_no, pan_no, 
       products, total_amount, final_amount, bill_copy, ornament_photo, reference, 
       reference_person, other_reference, remarks, status, margin_percent,
       payment_method, created_by, updated_by, financial_id, quotation_id, user_capture, issrcc, bref_no, tenant_type) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        purchase_id,
        purchaseData.customer_id || null,
        purchaseData.customer_name,
        purchaseData.aadhar_no,
        purchaseData.pan_no,
        JSON.stringify(purchaseData.products),
        purchaseData.final_amount,
        quotation_row[0].total_amount,
        purchaseData.bill_copy,
        purchaseData.ornament_photo,
        purchaseData.reference,
        purchaseData.reference_person,
        purchaseData.other_reference,
        purchaseData.remarks,
        purchaseData.status || 'pending_payment',
        purchaseData.margin_percent || 3,
        purchaseData.payment_method,
        purchaseData.created_by,
        purchaseData.updated_by,
        purchaseData.financial_id,
        purchaseData.quotation_id || null,
        purchaseData.user_capture,
        "D",
        `BREF${code}`,
        "D"
      ]
    );

    // Update quotation if exists - FIXED THIS PART
    if (purchaseData.quotation_id) {
      if (purchaseData.pledge_status) {
        // Update pledge_quotations
        await connection.query(
          `UPDATE pledge_final_quotation 
           SET status = 'closed', 
               purchase_id = ?,
               updated_at = NOW()
           WHERE quotation_id = ?`,
          [purchase_id, purchaseData.quotation_id]
        );
      } else {
        // Update quotations
        await connection.query(
          `UPDATE quotations 
           SET status = 'closed', 
               purchase_id = ?,
               updated_at = NOW()
           WHERE quotation_id = ?`,
          [purchase_id, purchaseData.quotation_id]
        );
      }
    }

    await connection.commit();
    const ll = {
      ...purchaseResult,
      company_code: company.company_code
    }
    // Return the created purchase with company code
    return ll

  } catch (error) {
    console.error('Error in createPurchase:', error);
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Get purchase by ID with connection management
const getPurchaseById = async (id) => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT p.*, 
    u1.username AS created_by_name, 
    u2.username AS updated_by_name,
    f.id AS financial_year_id
  FROM purchases p
  LEFT JOIN users u1 ON p.created_by = u1.id
  LEFT JOIN users u2 ON p.updated_by = u2.id
  LEFT JOIN financial_years f ON p.financial_id = f.id
  WHERE p.id = ?`,
      [id]
    );

    if (rows.length === 0) return null;

    const purchase = rows[0];

    // Safely parse products JSON
    if (purchase.products && typeof purchase.products === 'string') {
      try {
        purchase.products = JSON.parse(purchase.products);
      } catch (e) {
        console.error('Error parsing products JSON:', e);
        purchase.products = [];
      }
    } else if (!Array.isArray(purchase.products)) {
      purchase.products = [];
    }

    return purchase;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

// Get all purchases with pagination
const getAllPurchases = async ({ 
  page = 1, 
  limit = 10, 
  search, 
  metal, 
  status, 
  branch_id,
  start_date,
  end_date 
}) => {
  const connection = await pool.promise().getConnection();
  try {
    const offset = (page - 1) * limit;
    let query = `FROM purchases WHERE 1=1`;
    const params = [];

    // Apply search filter
    if (search) {
      query += ` AND (customer_name LIKE ? OR purchase_id LIKE ? OR aadhar_no LIKE ? OR barcode LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Apply metal filter
    if (metal) {
      query += ` AND JSON_CONTAINS(products, JSON_OBJECT('metal', ?))`;
      params.push(metal);
    }

    // Apply status filter
    if (status) {
      query += ` AND status = ?`;
      params.push(status);
    }
    
    if (branch_id) {
      query += ` AND branch_id = ?`;
      params.push(branch_id);
    }

    // ✅ FIX: Add date range filter
    if (start_date && end_date) {
      query += ` AND DATE(created_at) BETWEEN ? AND ?`;
      params.push(start_date, end_date);
    }

    // Get total count
    const [countResult] = await connection.query(
      `SELECT COUNT(*) as total ${query}`,
      params
    );
    const total = countResult[0].total;

    // Apply pagination
    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    // Get paginated results
    const [rows] = await connection.query(
      `SELECT * ${query}`,
      params
    );

    // Parse products + fetch pledge data if needed
    const purchases = [];
    for (const purchase of rows) {
      // Parse products JSON safely
      if (purchase.products) {
        try {
          purchase.products = JSON.parse(purchase.products);
        } catch (e) {
          console.error('Error parsing products JSON:', e);
          purchase.products = [];
        }
      }

      // If pledge_status = 1 → fetch quotation + pledge details
      if (purchase.pledge_status == 1) {
        const [quotationRows] = await connection.query(
          'SELECT * FROM pledge_quotations WHERE quotation_id=?',
          [purchase.quotation_id]
        );

        if (quotationRows.length > 0) {
          const quotation = quotationRows[0];
          const [pledgeRows] = await connection.query(
            'SELECT * FROM pledge_items WHERE id=?',
            [quotation.pledge_id]
          );

          purchase.accounts_amount = pledgeRows.length > 0 ? pledgeRows[0].accounts_amount : null;
        }
      }

      purchases.push(purchase);
    }

    return { purchases, total };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};


// Get all purchases with pagination
const getAllPurchasesRegional = async (
  branch_id,
  manager_id,
  { page = 1, limit = 10, search, metal, status, startDate, endDate }
) => {
  const connection = await pool.promise().getConnection();
  try {
    const offset = (page - 1) * limit;
    const params = [];

    let where = `WHERE 1=1 AND p.branch_id = ?`;
    params.push(branch_id);

    if (search) {
      where += ` AND (p.customer_name LIKE ? OR p.purchase_id LIKE ? OR p.aadhar_no LIKE ? OR p.barcode LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (metal) {
      where += ` AND JSON_CONTAINS(p.products, JSON_OBJECT('metal', ?))`;
      params.push(metal);
    }

    if (status) {
      where += ` AND p.regional_status = ?`;
      params.push(status);
    }

    if (startDate && endDate) {
      where += ` AND p.created_at BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    }

    let countQuery, dataQuery, queryParams;

    if (manager_id == 1) {
      countQuery = `SELECT COUNT(*) as total FROM purchases p ${where}`;
      dataQuery = `SELECT p.* FROM purchases p ${where} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
      queryParams = [...params, parseInt(limit), offset];
    } else {
      countQuery = `
        SELECT COUNT(*) as total
        FROM purchases p
        JOIN user_details ud_creator ON ud_creator.user_id = p.created_by
        JOIN user_details ud_manager ON ud_manager.user_id = ?
        ${where} AND ud_creator.company_id = ud_manager.company_id
        AND JSON_CONTAINS(ud_manager.branches, CAST(ud_creator.branch_id AS JSON))
      `;
      dataQuery = `
        SELECT p.*
        FROM purchases p
        JOIN user_details ud_creator ON ud_creator.user_id = p.created_by
        JOIN user_details ud_manager ON ud_manager.user_id = ?
        ${where} AND ud_creator.company_id = ud_manager.company_id
        AND JSON_CONTAINS(ud_manager.branches, CAST(ud_creator.branch_id AS JSON))
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
      `;
      queryParams = [manager_id, ...params, parseInt(limit), offset];
    }

    const [countResult] = await connection.query(countQuery, queryParams.slice(0, queryParams.length - 2));
    const total = countResult[0].total;

    const [rows] = await connection.query(dataQuery, queryParams);

    for (const purchase of rows) {
      try {
        purchase.products = purchase.products ? JSON.parse(purchase.products) : [];
      } catch {
        purchase.products = [];
      }

      if (purchase.pledge_status == 1) {
        const [quotationRows] = await connection.query(
          'SELECT * FROM pledge_quotations WHERE quotation_id=?',
          [purchase.quotation_id]
        );
        if (quotationRows.length > 0) {
          const quotation = quotationRows[0];
          const [pledgeRows] = await connection.query(
            'SELECT * FROM pledge_items WHERE id=?',
            [quotation.pledge_id]
          );
          purchase.accounts_amount = pledgeRows.length > 0 ? pledgeRows[0].accounts_amount : null;
        }
      }
    }

    return { purchases: rows, total };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};


const getAllPurchasesAccounts = async (
  branch_id,
  { page = 1, limit = 10, search, metal, status, startDate, endDate }
) => {
  const connection = await pool.promise().getConnection();
  try {
    const offset = (page - 1) * limit;
    const params = [];

    let where = `WHERE 1=1 AND p.branch_id = ?`;
    params.push(branch_id);

    // ✅ Default: status = 1 if not provided
    if (status !== undefined && status !== null) {
      where += ` AND p.regional_status = ?`;
      params.push(status);
    } else {
      where += ` AND p.regional_status = 1`;
    }

    if (search) {
      where += ` AND (p.customer_name LIKE ? OR p.purchase_id LIKE ? OR p.aadhar_no LIKE ? OR p.barcode LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (metal) {
      where += ` AND JSON_CONTAINS(p.products, JSON_OBJECT('metal', ?))`;
      params.push(metal);
    }

    if (startDate && endDate) {
      where += ` AND p.created_at BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    }

    // Count query
    const countQuery = `SELECT COUNT(*) AS total FROM purchases p ${where}`;
    const [countResult] = await connection.query(countQuery, params);
    const total = countResult[0].total;

    // Data query
    const dataQuery = `
      SELECT p.*
      FROM purchases p
      ${where}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await connection.query(dataQuery, [...params, parseInt(limit), offset]);

    // Process each purchase
    for (const purchase of rows) {
      try {
        purchase.products = purchase.products ? JSON.parse(purchase.products) : [];
      } catch {
        purchase.products = [];
      }

      // ✅ Fetch sales details
      const [salesRows] = await connection.query(
        `SELECT * FROM sales WHERE purchase_id = ?`,
        [purchase.purchase_id]
      );

      if (salesRows.length > 0) {
        purchase.sales_status = "1";
        const sales = salesRows[0];
        const [userRows] = await connection.query(
          `SELECT * FROM users WHERE id = ?`,
          [sales.user_id]
        );
        const [userDetailsRows] = await connection.query(
          `SELECT * FROM user_details WHERE user_id = ?`,
          [sales.user_id]
        );
        purchase.sales_user = { ...userRows[0], ...userDetailsRows[0] };
      } else {
        purchase.sales_status = "0";
        purchase.sales_user = null;
      }
      if (purchase.pledge_status == 1) {
        const [quotationRows] = await connection.query(
          `SELECT * FROM pledge_quotations WHERE quotation_id = ?`,
          [purchase.quotation_id]
        );

        if (quotationRows.length > 0) {
          const quotation = quotationRows[0];
          const [pledgeRows] = await connection.query(
            `SELECT * FROM pledge_items WHERE id = ?`,
            [quotation.pledge_id]
          );

          purchase.accounts_amount = pledgeRows.length > 0 ? pledgeRows[0].accounts_amount : null;
        }
      }
    }

    return { purchases: rows, total };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};


// ✅ In purchaseService.js
const createSales = async (user_id, data) => {
  const connection = await pool.promise().getConnection();
  try {
    const { purchase_id, comments } = data;

    const [result] = await connection.query(
      `INSERT INTO sales (purchase_id, user_id, comments, created_user)
       VALUES (?, ?, ?, ?)`,
      [purchase_id, data.user_id, comments || null, user_id]
    );

    return { success: true, id: result.insertId };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};


const updatePurchaseAccountsStatus = async (id, updateData) => {
  const connection = await pool.promise().getConnection();
  try {
    const setClause = [];
    const values = [];

    if (updateData.collected_status !== undefined) {
      setClause.push("collected_status = ?");
      values.push(updateData.collected_status);
    }


    values.push(id);

    await connection.query(
      `UPDATE purchases 
       SET ${setClause.join(", ")}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      values
    );

    return { success: true, purchase_id: id }; // returning purchase table ID
  } finally {
    connection.release();
  }
};

const updatePurchaseReligionStatus = async (id, manager_id, updateData) => {
  const connection = await pool.promise().getConnection();
  console.log(manager_id)
  try {
    const setClause = [];
    const values = [];
    if (updateData.regional_status !== undefined) {
      setClause.push("collected_status = ?")
      setClause.push("regional_status = ?");
      values.push(updateData.regional_status);
      values.push(updateData.regional_status);
    }

    const [userRows] = await connection.query(
      `SELECT company_id, branch_id FROM user_details WHERE user_id = ?`,
      [manager_id]
    );
    if (!userRows.length) throw new Error("User not found");

    setClause.push("accounts_id = ?");
    values.push(userRows[0].branch_id);

    values.push(id);

    await connection.query(
      `UPDATE purchases 
       SET ${setClause.join(", ")}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      values
    );
    if (updateData.regional_status == 1) {
      await createMeltingPurchase(id)
    }
    return { success: true, purchase_id: id }; // returning purchase table ID
  } finally {
    connection.release();
  }
};






// Update purchase
const updatePurchase = async (id, updateData) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();

    // Get current purchase data
    const currentPurchase = await getPurchaseById(id);
    if (!currentPurchase) {
      throw new Error('Purchase not found');
    }

    // Prepare update fields
    let setClause = [];
    const values = [];

    const fields = [
      'customer_id', 'customer_name', 'aadhar_no', 'pan_no',
      'products', 'total_amount', 'reference', 'reference_person',
      'other_reference', 'remarks', 'status', 'margin_percent',
      'payment_method', 'updated_by', 'barcode', 'barcode_path',
      'qr_data', 'qr_code_path', 'bill_pdf_path'
    ];

    // Add fields to update
    fields.forEach(field => {
      if (updateData[field] !== undefined) {
        setClause.push(`${field} = ?`);
        values.push(field === 'products' && Array.isArray(updateData[field])
          ? JSON.stringify(updateData[field])
          : updateData[field]);
      }
    });

    // Handle file updates
    if (updateData.bill_copy !== undefined) {
      setClause.push('bill_copy = ?');
      values.push(updateData.bill_copy);
    }

    if (updateData.ornament_photo !== undefined) {
      setClause.push('ornament_photo = ?');
      values.push(updateData.ornament_photo);
    }

    values.push(id);

    // Execute update
    await connection.query(
      `UPDATE purchases SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      values
    );
    if (updateData.payment_details !== "Full") {
      const [rows] = await connection.query(
        `SELECT * FROM purchases WHERE id = ?`,
        values
      );

      await connection.query(
        `INSERT INTO collections 
    (purchase_id, customer_id, customer_name, aadhar_no, pan_no, 
     products, total_amount, bill_copy, ornament_photo, reference, 
     reference_person, other_reference, remarks, status, margin_percent,
     payment_method, created_by, updated_by, financial_id, quotation_id,user_capture,issrcc,bref_no) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?)`,
        [
          purchaseId,
          rows[0].customer_id || null,
          rows[0].customer_name,
          rows[0].aadhar_no,
          rows[0].pan_no,
          JSON.stringify(rows[0].products),
          rows[0].total_amount,
          rows[0].bill_copy,
          rows[0].ornament_photo,
          rows[0].reference,
          rows[0].reference_person,
          rows[0].other_reference,
          rows[0].remarks,
          rows[0].status || 'pending_payment',
          rows[0].margin_percent || 3,
          rows[0].payment_method,
          rows[0].created_by,
          rows[0].updated_by,
          rows[0].financial_id,
          rows[0].quotation_id || null,
          rows[0].user_capture,
          "D",
          rows[0].bref_no
        ]
      );

    }

    await connection.commit();
    return await getPurchaseById(id);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Delete purchase
const deletePurchase = async (id) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();

    // Get purchase details first to handle file cleanup
    const purchase = await getPurchaseById(id);
    if (!purchase) {
      throw new Error('Purchase not found');
    }

    // Delete payment records
    await connection.query(
      `DELETE FROM purchase_payments WHERE purchase_id = ?`,
      [id]
    );

    // Delete purchase
    await connection.query(
      `DELETE FROM purchases WHERE id = ?`,
      [id]
    );

    await connection.commit();

    // Clean up associated files
    if (purchase.bill_copy || purchase.ornament_photo || purchase.barcode_path || purchase.qr_code_path || purchase.bill_pdf_path) {
      const uploadDir = path.join(__dirname, '../../public/uploads/purchases', id.toString());
      if (fs.existsSync(uploadDir)) {
        await fs.promises.rm(uploadDir, { recursive: true, force: true });
      }
    }

    return { success: true };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Record payment
const recordPayment = async (req, res, next) => {
  let connection;
  try {
    connection = await pool.promise().getConnection();
    await connection.beginTransaction();

    const { id } = req.params;
    const { payment_method, amount, bank_details, transaction_reference } = req.body;
    const { user } = req;

    // Validate payment data
    if (!payment_method || !amount) {
      throw new Error('Payment method and amount are required');
    }

    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      throw new Error('Invalid payment amount');
    }

    // Get purchase details
    const purchase = await purchaseService.getPurchaseById(id);
    if (!purchase) {
      return errorResponse(res, 'Purchase not found', 404);
    }

    // Calculate payment summary
    const total_paid = await purchaseService.getTotalPaidAmount(id);
    const new_paid_amount = total_paid + paymentAmount;
    const remaining_amount = purchase.total_amount - new_paid_amount;

    // Validate payment doesn't exceed total amount
    if (remaining_amount < 0) {
      throw new Error('Payment amount exceeds remaining balance');
    }

    // Record payment
    const payment = await purchaseService.recordPayment({
      purchase_id: id,
      payment_method,
      amount: paymentAmount,
      bank_details,
      transaction_reference,
      recorded_by: user.id,
      remaining_amount
    });

    // Update purchase status if fully paid
    if (remaining_amount <= 0) {
      await purchaseService.updatePurchase(id, { status: 'paid' });
    } else if (purchase.status === 'pending_payment' && new_paid_amount > 0) {
      await purchaseService.updatePurchase(id, { status: 'partially_paid' });
    }

    await connection.commit();
    successResponse(res, payment);
  } catch (error) {
    if (connection) await connection.rollback();
    errorResponse(res, error.message, 400, error);
  } finally {
    if (connection) connection.release();
  }
};


// Get payment history
const getPaymentHistory = async (purchaseId) => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT pp.*, u.username as recorded_by_name
       FROM purchase_payments pp
       LEFT JOIN users u ON pp.recorded_by = u.id
       WHERE pp.purchase_id = ?
       ORDER BY pp.recorded_at DESC`,
      [purchaseId]
    );

    // Parse bank details if they exist
    return rows.map(row => {
      if (row.bank_details) {
        try {
          row.bank_details = JSON.parse(row.bank_details);
        } catch (e) {
          console.error('Error parsing bank details:', e);
          row.bank_details = null;
        }
      }
      return row;
    });
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

// Get total paid amount for a purchase
const getTotalPaidAmount = async (purchaseId) => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT COALESCE(SUM(amount), 0) as total_paid
       FROM purchase_payments
       WHERE purchase_id = ?`,
      [purchaseId]
    );
    return rows[0].total_paid;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

// Search purchases
const searchPurchases = async (query, limit = 10) => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT id, purchase_id, customer_name, total_amount, status 
       FROM purchases 
       WHERE customer_name LIKE ? OR purchase_id LIKE ? OR aadhar_no LIKE ? OR barcode LIKE ?
       LIMIT ?`,
      [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, parseInt(limit)]
    );
    return rows;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

// Filter purchases
const filterPurchases = async (filters) => {
  const connection = await pool.promise().getConnection();
  try {
    let query = `FROM purchases WHERE 1=1`;
    const params = [];

    // Apply search filter
    if (filters.search) {
      query += ` AND (customer_name LIKE ? OR purchase_id LIKE ? OR aadhar_no LIKE ? OR barcode LIKE ?)`;
      params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
    }

    // Apply metal filter
    if (filters.metal) {
      query += ` AND JSON_CONTAINS(products, JSON_OBJECT('metal', ?))`;
      params.push(filters.metal);
    }

    // Apply status filter
    if (filters.status) {
      query += ` AND status = ?`;
      params.push(filters.status);
    }

    // Apply date range filter
    if (filters.dateFrom && filters.dateTo) {
      query += ` AND created_at BETWEEN ? AND ?`;
      params.push(filters.dateFrom, filters.dateTo);
    }

    // Execute query
    const [rows] = await connection.query(
      `SELECT id, purchase_id, customer_name, total_amount, status, created_at
       ${query} ORDER BY created_at DESC`,
      params
    );

    return rows;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

// Generate unique purchase ID
const generatePurchaseId = () => {
  const prefix = 'PUR';
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${year}${month}${random}`;
};

// Generate Barcode
const generateBarcode = async (purchaseId) => {
  const connection = await pool.promise().getConnection();
  try {

    console.log(purchaseId);

    await connection.beginTransaction();

    const purchase = await getPurchaseById(purchaseId);
    if (!purchase) {
      throw new Error('Purchase not found');
    }

    // Generate barcode value
    const barcodeValue = `PUR${purchase.id}-${purchase.customer_id}`;

    // Generate barcode image
    const png = await bwipjs.toBuffer({
      bcid: 'code128',
      text: barcodeValue,
      scale: 3,
      height: 10,
      includetext: true,
      textxalign: 'center'
    });

    // Save barcode image
    const uploadDir = path.join(__dirname, '../../public/uploads/purchases', purchaseId.toString());
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const barcodePath = path.join(uploadDir, 'barcode.png');
    fs.writeFileSync(barcodePath, png);

    // Update purchase with barcode
    await connection.query(
      `UPDATE purchases 
       SET barcode = ?, barcode_path = ?
       WHERE id = ?`,
      [barcodeValue, `/uploads/purchases/${purchaseId}/barcode.png`, purchaseId]
    );

    await connection.commit();
    return barcodeValue;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Generate QR Code
const generateQRCode = async (purchaseId) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();

    const purchase = await getPurchaseById(purchaseId);
    if (!purchase) {
      throw new Error('Purchase not found');
    }

    // Prepare QR data
    const qrData = {
      purchase: purchase,
      // purchase_id: purchase.purchase_id,
      // total_amount: purchase.total_amount,
      // date: purchase.created_at,
      // payment_method: purchase.payment_method
    };

    // Generate QR code
    const qrCode = await QRCode.toDataURL(JSON.stringify(qrData));

    // Save QR code image
    const uploadDir = path.join(__dirname, '../../public/uploads/purchases', purchaseId.toString());
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const qrPath = path.join(uploadDir, 'qrcode.png');
    const base64Data = qrCode.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync(qrPath, base64Data, 'base64');




    // Update purchase with QR code data
    await connection.query(
      `UPDATE purchases 
       SET qr_data = ?, qr_code_path = ?
       WHERE id = ?`,
      [JSON.stringify(qrData), `/uploads/purchases/${purchaseId}/qrcode.png`, purchaseId]
    );

    await connection.commit();
    return qrData;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};


// Get purchase by barcode
const getPurchaseByBarcode = async (barcode) => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT * FROM purchases WHERE barcode = ?`,
      [barcode]
    );

    if (rows.length === 0) return null;

    const purchase = rows[0];

    // Parse products JSON
    if (purchase.products) {
      try {
        purchase.products = JSON.parse(purchase.products);
      } catch (e) {
        console.error('Error parsing products JSON:', e);
        purchase.products = [];
      }
    }

    return purchase;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

const getPurchaseByQuotationId = async (quotationId) => {

  console.log(quotationId);

  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT p.*, 
       u1.username as created_by_name, u2.username as updated_by_name,
       f.id
       FROM purchases p
       LEFT JOIN users u1 ON p.created_by = u1.id
       LEFT JOIN users u2 ON p.updated_by = u2.id
       LEFT JOIN financial_years f ON p.financial_id = f.id
       WHERE p.quotation_id = ?`,
      [quotationId]
    );

    if (rows.length === 0) return null;

    const purchase = rows[0];

    // Parse products JSON if it's a string
    if (purchase.products && typeof purchase.products === 'string') {
      try {
        purchase.products = JSON.parse(purchase.products);
      } catch (e) {
        console.error('Error parsing products JSON:', e);
        purchase.products = [];
      }
    } else if (!Array.isArray(purchase.products)) {
      purchase.products = [];
    }

    return purchase;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  createPurchase,
  getPurchaseById,
  getAllPurchases,
  updatePurchase,
  deletePurchase,
  recordPayment,
  getPaymentHistory,
  searchPurchases,
  filterPurchases,
  generateBarcode,
  generateQRCode,
  getPurchaseByBarcode,
  getTotalPaidAmount,
  getPurchaseByQuotationId, updatePurchaseReligionStatus,
  getAllPurchasesRegional, updatePurchaseAccountsStatus, getAllPurchasesAccounts, createSales

};