
const pool = require('../config/db.config');
const userService = require('../services/userService');
const { getCurrentFinancialYear } = require('../middlewares/currfinancialYear');

const safeJSONParse = (value) => {
    try {
        return value ? JSON.parse(value) : [];
    } catch {
        return [];
    }
};

const createPledge = async (pledgeData) => {
    const connection = await pool.promise().getConnection();
    try {
        await connection.beginTransaction();

        if (!pledgeData.customer_id || !pledgeData.role_id || !pledgeData.adhar_number ||
            !pledgeData.pan_number || !pledgeData.created_user || !pledgeData.phone_number) {
            throw new Error('Missing required pledge fields');
        }

        const currentFYId = await getCurrentFinancialYear();
        const [userRows] = await connection.query(
            `SELECT company_id, branch_id FROM user_details WHERE user_id = ?`,
            [pledgeData.created_user]
        );

        if (userRows.length === 0) throw new Error("Created user not found");
        const { company_id, branch_id } = userRows[0];
        const [managers] = await connection.query(`SELECT id FROM users WHERE role = 2`);

        let manager_id = null;
        for (let mgr of managers) {
            const [mgrRows] = await connection.query(
                `SELECT company_id, branch_id FROM user_details WHERE user_id = ?`,
                [mgr.id]
            );
            if (mgrRows.length && mgrRows[0].company_id === company_id && mgrRows[0].branch_id === branch_id) {
                manager_id = mgr.id;
                break;
            }
        }
        const [result] = await connection.query(
            `INSERT INTO pledge_items 
             (customer_id, adhar_number, pan_number, phone_number, role_id, created_user, manager) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                pledgeData.customer_id,
                pledgeData.adhar_number,
                pledgeData.pan_number,
                pledgeData.phone_number,
                pledgeData.role_id,
                pledgeData.created_user,
                manager_id
            ]
        );

        const pledgeId = result.insertId;
        await connection.commit();

        return await getPledgeById(pledgeId);
    } catch (error) {
        await connection.rollback();
        throw new Error(`Failed to create pledge: ${error.message}`);
    } finally {
        connection.release();
    }
};


const updatePledge = async (pledgeId, step2Data) => {
    const connection = await pool.promise().getConnection();
    try {
        await connection.beginTransaction();
        if (!pledgeId) throw new Error('Missing pledge ID');

        await connection.query(
            `UPDATE pledge_items 
             SET bill = ?, 
                 ornament_photo = ?, 
                 product_details = ?, 
                 remarks = ?, 
                 interest_rate = ?, 
                 pledge_amount = ?,
                 current_interest = ?, 
                 total_payment = ?, 
                 approval = ?
             WHERE id = ?`,
            [
                step2Data.bill || null,
                step2Data.ornament_photo || null,
                step2Data.product_details || null,
                step2Data.remarks || null,
                step2Data.interest_rate || null,
                step2Data.pledge_amount || null,
                step2Data.current_interest || null,
                step2Data.total_payment || null,
                "0",
                pledgeId
            ]
        );

        await connection.commit();
        return await getPledgeById(pledgeId);
    } catch (error) {
        await connection.rollback();
        throw new Error(`Failed to update pledge: ${error.message}`);
    } finally {
        connection.release();
    }
};

const assigneExecutive = async (pledgeId, step2Data) => {
    const connection = await pool.promise().getConnection();
    try {
        await connection.beginTransaction();
        if (!pledgeId) throw new Error('Missing pledge ID');
        const [userRows] = await connection.query(
            `SELECT company_id, branch_id 
             FROM user_details 
             WHERE user_id = ?`,
            [step2Data.user_id]
        );
        if (!userRows.length) throw new Error("User not found");
        const { company_id, branch_id } = userRows[0];
        const [execRows] = await connection.query(
            `SELECT u.id as user_id, ud.branches
             FROM users u
             JOIN user_details ud ON u.id = ud.user_id
             WHERE u.role = 7 AND ud.company_id = ?`,
            [company_id]
        );
        if (!execRows.length) throw new Error("No executives found for company");
        let uid = null;
        for (let exec of execRows) {
            let branches = JSON.parse(exec.branches || "[]");
            if (branches.includes(branch_id)) {
                uid = exec.user_id;
                break;
            }
        }
        if (!uid) throw new Error("No executive found for this branch");
        const [execRows2] = await connection.query(
            `SELECT u.id 
         FROM users u
         JOIN user_details ud ON u.id = ud.user_id
         WHERE u.role = 6 AND ud.company_id = ? 
         LIMIT 1`,
            [company_id]
        );
        await connection.query(
            `UPDATE pledge_items 
             SET regional_id = ?, regional_status = ? ,approval_accounts_id = ?
             WHERE id = ?`,
            [uid, step2Data.regional_status, execRows2[0]?.id || null, pledgeId]
        );
        await connection.commit();
        return await getPledgeById(pledgeId);
    } catch (error) {
        await connection.rollback();
        throw new Error(`Failed to update pledge: ${error.message}`);
    } finally {
        connection.release();
    }
};
const updateSalesExecutive = async (pledgeId, step2Data) => {
    const connection = await pool.promise().getConnection();
    try {
        await connection.beginTransaction();
        if (!pledgeId) throw new Error('Missing pledge ID');

        await connection.query(
            `UPDATE pledge_items 
                 SET reference = ?
                 WHERE id = ?`,
            [
                step2Data.reference,
                pledgeId
            ]
        );
        await connection.commit();
        return await getPledgeById(pledgeId);
    } catch (error) {
        await connection.rollback();
        throw new Error(`Failed to update pledge: ${error.message}`);
    } finally {
        connection.release();
    }
};

const updateExecutive = async (pledgeId, step2Data) => {
    const connection = await pool.promise().getConnection();
    try {
        await connection.beginTransaction();
        if (!pledgeId) throw new Error('Missing pledge ID');

        if (step2Data.approval == "1") {
            // Fetch pledge row
            const [rows] = await connection.query(
                `SELECT * FROM pledge_items WHERE id = ?`,
                [pledgeId]
            );
            if (rows.length === 0) throw new Error("Pledge not found");

            await connection.query(
                `UPDATE pledge_items 
                 SET  accounts_amount = ?, money_request_id = ?
                 WHERE id = ?`,
                [
                    step2Data.accounts_amount,
                    rows[0].approval_accounts_id,
                    pledgeId
                ]
            );
        } else {
            await connection.query(
                `UPDATE pledge_items 
                 SET approval = ?, money_request_id = ?
                 WHERE id = ?`,
                [
                    step2Data.approval,
                    0,
                    pledgeId
                ]
            );
        }

        await connection.commit();
        return await getPledgeById(pledgeId);
    } catch (error) {
        await connection.rollback();
        throw new Error(`Failed to update pledge: ${error.message}`);
    } finally {
        connection.release();
    }
};

const updateMoneyRequest = async (pledgeId, step2Data) => {
    if (!pledgeId) throw new Error("Missing pledge ID");

    const connection = await pool.promise().getConnection();
    try {
        // Find user's company and branch
        const [userRows] = await connection.query(
            `SELECT company_id, branch_id 
         FROM user_details 
         WHERE user_id = ?`,
            [step2Data.user_id]
        );
        if (!userRows.length) throw new Error("User not found");

        const { company_id, branch_id } = userRows[0];

        // Find first role=6 user in same company & branch
        const [execRows] = await connection.query(
            `SELECT u.id 
         FROM users u
         JOIN user_details ud ON u.id = ud.user_id
         WHERE u.role = 6 AND ud.company_id = ? AND ud.branch_id = ?
         LIMIT 1`,
            [company_id, branch_id]
        );
        if (!execRows.length) throw new Error("No executive found for branch");

        // Update pledge
        await connection.query(
            `UPDATE pledge_items 
         SET money_request_lat = ?, money_requet_lng = ?, money_rquest_status = ?, accounts_id = ?
         WHERE id = ?`,
            [
                step2Data.money_request_lat,
                step2Data.money_requet_lng,
                step2Data.money_rquest_status,
                execRows[0].id,
                pledgeId,
            ]
        );

        // Return updated pledge
        return await getPledgeById(pledgeId);

    } catch (error) {
        throw new Error(`Failed to update pledge: ${error.message}`);
    } finally {
        connection.release();
    }
};

const updateManageApprovalRequest = async (pledgeId, step2Data) => {
    if (!pledgeId) throw new Error("Missing pledge ID");

    const connection = await pool.promise().getConnection();
    try {
        await connection.query(
            `UPDATE pledge_items 
             SET manage_approval_status = ?
             WHERE id = ?`,
            [step2Data.manage_approval_status, pledgeId]
        );

        const [rows] = await connection.query(`SELECT * FROM pledge_items WHERE id = ?`, [pledgeId]);
        if (!rows.length) throw new Error("Pledge not found");

        const [user_rows] = await connection.query(
            `SELECT * FROM customers WHERE customer_id = ?`,
            [rows[0].customer_id]
        );
        if (!user_rows.length) throw new Error("Customer not found");

        const [quotation_rows] = await connection.query(
            `SELECT * FROM pledge_quotations WHERE pledge_id = ?`,
            [pledgeId]
        );

        const user = await userService.getUserById(rows[0].created_user);
        const currentYear = new Date().getFullYear(); // 2025

        // Get total count to auto increment
        const [countRows] = await connection.query(`SELECT COUNT(*) as count FROM pledge_quotations`);
        const nextCount = countRows[0].count + 1;
        const formattedCount = nextCount.toString().padStart(2, "0"); // 01, 02, 03, ...

        // Generate IDs (no branch code)
        const quotationId = `QTP${formattedCount}${currentYear}`;
        const purchaseId = `PURP${formattedCount}${currentYear}`;

        let product_details = safeJSONParse(rows[0].product_details);
        let interestRate = parseFloat(rows[0].interest_rate);
        if (isNaN(interestRate)) interestRate = 0;
        const marginPercent = parseFloat(interestRate.toFixed(2));

        let product_text = product_details.map((p, i) => {
            const grossWeight = parseFloat(p.gross_weight) || 0;
            const dustWeight = parseFloat(p.dust_weight) || 0;
            const stoneWeight = parseFloat(p.stone_weight) || 0;
            const purity = parseFloat(p.purity) || 100;

            const netWeight = (grossWeight - dustWeight - stoneWeight) * (purity / 100);
            const marginWeight = (netWeight * marginPercent) / 100;
            const finalWeight = netWeight - marginWeight;
            const amount = finalWeight * p.rate;

            return {
                id: i + 1,
                metal: p.metal,
                purity,
                product: p.product,
                sub_product: p.sub_product,
                gross_weight: grossWeight,
                dust_weight: dustWeight,
                stone_weight: stoneWeight,
                net_weight: parseFloat(netWeight.toFixed(3)),
                margin_weight: parseFloat(marginWeight.toFixed(3)),
                final_weight: parseFloat(finalWeight.toFixed(3)),
                rate: parseFloat(p.rate.toFixed(2)),
                amount: parseFloat(amount.toFixed(2)),
                mcx_rate: parseFloat(p.rate.toFixed(2))
            };
        });

        const totalAmount = product_text.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

        if (quotation_rows.length === 0) {
            await connection.query(
                `INSERT INTO pledge_quotations (
                    quotation_id, purchase_id, customer_id, customer_name, 
                    aadhar_no, pan_no, products, total_amount, bill_copy, 
                    ornament_photo, remarks, status, margin_percent, created_by, pledge_id, branch_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    quotationId,
                    purchaseId,
                    user_rows[0].id,
                    user_rows[0].customer_name,
                    rows[0].adhar_number,
                    rows[0].pan_number,
                    JSON.stringify(product_text),
                    totalAmount,
                    rows[0].bill,
                    rows[0].ornament_photo,
                    rows[0].remarks,
                    "active",
                    marginPercent,
                    rows[0].created_user,
                    pledgeId,
                    user.branch_id
                ]
            );
        } else {
            await connection.query(
                `UPDATE pledge_quotations SET
                    customer_id=?, customer_name=?, 
                    aadhar_no=?, pan_no=?, products=?, total_amount=?, bill_copy=?, 
                    ornament_photo=?, remarks=?, margin_percent=?, created_by=?
                 WHERE pledge_id=?`,
                [
                    user_rows[0].id,
                    user_rows[0].customer_name,
                    rows[0].adhar_number,
                    rows[0].pan_number,
                    JSON.stringify(product_text),
                    totalAmount,
                    rows[0].bill,
                    rows[0].ornament_photo,
                    rows[0].remarks,
                    marginPercent,
                    rows[0].created_user,
                    pledgeId
                ]
            );
        }

        return await getPledgeById(pledgeId);
    } catch (error) {
        console.error("Error in updateManageApprovalRequest:", error);
    } finally {
        connection.release();
    }
};




const updateCollectionRequest = async (pledgeId, step2Data) => {
    if (!pledgeId) throw new Error("Missing pledge ID");

    const connection = await pool.promise().getConnection();
    try {
        const [rows] = await connection.query(
            'SELECT * FROM pledge_items WHERE id = ?',
            [pledgeId]
        );
        await connection.query(
            `UPDATE pledge_items 
         SET collection_type = ?, bank_collection_id = ?
         WHERE id = ?`,
            [
                step2Data.collection_type,
                rows[0].reference,
                pledgeId,
            ]
        );

        return await getPledgeById(pledgeId);

    } catch (error) {
        throw new Error(`Failed to update pledge: ${error.message}`);
    } finally {
        connection.release();
    }
};


const updateBankCollectionRequest = async (pledgeId, step2Data) => {
    if (!pledgeId) throw new Error("Missing pledge ID");

    const connection = await pool.promise().getConnection();
    try {
        const [rows] = await connection.query(
            'SELECT * FROM pledge_items WHERE id = ?',
            [pledgeId]
        );
        await connection.query(
            `UPDATE pledge_items 
         SET bank_collection_status = ?, bank_collection_lat = ?,bank_collection_lng = ?, finance_id = ?
         WHERE id = ?`,
            [
                step2Data.bank_collection_status,
                step2Data.bank_collection_lat,
                step2Data.bank_collection_lng,
                rows[0].reference,
                pledgeId,
            ]
        );

        return await getPledgeById(pledgeId);

    } catch (error) {
        throw new Error(`Failed to update pledge: ${error.message}`);
    } finally {
        connection.release();
    }
};

const updateFinanceInstituteRequest = async (pledgeId, step2Data) => {
    if (!pledgeId) throw new Error("Missing pledge ID");

    const connection = await pool.promise().getConnection();
    try {
        const [rows] = await connection.query(
            'SELECT * FROM pledge_items WHERE id = ?',
            [pledgeId]
        );
        await connection.query(
            `UPDATE pledge_items 
         SET finance_status = ?, finance_lat = ?,finance_lng = ?, gold_collect_id = ?
         WHERE id = ?`,
            [
                step2Data.finance_status,
                step2Data.finance_lat,
                step2Data.finance_lng,
                rows[0].reference,
                pledgeId,
            ]
        );

        return await getPledgeById(pledgeId);

    } catch (error) {
        throw new Error(`Failed to update pledge: ${error.message}`);
    } finally {
        connection.release();
    }
};

const assigneRegigonalApproval = async (pledgeId, step2Data) => {
    if (!pledgeId) throw new Error("Missing pledge ID");

    const connection = await pool.promise().getConnection();
    try {
        const [result] = await connection.query(
            `UPDATE pledge_items 
         SET regional_manager_status = ?, approval_accounts_status = 1
         WHERE id = ?`,
            [step2Data.regional_manager_status, pledgeId]
        );

        if (result.affectedRows === 0) {
            throw new Error(`No pledge found with ID: ${pledgeId}`);
        }

        return await getPledgeById(pledgeId);

    } catch (error) {
        throw new Error(`Failed to update pledge: ${error.message}`);
    } finally {
        connection.release();
    }
};

const assignAccountsApproval = async (pledgeId, step2Data) => {
    if (!pledgeId) throw new Error("Missing pledge ID");

    const connection = await pool.promise().getConnection();
    try {

        await connection.query(
            `UPDATE pledge_items 
         SET approval_accounts_status = ?
         WHERE id = ?`,
            [
                step2Data.approval_accounts_status,
                pledgeId,
            ]
        );

        return await getPledgeById(pledgeId);

    } catch (error) {
        throw new Error(`Failed to update pledge: ${error.message}`);
    } finally {
        connection.release();
    }
};

const updategoldcollectRequest = async (pledgeId, step2Data) => {
    if (!pledgeId) throw new Error("Missing pledge ID");

    const connection = await pool.promise().getConnection();
    try {
        const [rows] = await connection.query(
            'SELECT * FROM pledge_items WHERE id = ?',
            [pledgeId]
        );
        await connection.query(
            `UPDATE pledge_items 
         SET gold_collect_status = ?, gold_collect_lat = ?,gold_collect_lng = ?, manager_approvel_id = ?
         WHERE id = ?`,
            [
                step2Data.gold_collect_status,
                step2Data.gold_collect_lat,
                step2Data.gold_collect_lng,
                rows[0].manager,
                pledgeId,
            ]
        );

        return await getPledgeById(pledgeId);

    } catch (error) {
        throw new Error(`Failed to update pledge: ${error.message}`);
    } finally {
        connection.release();
    }
};

const updateAccountRequest = async (pledgeId, step2Data) => {
    if (!pledgeId) throw new Error("Missing pledge ID");

    const connection = await pool.promise().getConnection();
    try {
        const [rows] = await connection.query(
            'SELECT * FROM pledge_items WHERE id = ?',
            [pledgeId]
        );
        await connection.query(
            `UPDATE pledge_items 
         SET accounts_status = ?, collection_id = ?,accounts_amount = ?
         WHERE id = ?`,
            [
                step2Data.accounts_status,
                rows[0].manager,
                step2Data.accounts_amount,
                pledgeId,
            ]
        );

        return await getPledgeById(pledgeId);

    } catch (error) {
        throw new Error(`Failed to update pledge: ${error.message}`);
    } finally {
        connection.release();
    }
};



const getPledgeById = async (pledgeId) => {
    const connection = await pool.promise().getConnection();
    try {
        const [rows] = await connection.query(
            'SELECT * FROM pledge_items WHERE id = ?',
            [pledgeId]
        );
        return rows[0];
    } catch (error) {
        throw error;
    } finally {
        connection.release();
    }
};

const getAllPledges = async (page = 1, limit = 10, id) => {
    const connection = await pool.promise().getConnection();
    try {
        page = Number(page) || 1;
        limit = Number(limit) || 10;
        const offset = (page - 1) * limit;

        const [[{ total }]] = await connection.query(
            'SELECT COUNT(*) AS total FROM pledge_items WHERE created_user = ?',
            [id]
        );
        const [pledges] = await connection.query(
            'SELECT * FROM pledge_items WHERE created_user = ? ORDER BY id DESC LIMIT ? OFFSET ?',
            [id, limit, offset]
        );

        const result = [];
        for (const pledge of pledges) {
            const [[customer]] = await connection.query(
                'SELECT * FROM customers WHERE customer_id = ?',
                [pledge.customer_id]
            );
            const [[creator]] = await connection.query(
                'SELECT * FROM users WHERE id = ?',
                [pledge.created_user]
            );

            const product_details = safeJSONParse(pledge.product_details);
            const totalNetWeight = parseFloat(
                product_details.reduce((sum, item) => sum + parseFloat(item.net_weight || 0), 0).toFixed(3)
            );

            result.push({
                pledge_id: "#PLEDAM" + pledge.id,
                ...pledge,
                weight: totalNetWeight,
                created_user: {
                    id: pledge.created_user,
                    username: creator?.username,
                    role: creator?.role,
                },
                customer_data: customer,
                ornament_photo: pledge.ornament_photo ? `/public/uploads/pledge_items/${pledge.ornament_photo}` : null,
                bill: pledge.bill ? `/public/uploads/pledge_items/${pledge.bill}` : null,
                product_details
            });
        }

        return { total, page, limit, totalPages: Math.ceil(total / limit), data: result };
    } catch (error) {
        throw error;
    } finally {
        connection.release();
    }
};
const getPledges = async (page = 1, limit = 10, filters = {}) => {
    const connection = await pool.promise().getConnection();
    try {
        page = Number(page) || 1;
        limit = Number(limit) || 10;
        const offset = (page - 1) * limit;

        let where = [];
        let values = [];

        // 🔹 Status filters
        if (filters.approval !== undefined && filters.approval !== '') {
            where.push("p.approval = ?");
            values.push(filters.approval);
        }

        if (filters.accounts_status !== undefined && filters.accounts_status !== '') {
            where.push("p.accounts_status = ?");
            values.push(filters.accounts_status);
        }

        if (filters.finance_status !== undefined && filters.finance_status !== '') {
            where.push("p.finance_status = ?");
            values.push(filters.finance_status);
        }

        // 🔹 Date filter - FIXED
        if (filters.fromDate && filters.toDate) {
            // Convert to UTC date range
            const fromDate = new Date(filters.fromDate + 'T00:00:00.000Z');
            const toDate = new Date(filters.toDate + 'T23:59:59.999Z');

            where.push("p.created_at BETWEEN ? AND ?");
            values.push(fromDate, toDate);
        } else if (filters.fromDate) {
            const fromDate = new Date(filters.fromDate + 'T00:00:00.000Z');
            where.push("p.created_at >= ?");
            values.push(fromDate);
        } else if (filters.toDate) {
            const toDate = new Date(filters.toDate + 'T23:59:59.999Z');
            where.push("p.created_at <= ?");
            values.push(toDate);
        }

        // 🔹 Search filter (customer name or ID)
        if (filters.search) {
            where.push("(c.customer_name LIKE ? OR c.customer_id LIKE ? OR p.pledge_id LIKE ?)");
            const searchTerm = `%${filters.search}%`;
            values.push(searchTerm, searchTerm, searchTerm);
        }

        // 🔹 Metal filter (based on product_details)
        if (filters.metal) {
            // This requires JSON search in product_details
            where.push("JSON_SEARCH(p.product_details, 'one', ?) IS NOT NULL");
            values.push(`%${filters.metal}%`);
        }

        const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

        // 🔹 Total Count
        const countQuery = where.length
            ? `SELECT COUNT(*) AS total FROM pledge_items p LEFT JOIN customers c ON c.customer_id = p.customer_id ${whereClause}`
            : `SELECT COUNT(*) AS total FROM pledge_items p ${whereClause}`;

        const [[{ total }]] = await connection.query(countQuery, values);

        // 🔹 Main Query with JOINs
        const [rows] = await connection.query(
            `SELECT
            p.*,
            p.id as pledge_db_id,
            c.id AS customer_db_id,
            c.customer_name,
            c.customer_photo,
            c.aadhar_no,
            c.pan_no,
            c.address_1,
            c.address_2,
            c.area,
            c.city,
            c.pincode,
            c.district,
            c.state,
            c.phoneno,
            u.username,
            u.role
         FROM pledge_items p
         LEFT JOIN customers c ON c.customer_id = p.customer_id
         LEFT JOIN users u ON u.id = p.created_user
         ${whereClause}
         ORDER BY p.id DESC
         LIMIT ? OFFSET ?`,
            [...values, limit, offset]
        );

        // 🔹 Response Mapping
        const result = rows.map((p) => {
            const product_details = safeJSONParse(p.product_details) || [];

            const totalWeight = product_details
                .reduce((sum, i) => sum + parseFloat(i.net_weight || 0), 0);

            const totalAmount = product_details
                .reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);

            return {
                pledge_id: p.pledge_id || `#PLEDAM${p.id}`,
                ...p,
                weight: parseFloat(totalWeight.toFixed(3)),
                amount: parseFloat(totalAmount.toFixed(2)),
                created_user: {
                    id: p.created_user,
                    username: p.username,
                    role: p.role,
                },
                customer_data: {
                    id: p.customer_db_id,
                    customer_id: p.customer_id,
                    customer_name: p.customer_name,
                    customer_photo: p.customer_photo,
                    aadhar_no: p.aadhar_no,
                    pan_no: p.pan_no,
                    address_1: p.address_1,
                    address_2: p.address_2,
                    area: p.area,
                    city: p.city,
                    pincode: p.pincode,
                    district: p.district,
                    state: p.state,
                    phoneno: p.phoneno,
                },
                ornament_photo: p.ornament_photo
                    ? `${process.env.BASE_URL}/public/uploads/pledge_items/${p.ornament_photo}`
                    : null,
                bill: p.bill
                    ? `${process.env.BASE_URL}/public/uploads/pledge_items/${p.bill}`
                    : null,
                product_details
            };
        });

        return {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            data: result
        };

    } catch (error) {
        console.error("Error in getPledges:", error);
        throw error;
    } finally {
        connection.release();
    }
};




// const getPledges = async (page = 1, limit = 10) => {
//     const connection = await pool.promise().getConnection();
//     try {
//         page = Number(page) || 1;
//         limit = Number(limit) || 10;
//         const offset = (page - 1) * limit;

//         const [[{ total }]] = await connection.query(
//             'SELECT COUNT(*) AS total FROM pledge_items ',

//         );
//         const [pledges] = await connection.query(
//             'SELECT * FROM pledge_items  ORDER BY id DESC LIMIT ? OFFSET ?',
//             [limit, offset]
//         );

//         const result = [];
//         for (const pledge of pledges) {
//             const [[customer]] = await connection.query(
//                 'SELECT * FROM customers WHERE customer_id = ?',
//                 [pledge.customer_id]
//             );
//             const [[creator]] = await connection.query(
//                 'SELECT * FROM users WHERE id = ?',
//                 [pledge.created_user]
//             );

//             const product_details = safeJSONParse(pledge.product_details);
//             const totalNetWeight = parseFloat(
//                 product_details.reduce((sum, item) => sum + parseFloat(item.net_weight || 0), 0).toFixed(3)
//             );

//             result.push({
//                 pledge_id: "#PLEDAM" + pledge.id,
//                 ...pledge,
//                 weight: totalNetWeight,
//                 created_user: {
//                     id: pledge.created_user,
//                     username: creator?.username,
//                     role: creator?.role,
//                 },
//                 customer_data: customer,
//                 ornament_photo: pledge.ornament_photo ? `/public/uploads/pledge_items/${pledge.ornament_photo}` : null,
//                 bill: pledge.bill ? `/public/uploads/pledge_items/${pledge.bill}` : null,
//                 product_details
//             });
//         }

//         return { total, page, limit, totalPages: Math.ceil(total / limit), data: result };
//     } catch (error) {
//         throw error;
//     } finally {
//         connection.release();
//     }
// };

const getAllMoneyRequestPledges = async (page = 1, limit = 10, id) => {
    const connection = await pool.promise().getConnection();
    try {
        page = Number(page) || 1;
        limit = Number(limit) || 10;
        const offset = (page - 1) * limit;

        const [[{ total }]] = await connection.query(
            'SELECT COUNT(*) AS total FROM pledge_items WHERE money_request_id = ?',
            [id]
        );
        const [pledges] = await connection.query(
            'SELECT * FROM pledge_items WHERE money_request_id = ? ORDER BY id DESC LIMIT ? OFFSET ?',
            [id, limit, offset]
        );


        const result = [];
        for (const pledge of pledges) {
            const [[customer]] = await connection.query(
                'SELECT * FROM customers WHERE customer_id = ?',
                [pledge.customer_id]
            );
            const [[creator]] = await connection.query(
                'SELECT * FROM users WHERE id = ?',
                [pledge.created_user]
            );

            const product_details = safeJSONParse(pledge.product_details);
            const totalNetWeight = parseFloat(
                product_details.reduce((sum, item) => sum + parseFloat(item.net_weight || 0), 0).toFixed(3)
            );

            result.push({
                pledge_id: "#PLEDAM" + pledge.id,
                ...pledge,
                weight: totalNetWeight,
                created_user: {
                    id: pledge.created_user,
                    username: creator?.username,
                    role: creator?.role,
                },
                customer_data: customer,
                ornament_photo: pledge.ornament_photo ? `/public/uploads/pledge_items/${pledge.ornament_photo}` : null,
                bill: pledge.bill ? `/public/uploads/pledge_items/${pledge.bill}` : null,
                product_details
            });
        }

        return { total, page, limit, totalPages: Math.ceil(total / limit), data: result };
    } catch (error) {
        throw error;
    } finally {
        connection.release();
    }
};

const getAllManagerApprovalPledges = async (page = 1, limit = 10, id) => {
    const connection = await pool.promise().getConnection();
    try {
        page = Number(page) || 1;
        limit = Number(limit) || 10;
        const offset = (page - 1) * limit;

        const [[{ total }]] = await connection.query(
            'SELECT COUNT(*) AS total FROM pledge_items WHERE manager_approvel_id = ?',
            [id]
        );
        const [pledges] = await connection.query(
            'SELECT * FROM pledge_items WHERE manager_approvel_id = ? ORDER BY id DESC LIMIT ? OFFSET ?',
            [id, limit, offset]
        );

        const result = [];
        for (const pledge of pledges) {
            const [[customer]] = await connection.query(
                'SELECT * FROM customers WHERE customer_id = ?',
                [pledge.customer_id]
            );
            const [[creator]] = await connection.query(
                'SELECT * FROM users WHERE id = ?',
                [pledge.created_user]
            );

            const product_details = safeJSONParse(pledge.product_details);
            const totalNetWeight = parseFloat(
                product_details.reduce((sum, item) => sum + parseFloat(item.net_weight || 0), 0).toFixed(3)
            );

            result.push({
                pledge_id: "#PLEDAM" + pledge.id,
                ...pledge,
                weight: totalNetWeight,
                created_user: {
                    id: pledge.created_user,
                    username: creator?.username,
                    role: creator?.role,
                },
                customer_data: customer,
                ornament_photo: pledge.ornament_photo ? `/public/uploads/pledge_items/${pledge.ornament_photo}` : null,
                bill: pledge.bill ? `/public/uploads/pledge_items/${pledge.bill}` : null,
                product_details
            });
        }

        return { total, page, limit, totalPages: Math.ceil(total / limit), data: result };
    } catch (error) {
        throw error;
    } finally {
        connection.release();
    }
};

const getAllManagersApprovalPledges = async (page = 1, limit = 10, id) => {
    const connection = await pool.promise().getConnection();
    try {
        page = Number(page) || 1;
        limit = Number(limit) || 10;
        const offset = (page - 1) * limit;

        const [[{ total }]] = await connection.query(
            'SELECT COUNT(*) AS total FROM pledge_items WHERE manager_approvel_id = ?',
            [id]
        );
        const [pledges] = await connection.query(
            'SELECT * FROM pledge_items WHERE manager_approvel_id = ? ORDER BY id DESC LIMIT ? OFFSET ?',
            [id, limit, offset]
        );

        const result = [];
        for (const pledge of pledges) {
            const [[customer]] = await connection.query(
                'SELECT * FROM customers WHERE customer_id = ?',
                [pledge.customer_id]
            );
            const [[creator]] = await connection.query(
                'SELECT * FROM users WHERE id = ?',
                [pledge.created_user]
            );

            const product_details = safeJSONParse(pledge.product_details);
            const totalNetWeight = parseFloat(
                product_details.reduce((sum, item) => sum + parseFloat(item.net_weight || 0), 0).toFixed(3)
            );

            result.push({
                pledge_id: "#PLEDAM" + pledge.id,
                ...pledge,
                weight: totalNetWeight,
                created_user: {
                    id: pledge.created_user,
                    username: creator?.username,
                    role: creator?.role,
                },
                customer_data: customer,
                ornament_photo: pledge.ornament_photo ? `/public/uploads/pledge_items/${pledge.ornament_photo}` : null,
                bill: pledge.bill ? `/public/uploads/pledge_items/${pledge.bill}` : null,
                product_details
            });
        }

        return { total, page, limit, totalPages: Math.ceil(total / limit), data: result };
    } catch (error) {
        throw error;
    } finally {
        connection.release();
    }
};

const getAllOfficePledges = async (page = 1, limit = 10, id) => {
    const connection = await pool.promise().getConnection();
    try {
        page = Number(page) || 1;
        limit = Number(limit) || 10;
        const offset = (page - 1) * limit;

        const [[{ total }]] = await connection.query(
            'SELECT COUNT(*) AS total FROM pledge_items WHERE reference = ?',
            [id]
        );
        const [pledges] = await connection.query(
            'SELECT * FROM pledge_items WHERE reference = ? ORDER BY id DESC LIMIT ? OFFSET ?',
            [id, limit, offset]
        );

        const result = [];
        for (const pledge of pledges) {
            const [[customer]] = await connection.query(
                'SELECT * FROM customers WHERE customer_id = ?',
                [pledge.customer_id]
            );
            const [[creator]] = await connection.query(
                'SELECT * FROM users WHERE id = ?',
                [pledge.created_user]
            );

            const product_details = safeJSONParse(pledge.product_details);
            const totalNetWeight = parseFloat(
                product_details.reduce((sum, item) => sum + parseFloat(item.net_weight || 0), 0).toFixed(3)
            );

            result.push({
                pledge_id: "#PLEDAM" + pledge.id,
                ...pledge,
                weight: totalNetWeight,
                created_user: {
                    id: pledge.created_user,
                    username: creator?.username,
                    role: creator?.role,
                },
                customer_data: customer,
                ornament_photo: pledge.ornament_photo ? `/public/uploads/pledge_items/${pledge.ornament_photo}` : null,
                bill: pledge.bill ? `/public/uploads/pledge_items/${pledge.bill}` : null,
                product_details
            });
        }

        return { total, page, limit, totalPages: Math.ceil(total / limit), data: result };
    } catch (error) {
        throw error;
    } finally {
        connection.release();
    }
};

const getAllAccountsPledges = async (page = 1, limit = 10, id) => {
    const connection = await pool.promise().getConnection();
    try {
        page = Number(page) || 1;
        limit = Number(limit) || 10;
        const offset = (page - 1) * limit;

        const [[{ total }]] = await connection.query(
            'SELECT COUNT(*) AS total FROM pledge_items WHERE (money_request_id = ? OR reference = ?)',
            [id, id]
        );
        const [pledges] = await connection.query(
            'SELECT * FROM pledge_items WHERE (money_request_id = ? OR reference = ?) ORDER BY id DESC LIMIT ? OFFSET ?',
            [id, id, limit, offset]
        );

        const result = [];
        for (const pledge of pledges) {
            const [[customer]] = await connection.query(
                'SELECT * FROM customers WHERE customer_id = ?',
                [pledge.customer_id]
            );
            const [[creator]] = await connection.query(
                'SELECT * FROM users WHERE id = ?',
                [pledge.created_user]
            );

            const product_details = safeJSONParse(pledge.product_details);
            const totalNetWeight = parseFloat(
                product_details.reduce((sum, item) => sum + parseFloat(item.net_weight || 0), 0).toFixed(3)
            );

            result.push({
                pledge_id: "#PLEDAM" + pledge.id,
                ...pledge,
                weight: totalNetWeight,
                created_user: {
                    id: pledge.created_user,
                    username: creator?.username,
                    role: creator?.role,
                },
                customer_data: customer,
                ornament_photo: pledge.ornament_photo ? `/public/uploads/pledge_items/${pledge.ornament_photo}` : null,
                bill: pledge.bill ? `/public/uploads/pledge_items/${pledge.bill}` : null,
                product_details
            });
        }

        return { total, page, limit, totalPages: Math.ceil(total / limit), data: result };
    } catch (error) {
        throw error;
    } finally {
        connection.release();
    }
};

const getAllCollectionPledges = async (page = 1, limit = 10, id) => {
    const connection = await pool.promise().getConnection();
    try {
        page = Number(page) || 1;
        limit = Number(limit) || 10;
        const offset = (page - 1) * limit;

        const [[{ total }]] = await connection.query(
            'SELECT COUNT(*) AS total FROM pledge_items WHERE collection_id = ?',
            [id]
        );
        const [pledges] = await connection.query(
            'SELECT * FROM pledge_items WHERE collection_id = ? ORDER BY id DESC LIMIT ? OFFSET ?',
            [id, limit, offset]
        );

        const result = [];
        for (const pledge of pledges) {
            const [[customer]] = await connection.query(
                'SELECT * FROM customers WHERE customer_id = ?',
                [pledge.customer_id]
            );
            const [[creator]] = await connection.query(
                'SELECT * FROM users WHERE id = ?',
                [pledge.created_user]
            );

            const product_details = safeJSONParse(pledge.product_details);
            const totalNetWeight = parseFloat(
                product_details.reduce((sum, item) => sum + parseFloat(item.net_weight || 0), 0).toFixed(3)
            );

            result.push({
                pledge_id: "#PLEDAM" + pledge.id,
                ...pledge,
                weight: totalNetWeight,
                created_user: {
                    id: pledge.created_user,
                    username: creator?.username,
                    role: creator?.role,
                },
                customer_data: customer,
                ornament_photo: pledge.ornament_photo ? `/public/uploads/pledge_items/${pledge.ornament_photo}` : null,
                bill: pledge.bill ? `/public/uploads/pledge_items/${pledge.bill}` : null,
                product_details
            });
        }

        return { total, page, limit, totalPages: Math.ceil(total / limit), data: result };
    } catch (error) {
        throw error;
    } finally {
        connection.release();
    }
};

const getAllBankCollectionPledges = async (page = 1, limit = 10, id) => {
    const connection = await pool.promise().getConnection();
    try {
        page = Number(page) || 1;
        limit = Number(limit) || 10;
        const offset = (page - 1) * limit;

        const [[{ total }]] = await connection.query(
            'SELECT COUNT(*) AS total FROM pledge_items WHERE bank_collection_id = ?',
            [id]
        );
        const [pledges] = await connection.query(
            'SELECT * FROM pledge_items WHERE bank_collection_id = ? ORDER BY id DESC LIMIT ? OFFSET ?',
            [id, limit, offset]
        );

        const result = [];
        for (const pledge of pledges) {
            const [[customer]] = await connection.query(
                'SELECT * FROM customers WHERE customer_id = ?',
                [pledge.customer_id]
            );
            const [[creator]] = await connection.query(
                'SELECT * FROM users WHERE id = ?',
                [pledge.created_user]
            );

            const product_details = safeJSONParse(pledge.product_details);
            const totalNetWeight = parseFloat(
                product_details.reduce((sum, item) => sum + parseFloat(item.net_weight || 0), 0).toFixed(3)
            );

            result.push({
                pledge_id: "#PLEDAM" + pledge.id,
                ...pledge,
                weight: totalNetWeight,
                created_user: {
                    id: pledge.created_user,
                    username: creator?.username,
                    role: creator?.role,
                },
                customer_data: customer,
                ornament_photo: pledge.ornament_photo ? `/public/uploads/pledge_items/${pledge.ornament_photo}` : null,
                bill: pledge.bill ? `/public/uploads/pledge_items/${pledge.bill}` : null,
                product_details
            });
        }

        return { total, page, limit, totalPages: Math.ceil(total / limit), data: result };
    } catch (error) {
        throw error;
    } finally {
        connection.release();
    }
};
const getAllFinanceInstitutePledges = async (page = 1, limit = 10, id) => {
    const connection = await pool.promise().getConnection();
    try {
        page = Number(page) || 1;
        limit = Number(limit) || 10;
        const offset = (page - 1) * limit;

        const [[{ total }]] = await connection.query(
            'SELECT COUNT(*) AS total FROM pledge_items WHERE finance_id = ?',
            [id]
        );
        const [pledges] = await connection.query(
            'SELECT * FROM pledge_items WHERE finance_id = ? ORDER BY id DESC LIMIT ? OFFSET ?',
            [id, limit, offset]
        );

        const result = [];
        for (const pledge of pledges) {
            const [[customer]] = await connection.query(
                'SELECT * FROM customers WHERE customer_id = ?',
                [pledge.customer_id]
            );
            const [[creator]] = await connection.query(
                'SELECT * FROM users WHERE id = ?',
                [pledge.created_user]
            );

            const product_details = safeJSONParse(pledge.product_details);
            const totalNetWeight = parseFloat(
                product_details.reduce((sum, item) => sum + parseFloat(item.net_weight || 0), 0).toFixed(3)
            );

            result.push({
                pledge_id: "#PLEDAM" + pledge.id,
                ...pledge,
                weight: totalNetWeight,
                created_user: {
                    id: pledge.created_user,
                    username: creator?.username,
                    role: creator?.role,
                },
                customer_data: customer,
                ornament_photo: pledge.ornament_photo ? `/public/uploads/pledge_items/${pledge.ornament_photo}` : null,
                bill: pledge.bill ? `/public/uploads/pledge_items/${pledge.bill}` : null,
                product_details
            });
        }

        return { total, page, limit, totalPages: Math.ceil(total / limit), data: result };
    } catch (error) {
        throw error;
    } finally {
        connection.release();
    }
};

const getAllGoldCollectPledges = async (page = 1, limit = 10, id) => {
    const connection = await pool.promise().getConnection();
    try {
        page = Number(page) || 1;
        limit = Number(limit) || 10;
        const offset = (page - 1) * limit;

        const [[{ total }]] = await connection.query(
            'SELECT COUNT(*) AS total FROM pledge_items WHERE gold_collect_id = ?',
            [id]
        );
        const [pledges] = await connection.query(
            'SELECT * FROM pledge_items WHERE gold_collect_id = ? ORDER BY id DESC LIMIT ? OFFSET ?',
            [id, limit, offset]
        );

        const result = [];
        for (const pledge of pledges) {
            const [[customer]] = await connection.query(
                'SELECT * FROM customers WHERE customer_id = ?',
                [pledge.customer_id]
            );
            const [[creator]] = await connection.query(
                'SELECT * FROM users WHERE id = ?',
                [pledge.created_user]
            );

            const product_details = safeJSONParse(pledge.product_details);
            const totalNetWeight = parseFloat(
                product_details.reduce((sum, item) => sum + parseFloat(item.net_weight || 0), 0).toFixed(3)
            );

            result.push({
                pledge_id: "#PLEDAM" + pledge.id,
                ...pledge,
                weight: totalNetWeight,
                created_user: {
                    id: pledge.created_user,
                    username: creator?.username,
                    role: creator?.role,
                },
                customer_data: customer,
                ornament_photo: pledge.ornament_photo ? `/public/uploads/pledge_items/${pledge.ornament_photo}` : null,
                bill: pledge.bill ? `/public/uploads/pledge_items/${pledge.bill}` : null,
                product_details
            });
        }

        return { total, page, limit, totalPages: Math.ceil(total / limit), data: result };
    } catch (error) {
        throw error;
    } finally {
        connection.release();
    }
};

const getAllManagerPledges = async (page = 1, limit = 10, id) => {
    const connection = await pool.promise().getConnection();
    try {
        page = Number(page) || 1;
        limit = Number(limit) || 10;
        const offset = (page - 1) * limit;

        const [[{ total }]] = await connection.query(
            'SELECT COUNT(*) AS total FROM pledge_items WHERE manager = ? AND approval_accounts_status = 1 AND regional_manager_status = 1',
            [id]
        );
        const [pledges] = await connection.query(
            'SELECT * FROM pledge_items WHERE manager = ? AND approval_accounts_status = 1 AND regional_manager_status = 1 ORDER BY id DESC LIMIT ? OFFSET ?',
            [id, limit, offset]
        );

        const result = [];
        for (const pledge of pledges) {
            const [[customer]] = await connection.query(
                'SELECT * FROM customers WHERE customer_id = ?',
                [pledge.customer_id]
            );
            const [[creator]] = await connection.query(
                'SELECT * FROM users WHERE id = ?',
                [pledge.created_user]
            );

            const product_details = safeJSONParse(pledge.product_details);
            const totalNetWeight = parseFloat(
                product_details.reduce((sum, item) => sum + parseFloat(item.net_weight || 0), 0).toFixed(3)
            );

            result.push({
                pledge_id: "#PLEDAM" + pledge.id,
                ...pledge,
                weight: totalNetWeight,
                created_user: {
                    id: pledge.created_user,
                    username: creator?.username,
                    role: creator?.role,
                },
                customer_data: customer,
                ornament_photo: pledge.ornament_photo ? `/public/uploads/pledge_items/${pledge.ornament_photo}` : null,
                bill: pledge.bill ? `/public/uploads/pledge_items/${pledge.bill}` : null,
                product_details
            });
        }

        return { total, page, limit, totalPages: Math.ceil(total / limit), data: result };
    } catch (error) {
        throw error;
    } finally {
        connection.release();
    }
};


const getAllManagerPledges1 = async (page = 1, limit = 10, id) => {
    const connection = await pool.promise().getConnection();
    try {
        page = Number(page) || 1;
        limit = Number(limit) || 10;
        const offset = (page - 1) * limit;

        const [[{ total }]] = await connection.query(
            'SELECT COUNT(*) AS total FROM pledge_items WHERE manager = ? ',
            [id]
        );
        const [pledges] = await connection.query(
            'SELECT * FROM pledge_items WHERE manager = ? ORDER BY id DESC LIMIT ? OFFSET ?',
            [id, limit, offset]
        );

        const result = [];
        for (const pledge of pledges) {
            const [[customer]] = await connection.query(
                'SELECT * FROM customers WHERE customer_id = ?',
                [pledge.customer_id]
            );
            const [[creator]] = await connection.query(
                'SELECT * FROM users WHERE id = ?',
                [pledge.created_user]
            );

            const product_details = safeJSONParse(pledge.product_details);
            const totalNetWeight = parseFloat(
                product_details.reduce((sum, item) => sum + parseFloat(item.net_weight || 0), 0).toFixed(3)
            );

            result.push({
                pledge_id: "#PLEDAM" + pledge.id,
                ...pledge,
                weight: totalNetWeight,
                created_user: {
                    id: pledge.created_user,
                    username: creator?.username,
                    role: creator?.role,
                },
                customer_data: customer,
                ornament_photo: pledge.ornament_photo ? `/public/uploads/pledge_items/${pledge.ornament_photo}` : null,
                bill: pledge.bill ? `/public/uploads/pledge_items/${pledge.bill}` : null,
                product_details
            });
        }

        return { total, page, limit, totalPages: Math.ceil(total / limit), data: result };
    } catch (error) {
        throw error;
    } finally {
        connection.release();
    }
};

const getAllRegionalManagerPledges = async (page = 1, limit = 10, id) => {
    const connection = await pool.promise().getConnection();
    try {
        page = Number(page) || 1;
        limit = Number(limit) || 10;
        const offset = (page - 1) * limit;

        const [[{ total }]] = await connection.query(
            'SELECT COUNT(*) AS total FROM pledge_items WHERE regional_id = ? AND regional_status = 1',
            [id]
        );
        const [pledges] = await connection.query(
            'SELECT * FROM pledge_items WHERE regional_id = ? AND regional_status = 1 ORDER BY id DESC LIMIT ? OFFSET ?',
            [id, limit, offset]
        );

        const result = [];
        for (const pledge of pledges) {
            const [[customer]] = await connection.query(
                'SELECT * FROM customers WHERE customer_id = ?',
                [pledge.customer_id]
            );
            const [[creator]] = await connection.query(
                'SELECT * FROM users WHERE id = ?',
                [pledge.created_user]
            );

            const product_details = safeJSONParse(pledge.product_details);
            const totalNetWeight = parseFloat(
                product_details.reduce((sum, item) => sum + parseFloat(item.net_weight || 0), 0).toFixed(3)
            );

            result.push({
                pledge_id: "#PLEDAM" + pledge.id,
                ...pledge,
                weight: totalNetWeight,
                created_user: {
                    id: pledge.created_user,
                    username: creator?.username,
                    role: creator?.role,
                },
                customer_data: customer,
                ornament_photo: pledge.ornament_photo ? `/public/uploads/pledge_items/${pledge.ornament_photo}` : null,
                bill: pledge.bill ? `/public/uploads/pledge_items/${pledge.bill}` : null,
                product_details
            });
        }

        return { total, page, limit, totalPages: Math.ceil(total / limit), data: result };
    } catch (error) {
        throw error;
    } finally {
        connection.release();
    }
};

const getAllAccountsApprovalPledges = async (page = 1, limit = 10, id) => {
    const connection = await pool.promise().getConnection();
    try {
        page = Number(page) || 1;
        limit = Number(limit) || 10;
        const offset = (page - 1) * limit;
        const [[{ total }]] = await connection.query(
            'SELECT COUNT(*) AS total FROM pledge_items WHERE (approval_accounts_id = ? OR regional_id = ?) AND regional_status = 1',
            [id, id]
        );
        const [pledges] = await connection.query(
            'SELECT * FROM pledge_items WHERE (approval_accounts_id = ? OR regional_id = ?) AND regional_status = 1 ORDER BY id DESC LIMIT ? OFFSET ?',
            [id, id, limit, offset]
        );
        const result = [];
        for (const pledge of pledges) {
            const [[customer]] = await connection.query(
                'SELECT * FROM customers WHERE customer_id = ?',
                [pledge.customer_id]
            );
            const [[creator]] = await connection.query(
                'SELECT * FROM users WHERE id = ?',
                [pledge.created_user]
            );
            const product_details = safeJSONParse(pledge.product_details);

            const totalNetWeight = parseFloat(
                product_details.reduce((sum, item) => sum + parseFloat(item.net_weight || 0), 0).toFixed(3)
            );
            result.push({
                pledge_id: "#PLEDAM" + pledge.id,
                ...pledge,
                weight: totalNetWeight,
                created_user: {
                    id: pledge.created_user,
                    username: creator?.username,
                    role: creator?.role,
                },
                customer_data: customer,
                ornament_photo: pledge.ornament_photo ? `/public/uploads/pledge_items/${pledge.ornament_photo}` : null,
                bill: pledge.bill ? `/public/uploads/pledge_items/${pledge.bill}` : null,
                product_details
            });
        }
        return { total, page, limit, totalPages: Math.ceil(total / limit), data: result };
    } catch (error) {
        throw error;
    } finally {
        connection.release();
    }
};

const getAllUpdateExecutive = async (req) => {
    const connection = await pool.promise().getConnection();
    try {
        const id = req.params.id;

        // Get the user's company & branch
        const [userRows] = await connection.query(
            `SELECT company_id, branch_id FROM user_details WHERE user_id = ?`,
            [id]
        );
        if (userRows.length === 0) throw new Error("User not found");
        const { company_id, branch_id } = userRows[0];
        const [executives] = await connection.query(
            `SELECT u.id, ud.* 
             FROM users u
             JOIN user_details ud ON u.id = ud.user_id
             WHERE u.role = 1 AND ud.company_id = ? AND ud.branch_id = ?`,
            [company_id, branch_id]
        );

        return executives;
    } catch (error) {
        throw error;
    } finally {
        connection.release();
    }
};


const getAllUpdateManager = async (id) => {
    const connection = await pool.promise().getConnection();
    try {
        const [pledges] = await connection.query('SELECT * FROM users WHERE manager = ? AND approval_accounts_status = 1 AND regional_manager_status = 1 ', []);
        return pledges;
    } catch (error) {
        throw error;
    } finally {
        connection.release();
    }
};

module.exports = {
    createPledge,
    updatePledge,
    getPledgeById,
    getAllPledges,
    assigneExecutive,
    updateExecutive,
    getAllUpdateExecutive,
    getAllOfficePledges,
    getAllManagerPledges,
    getAllUpdateManager,
    getAllMoneyRequestPledges,
    updateMoneyRequest,
    getAllAccountsPledges,
    updateAccountRequest,
    getAllCollectionPledges,
    updateCollectionRequest,
    getAllBankCollectionPledges,
    updateBankCollectionRequest,
    getAllFinanceInstitutePledges,
    updateFinanceInstituteRequest,
    getAllGoldCollectPledges,
    updategoldcollectRequest,
    getAllManagerApprovalPledges,
    getAllRegionalManagerPledges,
    assigneRegigonalApproval,
    getAllAccountsApprovalPledges,
    assignAccountsApproval,
    updateSalesExecutive,
    getAllManagersApprovalPledges,
    updateManageApprovalRequest,
    getAllManagerPledges1,
    getPledges
};
