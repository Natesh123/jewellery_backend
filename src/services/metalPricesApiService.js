const pool = require('../config/db.config');

const metalPriceAPIConfiguration = require('../config/metalPriceApiConfig');
const { apiBase, endPoints, defaultBaseCurrency, defaultUnit, supportedMetals, getAPIKey, resultMappings } = metalPriceAPIConfiguration;

const fetchAndStoreMetalPrices = async () => {
  const result = await getLatestMetalPrices();
  const prices = formatResponse(result);
  await storeMetalPrice(prices);
  return prices;
};

const getLatestMetalPrices = async () => {
  const apiUrl = `${apiBase}${endPoints.latest}?api_key=${getAPIKey()}&base=${defaultBaseCurrency}&currencies=${supportedMetals.join(',')}&unit=${defaultUnit}`;
  console.log(apiUrl)
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(`Error fetching metal prices: ${response.statusText}`);
  }

  const result = await response.json();
  if (!result || !result.success) {
    throw new Error('Failed to fetch metal prices from API');
  }

  return result;
}

const formatResponse = (response) => {
  const { rates } = response;

  const gold_24k_price = rates[resultMappings['gold_24k_price']];
  const silver_price = rates[resultMappings['silver_price']];

  return [
    {
      metal: 'gold',
      carat: '24K',
      price: gold_24k_price || 0,
      currency: defaultBaseCurrency
    },
    {
      metal: 'gold',
      carat: '22K',
      price: gold_24k_price || 0,
      currency: defaultBaseCurrency
    },
    {
      metal: 'silver',
      carat: '999',
      price: silver_price || 0,
      currency: defaultBaseCurrency
    },
  ]
};

const getGold22KPrice = (gold24KPrice) => {
  if (!gold24KPrice) {
    throw new Error('Gold 24K price is required to calculate 22K price');
  }
  // 22K gold is 91.67% pure, so we multiply the 24K price by 22/24
  return gold24KPrice * (22 / 24);
}

// const storeMetalPrice = async (data) => {
//   const connection = await pool.promise().getConnection();
//   try {
//     await Promise.all(data.map(async (item) => {
//       const { metal, carat, price, currency } = item;

//       const [rows] = await connection.query(
//         `SELECT id FROM metal_prices 
//          WHERE metal = ? AND carat = ? AND DATE(fetched_at) = CURDATE()`,
//         [metal, carat]
//       );

//       if (rows.length > 0) {
//         await connection.query(
//           `UPDATE metal_prices 
//            SET price = ?, currency = ?, fetched_at = NOW() 
//            WHERE id = ?`,
//           [price, currency, rows[0].id]
//         );
//       } else {
//         await connection.query(
//           `INSERT INTO metal_prices (metal, carat, price, currency, fetched_at) 
//            VALUES (?, ?, ?, ?, NOW())`,
//           [metal, carat, price, currency]
//         );
//       }
//     }));



//     await connection.query(
//       `DELETE FROM metal_prices WHERE fetched_at < DATE_SUB(NOW(), INTERVAL 20 DAY)`
//     );

//   } catch (error) {
//     console.error('Error storing metal prices:', error);
//     throw new Error(`Failed to store metal prices: ${error.message}`);
//   } finally {
//     connection.release();
//   }
// };

const storeMetalPrice = async (data) => {
  const connection = await pool.promise().getConnection();
  try {
    await Promise.all(
      data.map(async (item) => {
        const { metal, carat, price, currency } = item;

        // 1️⃣ Insert or update into metal_prices
        const [rows] = await connection.query(
          `SELECT id FROM metal_prices 
           WHERE metal = ? AND carat = ? AND DATE(fetched_at) = CURDATE()`,
          [metal, carat]
        );

        if (rows.length > 0) {
          await connection.query(
            `UPDATE metal_prices 
             SET price = ?, currency = ?, fetched_at = NOW() 
             WHERE id = ?`,
            [price, currency, rows[0].id]
          );
        } else {
          await connection.query(
            `INSERT INTO metal_prices (metal, carat, price, currency, fetched_at) 
             VALUES (?, ?, ?, ?, NOW())`,
            [metal, carat, price, currency]
          );
        }

        // 2️⃣ Sync latest price to live_rates table
        const [existingRate] = await connection.query(
          `SELECT id FROM live_rates WHERE metal_name = ? AND carat = ?`,
          [metal, carat]
        );

        if (existingRate.length > 0) {
          // Update live_rate (effective_rate auto updates)
          await connection.query(
            `UPDATE live_rates 
             SET live_rate = ?, updated_at = NOW() 
             WHERE id = ?`,
            [price, existingRate[0].id]
          );
        } else {
          // Insert new record in live_rates
          await connection.query(
            `INSERT INTO live_rates (metal_name, carat, live_rate, discount) 
             VALUES (?, ?, ?, 0)`,
            [metal, carat, price]
          );
        }
      })
    );

    // 3️⃣ Optional cleanup of old metal_prices
    await connection.query(
      `DELETE FROM metal_prices WHERE fetched_at < DATE_SUB(NOW(), INTERVAL 20 DAY)`
    );

  } catch (error) {
    console.error('Error storing metal prices:', error);
    throw new Error(`Failed to store metal prices: ${error.message}`);
  } finally {
    connection.release();
  }
};



async function getLatestMetalPrices2() {
  const apiUrl = `${apiBase}${endPoints.latest}?api_key=${getAPIKey()}&base=${defaultBaseCurrency}&currencies=${supportedMetals.join(',')}&unit=${defaultUnit}`;
  let lastError;
  for (let i = 0; i < 3; i++) {
    try {
      const response = await fetch(apiUrl, { timeout: 10000 });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      if (!result || !result.success) throw new Error("Invalid API response");
      return result;
    } catch (err) {
      lastError = err;
      console.warn(`Retry ${i + 1} failed:`, err.message);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  throw lastError;
}
const getMetalPriceFromDatabase2 = async () => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(`
      SELECT mp.metal, mp.carat, mp.price, mp.currency, mp.fetched_at 
      FROM metal_prices mp 
      INNER JOIN (
        SELECT metal, carat, MAX(fetched_at) as latest_time 
        FROM metal_prices 
        GROUP BY metal, carat
      ) latest 
      ON mp.metal = latest.metal 
      AND mp.carat = latest.carat 
      AND mp.fetched_at = latest.latest_time
    `);

    const currentDate = new Date().toISOString().split("T")[0];
    const [mcx_rate] = await connection.query(
      `SELECT * FROM mcx_rates WHERE date = ? AND metal_name='Gold'`,
      [currentDate]
    );

    return rows.map(i => {
      if (i.metal.toLowerCase() === "gold" && mcx_rate.length > 0) {
        return { ...i, price: i.price - mcx_rate[0].sub_amt };
      }
      return i;
    });

  } finally {
    connection.release();
  }
};





const getMetalPriceFromDatabase = async () => {
  const connection = await pool.promise().getConnection();
  try {

    const [row] = await connection.query(`
      SELECT mp.metal, mp.carat, mp.price, mp.currency, mp.fetched_at 
      FROM metal_prices mp 
      INNER JOIN (
        SELECT metal, carat, MAX(fetched_at) as latest_time 
        FROM metal_prices 
        GROUP BY metal, carat
      ) latest 
      ON mp.metal = latest.metal 
      AND mp.carat = latest.carat 
      AND mp.fetched_at = latest.latest_time
    `);

    for (let i of row) {
      const MetalDate = new Date(i.fetched_at).toISOString().split("T")[0];
      const currentDate = new Date().toISOString().split("T")[0];

      if (MetalDate === currentDate) {
        const [rows] = await connection.query(`SELECT * FROM metals`);

        let findData = rows.find(
          (_data) => _data.metalname.toLowerCase() === i.metal.toLowerCase()
        );

        if (findData) {
          const [exists] = await connection.query(
            `SELECT * FROM mcx_rates WHERE metal = ? AND date = ? LIMIT 1`,
            [findData.id, MetalDate]
          );

          if (exists.length === 0) {
            await connection.query(
              `INSERT INTO mcx_rates (metal, metal_name, origin_price, rate, sub_amt, date) 
               VALUES (?, ?, ?, ?, ?, ?)`,
              [findData.id, findData.metalname, i.price, i.price, 0, MetalDate]
            );
          } else {
            await connection.query(
              `UPDATE mcx_rates 
               SET origin_price = ?, rate = ? - sub_amt 
               WHERE metal = ? AND date = ?`,
              [i.price, i.price, findData.id, MetalDate]
            );
          }
        }
      }
    }


    return row;
  } catch (error) {
    console.error('Error fetching metal prices from database:', error);
    throw new Error(`Failed to fetch metal prices: ${error.message}`);
  } finally {
    connection.release();
  }
};


module.exports = {
  fetchAndStoreMetalPrices,
  getMetalPriceFromDatabase,
  getMetalPriceFromDatabase2,
  getLatestMetalPrices2
};