const branchService = require('../services/branchService');
const { successResponse, errorResponse } = require('../utills/apiResponse');
const fs = require('fs');
const path = require('path');

const validateBranchData = (data) => {
  if (!data.company_id) {
    throw new Error('Company ID is required');
  }
  if (!data.branch_name) {
    throw new Error('Branch name is required');
  }
  if (!data.address1) {
    throw new Error('Address is required');
  }
  if (!data.city) {
    throw new Error('City is required');
  }
  if (!data.state) {
    throw new Error('State is required');
  }
};

const saveUploadedFiles = async (files, branchId) => {
  if (!files || files.length === 0) return [];
  
  const uploadDir = path.join(__dirname, '../../public/uploads/branches', branchId.toString());
  
  // Create directory if not exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  const documents = [];
  
  for (const file of files) {
    const newFilename = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(uploadDir, newFilename);
    
    await fs.promises.rename(file.path, filePath);
    
    documents.push({
      name: file.originalname,
      url: `/uploads/branches/${branchId}/${newFilename}`
    });
  }
  
  return documents;
};

const createBranch = async (req, res, next) => {
  try {
    const { body, files } = req;
    
    // Validate input data
    validateBranchData(body);
    
    // Prepare branch data
    const branchData = {
      ...body,
      documents: []
    };
    
    // Create branch in database
    const branch = await branchService.createBranch(branchData);
    
    // Handle file uploads if any
    if (files && files.length > 0) {
      const documents = await saveUploadedFiles(files, branch.id);
      branchData.documents = documents;
      
      // Update branch with document references
      await branchService.updateBranch(branch.id, branchData);
    }
    
    successResponse(res, branch, 201);
  } catch (error) {
    errorResponse(res, error.message, 400, error);
  }
};

const getBranch = async (req, res, next) => {
  try {

    const branch = await branchService.getBranchById(req.params.id);
    if (!branch) {
      return errorResponse(res, 'Branch not found', 404);
    }
    successResponse(res, branch);
  } catch (error) {
    errorResponse(res, 'Failed to fetch branch', 500, error);
  }
};

const getBranchByCompany = async (req, res, next) => {
  try {

    
    
    const branch = await branchService.getBranchByCompanyId(req.params.companyId);
    if (!branch) {
      return errorResponse(res, 'Branch not found', 404);
    }
    successResponse(res, branch);
  } catch (error) {
    errorResponse(res, 'Failed to fetch branch', 500, error);
  }
};

const getAllBranches = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, state, company } = req.query;
    
    const { branches, total } = await branchService.getAllBranches({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      state,
      company
    });
    
    successResponse(res, {
      branches,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    errorResponse(res, 'Failed to fetch branches', 500, error);
  }
};

const updateBranch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { body, files } = req;
    
    // Get existing branch
    const existingBranch = await branchService.getBranchById(id);
    if (!existingBranch) {
      return errorResponse(res, 'Branch not found', 404);
    }
    
    // Validate input data
    validateBranchData(body);
    
    // Handle file uploads if any
    let documents = existingBranch.documents || [];
    if (files && files.length > 0) {
      const newDocuments = await saveUploadedFiles(files, id);
      documents = [...documents, ...newDocuments];
    }
    
    // Prepare update data
    const updateData = {
      ...body,
      documents
    };
    
    // Update branch
    const updatedBranch = await branchService.updateBranch(id, updateData, req.user.id);
    successResponse(res, updatedBranch);
  } catch (error) {
    errorResponse(res, error.message, 400, error);
  }
};

const deleteBranch = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Get branch first to handle document cleanup
    const branch = await branchService.getBranchById(id);
    if (!branch) {
      return errorResponse(res, 'Branch not found', 404);
    }
    
    // Delete associated documents
    if (branch.documents && branch.documents.length > 0) {
      const uploadDir = path.join(__dirname, '../../public/uploads/branches', id);
      if (fs.existsSync(uploadDir)) {
        fs.rmSync(uploadDir, { recursive: true, force: true });
      }
    }
    
    // Delete branch from database
    await branchService.deleteBranch(id);
    successResponse(res, { message: 'Branch deleted successfully' });
  } catch (error) {
    errorResponse(res, 'Failed to delete branch', 500, error);
  }
};

const searchBranches = async (req, res, next) => {
  try {
    const { query } = req.params;
    const branches = await branchService.searchBranches(query);
    successResponse(res, branches);
  } catch (error) {
    errorResponse(res, 'Search failed', 500, error);
  }
};

const filterByState = async (req, res, next) => {
  try {
    const { state } = req.params;
    const branches = await branchService.filterByState(state);
    successResponse(res, branches);
  } catch (error) {
    errorResponse(res, 'Filter failed', 500, error);
  }
};

const filterByCompany = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const branches = await branchService.filterByCompany(companyId);
    successResponse(res, branches);
  } catch (error) {
    errorResponse(res, 'Filter failed', 500, error);
  }
};

module.exports = {
  createBranch,
  getBranch,
  getAllBranches,
  updateBranch,
  deleteBranch,
  searchBranches,
  filterByState,
  filterByCompany,
  getBranchByCompany
};