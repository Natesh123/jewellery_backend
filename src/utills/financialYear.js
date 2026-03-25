// financialYearUtils.js
const mysql = require('mysql2/promise');

/**
 * Get current financial year ID (creates if doesn't exist)
 * @param {Pool} pool - MySQL connection pool
 * @returns {Promise<number>} - Financial year ID
 */
async function getCurrentFinancialYearId(pool) {
    try {
        // Get current date
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1; // Months are 0-indexed

        // Determine financial year (April to March)
        let financialYearStart, financialYearEnd, financialYearCode;
        
        if (currentMonth >= 4) { // April or later
            financialYearStart = new Date(`${currentYear}-04-01T00:00:00`);
            financialYearEnd = new Date(`${currentYear + 1}-03-31T23:59:59`);
            financialYearCode = `${currentYear.toString().slice(-2)}-${(currentYear + 1).toString().slice(-2)}`;
        } else { // January-March
            financialYearStart = new Date(`${currentYear - 1}-04-01T00:00:00`);
            financialYearEnd = new Date(`${currentYear}-03-31T23:59:59`);
            financialYearCode = `${(currentYear - 1).toString().slice(-2)}-${currentYear.toString().slice(-2)}`;
        }

        // Check if financial year exists
        const [existing] = await pool.query(
            `SELECT id FROM financial_years 
             WHERE starting_year_month = ? AND ending_year_month = ?`,
            [financialYearStart, financialYearEnd]
        );

        if (existing.length > 0) {
            return existing[0].id;
        }

        // Create new financial year if doesn't exist
        const [result] = await pool.query(
            `INSERT INTO financial_years 
             (starting_year_month, ending_year_month, financial_year_code, is_active, created_at) 
             VALUES (?, ?, ?, TRUE, NOW())`,
            [financialYearStart, financialYearEnd, financialYearCode]
        );

        return result.insertId;

    } catch (error) {
        console.error('Error in getCurrentFinancialYearId:', error);
        throw error;
    }
}

/**
 * Get financial year ID by date
 * @param {Pool} pool - MySQL connection pool
 * @param {Date} date - Date to check
 * @returns {Promise<number>} - Financial year ID
 */
async function getFinancialYearIdByDate(pool, date) {
    try {
        const [result] = await pool.query(
            `SELECT id FROM financial_years 
             WHERE ? BETWEEN starting_year_month AND ending_year_month 
             LIMIT 1`,
            [date]
        );

        if (result.length > 0) {
            return result[0].id;
        }

        // If no matching financial year found, create based on the provided date
        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        let financialYearStart, financialYearEnd, financialYearCode;
        
        if (month >= 4) { // April or later
            financialYearStart = new Date(`${year}-04-01T00:00:00`);
            financialYearEnd = new Date(`${year + 1}-03-31T23:59:59`);
            financialYearCode = `${year.toString().slice(-2)}-${(year + 1).toString().slice(-2)}`;
        } else { // January-March
            financialYearStart = new Date(`${year - 1}-04-01T00:00:00`);
            financialYearEnd = new Date(`${year}-03-31T23:59:59`);
            financialYearCode = `${(year - 1).toString().slice(-2)}-${year.toString().slice(-2)}`;
        }

        const [insertResult] = await pool.query(
            `INSERT INTO financial_years 
             (starting_year_month, ending_year_month, financial_year_code, created_at) 
             VALUES (?, ?, ?, NOW())`,
            [financialYearStart, financialYearEnd, financialYearCode]
        );

        return insertResult.insertId;

    } catch (error) {
        console.error('Error in getFinancialYearIdByDate:', error);
        throw error;
    }
}

/**
 * Get financial year ID by created_at date from any table
 * @param {Pool} pool - MySQL connection pool
 * @param {string} tableName - Table name to check created_at
 * @param {number} recordId - Record ID to get created_at date
 * @returns {Promise<number>} - Financial year ID
 */
async function getFinancialYearIdByRecord(pool, tableName, recordId) {
    try {
        // First get the created_at date from the record
        const [record] = await pool.query(
            `SELECT created_at FROM ${tableName} WHERE id = ?`,
            [recordId]
        );

        if (record.length === 0) {
            throw new Error(`Record not found in table ${tableName} with ID ${recordId}`);
        }

        const createdAt = new Date(record[0].created_at);
        return await getFinancialYearIdByDate(pool, createdAt);

    } catch (error) {
        console.error('Error in getFinancialYearIdByRecord:', error);
        throw error;
    }
}

/**
 * Update financial_years table structure to include financial_year_code
 * @param {Pool} pool - MySQL connection pool
 */
async function updateFinancialYearsTable(pool) {
    try {
        // Check if column already exists
        const [columns] = await pool.query(
            `SHOW COLUMNS FROM financial_years LIKE 'financial_year_code'`
        );

        if (columns.length === 0) {
            await pool.query(
                `ALTER TABLE financial_years 
                 ADD COLUMN financial_year_code VARCHAR(10) AFTER ending_year_month`
            );
            console.log('Added financial_year_code column to financial_years table');
        }

        // Update existing records with financial year codes if they're null
        const [years] = await pool.query(
            `SELECT id, starting_year_month FROM financial_years 
             WHERE financial_year_code IS NULL`
        );

        for (const year of years) {
            const startDate = new Date(year.starting_year_month);
            const startYear = startDate.getFullYear();
            const endYear = startYear + 1;
            const code = `${startYear.toString().slice(-2)}-${endYear.toString().slice(-2)}`;

            await pool.query(
                `UPDATE financial_years SET financial_year_code = ? WHERE id = ?`,
                [code, year.id]
            );
        }

    } catch (error) {
        console.error('Error in updateFinancialYearsTable:', error);
        throw error;
    }
}

module.exports = {
    getCurrentFinancialYearId,
    getFinancialYearIdByDate,
    getFinancialYearIdByRecord,
    updateFinancialYearsTable
};