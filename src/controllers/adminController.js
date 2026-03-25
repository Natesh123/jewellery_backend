const { successResponse, errorResponse } = require('../utills/apiResponse');
const adminService = require('../services/adminService');

// @desc    Authenticate admin & get token
// @route   POST /api/admin/login
// @access  Public
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return errorResponse(res, 'Email and password are required', 400);
  }

  try {
    const admin = await adminService.authenticateAdmin(email, password);
    console.log(admin)
    successResponse(res, admin);
  } catch (error) {
    console.log(error)
    errorResponse(res, error.message, 401);
  }
};

const resetAdminPassword = async (req, res) => {
  const { username,oldPassword, newPassword, confirmPassword } = req.body;

  if (!username || !newPassword || !confirmPassword) {
    return errorResponse(res, 'Username, new password and confirm password are required', 400);
  }

  if (newPassword !== confirmPassword) {
    return errorResponse(res, 'Passwords do not match', 400);
  }

  try {
    const admin = await adminService.resetAdminPassword(username,oldPassword, newPassword);
    successResponse(res, admin);
  } catch (error) {
    errorResponse(res, error.message, 401);
  }
};


// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Private/Admin
const getAdminProfile = async (req, res) => {
  try {
    const admin = await adminService.getAdminProfile(req.user.id);
    successResponse(res, admin);
  } catch (error) {
    errorResponse(res, 'Admin not found', 404);
  }
};

// @desc    Update admin profile
// @route   PUT /api/admin/profile
// @access  Private/Admin
const updateAdminProfile = async (req, res) => {
  try {
    const updatedAdmin = await adminService.updateAdminProfile(req.user.id, req.body);
    successResponse(res, updatedAdmin);
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

// @desc    Get admin dashboard data
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getAdminDashboard = async (req, res) => {
  try {
    const dashboardData = await adminService.getAdminDashboardData();
    successResponse(res, dashboardData);
  } catch (error) {
    errorResponse(res, 'Failed to load dashboard data', 500);
  }
};

// @desc    Create a new admin (superadmin only)
// @route   POST /api/admin
// @access  Private/Superadmin
const createAdmin = async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return errorResponse(res, 'Not authorized', 403);
    }
    
    const admin = await adminService.createAdmin(req.body);
    successResponse(res, admin, 201);
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

// @desc    Get all admins
// @route   GET /api/admin
// @access  Private/Superadmin
const getAllAdmins = async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return errorResponse(res, 'Not authorized', 403);
    }
    
    const admins = await adminService.getAllAdmins();
    successResponse(res, admins);
  } catch (error) {
    errorResponse(res, 'Failed to fetch admins', 500);
  }
};

// @desc    Get admin by ID
// @route   GET /api/admin/:id
// @access  Private/Superadmin
const getAdminById = async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return errorResponse(res, 'Not authorized', 403);
    }
    
    const admin = await adminService.getAdminById(req.params.id);
    
    if (!admin) {
      return errorResponse(res, 'Admin not found', 404);
    }
    
    successResponse(res, admin);
  } catch (error) {
    errorResponse(res, 'Failed to fetch admin', 500);
  }
};

// @desc    Update admin
// @route   PUT /api/admin/:id
// @access  Private/Superadmin
const updateAdmin = async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return errorResponse(res, 'Not authorized', 403);
    }
    
    const updatedAdmin = await adminService.updateAdmin(req.params.id, req.body);
    successResponse(res, updatedAdmin);
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

// @desc    Delete admin
// @route   DELETE /api/admin/:id
// @access  Private/Superadmin
const deleteAdmin = async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return errorResponse(res, 'Not authorized', 403);
    }
    
    // Prevent self-deletion
    if (req.user.id === parseInt(req.params.id)) {
      return errorResponse(res, 'Cannot delete yourself', 400);
    }
    
    await adminService.deleteAdmin(req.params.id);
    successResponse(res, { message: 'Admin removed successfully' });
  } catch (error) {
    errorResponse(res, 'Failed to delete admin', 500);
  }
};

module.exports = {
  loginAdmin,
  getAdminProfile,
  updateAdminProfile,
  getAdminDashboard,
  createAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  resetAdminPassword
};