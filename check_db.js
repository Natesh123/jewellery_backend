const pool = require('./src/config/db.config');

async function checkPledges() {
    const connection = await pool.promise().getConnection();
    try {
        const [rows] = await connection.query('SELECT id, regional_id, regional_status, regional_manager_status, approval_accounts_status FROM pledge_items LIMIT 20');
        console.log('Pledge Items Status:');
        console.table(rows);

        const [users] = await connection.query('SELECT u.id, u.username, u.role, r.name as role_name FROM users u JOIN roles r ON u.role = r.id WHERE u.role IN (2, 6, 7)');
        console.log('\nUsers (Manager, Regional, Accounts):');
        console.table(users);
    } catch (err) {
        console.error(err);
    } finally {
        connection.release();
        process.exit();
    }
}

checkPledges();
