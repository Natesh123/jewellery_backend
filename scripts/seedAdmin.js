require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = require('../src/config/db.config'); 
const bcrypt = require('bcryptjs');
const financialYearUtils = require('../src/utills/financialYear'); 

const {
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  INITIAL_ADMIN_USERNAME,
  INITIAL_ADMIN_EMAIL,
  INITIAL_ADMIN_PASSWORD,
} = process.env;

const createDatabaseAndAdmin = async () => {
  let connection;
  try {
    // Connect to MySQL server (not to a specific DB yet)
    connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
    });

    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
    console.log(`Database '${DB_NAME}' ensured.`);

    // Close initial connection
    await connection.end();

    // Connect to the newly ensured database using a connection pool
    const pool = await mysql.createPool({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // Create users table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT(11) NOT NULL AUTO_INCREMENT,
        username VARCHAR(50) NOT NULL,
        email VARCHAR(100) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('superadmin','admin') NOT NULL DEFAULT 'admin',
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);
    console.log("Table 'users' ensured.");

    // Check if admin already exists
    const [existing] = await pool.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [INITIAL_ADMIN_USERNAME, INITIAL_ADMIN_EMAIL]
    );

    if (existing.length > 0) {
      console.log('Initial admin already exists. Skipping creation.');
    } else {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(INITIAL_ADMIN_PASSWORD, salt);

      // Insert superadmin
      await pool.query(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        [INITIAL_ADMIN_USERNAME, INITIAL_ADMIN_EMAIL, hashedPassword, 'superadmin']
      );

      console.log('Initial superadmin created successfully:');
      console.log('Username:', INITIAL_ADMIN_USERNAME);
      console.log('Email:', INITIAL_ADMIN_EMAIL);
      console.log('Password:', INITIAL_ADMIN_PASSWORD);
    }

    // Create financial_years table with proper timestamp handling
  await pool.query(`
  CREATE TABLE IF NOT EXISTS financial_years (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    starting_year_month DATETIME NOT NULL,
    ending_year_month DATETIME NOT NULL,
    financial_year_code VARCHAR(10),
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX (financial_year_code)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
`);

    console.log("Table 'financial_years' ensured.");

    // Update financial_years table structure if needed
    await financialYearUtils.updateFinancialYearsTable(pool);

    // Create default financial year if none exists
    const currentFYId = await financialYearUtils.getCurrentFinancialYearId(pool);
    console.log(`Current financial year ID: ${currentFYId}`);

    // Close pool
    await pool.end();
  } catch (err) {
    console.error('Error during database setup:', err.message);
    if (connection) await connection.end();
  }
};

createDatabaseAndAdmin();