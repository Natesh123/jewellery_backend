const pool = require('../config/db.config');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const bwipjs = require('bwip-js');
const { getCustomerById } = require('../services/customerService');
const { getUserById } = require('../services/userService');
const { x } = require('pdfkit');


const createMeltProducts = async (data) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();

    const purchasesArray = JSON.parse(data.purchases);
    await connection.query(
      `INSERT INTO melt (purchases, weight) VALUES (?, ?)`,
      [data.purchases, data.total_weight]
    );

    for (let item of purchasesArray) {
      await connection.query(
        `UPDATE stock SET melt_status = 'completed' WHERE id = ?`,
        [item.purchase_record_id]
      );
    }


    await connection.commit();
    return { message: "Melting created and stock updated successfully" };
  } catch (error) {
    console.error("Error in createMeltingPurchase:", error);
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};




const createSalesPayment = async (id, paymentData) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();
    const paymentSql = `
    INSERT INTO sales_payments (
      melt_id, 
      user_id, 
      user_name, 
      payment_type, 
      total_payment, 
      completed_payment, 
      pending_payment, 
      transaction_id, 
      cheque_number, 
      bank_name
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

    const paymentValues = [
      id, // melt_id
      paymentData.user_id || 0, // user_id
      paymentData.user_name || 'System', // user_name
      paymentData.payment_type, // payment_type
      paymentData.total_amount?.toString() || '0', // total_payment
      paymentData.completed_payment?.toString() || '0', // completed_payment
      paymentData.pending_payment?.toString() || '0', // pending_payment
      paymentData.transaction_id || null, // transaction_id
      paymentData.cheque_number || null, // cheque_number
      paymentData.bank_name || null
    ];

    await connection.query(paymentSql, paymentValues);
    await connection.commit();
    return { message: "Record copied to melting_purchase successfully" };
  } catch (error) {
    console.error("Error in createMeltingPurchase:", error);
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};


const updateMeltProduct = async (id, data) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();

    const allowedFields = [
      "metal",
      "product",
      "sub_product",
      "purchases",
      "weight",
      "status",
      "product_type",
      "melt_weight",
      "assign_customer",
      "assign_customer_name",
      "assign_customer_payment_type",
      "assigned_at",
      "wages"
    ];
    const fields = [];
    const values = [];

    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    }

    if (fields.length === 0) {
      throw new Error("No valid fields provided for update");
    }

    const sql = `UPDATE melt SET ${fields.join(", ")} WHERE id = ?`;
    values.push(id);

    await connection.query(sql, values);

    // Check if assign_customer is being set and payment details are provided
    if (data.assign_customer !== undefined && data.payment_details) {
      const paymentData = data.payment_details;

      // Insert into sales_payments table
      const paymentSql = `
        INSERT INTO sales_payments (
          melt_id, 
          user_id, 
          user_name, 
          payment_type, 
          total_payment, 
          completed_payment, 
          pending_payment, 
          transaction_id, 
          cheque_number, 
          bank_name
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const paymentValues = [
        id, // melt_id
        paymentData.user_id || 0, // user_id
        paymentData.user_name || 'System', // user_name
        paymentData.payment_type, // payment_type
        paymentData.total_amount?.toString() || '0', // total_payment
        paymentData.paid_amount?.toString() || '0', // completed_payment
        paymentData.due_amount?.toString() || '0', // pending_payment
        paymentData.transaction_id || null, // transaction_id
        paymentData.cheque_number || null, // cheque_number
        paymentData.bank_name || null
      ];

      await connection.query(paymentSql, paymentValues);
    }

    await connection.commit();
    return { message: "Melt record updated successfully" };
  } catch (error) {
    console.error("Error in updateMeltProduct:", error);
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};


const getAllSmith = async () => {
  const connection = await pool.promise().getConnection();
  let baseQuery = `SELECT * FROM account_head_creation WHERE group_code='S09'`;
  try {
    const [rows] = await connection.query(baseQuery)
    return { data: rows }
  } catch (error) {
    console.error("Error in getAllSmith :", error)
  }
}


const getAllWages = async (req) => {
  const connection = await pool.promise().getConnection();
  
  try {
    const baseQuery = `SELECT * FROM melt WHERE assign_smith_name = ? AND wages_status = 0`;
    const sumQuery = `SELECT SUM(total_wage) as totalWages FROM melt WHERE assign_smith_name = ? AND wages_status = 0`;
    const baseQuery2 = `SELECT * FROM wages_details WHERE assign_smith_name = ?`;

    const [rows] = await connection.query(baseQuery, [req.assign_smith_name]);
    const [sumRows] = await connection.query(sumQuery, [req.assign_smith_name]);
    const [rows2] = await connection.query(baseQuery2, [req.assign_smith_name]);

    return {
      totalWages: sumRows[0].totalWages || 0,
      data: rows,
      history: rows2
    };

  } catch (error) {
    console.error("Error in getAllSmith :", error);
    throw error;
  } finally {
    connection.release();
  }
};



const updateWages = async (req) => {
  const connection = await pool.promise().getConnection();

  try {
    await connection.beginTransaction();

    // 1️⃣ Get pending wages
    const selectQuery = `
      SELECT * FROM melt 
      WHERE assign_smith_name = ? AND wages_status = 0
    `;

    const [rows] = await connection.query(selectQuery, [req.assign_smith_name]);

    // 2️⃣ Calculate total wages
    let totalWages = 0;
    rows.forEach(row => {
      totalWages += parseFloat(row.total_wage) || 0;
    });

    // 3️⃣ Update melt table
    const updateQuery = `
      UPDATE melt 
      SET wages_status = 1 
      WHERE assign_smith_name = ? AND wages_status = 0
    `;
    await connection.query(updateQuery, [req.assign_smith_name]);

    // 4️⃣ Insert into wages_details
    const insertQuery = `
      INSERT INTO wages_details 
      (amount, description, balanceAmt, assign_smith_name, mode)
      VALUES (?, ?, ?, ?, ?)
    `;

    await connection.query(insertQuery, [
      totalWages,
      req.description || "Wages Paid",
      req.balanceAmt || 0,
      req.assign_smith_name,
      req.mode || "cash"
    ]);

    await connection.commit();

    return {
      message: "Wages Updated Successfully",
      totalWages
    };

  } catch (error) {
    await connection.rollback();
    console.error("Error in updateWages :", error);
    throw error;
  } finally {
    connection.release();
  }
};





const getAllMeltProducts = async ({
  page = 1,
  limit = 10,
  search = "",
  metal,
  status,
  startDate,
  endDate
}) => {
  const connection = await pool.promise().getConnection();
  try {
    const offset = (page - 1) * limit;

    let baseQuery = `SELECT * FROM melt WHERE 1=1`;
    let countQuery = `SELECT COUNT(*) AS total FROM melt WHERE 1=1`;
    const params = [];

    // Optional filters
    if (search) {
      baseQuery += ` AND (purchases LIKE ? OR metal LIKE ? OR status LIKE ?)`;
      countQuery += ` AND (purchases LIKE ? OR metal LIKE ? OR status LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (metal) {
      baseQuery += ` AND metal = ?`;
      countQuery += ` AND metal = ?`;
      params.push(metal);
    }
    if (status !== undefined && status !== '') {
      baseQuery += ` AND status = ?`;
      countQuery += ` AND status = ?`;
      params.push(status);
    }
    if (startDate && endDate) {
      baseQuery += ` AND DATE(created_at) BETWEEN ? AND ?`;
      countQuery += ` AND DATE(created_at) BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    }


    baseQuery += ' AND assign_smith_name IS NULL';

    // Add ORDER BY to show latest first
    baseQuery += ` ORDER BY created_at DESC`;

    // Add pagination
    baseQuery += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    // Run queries
    const [rows] = await connection.query(baseQuery, params);
    const [countResult] = await connection.query(countQuery, params.slice(0, -2)); // exclude limit & offset

    return {
      purchases: rows,
      total: countResult[0].total
    };

  } catch (error) {
    console.error("Error in getAllMeltProducts:", error);
    throw error;
  } finally {
    connection.release();
  }
};


const getAllMeltReceiptProducts = async ({
  page = 1,
  limit = 10,
  search = "",
  metal,
  status,
  startDate,
  endDate
}) => {
  const connection = await pool.promise().getConnection();
  try {
    const offset = (page - 1) * limit;
    
    let baseQuery = `SELECT * FROM melt WHERE 1=1`;
    let countQuery = `SELECT COUNT(*) AS total FROM melt WHERE 1=1`;
    const params = [];

    // Optional filters
    if (search) {
      baseQuery += ` AND (purchases LIKE ? OR metal LIKE ? OR status LIKE ?)`;
      countQuery += ` AND (purchases LIKE ? OR metal LIKE ? OR status LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (metal) {
      baseQuery += ` AND metal = ?`;
      countQuery += ` AND metal = ?`;
      params.push(metal);
    }
    if (status !== undefined && status !== '') {
      baseQuery += ` AND status = ?`;
      countQuery += ` AND status = ?`;
      params.push(status);
    }
    if (startDate && endDate) {
      baseQuery += ` AND DATE(created_at) BETWEEN ? AND ?`;
      countQuery += ` AND DATE(created_at) BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    }

    baseQuery += ' AND assign_smith_name IS NOT NULL';

    // Add ORDER BY to show latest first
    baseQuery += ` ORDER BY created_at DESC`;

    // Add pagination
    baseQuery += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    // Run queries
    const [rows] = await connection.query(baseQuery, params);
    const [countResult] = await connection.query(countQuery, params.slice(0, -2)); // exclude limit & offset

    return {
      purchases: rows,
      total: countResult[0].total
    };

  } catch (error) {
    console.error("Error in getAllMeltProducts:", error);
    throw error;
  } finally {
    connection.release();
  }
};

const getAllSalesPayments = async ({ metal }) => {
  const connection = await pool.promise().getConnection();
  try {
    let query = `SELECT * FROM sales_payments WHERE 1=1`;
    const params = [];

    if (metal) {
      query += ` AND melt_id = ?`;
      params.push(metal);
    }

    const [rows] = await connection.query(query, params);
    return { purchases: rows };
  } catch (error) {
    console.error("Error in getAllSalesPayments:", error);
    throw error;

  } finally {
    connection.release();

  }
};


const createMeltingPurchase = async (id) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();
    const [insertResult] = await connection.query(`
        INSERT INTO melting_purchase (
          quotation_id, purchase_id, customer_id, customer_name, aadhar_no, pan_no,
          products, total_amount, bill_copy, ornament_photo, reference,
          reference_person, other_reference, remarks, status, margin_percent,
          payment_method, barcode, barcode_path, qr_data, qr_code_path,
          bill_pdf_path, created_by, updated_by, financial_id,
          user_capture, bref_no, payment_details, pledge_status,
          regional_status, accounts_status, company_code, branch_id,
          collected_status, accounts_id
        )
        SELECT 
          quotation_id, purchase_id, customer_id, customer_name, aadhar_no, pan_no,
          products, total_amount, bill_copy, ornament_photo, reference,
          reference_person, other_reference, remarks, status, margin_percent,
          payment_method, barcode, barcode_path, qr_data, qr_code_path,
          bill_pdf_path, created_by, updated_by, financial_id,
          user_capture, CONCAT('BREF', id), payment_details, pledge_status,
          regional_status, accounts_status, company_code, branch_id,
          collected_status, accounts_id
        FROM purchases
        WHERE id = ?
      `, [id]);
    await connection.query(`UPDATE purchases SET melting_status = 1 WHERE id = ?`, [id]);

    await connection.commit();

    return { message: "Record copied to melting_purchase successfully", insertId: insertResult.insertId };

  } catch (error) {
    console.error("Error in createMeltingPurchase:", error);
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
const getAllkMeltingPurchases = async ({ page, limit, search, metal, status }) => {
  const connection = await pool.promise().getConnection();
  let whereClause = 'WHERE 1=1';
  const params = [];

  if (search) {
    whereClause += ' AND (customer_name LIKE ? OR purchase_id LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (metal) {
    whereClause += ' AND products LIKE ?';
    params.push(`%${metal}%`);
  }
  if (status) {
    whereClause += ' AND status = ?';
    params.push(status);
  }

  const offset = (page - 1) * limit;

  const [purchases] = await connection.query(
    `SELECT * FROM melting_purchase ${whereClause} ORDER BY id DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const [[{ total }]] = await connection.query(
    `SELECT COUNT(*) AS total FROM melting_purchase ${whereClause}`,
    params
  );


  for (const purchase of purchases) {
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
  return { purchases, total };

};

const getAllMeltPurchases = async ({ page, limit, search, metal, status }) => {
  const connection = await pool.promise().getConnection();
  let whereClause = 'WHERE 1=1';
  const params = [];

  if (search) {
    whereClause += ' AND (s.customer_name LIKE ? OR s.purchase_id LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (metal) {
    whereClause += ' AND s.products LIKE ?';
    params.push(`%${metal}%`);
  }
  if (status) {
    whereClause += ' AND s.status = ?';
    params.push(status);
  }

  whereClause += ' AND s.purchase_id IN (SELECT purchase_id FROM melting_purchase)';


  whereClause += ' AND s.melt_status = "pending"';

  const offset = (page - 1) * limit;

  const [purchases] = await connection.query(
    `
    SELECT s.*
    FROM stock s
    ${whereClause}
    ORDER BY s.id DESC
    LIMIT ? OFFSET ?
    `,
    [...params, limit, offset]
  );


  const [[{ total }]] = await connection.query(
    `
    SELECT COUNT(*) AS total
    FROM stock s
    ${whereClause}
    `,
    params
  );

  for (const purchase of purchases) {
    try {
      purchase.products = purchase.products ? JSON.parse(purchase.products) : [];
    } catch {
      purchase.products = [];
    }
  }

  return { purchases, total };
};


const updatePurchaseAccountsStatus = async (id, updateData) => {
  const connection = await pool.promise().getConnection();
  try {
    const setClause = [];
    const values = [];

    if (updateData.collect_accounts_status !== undefined) {
      setClause.push("collect_accounts_status = ?");
      values.push(updateData.collect_accounts_status);
    }


    values.push(id);

    await connection.query(
      `UPDATE melting_purchase 
         SET ${setClause.join(", ")}, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
      values
    );

    return { success: true, purchase_id: id }; // returning purchase table ID
  } finally {
    connection.release();
  }
};


const updatePurchaseMeltingStatus = async (id, updateData) => {
  const connection = await pool.promise().getConnection();
  try {
    const setClause = [];
    const values = [];

    if (updateData.melting_status !== undefined) {
      setClause.push("melting_status = ?");
      values.push(updateData.melting_status); // int column
    }

    if (updateData.purity_type !== undefined) {
      setClause.push("purity_type = ?");
      values.push(updateData.purity_type); // varchar column
    }

    if (updateData.copper_percentage !== undefined) {
      setClause.push("copper_percentage = ?");
      values.push(updateData.copper_percentage); // keep as string
    }

    if (updateData.total_calculated_weight !== undefined) {
      setClause.push("total_calculated_weight = ?");
      values.push(updateData.total_calculated_weight);
    }

    if (updateData.melting_products !== undefined) {
      const meltingProducts = updateData.melting_products
      setClause.push("melting_products = ?");
      values.push(JSON.stringify(meltingProducts));
    }

    if (setClause.length === 0) {
      throw new Error("No valid fields to update");
    }

    values.push(id);
    await connection.query(
      `UPDATE melting_purchase 
         SET ${setClause.join(", ")}, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
      values
    );

    return { success: true, purchase_id: id };
  } finally {
    connection.release();
  }
};


const updatePurchaseMeltingProduct = async (id, updateData) => {
  const connection = await pool.promise().getConnection();
  try {
    const setClause = [];
    const values = [];

    if (updateData.melting_status !== undefined) {
      setClause.push("melting_status = ?");
      values.push(updateData.melting_status);
    }

    if (updateData.purity_type !== undefined) {
      setClause.push("purity_type = ?");
      values.push(updateData.purity_type);
    }

    if (updateData.copper_percentage !== undefined) {
      setClause.push("copper_percentage = ?");
      values.push(updateData.copper_percentage);
    }

    if (updateData.total_calculated_weight !== undefined) {
      setClause.push("total_calculated_weight = ?");
      values.push(updateData.total_calculated_weight);
    }

    if (updateData.melting_products !== undefined) {
      const meltingProductsString = JSON.stringify(updateData.melting_products);
      setClause.push("melting_products = ?");
      values.push(meltingProductsString);
    }
    values.push(id);

    await connection.query(
      `UPDATE melting_purchase 
         SET ${setClause.join(", ")}, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
      values
    );

    return { success: true, purchase_id: id };
  } finally {
    connection.release();
  }
};

const getMeltPurchaseById = async (id) => {
  const connection = await pool.promise().getConnection();
  const [rows] = await connection.query(
    `SELECT * FROM melting_purchase WHERE id = ?`,
    [id]
  );
  return rows.length ? rows[0] : null;
};

const updateMeltDetails = async (id, updateData) => {
  const connection = await pool.promise().getConnection();
  try {
    const setClause = [];

    const values = [];

    if (updateData.melt_weight !== undefined) {
      setClause.push("melt_weight = ?");
      values.push(updateData.melt_weight);
    }

    if (updateData.metal !== undefined) {
      setClause.push("metal = ?");
      values.push(updateData.metal);
    }
    if (updateData.product !== undefined) {
      setClause.push("product = ?");
      values.push(updateData.product);

    }
    if (updateData.sub_product !== undefined) {
      setClause.push("sub_product = ?");
      values.push(updateData.sub_product);
    }

    if (updateData.total_wage !== undefined) {
      setClause.push("total_wage = ?");
      values.push(updateData.total_wage);
    }
    if (updateData.melt_details !== undefined) {
      setClause.push("metal_details = ?");
      values.push(updateData.melt_details);
    }

    if (updateData.assign_smith_name !== undefined) {
      setClause.push("assign_smith_name = ?");
      values.push(updateData.assign_smith_name);
    }

    if (setClause.length === 0) {
      throw new Error("No valid fields to update");
    }

    values.push(id);

    await connection.query(`UPDATE melt SET ${setClause.join(", ")}, assigned_at = CURRENT_TIMESTAMP WHERE id = ?`, values);

  } finally {
    connection.release();
  }
}

const updateWagesDetails = async (id, updateData) => {
  console.log("-----", updateData);

  const connection = await pool.promise().getConnection();
  try {
    const setClause = [];
    const values = [];

    if (updateData.total_wages !== undefined) {
      setClause.push("total_wage = ?");
      values.push(updateData.total_wages)
    }

    if (updateData.wages_history !== undefined) {
      setClause.push("wages_history = ?");
      values.push(updateData.wages_history)
    }

    if (setClause.length === 0) {
      throw new Error("No valid fields to update");
    }

    values.push(id);

    await connection.query(`UPDATE melt SET ${setClause.join(", ")} WHERE id = ?`, values);

  } finally {
    connection.release();
  }
}

module.exports = {
  createMeltingPurchase,
  getAllMeltPurchases,
  updatePurchaseAccountsStatus,
  updatePurchaseAccountsStatus,
  getMeltPurchaseById,
  updatePurchaseMeltingStatus, createMeltProducts,
  getAllMeltProducts,
  updateMeltProduct,
  getAllSalesPayments, createSalesPayment,
  getAllkMeltingPurchases,
  updateMeltDetails,
  updateWagesDetails,
  getAllMeltReceiptProducts,
  getAllSmith,
  getAllWages,
  updateWages

};