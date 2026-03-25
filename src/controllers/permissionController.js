const permissionService = require('../services/permissionServices');
const { successResponse, errorResponse } = require('../utills/apiResponse');

const validatePermissionData = (data) => {
  if (!data.roleId) {
    throw new Error('Role ID is required');
  }
  if (!data.permissions || !Array.isArray(data.permissions)) {
    throw new Error('Permissions array is required');
  }
};

const createPermission = async (req, res, next) => {
  try {
    const { body } = req;
    
    // Validate input data
    validatePermissionData(body);
    
    // Create permission
    const permission = await permissionService.createPermission(body, req.user.id);
    
    successResponse(res, permission, 201);
  } catch (error) {
    errorResponse(res, error.message, 400, error);
  }
};

const getPermission = async (req, res, next) => {
  try {
    const permission = await permissionService.getPermissionById(req.params.id);
    if (!permission) {
      return errorResponse(res, 'Permission not found', 404);
    }
    successResponse(res, permission);
  } catch (error) {
    errorResponse(res, 'Failed to fetch permission', 500, error);
  }
};

const getAllPermissions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, roleId } = req.query;
    
    const { permissions, total } = await permissionService.getAllPermissions({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      roleId
    });
    
    successResponse(res, {
      permissions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    errorResponse(res, 'Failed to fetch permissions', 500, error);
  }
};

const updatePermission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { body } = req;
    
    // Validate input data
    validatePermissionData(body);
    
    // Update permission
    const updatedPermission = await permissionService.updatePermission(id, body, req.user.id);
    successResponse(res, updatedPermission);
  } catch (error) {
    errorResponse(res, error.message, 400, error);
  }
};

const deletePermission = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Delete permission
    await permissionService.deletePermission(id);
    successResponse(res, { message: 'Permission deleted successfully' });
  } catch (error) {
    errorResponse(res, error.message, 400, error);
  }
};

const searchPermissions = async (req, res, next) => {
  try {
    const query = req.query.query;
    const permissions = await permissionService.searchPermissions(query);
    successResponse(res, permissions);
  } catch (error) {
    errorResponse(res, 'Search failed', 500, error);
  }
};

const getPermissionsByRole = async (req, res, next) => {
  try {
    const roleId = req.params.roleId;
    const permissions = await permissionService.getPermissionsByRole(roleId);
    successResponse(res, permissions);
  } catch (error) {
    errorResponse(res, 'Failed to fetch permissions by role', 500, error);
  }
};

module.exports = {
  createPermission,
  getPermission,
  getAllPermissions,
  updatePermission,
  deletePermission,
  searchPermissions,
  getPermissionsByRole
};