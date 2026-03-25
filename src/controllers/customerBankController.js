const customerBankService = require('../services/customerBankService');
const { successResponse, errorResponse } = require('../utills/apiResponse');
const fs = require('fs');
const path = require('path');

const validateBankAccountData = (data , candu) => {

    if (candu === 'create') {
  if (!data.customer_id ) {
    throw new Error('Customer ID is required');
  }
  if (!data.bank_name) {
    throw new Error('Bank name is required');
  }
  if (!data.account_number) {
    throw new Error('Account number is required');
  }
  if (!data.ifsc_code) {
    throw new Error('IFSC code is required');
  }
  if (!data.branch_name) {
    throw new Error('Branch name is required');
  }
  if (!data.account_type) {
    throw new Error('Account type is required');
  }
}
else if (candu === 'update') {
     if (!data.bank_name) {
    throw new Error('Bank name is required');
  }
  if (!data.account_number) {
    throw new Error('Account number is required');
  }
  if (!data.ifsc_code) {
    throw new Error('IFSC code is required');
  }
  if (!data.branch_name) {
    throw new Error('Branch name is required');
  }
  if (!data.account_type) {
    throw new Error('Account type is required');
  }
}
};

const saveBankDocuments = async (files, bankAccountId) => {
  if (!files || files.length === 0) return [];
  
  const uploadDir = path.join(__dirname, '../../public/uploads/bank-accounts', bankAccountId.toString());
  
  // Create directory if not exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  const documentPromises = files.map(async (file, index) => {
    const newFilename = `doc-${Date.now()}-${index}-${file.originalname}`;
    const filePath = path.join(uploadDir, newFilename);
    
    await fs.promises.rename(file.path, filePath);
    
    return {
      name: file.originalname,
      type: file.mimetype,
      url: `/uploads/bank-accounts/${bankAccountId}/${newFilename}`
    };
  });
  
  return Promise.all(documentPromises);
};

const createBankAccount = async (req, res, next) => {
  try {
    const { body, files, user } = req;
    
    // Validate input data
    validateBankAccountData(body , 'create');
    
    // Prepare bank account data
    const bankAccountData = {
      ...body,
      is_primary: body.is_primary === 'true',
      created_by: user.id,
      updated_by: user.id
    };
    
    // Handle document uploads
    if (files && files.length > 0) {
      bankAccountData.documents = await saveBankDocuments(files, body.customer_id);
    }
    
    // Create bank account
    const bankAccount = await customerBankService.createBankAccount(bankAccountData);
    
    // If this is the first account for customer, set as primary
    if (bankAccount.is_primary) {
      await customerBankService.setPrimaryBankAccount(bankAccount.id);
    }
    
    successResponse(res, bankAccount, 201);
  } catch (error) {
    errorResponse(res, error.message, 400, error);
  }
};

const getBankAccount = async (req, res, next) => {
    console.log('req.params:', req.params.id);
    
  try {
    const bankAccount = await customerBankService.getBankAccountById(req.params.id);
    if (!bankAccount) {
      return errorResponse(res, 'Bank account not found', 404);
    }
    successResponse(res, bankAccount);
  } catch (error) {
    errorResponse(res, 'Failed to fetch bank account', 500, error);
  }
};

const getAllBankAccounts = async (req, res, next) => {
    console.log('req.query:', req.query);
    
  try {
    const { page = 1, limit = 10, search, bankName } = req.query;
    
    const { bankAccounts, total } = await customerBankService.getAllBankAccounts({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      bankName
    });
    
    successResponse(res, {
      bankAccounts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    errorResponse(res, 'Failed to fetch bank accounts', 500, error);
  }
};

const getBankAccountsByCustomer = async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const bankAccounts = await customerBankService.getBankAccountsByCustomer(customerId);
    successResponse(res, bankAccounts);
  } catch (error) {
    errorResponse(res, 'Failed to fetch customer bank accounts', 500, error);
  }
};

const updateBankAccount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { body, files, user } = req;
    
    // Get existing bank account
    const existingAccount = await customerBankService.getBankAccountById(id);
    if (!existingAccount) {
      return errorResponse(res, 'Bank account not found', 404);
    }
    
    // Validate input data
    validateBankAccountData(body , 'update');
    
    // Prepare update data
    const updateData = {
      ...body,
      is_primary: body.is_primary === 'true',
      updated_by: user.id
    };
    
    // Handle document uploads
    if (files && files.length > 0) {
      updateData.documents = await saveBankDocuments(files, id);
    }
    
    // Update bank account
    const updatedAccount = await customerBankService.updateBankAccount(id, updateData);
    
    // If set as primary, update all other accounts
    if (updatedAccount.is_primary) {
      await customerBankService.setPrimaryBankAccount(id);
    }
    
    successResponse(res, updatedAccount);
  } catch (error) {
    errorResponse(res, error.message, 400, error);
  }
};

const deleteBankAccount = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Get bank account first to handle document cleanup
    const bankAccount = await customerBankService.getBankAccountById(id);
    if (!bankAccount) {
      return errorResponse(res, 'Bank account not found', 404);
    }
    
    // Delete associated documents
    const uploadDir = path.join(__dirname, '../../public/uploads/bank-accounts', id);
    if (fs.existsSync(uploadDir)) {
      fs.rmSync(uploadDir, { recursive: true, force: true });
    }
    
    // Delete bank account from database
    await customerBankService.deleteBankAccount(id);
    successResponse(res, { message: 'Bank account deleted successfully' });
  } catch (error) {
    errorResponse(res, 'Failed to delete bank account', 500, error);
  }
};

const setPrimaryBankAccount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await customerBankService.setPrimaryBankAccount(id);
    successResponse(res, result);
  } catch (error) {
    errorResponse(res, error.message, 400, error);
  }
};

const searchBankAccounts = async (req, res, next) => {
  try {
    const { query } = req.params;
    const bankAccounts = await customerBankService.searchBankAccounts(query);
    successResponse(res, bankAccounts);
  } catch (error) {
    errorResponse(res, 'Search failed', 500, error);
  }
};

const filterByBankName = async (req, res, next) => {
  try {
    const { bankName } = req.params;
    const bankAccounts = await customerBankService.filterByBankName(bankName);
    successResponse(res, bankAccounts);
  } catch (error) {
    errorResponse(res, 'Filter failed', 500, error);
  }
};

module.exports = {
  createBankAccount,
  getBankAccount,
  getAllBankAccounts,
  getBankAccountsByCustomer,
  updateBankAccount,
  deleteBankAccount,
  setPrimaryBankAccount,
  searchBankAccounts,
  filterByBankName
};