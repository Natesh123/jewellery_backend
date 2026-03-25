const mysql = require('mysql2/promise');
require('dotenv').config();

async function alterTable() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    try {
        await connection.query("ALTER TABLE wages_details ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
        console.log("Column added successfully");
    } catch (err) {
        console.error(err.message);
    } finally {
        await connection.end();
    }
}

alterTable();
