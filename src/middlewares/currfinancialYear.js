const pool = require('../config/db.config');

const getCurrentFinancialYear = async (req, res) => {
  try {
    // Get current date in YYYY-MM-DD format
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Query to find active financial year that includes current date
    const [rows] = await pool.promise().query(
      `SELECT id, starting_year_month, ending_year_month 
       FROM financial_years 
       WHERE ? BETWEEN starting_year_month AND ending_year_month 
       AND is_active = 1 
       LIMIT 1`,
      [currentDate]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active financial year found for the current date'
      });
    }

    return rows[0].id; 
 

  } catch (error) {
    console.error('Error fetching current financial year:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch current financial year',
      error: error.message
    });
  }
};

module.exports = {
  getCurrentFinancialYear
};