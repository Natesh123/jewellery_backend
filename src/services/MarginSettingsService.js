const pool = require('../config/db.config');

const getMarginSettings = async () => {
    const connection = await pool.promise().getConnection();

    try {
        const [rows] = await connection.query(`
            SELECT * FROM margin_settings   
        `);
        return rows;
    } catch (err) {
        console.error('Error fetching Margin values:', err);
        throw new Error('Failed to fetch Margin values');
    } finally {
        connection.release();
    }
};

const getMarginSettingsByRoleId = async (id) => {
    const connection = await pool.promise().getConnection();

    try {
        const [rows] = await pool.promise().query(
            `SELECT * FROM margin_settings WHERE role = ?`, [id]
        );
        return rows;
    } catch (err) {
        console.error('Error fetching Margin values:', err);
        throw new Error('Failed to fetch Margin values');
    } finally {
        connection.release();
    }
};

const getMarginSettingsById = async (id) => {
    const connection = await pool.promise().getConnection();

    try {
        const [rows] = await connection.query(`
            SELECT * FROM margin_settings WHERE id = ?  
        `, [id]);

        if (rows.length === 0) return null;

        return rows[0];
    } catch (err) {
        console.error('Error fetching Margin values:', err);
        throw new Error('Failed to fetch Margin values');
    } finally {
        connection.release();
    }
};

const updateMarginSettings = async (id, updateData) => {
    const connection = await pool.promise().getConnection();

    try {
        await connection.beginTransaction();

        await connection.query(`
            UPDATE margin_settings SET min_percent = ?, max_percent = ? WHERE role = ?  
        `, [updateData.min_percent, updateData.max_percent, id]);

        await connection.commit();

        return await getMarginSettingsByRoleId(id);
    } catch (err) {
        await connection.rollback();
        console.error('Error fetching Margin values:', err);
        throw new Error('Failed to fetch Margin values');
    } finally {
        connection.release();
    }
}

const createMarginSettings = async (margin) => {
    const connection = await pool.promise().getConnection();

    console.log("values", margin);
    try {
        await connection.beginTransaction();

        const rows = await getMarginSettingsByRoleId(margin.role_id)

        if (rows.length === 0) {
            const [result] = await connection.query(`
            INSERT INTO margin_settings (role, min_percent, max_percent) VALUES (?, ?, ?)  
            `, [margin.role_id, margin.min_percent, margin.max_percent]);

            const marginId = result.insertId;
            await connection.commit();
            return await getMarginSettingsById(marginId);
        } else {
            throw new Error('Failed! Role is already present');
        }
    } catch (err) {
        await connection.rollback();
        console.error('Error create Margin values:', err);
        throw new Error('Failed to create Margin values');
    } finally {
        connection.release();
    }
}

module.exports = {
    createMarginSettings,
    getMarginSettings,
    getMarginSettingsByRoleId,
    updateMarginSettings
}