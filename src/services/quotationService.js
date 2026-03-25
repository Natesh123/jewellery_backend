const pool = require('../config/db.config');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const Mustache = require('mustache');
const { getCustomerById } = require('../services/customerService')
const { getUserById } = require('../services/userService');
const { getCompanyById } = require('../services/companyService');
const userService = require('../services/userService');

const unlinkAsync = promisify(fs.unlink);

const createQuotation = async (quotationData) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();

    // 🔹 Get current date
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // 🔹 Determine financial year (e.g., 2025–2026)
    const startYear = currentMonth >= 4 ? currentYear : currentYear - 1;
    const endYear = startYear + 1;
    const financialYearCode = `Y${String(startYear).slice(2)}${String(endYear).slice(2)}`; // Y2526

    // 🔹 Get user (still needed for created_by etc.)
    const user = await userService.getUserById(quotationData.created_by);

    // 1️⃣ Get last quotation for this financial year
    const [lastQuotation] = await connection.query(
      `SELECT quotation_id FROM quotations 
       WHERE quotation_id LIKE ? 
       ORDER BY id DESC LIMIT 1`,
      [`QT%${financialYearCode}`]
    );

    let newQuotationNumber = 1;
    if (lastQuotation.length > 0) {
      const lastNum = parseInt(lastQuotation[0].quotation_id.match(/QT(\d+)/)[1]);
      newQuotationNumber = lastNum + 1;
    }

    // 2️⃣ Get last purchase for this financial year
    const [lastPurchase] = await connection.query(
      `SELECT purchase_id FROM quotations 
       WHERE purchase_id LIKE ? 
       ORDER BY id DESC LIMIT 1`,
      [`PUR%${financialYearCode}`]
    );

    let newPurchaseNumber = 1;
    if (lastPurchase.length > 0) {
      const lastNum = parseInt(lastPurchase[0].purchase_id.match(/PUR(\d+)/)[1]);
      newPurchaseNumber = lastNum + 1;
    }

    // 3️⃣ Generate new IDs (e.g., PUR01Y2526, QT01Y2526)
    const quotation_id = `QT${String(newQuotationNumber).padStart(2, '0')}${financialYearCode}`;
    const purchase_id = `PUR${String(newPurchaseNumber).padStart(2, '0')}${financialYearCode}`;

    // 4️⃣ Insert record
    const [result] = await connection.query(
      `INSERT INTO quotations 
      (quotation_id, customer_id, customer_name, aadhar_no, pan_no, 
       products, total_amount, bill_copy, ornament_photo, reference, 
       reference_person, other_reference, remarks, status, margin_percent,
       created_by, updated_by, financial_id, purchase_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        quotation_id,
        quotationData.customer_id,
        quotationData.customer_name,
        quotationData.aadhar_no,
        quotationData.pan_no,
        JSON.stringify(quotationData.products),
        quotationData.total_amount,
        quotationData.bill_copy,
        quotationData.ornament_photo,
        quotationData.reference,
        quotationData.reference_person,
        quotationData.other_reference,
        quotationData.remarks,
        quotationData.status || 'active',
        quotationData.margin_percent || 3,
        quotationData.created_by,
        quotationData.updated_by,
        quotationData.financial_id,
        purchase_id,
      ]
    );

    await connection.commit();
    return await getQuotationById(result.insertId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};




// Get quotation by ID
const getQuotationById = async (id) => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT q.*, 
       u1.username as created_by_name, u2.username as updated_by_name,
       f.id
       FROM quotations q
       LEFT JOIN users u1 ON q.created_by = u1.id
       LEFT JOIN users u2 ON q.updated_by = u2.id
       LEFT JOIN financial_years f ON q.financial_id = f.id
       WHERE q.id = ?`,
      [id]
    );

    if (rows.length === 0) return null;

    const quotation = rows[0];

    // Parse products JSON
    if (quotation.products) {
      try {
        quotation.products = JSON.parse(quotation.products);
      } catch (e) {
        console.error('Error parsing products JSON:', e);
        quotation.products = [];
      }
    }

    // Get approval history if exists
    if (quotation.margin_approval_requested) {
      const [history] = await connection.query(
        `SELECT * FROM quotation_approvals 
         WHERE quotation_id = ? 
         ORDER BY created_at DESC`,
        [id]
      );
      quotation.approval_history = history;
    }

    return quotation;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};
const getAllQuotations = async (branch_id, { 
  page = 1, 
  limit = 10, 
  search, 
  metal, 
  status,
  start_date,
  end_date 
}) => {
  const connection = await pool.promise().getConnection();
  try {
    const offset = (page - 1) * limit;
    let query = `
      FROM quotations q
      JOIN users u ON q.created_by = u.id
      JOIN user_details ud ON u.id = ud.user_id
      WHERE ud.branch_id = ?
    `;
    const params = [branch_id];
    
    if (search) {
      query += ` AND (q.customer_name LIKE ? OR q.quotation_id LIKE ? OR q.aadhar_no LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (metal) {
      query += ` AND JSON_CONTAINS(q.products, JSON_OBJECT('metal', ?))`;
      params.push(metal);
    }
    
    if (status) {
      query += ` AND q.status = ?`;
      params.push(status);
    }
    
    // ✅ FIX: Add date range filter properly
    if (start_date && end_date) {
      query += ` AND DATE(q.created_at) >= ? AND DATE(q.created_at) <= ?`;
      params.push(start_date, end_date);
    }
    
    // Get total count with same conditions
    const [countResult] = await connection.query(`SELECT COUNT(*) as total ${query}`, params);
    const total = countResult[0].total;
    
    // Apply pagination
    query += ` ORDER BY q.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);
    
    // Get paginated results
    const [rows] = await connection.query(`SELECT q.* ${query}`, params);
    
    return { quotations: rows, total };
    
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};


// Update quotation
const updateQuotation = async (id, updateData) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();

    // Get current quotation data
    const currentQuotation = await getQuotationById(id);
    if (!currentQuotation) {
      throw new Error('Quotation not found');
    }

    // Prepare update fields
    let setClause = [];
    const values = [];

    const fields = [
      'customer_id', 'customer_name', 'aadhar_no', 'pan_no',
      'products', 'total_amount', 'reference', 'reference_person',
      'other_reference', 'remarks', 'status', 'margin_percent', 'updated_by'
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
      `UPDATE quotations SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      values
    );

    await connection.commit();
    return await getQuotationById(id);
  } catch (error) {
    console.error('Error updating quotation service:', error);
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Delete quotation
const deleteQuotation = async (id) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();

    // Delete approval records
    await connection.query(
      `DELETE FROM quotation_approvals WHERE quotation_id = ?`,
      [id]
    );

    // Delete quotation
    await connection.query(
      `DELETE FROM quotations WHERE id = ?`,
      [id]
    );

    await connection.commit();
    return { success: true };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Search quotations
const searchQuotations = async (query, limit = 10) => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT id, quotation_id, customer_name, total_amount, status 
       FROM quotations 
       WHERE customer_name LIKE ? OR quotation_id LIKE ? OR aadhar_no LIKE ?
       LIMIT ?`,
      [`%${query}%`, `%${query}%`, `%${query}%`, parseInt(limit)]
    );
    return rows;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

// Filter quotations
const filterQuotations = async (filters) => {
  const connection = await pool.promise().getConnection();
  try {
    let query = `FROM quotations WHERE 1=1`;
    const params = [];

    // Apply search filter
    if (filters.search) {
      query += ` AND (customer_name LIKE ? OR quotation_id LIKE ? OR aadhar_no LIKE ?)`;
      params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
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
      `SELECT id, quotation_id, customer_name, total_amount, status, created_at
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

// Get metal options
const getMetalOptions = async () => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT id, metalname as name, metal_code as code FROM metals WHERE status = 'active' ORDER BY metalname`
    );
    return rows;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

// Get product options
const getProductOptions = async () => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT id, product_name as name, product_code as code, metal_id 
       FROM products WHERE status = 'active' ORDER BY product_name`
    );
    return rows;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

// Get sub-product options
const getSubProductOptions = async (productId) => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT id, sub_product_name as name, product_id 
       FROM sub_products 
       WHERE product_id = ? AND status = 'active'
       ORDER BY sub_product_name`,
      [productId]
    );
    return rows;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

// Get MCX rates
const getMCXRates = async () => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT * 
       FROM mcx_rates 
       WHERE date = (
         SELECT MAX(date) 
         FROM mcx_rates 
         WHERE date <= CURDATE()
       )`
    );
    return rows;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};
// Update mcx_rate by id
const updateMCXRate = async (id, { origin_price, sub_amt }) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.query(
      `UPDATE mcx_rates 
       SET origin_price = ?, rate = ? - sub_amt, sub_amt = ? 
       WHERE id = ?`,
      [origin_price, JSON.parse(origin_price), sub_amt, id]
    );
    return { success: true };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

// Delete mcx_rate by id
const deleteMCXRate = async (id) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.query(`DELETE FROM mcx_rates WHERE id = ?`, [id]);
    return { success: true };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};



const getMCXRatesAll = async () => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT * 
       FROM mcx_rates
       `
    );
    return rows.reverse();
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};



// Request margin approval
const requestMarginApproval = async (quotationId, userId, { old_margin, new_margin, reason }) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();

    // Create approval request
    await connection.query(
      `INSERT INTO quotation_approvals 
       (quotation_id, requested_by, old_margin, new_margin, reason, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [quotationId, userId, old_margin, new_margin, reason]
    );

    // Update quotation status
    await connection.query(
      `UPDATE quotations 
       SET margin_approval_requested = TRUE, 
           margin_approval_status = 'pending',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [quotationId]
    );

    await connection.commit();
    return { success: true, message: 'Margin change request submitted' };
  } catch (error) {
    console.log('Error requesting margin approval:', error);

    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Approve margin change
const approveMarginChange = async (approvalId, approverId, approvalNotes) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();

    // Get pending approval
    const [approvals] = await connection.query(
      `SELECT * FROM quotation_approvals 
       WHERE id = ? AND status = 'pending'
       ORDER BY created_at DESC LIMIT 1`,
      [approvalId]
    );

    if (approvals.length === 0) {
      throw new Error('No pending approval request found');
    }

    const approval = approvals[0];

    // Update approval record
    await connection.query(
      `UPDATE quotation_approvals 
       SET approved_by = ?, approved_at = CURRENT_TIMESTAMP,
           status = 'approved', approval_notes = ?
       WHERE id = ?`,
      [approverId, approvalNotes, approval.id]
    );

    // Update quotation with new margin
    await connection.query(
      `UPDATE quotations 
       SET margin_percent = ?, 
           margin_approval_status = 'approved',
           margin_approval_requested = FALSE,
           updated_by = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [approval.new_margin, approverId, approval.quotation_id]
    );

    // Recalculate product amounts with new margin
    const quotation = await getQuotationById(approval.quotation_id);
    if (quotation.products) {
      const products = JSON.parse(quotation.products);

      const updatedProducts = products.map(product => {
        const netWeight = (product.gross_weight - product.dust_weight - product.stone_weight) * (product.purity / 100);
        const marginWeight = (netWeight * approval.new_margin) / 100;
        const finalWeight = netWeight - marginWeight;
        const amount = finalWeight * product.mcx_rate;

        return {
          ...product,
          net_weight: netWeight,
          margin_weight: marginWeight,
          final_weight: finalWeight,
          amount: amount
        };
      });

      const total_amount = updatedProducts.reduce((sum, product) => sum + product.amount, 0);

      // Update products and total amount
      await connection.query(
        `UPDATE quotations 
         SET products = ?, total_amount = ?
         WHERE id = ?`,
        [JSON.stringify(updatedProducts), total_amount, approval.quotation_id]
      );
    }

    await connection.commit();
    return { success: true, message: 'Margin change approved' };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Reject margin change
const rejectMarginChange = async (approvalId, approverId, rejectionReason) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();

    // Get pending approval
    const [approvals] = await connection.query(
      `SELECT * FROM quotation_approvals 
       WHERE id = ? AND status = 'pending'
       ORDER BY created_at DESC LIMIT 1`,
      [approvalId]
    );

    if (approvals.length === 0) {
      throw new Error('No pending approval request found');
    }

    const approval = approvals[0];

    // Update approval record
    await connection.query(
      `UPDATE quotation_approvals 
       SET approved_by = ?, approved_at = CURRENT_TIMESTAMP,
           status = 'rejected', rejection_reason = ?
       WHERE id = ?`,
      [approverId, rejectionReason, approval.id]
    );

    // Update quotation status
    await connection.query(
      `UPDATE quotations 
       SET margin_approval_status = 'rejected',
           margin_approval_requested = FALSE,
           updated_by = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [approverId, approval.quotation_id]
    );

    await connection.commit();
    return { success: true, message: 'Margin change rejected' };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Get pending approvals
const getPendingApprovals = async () => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT qa.*, 
       q.quotation_id, q.customer_name, q.metal, q.product,
       u1.username as requested_by_name, u2.username as approved_by_name
       FROM quotation_approvals qa
       JOIN quotations q ON qa.quotation_id = q.id
       LEFT JOIN users u1 ON qa.requested_by = u1.id
       LEFT JOIN users u2 ON qa.approved_by = u2.id
       WHERE qa.status = 'pending'
       ORDER BY qa.created_at DESC`
    );
    return rows;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

// Get approval history
const getApprovalHistory = async (quotationId) => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT qa.*, 
       u1.username as requested_by_name, u2.username as approved_by_name
       FROM quotation_approvals qa
       LEFT JOIN users u1 ON qa.requested_by = u1.id
       LEFT JOIN users u2 ON qa.approved_by = u2.id
       WHERE qa.quotation_id = ?
       ORDER BY qa.created_at DESC`,
      [quotationId]
    );
    return rows;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

// Generate PDF for quotation (optimized for 3-inch thermal printer)
const generateQuotationPDF = async (quotationId) => {
  try {
    // 1. Get Quotation Details
    const quotation = await getQuotationById(quotationId);

    console.log(quotation);


    if (!quotation) {
      throw new Error('Quotation not found');
    }

    // 2. Get Customer Details
    const customer = await getCustomerById(quotation.customer_id);
    if (!customer) {
      throw new Error('Customer not found');
    }

    // 3. Get User Details (created_by/updated_by)
    const user = await getUserById(quotation.created_by || quotation.updated_by);

    // Default company details (for superadmin or when user not found)
    let company = {
      company_name: "AMAYA GOLD POINT",
      address1: "123 Jewel Street",
      city: "Gold City",
      state: "Tamil Nadu",
      pincode: "600001",
      phone: "+91 9876543210",
      email: "info@amayagold.com"
    };

    if (user && user.role !== 'superadmin') {
      const userCompany = await getCompanyById(user.company_id);
      if (userCompany) {
        company = userCompany;
      }
    }

    // 5. Prepare company logo (read from public folder)
    const logoPath = path.join(__dirname, '../../public/company_logo/logo.jpg');
    let companyLogo;
    try {
      const logoFile = fs.readFileSync(logoPath);
      companyLogo = `data:image/jpeg;base64,${logoFile.toString('base64')}`;
    } catch (err) {
      console.warn('Could not load company logo, using default');
      companyLogo = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMTAwIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2ZmYzEwNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiMwMDAiPkF0Y2hheWEgR09MRDwvdGV4dD48L3N2Zz4=";
    }

    // 6. Prepare formatted data
    const formattedData = {
      quotation_id: quotation.id,
      created_at: new Date(quotation.created_at).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      // Company Details
      company_name: company.company_name,
      company_address: `${company.address1}, ${company.city}, ${company.state} - ${company.pincode}`,
      company_phone: company.phone,
      company_email: company.email,
      company_logo: companyLogo,
      branch_name: user ? (user.branch_name || 'Main Branch') : 'Main Branch',
      // Customer Details
      customer_name: customer.customer_name,
      customer_phone: customer.phoneno || 'Not provided',
      customer_email: customer.email || 'Not provided',
      customer_address: customer.address_1 ?
        `${customer.address_1}, ${customer.city}, ${customer.state} - ${customer.pincode}` :
        'Not provided',
      aadhar_no: customer.aadhar_no || 'Not provided',
      pan_no: customer.pan_no || 'Not provided',
      // Product Details
      products: quotation.products.map((p, index) => ({
        sno: index + 1,
        sub_product: p.sub_product || 'Item',
        gross_weight: p.gross_weight.toFixed(3),
        final_weight: p.final_weight.toFixed(3),
        rate: p.rate.toFixed(2),
        amount: p.amount.toFixed(2),
      })),
      total_amount: quotation.total_amount,
      // User who created/updated
      prepared_by: user ? user.username : 'System',
      user_contact: user ? (user.phone || company.phone) : company.phone
    };

    // 7. Generate PDF
    const templatePath = path.join(__dirname, '../templates/quotationTemplate.html');
    const template = fs.readFileSync(templatePath, 'utf8');
    const rendered = Mustache.render(template, formattedData);

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 300, height: 800 });
    await page.setContent(rendered, { waitUntil: 'networkidle0' });
    const height = await page.evaluate(() => {
      return document.documentElement.offsetHeight + 100;
    });

    const pdfBuffer = await page.pdf({
      width: '3in',
      height: `${height}px`,
      printBackground: true,
      margin: {
        top: '0.1in',
        bottom: '0.1in',
        left: '0.1in',
        right: '0.1in'
      }
    });

    await browser.close();

    if (!pdfBuffer || pdfBuffer.length < 100) {
      throw new Error('Generated PDF is invalid');
    }

    return pdfBuffer;
  } catch (err) {
    console.error('PDF Generation Failed:', err);
    throw err;
  }
};

// Generate unique quotation ID
const generateQuotationId = () => {
  const prefix = 'QT';
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${year}${month}${random}`;
};

module.exports = {
  createQuotation,
  getQuotationById,
  getAllQuotations,
  updateQuotation,
  deleteQuotation,
  searchQuotations,
  filterQuotations,
  getMetalOptions,
  getProductOptions,
  getSubProductOptions,
  getMCXRates,
  requestMarginApproval,
  approveMarginChange,
  rejectMarginChange,
  getPendingApprovals,
  getApprovalHistory,
  generateQuotationPDF,
  getMCXRatesAll,
  updateMCXRate,
  deleteMCXRate
};