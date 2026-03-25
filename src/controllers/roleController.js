// roleController.js
const roleService = require('../services/roleServices');
const { successResponse, errorResponse } = require('../utills/apiResponse');

const validateRoleData = (data) => {
  if (!data.name) {
    throw new Error('Role name is required');
  }
  if (!data.description) {
    throw new Error('Role description is required');
  }
  if (!['active', 'inactive'].includes(data.status)) {
    throw new Error('Invalid status value');
  }
};

const createRole = async (req, res, next) => {
  try {
    const { body } = req;
    
    // Validate input data
    validateRoleData(body);
    
    // Create role
    const role = await roleService.createRole(body, req.user.id);
    
    successResponse(res, role, 201);
  } catch (error) {
    errorResponse(res, error.message, 400, error);
  }
};

const getRole = async (req, res, next) => {
  try {
    const role = await roleService.getRoleById(req.params.id);
    if (!role) {
      return errorResponse(res, 'Role not found', 404);
    }
    successResponse(res, role);
  } catch (error) {
    errorResponse(res, 'Failed to fetch role', 500, error);
  }
};

const getAllRoles = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    
    const { roles, total } = await roleService.getAllRoles({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      status
    });
    
    successResponse(res, {
      roles,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    errorResponse(res, 'Failed to fetch roles', 500, error);
  }
};

const updateRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { body } = req;
    
    // Validate input data
    validateRoleData(body);
    
    // Update role
    const updatedRole = await roleService.updateRole(id, body, req.user.id);
    successResponse(res, updatedRole);
  } catch (error) {
    errorResponse(res, error.message, 400, error);
  }
};

const deleteRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Delete role
    await roleService.deleteRole(id);
    successResponse(res, { message: 'Role deleted successfully' });
  } catch (error) {
    errorResponse(res, error.message, 400, error);
  }
};

const searchRoles = async (req, res, next) => {
  try {
    const srole = req.query.query;  // ✅ Use query param

    console.log('Search query:', srole);

    const roles = await roleService.searchRoles(srole);
    successResponse(res, roles);
  } catch (error) {
    errorResponse(res, 'Search failed', 500, error);
  }
};


const filterByStatus = async (req, res, next) => {
  try {
    const status = req.query.status;
    
    const roles = await roleService.filterRolesByStatus(status);
    successResponse(res, roles);
  } catch (error) {
    errorResponse(res, 'Filter failed', 500, error);
  }
};

module.exports = {
  createRole,
  getRole,
  getAllRoles,
  updateRole,
  deleteRole,
  searchRoles,
  filterByStatus
};