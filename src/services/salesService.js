
const pool = require('../config/db.config');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const { getCurrentFinancialYear } = require('../middlewares/currfinancialYear');


const getAllProducts = async (fromDate, toDate) => {
  const connection = await pool.promise().getConnection();

  const query = `
    SELECT id,products, quotation_id, customer_name, total_amount, created_at, 'stock' AS source
    FROM stock
    WHERE melt_status='pending'
    AND DATE(created_at) BETWEEN ? AND ?

    UNION ALL

    SELECT id,products, quotation_id, customer_name, total_amount, created_at, 'melting_purchase' AS source
    FROM melting_purchase
    WHERE DATE(created_at) BETWEEN ? AND ?

    ORDER BY created_at DESC
  `;

  try {
    const [rows] = await connection.query(query, [fromDate, toDate, fromDate, toDate]);
    return { data: rows };
  } catch (error) {
    console.error("Error in getAllProducts:", error);
  } finally {
    connection.release();
  }
};



const createSales=async(salesData,customerId)=>{
    const connection = await pool.promise().getConnection();
    const query=`INSERT INTO sales (customer_id, products, total_amount,purchase_id) VALUES (?, ?, ?)`;
    const values=[customerId, salesData.products, salesData.total_amount];
    try {
        const [rows] = await connection.query(query, values);
        return { data: rows };
    } catch (error) {
        console.error("Error in createSales:", error);
    } finally {
        connection.release();
    }
}