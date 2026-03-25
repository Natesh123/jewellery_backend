const userService = require('../services/userService');
const { successResponse, errorResponse } = require('../utills/apiResponse');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const unlinkAsync = promisify(fs.unlink);

const validateUserData = (data) => {
  if (!data.username) throw new Error('Username is required');
  if (!data.email) throw new Error('Email is required');
  if (!data.role_id) throw new Error('Role is required');
  if (!data.company_id) throw new Error('Company is required');
  if (!data.branch_id) throw new Error('Branch is required');
};

const processUploadedFiles = async (files, userId, isUpdate = false) => {
  const result = {};
  const uploadDir = path.join(__dirname, '../../public/uploads/users', userId.toString());
  const tempDir = path.join(__dirname, '../../public/uploads/users/temp');

  // Create final directory if it doesn't exist
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Process each file type
  const fileTypes = ['profile_photo', 'resume', 'degree_certificate'];
  for (const type of fileTypes) {
    if (files && files[type] && files[type][0]) {
      const file = files[type][0];
      const newFilename = `${type}-${Date.now()}${path.extname(file.originalname)}`;
      const newPath = path.join(uploadDir, newFilename);

      // Move file from temp to final location
      await fs.promises.rename(file.path, newPath);

      result[type] = {
        name: file.originalname,
        url: `/uploads/users/${userId}/${newFilename}`
      };
    }
  }

  // Clean up temp directory if it exists
  if (fs.existsSync(tempDir)) {
    try {
      await fs.promises.rm(tempDir, { recursive: true, force: true });
    } catch (err) {
      console.error('Error cleaning up temp directory:', err);
    }
  }

  return result;
};

const createUser = async (req, res, next) => {
  try {
    const { body, files } = req;

    validateUserData(body);

    // Create user first to get ID
    const user = await userService.createUser(body);

    // Process and save files with the new user ID
    const uploadedFiles = await processUploadedFiles(files, user.id);

    // Update user with file paths
    const updatedUser = await userService.updateUserFiles(user.id, uploadedFiles);

    successResponse(res, updatedUser, 201);
  } catch (error) {
    errorResponse(res, error.message, 400, error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }
    successResponse(res, user);
  } catch (error) {
    errorResponse(res, 'Failed to fetch user', 500, error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.user.id);
    const { page = 1, limit = 10, search, role, status, company, branch } = req.query;

    let filters = {
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      role,
      status,
      company,
      branch,
      branches: null // default
    };

    if (user.role_id == 2) {
      filters.company = user.company_id;
      filters.branch = user.branch_id; // only one branch
    }

    if (user.role_id == 7) {
      filters.company = user.company_id;
      filters.branches = JSON.parse(user.branches || "[]");
      filters.branch = null; 
    }

    if ([2, 3, 4, 7].includes(user.role_id)) {
      const { users, total } = await userService.getAllUsers(user.role_id, filters);

      return successResponse(res, {
        users,
        pagination: {
          total,
          page: filters.page,
          limit: filters.limit,
          totalPages: Math.ceil(total / filters.limit)
        }
      });
    }

    return errorResponse(res, 'Unauthorized role', 403);

  } catch (error) {
    errorResponse(res, 'Failed to fetch users', 500, error);
  }
};



const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { body, files } = req;

    // Get existing user to check for files to delete
    const existingUser = await userService.getUserById(id);
    if (!existingUser) {
      return errorResponse(res, 'User not found', 404);
    }

    validateUserData(body);

    // Process uploaded files
    const uploadedFiles = await processUploadedFiles(files, id, true);

    // Combine updated fields with file info
    const updateData = {
      ...body,
      ...uploadedFiles
    };

    // Update user
    const updatedUser = await userService.updateUser(id, updateData);

    successResponse(res, updatedUser);
  } catch (error) {
    errorResponse(res, error.message, 400, error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get user first to handle file cleanup
    const user = await userService.getUserById(id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Delete user from database
    await userService.deleteUser(id);

    // Delete associated files
    const uploadDir = path.join(__dirname, '../../public/uploads/users', id);
    if (fs.existsSync(uploadDir)) {
      await fs.promises.rm(uploadDir, { recursive: true, force: true });
    }

    successResponse(res, { message: 'User deleted successfully' });
  } catch (error) {
    errorResponse(res, 'Failed to delete user', 500, error);
  }
};

const searchUsers = async (req, res, next) => {
  try {
    const { query } = req.params;
    const users = await userService.searchUsers(query);
    successResponse(res, users);
  } catch (error) {
    errorResponse(res, 'Search failed', 500, error);
  }
};

const getUserCount = async (req, res, next) => {
  console.log('Getting user count...');
  try {

    const count = await userService.getUserCount();

    console.log('User count:', count);

    successResponse(res, { count });
  } catch (error) {
    errorResponse(res, 'Failed to get user count', 500, error);
  }
};

const getRoles = async (req, res, next) => {
  try {
    const roles = await userService.getRoles();
    successResponse(res, roles);
  } catch (error) {
    errorResponse(res, 'Failed to get roles', 500, error);
  }
};

const getCompanies = async (req, res, next) => {
  try {
    const companies = await userService.getCompanies();
    successResponse(res, companies);
  } catch (error) {
    errorResponse(res, 'Failed to get companies', 500, error);
  }
};

const getBranchesByCompany = async (req, res, next) => {
  try {
    const branches = await userService.getBranchesByCompany(req.params.companyId);
    successResponse(res, branches);
  } catch (error) {
    errorResponse(res, 'Failed to get branches', 500, error);
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
  getBranchesByCompany
};