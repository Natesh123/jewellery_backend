const mysql = require('mysql2/promise');
require('dotenv').config();
async function main() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });
    const [rows] = await connection.execute('DESC melt');
    console.log(JSON.stringify(rows, null, 2));
    await connection.end();
}
main().catch(console.error);
