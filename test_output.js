const pool = require('./src/config/db.config');

function safeJSONParse(str) {
    try { return JSON.parse(str); } catch (e) { return []; }
}

const getAllAccountsApprovalPledges = async (page = 1, limit = 10, id) => {
    const connection = await pool.promise().getConnection();
    try {
        page = Number(page) || 1;
        limit = Number(limit) || 10;
        const offset = (page - 1) * limit;

        const [rows] = await connection.query(
            `SELECT p.*, 
                    c.id AS customer_db_id, c.customer_name, c.customer_photo, c.aadhar_no, c.pan_no, 
                    c.address_1, c.address_2, c.area, c.city, c.pincode, c.district, c.state, c.phoneno,
                    u.username as creator_username, u.role as creator_role
             FROM pledge_items p
             LEFT JOIN customers c ON c.customer_id = p.customer_id
             LEFT JOIN users u ON u.id = p.created_user
             WHERE (p.approval_accounts_id = ? OR p.regional_id = ?) AND p.regional_status = 1 
             ORDER BY p.id DESC 
             LIMIT ? OFFSET ?`,
            [id, id, limit, offset]
        );

        const result = rows.map((p) => {
            const product_details = safeJSONParse(p.product_details) || [];
            const totalNetWeight = product_details.reduce((sum, item) => sum + (parseFloat(item.net_weight) || 0), 0);
            const totalAmount = product_details.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

            return {
                pledge_id: p.pledge_id || `#PLEDAM${p.id}`,
                ...p,
                weight: parseFloat(totalNetWeight.toFixed(3)),
                amount: parseFloat(totalAmount.toFixed(2)),
                created_user: {
                    id: p.created_user,
                    username: p.creator_username,
                    role: p.creator_role,
                },
                customer_data: {
                    id: p.customer_db_id,
                    customer_name: p.customer_name,
                    customer_id: p.customer_id,
                    phoneno: p.phoneno,
                    ...p
                },
                ornament_photo: p.ornament_photo ? `/public/uploads/pledge_items/${p.ornament_photo}` : null,
                bill: p.bill ? `/public/uploads/pledge_items/${p.bill}` : null,
                product_details
            };
        });

        return { data: result };
    } catch (error) {
        console.error(error);
    } finally {
        connection.release();
        process.exit();
    }
};

getAllAccountsApprovalPledges(1, 10, 39).then(res => {
    console.log('Sample Data Structure (first row):');
    console.log(JSON.stringify(res.data[0], null, 2));
});
