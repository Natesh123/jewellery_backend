const customerService = require('../services/customerService');
const { successResponse, errorResponse } = require('../utills/apiResponse');
const fs = require('fs');
const path = require('path');

const validateCustomerData = (data) => {
  if (!data.customer_name) {
    throw new Error('Customer name is required');
  }
  if (!data.aadhar_no) {
    throw new Error('Aadhar number is required');
  }
  if (!data.address_1) {
    throw new Error('Address is required');
  }
  if (!data.city) {
    throw new Error('City is required');
  }
  if (!data.state) {
    throw new Error('State is required');
  }
  if (!data.phoneno) {
    throw new Error('Phone number is required');
  }
};

const saveUploadedFile = async (file, customerId, type) => {
  if (!file) return null;
  
  const uploadDir = path.join(__dirname, '../../public/uploads/customers', customerId.toString());
  
  // Create directory if not exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  const newFilename = `${type}-${Date.now()}-${file.originalname}`;
  const filePath = path.join(uploadDir, newFilename);
  
  await fs.promises.rename(file.path, filePath);
  
  return `/uploads/customers/${customerId}/${newFilename}`;
};

const createCustomer = async (req, res, next) => {
  try {
    const { body, files, user } = req;
    
    // Validate input data
    validateCustomerData(body);
    
    // Prepare customer data
    const customerData = {
      ...body,
      has_bank_account: body.has_bank_account === 'true',
      created_by: user.id,
      updated_by: user.id
    };
    
    // Create customer in database
    const customer = await customerService.createCustomer(customerData);
    
    // Handle file uploads if any
    if (files) {
      const uploadPromises = [];
      
      if (files.customer_photo) {
        uploadPromises.push(
          saveUploadedFile(files.customer_photo[0], customer.id, 'customer')
          .then(url => customerService.updateCustomerUploads(customer.id, { customer_photo: url })))
      }
      
      if (files.aadhar_photo) {
        uploadPromises.push(
          saveUploadedFile(files.aadhar_photo[0], customer.id, 'aadhar')
          .then(url => customerService.updateCustomerUploads(customer.id, { aadhar_photo: url })))
      }
      
      if (files.pan_photo) {
        uploadPromises.push(
          saveUploadedFile(files.pan_photo[0], customer.id, 'pan')
          .then(url => customerService.updateCustomerUploads(customer.id, { pan_photo: url })))
      }
      
      await Promise.all(uploadPromises);
    }
    
    // Get updated customer with all files
    const updatedCustomer = await customerService.getCustomerById(customer.id);
    successResponse(res, updatedCustomer, 201);
  } catch (error) {
    errorResponse(res, error.message, 400, error);
  }
};

const getCustomer = async (req, res, next) => {
  try {
    const customer = await customerService.getCustomerById(req.params.id);
    if (!customer) {
      return errorResponse(res, 'Customer not found', 404);
    }
    successResponse(res, customer);
  } catch (error) {
    errorResponse(res, 'Failed to fetch customer', 500, error);
  }
};

const getAllCustomers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, state, hasBankAccount } = req.query;
    
    const { customers, total } = await customerService.getAllCustomers({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      state,
      hasBankAccount
    });
    
    successResponse(res, {
      customers,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    errorResponse(res, 'Failed to fetch customers', 500, error);
  }
};

const updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { body, files, user } = req;
    
    // Get existing customer
    const existingCustomer = await customerService.getCustomerById(id);
    if (!existingCustomer) {
      return errorResponse(res, 'Customer not found', 404);
    }
    
    // Validate input data
    validateCustomerData(body);
    
    // Prepare update data
    const updateData = {
      ...body,
      has_bank_account: body.has_bank_account === 'true',
      updated_by: user.id
    };
    
    // Handle file uploads if any
    if (files) {
      if (files.customer_photo) {
        updateData.customer_photo = await saveUploadedFile(
          files.customer_photo[0], id, 'customer');
      }
      
      if (files.aadhar_photo) {
        updateData.aadhar_photo = await saveUploadedFile(
          files.aadhar_photo[0], id, 'aadhar');
      }
      
      if (files.pan_photo) {
        updateData.pan_photo = await saveUploadedFile(
          files.pan_photo[0], id, 'pan');
      }
    }
    
    // Update customer
    const updatedCustomer = await customerService.updateCustomer(id, updateData);
    successResponse(res, updatedCustomer);
  } catch (error) {
    errorResponse(res, error.message, 400, error);
  }
};

const deleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Get customer first to handle file cleanup
    const customer = await customerService.getCustomerById(id);
    if (!customer) {
      return errorResponse(res, 'Customer not found', 404);
    }
    
    // Delete associated files
    const uploadDir = path.join(__dirname, '../../public/uploads/customers', id);
    if (fs.existsSync(uploadDir)) {
      fs.rmSync(uploadDir, { recursive: true, force: true });
    }
    
    // Delete customer from database
    await customerService.deleteCustomer(id);
    successResponse(res, { message: 'Customer deleted successfully' });
  } catch (error) {
    errorResponse(res, 'Failed to delete customer', 500, error);
  }
};

const searchCustomers = async (req, res, next) => {
  try {
    const { query } = req.params;
    const customers = await customerService.searchCustomers(query);
    successResponse(res, customers);
  } catch (error) {
    errorResponse(res, 'Search failed', 500, error);
  }
};

const filterByState = async (req, res, next) => {
  try {
    const { state } = req.params;
    const customers = await customerService.filterByState(state);
    successResponse(res, customers);
  } catch (error) {
    errorResponse(res, 'Filter failed', 500, error);
  }
};

const filterByBankAccount = async (req, res, next) => {
  try {
    const { hasAccount } = req.params;
    const customers = await customerService.filterByBankAccount(hasAccount === 'true');
    successResponse(res, customers);
  } catch (error) {
    errorResponse(res, 'Filter failed', 500, error);
  }
};

const generateAadharOTP = async (req, res, next) => {
  try {
    const { aadhar_no } = req.body;
    
    if (!aadhar_no || aadhar_no.length !== 12) {
      return errorResponse(res, 'Invalid Aadhar number', 400);
    }
    
    const otp = await customerService.generateAadharOTP(aadhar_no);
    successResponse(res, { message: 'OTP sent successfully', otp });
  } catch (error) {
    errorResponse(res, error.message, 400, error);
  }
};

const verifyAadharOTP = async (req, res, next) => {
  try {
    const { aadhar_no, otp } = req.body;
    
    if (!aadhar_no || aadhar_no.length !== 12) {
      return errorResponse(res, 'Invalid Aadhar number', 400);
    }
    
    if (!otp || otp.length !== 6) {
      return errorResponse(res, 'Invalid OTP', 400);
    }
    
    const result = await customerService.verifyAadharOTP(aadhar_no, otp);
    successResponse(res, result);
  } catch (error) {
    errorResponse(res, error.message, 400, error);
  }
};

module.exports = {
  createCustomer,
  getCustomer,
  getAllCustomers,
  updateCustomer,
  deleteCustomer,
  searchCustomers,
  filterByState,
  filterByBankAccount,
  generateAadharOTP,
  verifyAadharOTP
};