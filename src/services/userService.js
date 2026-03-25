const pool = require('../config/db.config');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const unlinkAsync = promisify(fs.unlink);


const createUser = async (userData) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();

    if (!userData.username || !userData.email || !userData.role_id) {
      throw new Error('Missing required user fields');
    }

    // 🔹 Check for Regional Manager (role_id = 7)
    if (userData.role_id == 7 && userData.branches) {
      let branchesArr = [];

      try {
        branchesArr = JSON.parse(userData.branches);
      } catch (e) {
        throw new Error("Invalid branches format. Must be JSON array.");
      }

      if (!Array.isArray(branchesArr) || branchesArr.length === 0) {
        throw new Error("Branches are required for Regional Manager.");
      }

      const [existing] = await connection.query(
        `SELECT ud.branches, u.id, u.username 
         FROM users u
         JOIN user_details ud ON u.id = ud.user_id
         WHERE u.role = 7`
      );

      for (const manager of existing) {
        if (!manager.branches) continue;

        let existingBranches = [];
        try {
          existingBranches = JSON.parse(manager.branches);
        } catch (e) {
          continue;
        }

        const overlap = branchesArr.filter(b => existingBranches.includes(b));
        if (overlap.length > 0) {
          throw new Error(
            `Branch(es) already have a Regional Manager (${manager.username}).`
          );
        }
      }
    }

    // 🔹 Check for Branch Manager (role_id = 2)
    if (userData.role_id == 2 && userData.branch_id) {
      const [branchManager] = await connection.query(
        `SELECT u.id, u.username 
         FROM users u
         JOIN user_details ud ON u.id = ud.user_id
         WHERE u.role = 2 AND ud.branch_id = ?`,
        [userData.branch_id]
      );

      if (branchManager.length > 0) {
        throw new Error(
          `Branch  already has a Branch Manager (${branchManager[0].username}).`
        );
      }
    }

    // 🔹 Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // 🔹 Insert into users
    const [userResult] = await connection.query(
      `INSERT INTO users 
      (username, email, password, role, is_active) 
      VALUES (?, ?, ?, ?, ?)`,
      [
        userData.username,
        userData.email,
        hashedPassword,
        userData.role_id,
        userData.status === 'active' ? 1 : 0
      ]
    );

    const userId = userResult.insertId;

    // 🔹 Insert into user_details
    await connection.query(
      `INSERT INTO user_details 
      (user_id, user_code, first_name, last_name, phone, company_id, branch_id, 
       aadhar, pan, permanent_address, reference_name, reference_contact, 
       joining_date, branches) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        userData.user_code,
        userData.first_name,
        userData.last_name,
        userData.phone,
        userData.company_id,
        userData.branch_id,
        userData.aadhar,
        userData.pan,
        userData.permanent_address,
        userData.reference_name,
        userData.reference_contact,
        userData.joining_date,
        userData.branches
      ]
    );

    await connection.commit();
    return { id: userId };
  } catch (error) {
    await connection.rollback();
    console.error('Error creating user:', error);
    throw new Error(`Failed to create user: ${error.message}`);
  } finally {
    connection.release();
  }
};




const getUserById = async (id) => {
  const connection = await pool.promise().getConnection();
  try {
    // Get user basic info (excluding password and superadmin)
    const [userRows] = await connection.query(
      `SELECT 
        u.id, u.username, u.email, u.is_active, u.created_at, u.updated_at,
        ud.user_code, ud.first_name, ud.last_name, ud.phone, ud.aadhar, ud.pan,
        ud.permanent_address, ud.reference_name, ud.reference_contact, ud.joining_date,
        ud.company_id, ud.branch_id, ud.profile_photo, ud.resume, ud.degree_certificate, ud.branches,
        r.id as role_id, r.name as role_name, 
        c.company_name, 
        b.branch_name
       FROM users u
       LEFT JOIN user_details ud ON u.id = ud.user_id
       LEFT JOIN roles r ON u.role = r.id
       LEFT JOIN companies c ON ud.company_id = c.id
       LEFT JOIN branches b ON ud.branch_id = b.id
       WHERE u.id = ? AND r.name != 'superadmin'`,
      [id]
    );

    if (userRows.length === 0) return null;

    const user = userRows[0];

    // Parse JSON fields and construct full URLs for files
    const parseFileField = (field) => {
      if (!user[field]) return null;
      try {
        const parsed = JSON.parse(user[field]);
        return {
          ...parsed,
          url: `${process.env.API_BASE_URL || ''}${parsed.url}`
        };
      } catch (e) {
        console.error(`Error parsing ${field}:`, e);
        return null;
      }
    };

    user.profile_photo = parseFileField("profile_photo");
    user.resume = parseFileField("resume");
    user.degree_certificate = parseFileField("degree_certificate");

    return user;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw new Error(`Failed to get user: ${error.message}`);
  } finally {
    connection.release();
  }
};


const getAllUsers = async (roleId, { page = 1, limit = 10, search, role, status, company, branch, branches }) => {
  const connection = await pool.promise().getConnection();
  try {
    const offset = (page - 1) * limit;
    let query = `FROM users u
                LEFT JOIN user_details ud ON u.id = ud.user_id
                LEFT JOIN roles r ON u.role = r.id
                LEFT JOIN companies c ON ud.company_id = c.id
                LEFT JOIN branches b ON ud.branch_id = b.id
                WHERE r.name != 'superadmin' AND u.role !=4`;

    const params = [];

    // 🔍 Common filters
    if (search) {
      query += ` AND (u.username LIKE ? OR ud.first_name LIKE ? OR ud.last_name LIKE ? OR u.email LIKE ? OR ud.user_code LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (role) {
      query += ` AND u.role = ?`;
      params.push(role);
    }

    if (status) {
      query += ` AND u.is_active = ?`;
      params.push(status === 'active' ? 1 : 0);
    }

    if (company) {
      query += ` AND ud.company_id = ?`;
      params.push(company);
    }

    // 🏢 Apply branch logic based on role
    if (roleId == 7 && Array.isArray(branches) && branches.length > 0) {
      query += ` AND ud.branch_id IN (${branches.map(() => '?').join(',')})`;
      params.push(...branches);
    } else if (branch) {
      query += ` AND ud.branch_id = ?`;
      params.push(branch);
    }

    // Count
    const [countResult] = await connection.query(
      `SELECT COUNT(*) as total ${query}`,
      params
    );
    const total = countResult[0].total;

    // Paginated results
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [rows] = await connection.query(
      `SELECT 
        u.id, u.username, u.email, u.is_active, u.created_at, u.updated_at,
        ud.user_code, ud.first_name, ud.last_name, ud.phone, ud.aadhar, ud.pan, ud.permanent_address,
        ud.reference_name, ud.reference_contact, ud.joining_date,
        ud.company_id, ud.branch_id,
        ud.profile_photo,
        r.id as role_id, r.name as role_name,
        c.company_name, 
        b.branch_name ${query}`,
      params
    );

    // Process profile photos
    const usersWithPhotos = rows.map(user => {
      if (user.profile_photo) {
        try {
          const parsed = JSON.parse(user.profile_photo);
          user.profile_photo_url = `${process.env.API_BASE_URL || ''}${parsed.url}`;
        } catch (e) {
          console.error('Error parsing profile photo:', e);
          user.profile_photo_url = null;
        }
      } else {
        user.profile_photo_url = null;
      }
      return user;
    });

    return {
      users: usersWithPhotos,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    console.error('Error getting all users:', error);
    throw new Error(`Failed to get users: ${error.message}`);
  } finally {
    connection.release();
  }
};






const updateUser = async (id, updateData) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();

    // Validate required fields
    if (!updateData.username || !updateData.email || !updateData.role_id) {
      throw new Error('Missing required user fields');
    }

    // Update users table
    await connection.query(
      `UPDATE users SET 
       username = ?, email = ?, role = ?, is_active = ?
       WHERE id = ?`,
      [
        updateData.username,
        updateData.email,
        updateData.role_id,
        updateData.status === 'active' ? 1 : 0,
        id
      ]
    );

    // Update user_details table
    await connection.query(
      `UPDATE user_details SET 
       user_code = ?, first_name = ?, last_name = ?, phone = ?, 
       company_id = ?, branch_id = ?, aadhar = ?, pan = ?, 
       permanent_address = ?, reference_name = ?, reference_contact = ?, 
       joining_date = ?, profile_photo = ?, resume = ?, degree_certificate = ? ,branches = ?
       WHERE user_id = ?`,
      [
        updateData.user_code,
        updateData.first_name,
        updateData.last_name,
        updateData.phone,
        updateData.company_id,
        updateData.branch_id,
        updateData.aadhar,
        updateData.pan,
        updateData.permanent_address,
        updateData.reference_name,
        updateData.reference_contact,
        updateData.joining_date,
        updateData.profile_photo ? JSON.stringify(updateData.profile_photo) : null,
        updateData.resume ? JSON.stringify(updateData.resume) : null,
        updateData.degree_certificate ? JSON.stringify(updateData.degree_certificate) : null,
        updateData.branches,
        id
      ]
    );

    await connection.commit();
    return await getUserById(id);
  } catch (error) {
    await connection.rollback();
    console.error('Error updating user:', error);
    throw new Error(`Failed to update user: ${error.message}`);
  } finally {
    connection.release();
  }
};

const deleteUser = async (id) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();

    // First get user documents to potentially delete files later
    const [userDetails] = await connection.query(
      `SELECT profile_photo, resume, degree_certificate FROM user_details WHERE user_id = ?`,
      [id]
    );

    // Delete from user_details
    await connection.query(
      `DELETE FROM user_details WHERE user_id = ?`,
      [id]
    );

    // Then delete the user
    await connection.query(
      `DELETE FROM users WHERE id = ?`,
      [id]
    );

    await connection.commit();

    // Optionally delete associated files
    if (userDetails.length > 0) {
      const details = userDetails[0];
      const files = [];

      if (details.profile_photo) {
        const photo = JSON.parse(details.profile_photo);
        files.push(photo.url);
      }
      if (details.resume) {
        const resume = JSON.parse(details.resume);
        files.push(resume.url);
      }
      if (details.degree_certificate) {
        const degree = JSON.parse(details.degree_certificate);
        files.push(degree.url);
      }

      await Promise.all(
        files.map(file =>
          unlinkAsync(path.join(__dirname, '../../public', file))
            .catch(err => console.error('Error deleting file:', err))
        )
      );

      // Delete user directory
      const userDir = path.join(__dirname, '../../public/uploads/users', id.toString());
      if (fs.existsSync(userDir)) {
        fs.rmSync(userDir, { recursive: true, force: true });
      }
    }

    return { success: true, message: 'User deleted successfully' };
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting user:', error);
    throw new Error(`Failed to delete user: ${error.message}`);
  } finally {
    connection.release();
  }
};



const updateUserFiles = async (userId, files) => {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();

    // Prepare update fields
    const updateFields = {};
    const updateValues = [];

    let query = 'UPDATE user_details SET ';

    if (files.profile_photo) {
      query += 'profile_photo = ?, ';
      updateValues.push(JSON.stringify(files.profile_photo));
    }

    if (files.resume) {
      query += 'resume = ?, ';
      updateValues.push(JSON.stringify(files.resume));
    }

    if (files.degree_certificate) {
      query += 'degree_certificate = ?, ';
      updateValues.push(JSON.stringify(files.degree_certificate));
    }

    // Remove trailing comma and space
    query = query.slice(0, -2);
    query += ' WHERE user_id = ?';
    updateValues.push(userId);

    if (updateValues.length > 1) { // Only if we have files to update
      await connection.query(query, updateValues);
    }

    await connection.commit();
    return await getUserById(userId);
  } catch (error) {
    await connection.rollback();
    console.error('Error updating user files:', error);
    throw new Error(`Failed to update user files: ${error.message}`);
  } finally {
    connection.release();
  }
};



const searchUsers = async (query, limit = 10) => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT u.id, u.username, ud.first_name, ud.last_name, u.email, ud.user_code
       FROM users u
       LEFT JOIN user_details ud ON u.id = ud.user_id
       WHERE u.username LIKE ? OR ud.first_name LIKE ? OR ud.last_name LIKE ? OR u.email LIKE ? OR ud.user_code LIKE ?
       LIMIT ?`,
      [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, parseInt(limit)]
    );
    return rows;
  } catch (error) {
    console.error('Error searching users:', error);
    throw new Error(`Failed to search users: ${error.message}`);
  } finally {
    connection.release();
  }
};

const getUserCount = async () => {
  const connection = await pool.promise().getConnection();


  try {
    const [rows] = await connection.query(
      `SELECT COUNT(*) as count FROM users`
    );
    return rows[0].count;
  } catch (error) {
    console.error('Error getting user count:', error);
    throw new Error(`Failed to get user count: ${error.message}`);
  } finally {
    connection.release();
  }
};

const getRoles = async () => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT id, name FROM roles`
    );
    return rows;
  } catch (error) {
    console.error('Error getting roles:', error);
    throw new Error(`Failed to get roles: ${error.message}`);
  } finally {
    connection.release();
  }
};

const getCompanies = async () => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT id, company_name, company_code FROM companies`
    );
    return rows;
  } catch (error) {
    console.error('Error getting companies:', error);
    throw new Error(`Failed to get companies: ${error.message}`);
  } finally {
    connection.release();
  }
};

const getBranchesByCompany = async (companyId) => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT id, branch_name, branch_code FROM branches WHERE company_id = ?`,
      [companyId]
    );
    return rows;
  } catch (error) {
    console.error('Error getting branches by company:', error);
    throw new Error(`Failed to get branches: ${error.message}`);
  } finally {
    connection.release();
  }
};

module.exports = {
  createUser,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
  searchUsers,
  getUserCount,
  getRoles,
  getCompanies,
  getBranchesByCompany,
  updateUserFiles
};