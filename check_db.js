const pool = require('./src/config/db.config');
pool.query('DESC melt', (err, rows) => {
    if (err) console.error(err);
    else console.log(JSON.stringify(rows));
    process.exit();
});
