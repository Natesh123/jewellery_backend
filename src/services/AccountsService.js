const pool = require('../config/db.config');



const createMasterGrouping = async (data) => {
    const connection = await pool.promise().getConnection();
    try {
        await connection.beginTransaction();

        const prefix = data.group_name.charAt(0).toUpperCase();

        const [rows] = await connection.query(
            `SELECT group_code FROM master_grouping WHERE group_code LIKE ? ORDER BY group_code DESC LIMIT 1`,
            [`${prefix}%`]
        );

        let newCode;
        if (rows.length > 0) {
            const lastCode = rows[0].group_code;
            const num = parseInt(lastCode.slice(1)) + 1;
            newCode = `${prefix}${String(num).padStart(2, "0")}`;
        } else {
            newCode = `${prefix}01`;
        }

        const allowedFields = [
            "group_name",
            "group_code",
            "group_type",
            "major_group",
            "major_group_code",
            "group_items"
        ];

        const fields = [];
        const placeholders = [];
        const values = [];

        for (const key of allowedFields) {
            if (key === "group_code") {
                fields.push("group_code");
                placeholders.push("?");
                values.push(newCode);
            } else if (data[key] !== undefined) {
                fields.push(key);
                placeholders.push("?");
                values.push(data[key]);
            }
        }

        const sql = `INSERT INTO master_grouping (${fields.join(",")}) VALUES (${placeholders.join(",")})`;
        await connection.query(sql, values);

        await connection.commit();
        return { message: "Group created successfully", group_code: newCode };
    } catch (error) {
        console.error("Error in createMasterGrouping:", error);
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

const createAccountHead = async (data) => {
    const connection = await pool.promise().getConnection();
    try {
        await connection.beginTransaction();

        // 1️⃣ Get group_code from master_grouping
        const [groupRows] = await connection.query(
            `SELECT group_code FROM master_grouping WHERE group_name = ? LIMIT 1`,
            [data.group_name]
        );

        if (groupRows.length === 0) {
            throw new Error("Invalid group_name — no matching group found in master_grouping");
        }

        const groupCode = groupRows[0].group_code;

        // 2️⃣ Generate new account_code based on groupCode
        const [accountRows] = await connection.query(
            `SELECT account_code FROM account_head_creation 
         WHERE account_code LIKE ? ORDER BY account_code DESC LIMIT 1`,
            [`${groupCode}%`]
        );

        let newAccountCode;
        if (accountRows.length > 0) {
            const lastCode = accountRows[0].account_code; // e.g. S010002
            const num = parseInt(lastCode.slice(groupCode.length)) + 1;
            newAccountCode = `${groupCode}${String(num).padStart(4, "0")}`;
        } else {
            newAccountCode = `${groupCode}0001`;
        }

        // 3️⃣ Dynamic insert (including group_code)
        const allowedFields = [
            "group_name",
            "group_code",
            "head_name",
            "address",
            "gst_no",
            "phone_no",
            "gst_type",
            "state",
            "state_code",
            "account_code",
        ];

        const fields = [];
        const placeholders = [];
        const values = [];
        fields.push("group_code");
        placeholders.push("?");
        values.push(groupCode);

        for (const key of allowedFields) {
            if (key === "account_code") {
                fields.push("account_code");
                placeholders.push("?");
                values.push(newAccountCode);
            } else if (data[key] !== undefined) {
                fields.push(key);
                placeholders.push("?");
                values.push(data[key]);
            }
        }

        const sql = `INSERT INTO account_head_creation (${fields.join(",")}) VALUES (${placeholders.join(",")})`;
        await connection.query(sql, values);

        await connection.commit();
        return { message: "Account head created successfully", account_code: newAccountCode };
    } catch (error) {
        console.error("Error in createAccountHead:", error);
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

const getAllAccountHeads = async (search) => {
    const connection = await pool.promise().getConnection();
    try {
        let query = `SELECT * FROM account_head_creation WHERE 1=1`;
        const params = [];

        // Optional search by head name or account code
        if (search) {
            query += ` AND (head_name LIKE ? OR account_code LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ` ORDER BY id DESC`;

        const [rows] = await connection.query(query, params);
        return rows;
    } catch (error) {
        console.error("Error in getAllAccountHeads:", error);
        throw error;
    } finally {
        connection.release();
    }
};


const getAllMasterGroupings = async (search) => {
    const connection = await pool.promise().getConnection();
    try {
        let query = `SELECT * FROM master_grouping WHERE 1=1`;
        const params = [];
        if (search) {
            query += ` AND (group_name LIKE ? OR group_code LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ` ORDER BY id DESC`;

        const [rows] = await connection.query(query, params);
        return rows;
    } catch (error) {
        console.error("Error in getAllMasterGroupings:", error);
        throw error;
    } finally {
        connection.release();
    }
};


const createReceipt = async (data) => {
    const connection = await pool.promise().getConnection();
    try {
      await connection.beginTransaction();
  
      // 1️⃣ Get account details
      const [accountRows] = await connection.query(
        `SELECT account_code, head_name AS account_name, address, gst_no 
         FROM account_head_creation 
         WHERE account_code = ? LIMIT 1`,
        [data.account_code]
      );
  
      if (accountRows.length === 0) {
        throw new Error("Invalid account_code — no matching record found");
      }
  
      const { account_code, account_name, address, gst_no } = accountRows[0];
  
      // 2️⃣ Get latest ref_no for that account_code
      const [refRows] = await connection.query(
        `SELECT ref_no FROM receipt 
         WHERE account_code = ? 
         ORDER BY id DESC LIMIT 1`, // 👈 changed from idPrimary → id
        [account_code]
      );
  
      let newRefNo;
      if (refRows.length > 0) {
        const lastRef = refRows[0].ref_no; // e.g. M010002Ref01
        const num = parseInt(lastRef.replace(/.*Ref/, "")) + 1; // get number after Ref
        newRefNo = `${account_code}Ref${String(num).padStart(2, "0")}`; // -> M010002Ref02
      } else {
        newRefNo = `${account_code}Ref01`;
      }
  
      // 3️⃣ Insert into receipt
      const sql = `
        INSERT INTO receipt 
        (type, ref_no, account_name, account_code, address, gst_no, amount, narration, mode_of_receipt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
  
      await connection.query(sql, [
        data.type,
        newRefNo,
        account_name,
        account_code,
        address,
        gst_no,
        data.amount,
        data.narration,
        data.mode_of_receipt,
      ]);
  
      await connection.commit();
  
      return { message: "Receipt created successfully", ref_no: newRefNo };
    } catch (error) {
      console.error("Error in createReceipt:", error);
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
  
const getAllReceipts = async () => {
    try {
      const [rows] = await pool
        .promise()
        .query(`SELECT * FROM receipt ORDER BY id DESC`);
      return rows;
    } catch (error) {
      console.error("Error in getAllReceipts:", error);
      throw error;
    }
  };
  
  const createState = async (data) => {
    const connection = await pool.promise().getConnection();
    try {
      await connection.beginTransaction();
  
      // Insert user-provided name and code
      const sql = `INSERT INTO state (name, code) VALUES (?, ?)`;
      await connection.query(sql, [data.name, data.code]);
  
      await connection.commit();
      return { message: "State created successfully" };
    } catch (error) {
      console.error("Error in createState3:", error);
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
  

  const getAllState = async () => {
    const connection = await pool.promise().getConnection();
    try {
      const [rows] = await connection.query(`SELECT * FROM state`);
      return rows;
    } catch (error) {
      console.error("Error in getAllState3:", error);
      throw error;
    } finally {
      connection.release();
    }
  };
  

module.exports = {
    createMasterGrouping,
    getAllMasterGroupings,
    createAccountHead,
    getAllAccountHeads,
    createReceipt,
    getAllReceipts,
    createState,
    getAllState
};