const pool = require('../config/db.config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Admin authentication
const authenticateAdmin = async (email, password) => {
  try {
    const [rows] = await pool.promise().query('SELECT * FROM users WHERE username = ?', [email]);

    if (rows.length === 0) {
      throw new Error('Admin not found');
    }

    const admin = rows[0];
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    if (!admin.is_active) {
      throw new Error('Admin account is inactive');
    }

    // Create token
    const token = jwt.sign(
      { id: admin.id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '1d' }
    );
    const [user_rows] = await  pool.promise().query(
      `SELECT * FROM user_details WHERE user_id=?`,
      [admin.id]
    );
    return {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      branch_id: user_rows[0].branch_id,
      token
    };
  } catch (error) {
    throw error;
  }
};

const resetAdminPassword = async (username, oldPassword, newPassword) => {
  try {
    // First, verify the user exists and old password is correct
    const [rows] = await pool.promise().query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      throw new Error('Admin not found');
    } 

    const user = rows[0];

    // Verify old password matches
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Check if new password is different from old password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new Error('New password cannot be the same as current password');
    }

    // Hash and update to new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await pool.promise().query(
      'UPDATE users SET password = ? WHERE username = ?',
      [hashedPassword, username]
    );

    return { message: 'Password reset successful' };
  } catch (error) {
    throw error;
  }
};



// Admin CRUD operations
const getAdminById = async (id) => {
  const [rows] = await pool.promise().query('SELECT id, username, email, role, is_active, created_at FROM users WHERE id = ?', [id]);
  return rows[0];
};

const getAllAdmins = async () => {
  const [rows] = await pool.promise().query('SELECT id, username, email, role, is_active, created_at FROM users');
  return rows;
};

const createAdmin = async (adminData) => {
  const { username, email, password, role = 'admin' } = adminData;

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const [result] = await pool.promise().query(
    'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
    [username, email, hashedPassword, role]
  );

  return getAdminById(result.insertId);
};

const updateAdmin = async (id, adminData) => {
  const { username, email, role, is_active } = adminData;

  await pool.promise().query(
    'UPDATE users SET username = ?, email = ?, role = ?, is_active = ? WHERE id = ?',
    [username, email, role, is_active, id]
  );

  return getAdminById(id);
};

const deleteAdmin = async (id) => {
  await pool.promise().query('DELETE FROM users WHERE id = ?', [id]);
  return { message: 'Admin removed' };
};

const getAdminProfile = async (id) => {
  return getAdminById(id);
};

const updateAdminProfile = async (id, updateData) => {
  const { username, email, password } = updateData;

  let updateFields = [];
  let queryParams = [];

  if (username) {
    updateFields.push('username = ?');
    queryParams.push(username);
  }

  if (email) {
    updateFields.push('email = ?');
    queryParams.push(email);
  }

  if (password) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    updateFields.push('password = ?');
    queryParams.push(hashedPassword);
  }

  if (updateFields.length === 0) {
    return getAdminById(id);
  }

  queryParams.push(id);

  await pool.promise().query(
    `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
    queryParams
  );

  return getAdminById(id);
};

const getAdminDashboardData = async () => {
  // Implement dashboard statistics logic here
  // Example:
  const [usersCount] = await pool.promise().query('SELECT COUNT(*) as count FROM users');
  const [ordersCount] = await pool.promise().query('SELECT COUNT(*) as count FROM orders');
  const [revenue] = await pool.promise().query('SELECT SUM(amount) as total FROM payments WHERE status = "completed"');

  return {
    users: usersCount[0].count,
    orders: ordersCount[0].count,
    revenue: revenue[0].total || 0
  };
};

module.exports = {
  authenticateAdmin,
  getAdminById,
  getAllAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getAdminProfile,
  updateAdminProfile,
  getAdminDashboardData,
  resetAdminPassword
};