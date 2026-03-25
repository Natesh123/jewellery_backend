const companyService = require('../services/companyService');
const { successResponse, errorResponse } = require('../utills/apiResponse');
const fs = require('fs');
const path = require('path');

const validateCompanyData = (data) => {
  if (!data.company_name) {
    throw new Error('Company name is required');
  }
  if (!data.gst_no) {
    throw new Error('GST number is required');
  }
  if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(data.gst_no)) {
    throw new Error('Invalid GST format');
  }
};

const saveUploadedFiles = async (files, companyId) => {
  if (!files || files.length === 0) return [];
  
  const uploadDir = path.join(__dirname, '../../public/uploads/companies', companyId.toString());
  
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
      url: `/uploads/companies/${companyId}/${newFilename}`
    });
  }
  
  return documents;
};

const createCompany = async (req, res, next) => {
  try {
    const { body, files } = req;

    
    
    // Validate input data
    validateCompanyData(body);
    
 
    // Prepare company data
    const companyData = {
      ...body,
      documents: []
    };
    
    
    // Create company in database
    const company = await companyService.createCompany(companyData);
    
    // Handle file uploads if any
    if (files && files.length > 0) {
      const documents = await saveUploadedFiles(files, company.id);
      companyData.documents = documents;

      console.log(companyData);
      
      
      // Update company with document references
      await companyService.updateCompany(company.id, companyData);
    }
    
    successResponse(res, company, 201);
  } catch (error) {
    errorResponse(res, error.message, 400, error);
  }
};

const getCompany = async (req, res, next) => {
  try {
    const company = await companyService.getCompanyById(req.params.id);
    if (!company) {
      return errorResponse(res, 'Company not found', 404);
    }
    successResponse(res, company);
  } catch (error) {
    errorResponse(res, 'Failed to fetch company', 500, error);
  }
};

const getAllCompanies = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, state, turnover } = req.query;
    
    const { companies, total } = await companyService.getAllCompanies({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      state,
      turnover
    });
    
    successResponse(res, {
      companies,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    errorResponse(res, 'Failed to fetch companies', 500, error);
  }
};

const updateCompany = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { body, files } = req;
    
    // Get existing company
    const existingCompany = await companyService.getCompanyById(id);
    if (!existingCompany) {
      return errorResponse(res, 'Company not found', 404);
    }
    
    // Validate input data
    if (body.gst_no && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(body.gst_no)) {
      throw new Error('Invalid GST format');
    }
    
    // Handle file uploads if any
    let documents = existingCompany.documents || [];
    if (files && files.length > 0) {
      const newDocuments = await saveUploadedFiles(files, id);
      documents = [...documents, ...newDocuments];
    }
    
    // Prepare update data
    const updateData = {
      ...body,
      documents
    };
    
    // Update company
    const updatedCompany = await companyService.updateCompany(id, updateData);
    successResponse(res, updatedCompany);
  } catch (error) {
    errorResponse(res, error.message, 400, error);
  }
};

const deleteCompany = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Get company first to handle document cleanup
    const company = await companyService.getCompanyById(id);
    if (!company) {
      return errorResponse(res, 'Company not found', 404);
    }
    
    // Delete associated documents
    if (company.documents && company.documents.length > 0) {
      const uploadDir = path.join(__dirname, '../../public/uploads/companies', id);
      if (fs.existsSync(uploadDir)) {
        fs.rmSync(uploadDir, { recursive: true, force: true });
      }
    }
    
    // Delete company from database
    await companyService.deleteCompany(id);
    successResponse(res, { message: 'Company deleted successfully' });
  } catch (error) {
    errorResponse(res, 'Failed to delete company', 500, error);
  }
};

const searchCompanies = async (req, res, next) => {
  try {
    const { query } = req.params;
    const companies = await companyService.searchCompanies(query);
    successResponse(res, companies);
  } catch (error) {
    errorResponse(res, 'Search failed', 500, error);
  }
};

const filterByState = async (req, res, next) => {
  try {
    const { state } = req.params;
    const companies = await companyService.filterByState(state);
    successResponse(res, companies);
  } catch (error) {
    errorResponse(res, 'Filter failed', 500, error);
  }
};

const filterByTurnover = async (req, res, next) => {
  try {
    const { turnover } = req.params;
    const companies = await companyService.filterByTurnover(turnover);
    successResponse(res, companies);
  } catch (error) {
    errorResponse(res, 'Filter failed', 500, error);
  }
};



module.exports = {
  createCompany,
  getCompany,
  getAllCompanies,
  updateCompany,
  deleteCompany,
  searchCompanies,
  filterByState,
  filterByTurnover
};