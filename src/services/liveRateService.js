const pool = require('../config/db.config');
const { updateMCXRate } = require('../services/quotationService')
// Fetch all live rates
const getLiveRatesFromDB = async () => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(`
      SELECT id, metal_name, carat, live_rate, discount, (live_rate - discount) AS effective_rate, updated_at
      FROM live_rates
      ORDER BY metal_name ASC;
    `);
    return rows;
  } catch (err) {
    console.error('Error fetching live rates:', err);
    throw new Error('Failed to fetch live rates');
  } finally {
    connection.release();
  }
};

const updateLiveRateInDB = async (id, live_rate, discount) => {
  const connection = await pool.promise().getConnection();
  try {
    const [live_rate_row] = await connection.query(
      `SELECT * FROM live_rates WHERE id=?`,
      [parseInt(id)]
    );

    await connection.query(
      `UPDATE live_rates 
       SET live_rate = ?, discount = ?, updated_at = NOW() 
       WHERE id = ?`,
      [live_rate, discount, id]
    );

    const [updated] = await connection.query(
      `SELECT id, metal_name, carat, live_rate, discount, 
              (live_rate - discount) AS effective_rate, updated_at
       FROM live_rates WHERE id = ?`,
      [id]
    );

    console.log("Updated:", JSON.stringify(updated));

    if (live_rate_row[0].carat === "24K") {
      const origin_price = live_rate;
      const currentDate = new Date().toISOString().split("T")[0];

      const [lastRate] = await connection.query(
        `SELECT * FROM mcx_rates ORDER BY id DESC LIMIT 1`
      );

      console.log("Last MCX rate:", lastRate[0]);

      await connection.query(
        `UPDATE mcx_rates 
         SET origin_price = ?,
         rate = ?,
         sub_amt = ?
         WHERE id =?`,
        [origin_price, updated[0].effective_rate, discount, lastRate[0].id]
      );
    }

    return updated[0];
  } catch (err) {
    console.error('Error updating live rate:', err);
    throw new Error('Failed to update live rate');
  } finally {
    connection.release();
  }
};



module.exports = {
  getLiveRatesFromDB,
  updateLiveRateInDB
};
