const quotationService = require('../services/pledgeQuotationService');
const customerService = require('../services/customerService');
const { successResponse, errorResponse } = require('../utills/apiResponse');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const getStream = require('get-stream');
const stream = require('stream');
const { getCurrentFinancialYear } = require('../middlewares/currfinancialYear');

const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);

// Helper function to save uploaded files
const saveUploadedFile = async (file, quotationId, type) => {
  if (!file) return null;

  const uploadDir = path.join(__dirname, '../../public/uploads/quotations', quotationId.toString());

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const newFilename = `${type}-${Date.now()}${path.extname(file.originalname)}`;
  const filePath = path.join(uploadDir, newFilename);

  await fs.promises.rename(file.path, filePath);

  return `/uploads/quotations/${quotationId}/${newFilename}`;
};

const createQuotation = async (req, res, next) => {
  try {
    const { body, files, user } = req;

    // Parse products if they come as string
    if (typeof body.products === 'string') {
      body.products = JSON.parse(body.products);
    }

    // Validate required fields
    if (!body.customer_id || !body.products || !Array.isArray(body.products) || body.products.length === 0) {
      throw new Error('Missing required fields');
    }

    // Calculate total amount
    const total_amount = body.products.reduce((sum, product) => sum + (product.amount || 0), 0);

    // Prepare quotation data
    const quotationData = {
      ...body,
      total_amount,
      created_by: user.id,
      updated_by: user.id,
      financial_id: await getCurrentFinancialYear(),
      status: 'active',
      margin_percent: body.margin_percent
    };

    // Handle file uploads
    if (files) {
      if (files.bill_copy) {
        quotationData.bill_copy = await saveUploadedFile(files.bill_copy[0], 'temp', 'bill');
      }
      if (files.ornament_photo) {
        quotationData.ornament_photo = await saveUploadedFile(files.ornament_photo[0], 'temp', 'ornament');
      }
    }

    // Create quotation
    const quotation = await quotationService.createPledgeQuotation(quotationData);

    // // Move temporary files to final location
    // if (quotationData.bill_copy) {
    //   const finalPath = await saveUploadedFile(
    //     { path: quotationData.bill_copy, originalname: 'bill_copy' }, 
    //     quotation.id, 
    //     'bill'
    //   );
    //   await quotationService.updateQuotation(quotation.id, { bill_copy: finalPath });
    // }

    // if (quotationData.ornament_photo) {
    //   const finalPath = await saveUploadedFile(
    //     { path: quotationData.ornament_photo, originalname: 'ornament_photo' }, 
    //     quotation.id, 
    //     'ornament'
    //   );
    //   await quotationService.updateQuotation(quotation.id, { ornament_photo: finalPath });
    // }

    // Return the complete quotation
    const updatedQuotation = await quotationService.getQuotationById(quotation.id);
    successResponse(res, updatedQuotation, 201);
  } catch (error) {
    errorResponse(res, error.message, 400, error);
  }
};

// Create quotation for specific customer
const createQuotationForCustomer = async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const { body, files, user } = req;

    // Parse products if they come as string
    if (typeof body.products === 'string') {
      body.products = JSON.parse(body.products);
    }

    // Get customer details
    const customer = await customerService.getCustomerById(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    // Calculate total amount
    const total_amount = body.products.reduce((sum, product) => sum + (product.amount || 0), 0);

    // Prepare quotation data
    const quotationData = {
      ...body,
      customer_id: customer.id,
      customer_name: customer.customer_name,
      aadhar_no: customer.aadhar_no,
      pan_no: customer.pan_no,
      total_amount,
      created_by: user.id,
      updated_by: user.id,
      financial_id: await getCurrentFinancialYear(),
      status: 'active',
      margin_percent: body.margin_percent || 3 // Default to 3% if not provided
    };

    // Handle file uploads
    if (files) {
      if (files.bill_copy) {
        quotationData.bill_copy = await saveUploadedFile(files.bill_copy[0], 'temp', 'bill');
      }
      if (files.ornament_photo) {
        quotationData.ornament_photo = await saveUploadedFile(files.ornament_photo[0], 'temp', 'ornament');
      }
    }
    const quotation = await quotationService.createPledgeQuotation(quotationData);
    console.log(quotation)
    const updatedQuotation = await quotationService.getQuotationById(quotation);
    successResponse(res, updatedQuotation, 200);
  } catch (error) {
    console.error('Error creating quotation for customer:', error);
    errorResponse(res, error.message, 400, error);
  }
};

// Get quotation by ID
const getQuotationById = async (req, res, next) => {
  try {
    let quotation = await quotationService.getQuotationById(req.params.id);

    if (quotation.margin_approval_requested) {
      quotation.approval_history = await quotationService.getApprovalHistory(req.params.id);
    }

    successResponse(res, quotation);
  } catch (error) {
    errorResponse(res, 'Failed to fetch quotation', 500, error);
  }
};



const getPledgeFinalQuotationById = async (req, res, next) => {
  try {
    const quotation = await quotationService.getPledgeFinalQuotationById(req.params.id);
    if (!quotation) {
      return errorResponse(res, 'Quotation not found', 404);
    }

    // Include approval history if exists
    if (quotation.margin_approval_requested) {
      quotation.approval_history = await quotationService.getApprovalHistory(req.params.id);
    }

    successResponse(res, quotation);
  } catch (error) {
    errorResponse(res, 'Failed to fetch quotation', 500, error);
  }
};

// Get all quotations with pagination
const getAllQuotations = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, metal, status } = req.query;

    const { quotations, total } = await quotationService.getAllQuotations({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      metal,
      status
    });

    successResponse(res, {
      quotations,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching quotations:', error);
    errorResponse(res, 'Failed to fetch quotations', 500, error);
  }
};

// Get all quotations with pagination
const getAllFinalQuotations = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, metal, status, start_date, end_date } = req.query;

    const { quotations, total } = await quotationService.getAllFinalQuotations({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      metal,
      status,
      start_date,  // Add this
      end_date     // Add this
    });

    successResponse(res, {
      quotations,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching quotations:', error);
    errorResponse(res, 'Failed to fetch quotations', 500, error);
  }
};

const getAllQuotationsForPurchase = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, metal, status } = req.query;

    const { quotations, total } = await quotationService.getAllQuotationsForPurchase({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      metal,
      status
    });

    successResponse(res, {
      quotations,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching quotations:', error);
    errorResponse(res, 'Failed to fetch quotations', 500, error);
  }
};

// Update quotation
const updateQuotation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { body, files, user } = req;

    // Get existing quotation
    const existingQuotation = await quotationService.getPledgeFinalQuotationById(id);
    if (!existingQuotation) {
      return errorResponse(res, 'Quotation not found', 404);
    }
    
    console.log(body);
    // Calculate total amount if products are updated
    if (Array.isArray(body.products)) {
      body.total_amount = body.products.reduce(
        (sum, product) => sum + (product.amount || 0),
        0
      );
    } else {
      body.total_amount = 0; // or handle accordingly
    }

    // Prepare update data
    const updateData = {
      ...body,
      updated_by: user.id
    };

    // Handle file uploads
    if (files) {
      if (files.bill_copy) {
        updateData.bill_copy = await saveUploadedFile(files.bill_copy[0], id, 'bill');
      }
      if (files.ornament_photo) {
        updateData.ornament_photo = await saveUploadedFile(files.ornament_photo[0], id, 'ornament');
      }
    }


    // Update quotation
    const updatedQuotation = await quotationService.updatePledgeFinalQuotation(id, updateData);
    successResponse(res, updatedQuotation);
  } catch (error) {
    console.error('Error updating quotation:', error);
    errorResponse(res, error.message, 400, error);
  }
};

// Delete quotation
const deleteQuotation = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Delete quotation
    await quotationService.deleteQuotation(id);
    successResponse(res, { message: 'Quotation deleted successfully' });
  } catch (error) {
    console.log(error)
    errorResponse(res, 'Failed to delete quotation', 500, error);
  }
};

// Search quotations
const searchQuotations = async (req, res, next) => {
  try {
    const { query } = req.params;
    const quotations = await quotationService.searchQuotations(query);
    successResponse(res, quotations);
  } catch (error) {
    errorResponse(res, 'Search failed', 500, error);
  }
};

// Filter quotations
const filterQuotations = async (req, res, next) => {
  try {
    const filters = req.query;
    const quotations = await quotationService.filterQuotations(filters);
    successResponse(res, quotations);
  } catch (error) {
    errorResponse(res, 'Filter failed', 500, error);
  }
};

// Generate PDF for quotation
const generateQuotationPDF = async (req, res) => {
  try {
    const buffer = await quotationService.generateQuotationPDF(req.params.id);

    if (!buffer || buffer.length < 100) {
      throw new Error("Generated PDF buffer is too small or empty");
    }

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="quotation_${req.params.id}.pdf"`,
      'Content-Length': buffer.length
    });

    res.send(buffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    errorResponse(res, 'Failed to generate PDF', 500);
  }
};


// Get metal options
const getMetalOptions = async (req, res, next) => {
  try {
    const metals = await quotationService.getMetalOptions();
    successResponse(res, metals);
  } catch (error) {
    errorResponse(res, 'Failed to fetch metal options', 500, error);
  }
};

// Get product options
const getProductOptions = async (req, res, next) => {
  try {
    const products = await quotationService.getProductOptions();
    successResponse(res, products);
  } catch (error) {
    errorResponse(res, 'Failed to fetch product options', 500, error);
  }
};

// Get sub-product options
const getSubProductOptions = async (req, res, next) => {
  try {
    const { product } = req.params;
    const subProducts = await quotationService.getSubProductOptions(product);
    successResponse(res, subProducts);
  } catch (error) {
    errorResponse(res, 'Failed to fetch sub-product options', 500, error);
  }
};

// Get MCX rates
const getMCXRates = async (req, res, next) => {
  try {
    const rates = await quotationService.getMCXRates();
    successResponse(res, rates);
  } catch (error) {
    errorResponse(res, 'Failed to fetch MCX rates', 500, error);
  }
};
const updateMCXRate = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await quotationService.updateMCXRate(id, req.body);
    res.json({ success: true, message: "MCX Rate updated", ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update MCX Rate", error });
  }
};

const deleteMCXRate = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await quotationService.deleteMCXRate(id);
    res.json({ success: true, message: "MCX Rate deleted", ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete MCX Rate", error });
  }
};

const getMCXRatesAll = async (req, res, next) => {
  try {
    const rates = await quotationService.getMCXRatesAll();
    successResponse(res, rates);
  } catch (error) {
    errorResponse(res, 'Failed to fetch MCX rates', 500, error);
  }
};

// Request margin approval
const requestMarginApproval = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user } = req;
    const { old_margin, new_margin, reason } = req.body;

    const result = await quotationService.requestMarginApproval(
      id,
      user.id,
      { old_margin, new_margin, reason }
    );

    successResponse(res, result);
  } catch (error) {
    errorResponse(res, error.message, 400, error);
  }
};

// Approve margin change
const approveMarginChange = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user } = req;
    const { approval_notes } = req.body;

    const result = await quotationService.approveMarginChange(
      id,
      user.id,
      approval_notes
    );

    successResponse(res, result);
  } catch (error) {
    errorResponse(res, error.message, 400, error);
  }
};

// Reject margin change
const rejectMarginChange = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user } = req;
    const { rejection_reason } = req.body;

    const result = await quotationService.rejectMarginChange(
      id,
      user.id,
      rejection_reason
    );

    successResponse(res, result);
  } catch (error) {
    errorResponse(res, error.message, 400, error);
  }
};

// Get pending approvals
const getPendingApprovals = async (req, res, next) => {
  try {
    const approvals = await quotationService.getPendingApprovals();
    successResponse(res, approvals);
  } catch (error) {
    errorResponse(res, 'Failed to fetch pending approvals', 500, error);
  }
};

// Get monthly analysis
const getMonthlyAnalysis = async (req, res, next) => {
  try {
    const { year } = req.query;
    const analysis = await quotationService.getMonthlyAnalysis(year);
    successResponse(res, analysis);
  } catch (error) {
    errorResponse(res, 'Failed to fetch monthly analysis', 500, error);
  }
};

// Get product-wise analysis
const getProductWiseAnalysis = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const analysis = await quotationService.getProductWiseAnalysis(startDate, endDate);
    successResponse(res, analysis);
  } catch (error) {
    errorResponse(res, 'Failed to fetch product-wise analysis', 500, error);
  }
};

// Get metal-wise analysis
const getMetalWiseAnalysis = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const analysis = await quotationService.getMetalWiseAnalysis(startDate, endDate);
    successResponse(res, analysis);
  } catch (error) {
    errorResponse(res, 'Failed to fetch metal-wise analysis', 500, error);
  }
};

module.exports = {
  createQuotation,
  createQuotationForCustomer,
  getQuotationById,
  getAllQuotations,
  updateQuotation,
  deleteQuotation,
  searchQuotations,
  filterQuotations,
  generateQuotationPDF,
  getMetalOptions,
  getProductOptions,
  getSubProductOptions,
  getMCXRates,
  requestMarginApproval,
  approveMarginChange,
  rejectMarginChange,
  getPendingApprovals,
  getMonthlyAnalysis,
  getProductWiseAnalysis,
  getMetalWiseAnalysis,
  getMCXRatesAll,
  updateMCXRate,
  deleteMCXRate,
  getAllQuotationsForPurchase,
  getAllFinalQuotations,
  getPledgeFinalQuotationById
};