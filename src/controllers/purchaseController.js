const purchaseService = require('../services/purchaseService');
const { successResponse, errorResponse } = require('../utills/apiResponse');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const bwipjs = require('bwip-js');
const puppeteer = require('puppeteer');
const Mustache = require('mustache');
const { getCurrentFinancialYear } = require('../middlewares/currfinancialYear');
const { getCustomerById } = require('../services/customerService');
const { getUserById } = require('../services/userService');

// Create new purchase
const createPurchase = async (req, res, next) => {
  try {
    const { body, files, user } = req;

    // Parse the main data field
    let bodyData;
    try {
      bodyData = typeof body.data === 'string' ? JSON.parse(body.data) : body.data;
    } catch (parseError) {
      throw new Error('Invalid data format');
    }

    // Parse products if they come as string
    if (typeof bodyData.products === 'string') {
      try {
        bodyData.products = JSON.parse(bodyData.products);
      } catch (error) {
        throw new Error('Invalid products format');
      }
    }

    // Validate required fields
    if (!bodyData.products || !Array.isArray(bodyData.products) || bodyData.products.length === 0) {
      throw new Error('Missing required fields: customer_id or products');
    }

    // Calculate total amount
    const total_amount = bodyData.products.reduce((sum, product) => {
      const amount = parseFloat(product.amount) || 0;
      return sum + amount;
    }, 0);

    // Prepare purchase data
    const purchaseData = {
      ...bodyData,
      total_amount,
      created_by: user.id,
      updated_by: user.id,
      financial_id: await getCurrentFinancialYear(),
      status: 'completed',
      margin_percent: bodyData.margin_percent || 3
    };

    // Handle file uploads
    if (files) {
      if (files.bill_copy) {
        purchaseData.bill_copy = await saveUploadedFile(files.bill_copy[0], 'temp', 'bill');
      }
      if (files.ornament_photo) {
        purchaseData.ornament_photo = await saveUploadedFile(files.ornament_photo[0], 'temp', 'ornament');
      }
      if (files.user_capture) {
        purchaseData.user_capture = await saveUploadedFile(files.user_capture[0], 'temp', 'LiveCapture');
      }
    }

    // Create purchase
    const purchase = await purchaseService.createPurchase(purchaseData);

    // Generate and save barcode


    // console.log(barcode);


    // Generate and save QR code

    console.log("purchase=>" + purchase)
    const updatedPurchase = await purchaseService.getPurchaseById(purchase.insertId);
    //  const barcode = await purchaseService.generateBarcode(updatedPurchase.purchase_id );
    //   const qrData = await purchaseService.generateQRCode(updatedPurchase.purchase_id );
    console.log(updatedPurchase);
    const obj = {
      ...updatedPurchase,
      company_code: purchase.company_code
    }
    successResponse(res, obj, 201);
  } catch (error) {
    console.error('Error in createPurchase:', error);
    errorResponse(res, error.message, 400, error);
  }
};

const getPurchaseByQuotationId = async (req, res, next) => {
  try {
    const quotationId = req.params.id;

    if (!quotationId) {
      return errorResponse(res, 'Quotation ID is required', 400);
    }

    const purchase = await purchaseService.getPurchaseByQuotationId(quotationId);

    if (!purchase) {
      return errorResponse(res, 'Purchase not found for this quotation', 404);
    }

    successResponse(res, purchase);
  } catch (error) {
    errorResponse(res, 'Failed to fetch purchase by quotation ID', 500, error);
  }
};

// Get purchase by ID
const getPurchaseById = async (req, res, next) => {
  try {
    const purchase = await purchaseService.getPurchaseById(req.params.id);
    if (!purchase) {
      return errorResponse(res, 'Purchase not found', 404);
    }

    // Include payment history
    purchase.payment_history = await purchaseService.getPaymentHistory(req.params.id);

    successResponse(res, purchase);
  } catch (error) {
    errorResponse(res, 'Failed to fetch purchase', 500, error);
  }
};

// Get all purchases with pagination
const getAllPurchases = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      metal, 
      status, 
      branch_id,
      start_date,
      end_date 
    } = req.query;

    const { purchases, total } = await purchaseService.getAllPurchases({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      metal,
      status,
      branch_id,
      start_date, // ✅ Add this
      end_date    // ✅ Add this
    });

    successResponse(res, {
      purchases,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching purchases:', error);
    errorResponse(res, 'Failed to fetch purchases', 500, error);
  }
};


const getAllPurchasesRegional = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, metal, status, startDate, endDate } = req.query;
    const managerId = req.params.manager_id; // assuming you get managerId from auth
    const branch_id = req.params.branch_id
    const { purchases, total } = await purchaseService.getAllPurchasesRegional(branch_id,managerId, {
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      metal,
      status,
      startDate,
      endDate
    });

    successResponse(res, {
      purchases,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching purchases:', error);
    errorResponse(res, error.message, 500, error);
  }
};







const updatePurchaseReligionStatus = async (req, res, next) => {
  try {
    const id = req.params.manager_id;
    await purchaseService.updatePurchaseReligionStatus(id, req.user.id, req.body);
    const updatedPurchase = await purchaseService.getPurchaseById(id);
    return res.status(200).json({
      success: true,
      data: updatedPurchase,
    });
  } catch (error) {
    console.error("Error updating purchase:", error);
    return errorResponse(res, error.message, 400, error);
  }
};

// ✅ In controller
const createSales = async (req, res, next) => {
  try {
    
    const result = await purchaseService.createSales( req.user.id, req.body);
    return res.status(200).json({
      success: true,
      sales_id: result.id,
    });
  } catch (error) {
    console.error("Error creating sales:", error);
    return errorResponse(res, error.message, 400, error);
  }
};



const getAllPurchasesAccounts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, metal, status, startDate, endDate } = req.query;
    const branch_id = req.params.branch_id
    const { purchases, total } = await purchaseService.getAllPurchasesAccounts(branch_id, {
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      metal,
      status,
      startDate,
      endDate
    });

    successResponse(res, {
      purchases,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching purchases:', error);
    errorResponse(res, error.message, 500, error);
  }
};


const updatePurchaseAccountsStatus = async (req, res, next) => {
  try {
    const id = req.params.accounts_id;
    await purchaseService.updatePurchaseAccountsStatus(id,  req.body);
    const updatedPurchase = await purchaseService.getPurchaseById(id);
    return res.status(200).json({
      success: true,
      data: updatedPurchase,
    });
  } catch (error) {
    console.error("Error updating purchase:", error);
    return errorResponse(res, error.message, 400, error);
  }
};


const updatePurchase = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { body, files, user } = req;

    // Parse the body data if it's a string
    const updateData = typeof body === 'string' ? JSON.parse(body) : body;

    console.log(updateData);


    // Ensure we're using the correct field names
    if (updateData.customer_id) {
      updateData.customer_id = updateData.customer_id;
      delete updateData.customer_id;
    }

    // Get existing purchase
    const existingPurchase = await purchaseService.getPurchaseById(id);
    if (!existingPurchase) {
      return errorResponse(res, 'Purchase not found', 404);
    }

    // Prepare update data with consistent field names
    const finalUpdateData = {
      ...updateData,
      updated_by: user.id
    };

    // Handle file uploads
    if (files) {
      if (files.bill_copy) {
        finalUpdateData.bill_copy = await saveUploadedFile(files.bill_copy[0], id, 'bill');
      }
      if (files.ornament_photo) {
        finalUpdateData.ornament_photo = await saveUploadedFile(files.ornament_photo[0], id, 'ornament');
      }
    }

    // Update purchase
    const updatedPurchase = await purchaseService.updatePurchase(id, finalUpdateData);
    successResponse(res, updatedPurchase);
  } catch (error) {
    console.error('Error updating purchase:', error);
    errorResponse(res, error.message, 400, error);
  }
};

// Delete purchase
const deletePurchase = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if purchase exists
    const purchase = await purchaseService.getPurchaseById(id);
    if (!purchase) {
      return errorResponse(res, 'Purchase not found', 404);
    }

    // Delete associated files
    const uploadDir = path.join(__dirname, '../../public/uploads/purchases', id);
    if (fs.existsSync(uploadDir)) {
      fs.rmSync(uploadDir, { recursive: true, force: true });
    }

    // Delete purchase
    await purchaseService.deletePurchase(id);
    successResponse(res, { message: 'Purchase deleted successfully' });
  } catch (error) {
    errorResponse(res, 'Failed to delete purchase', 500, error);
  }
};

// Aadhar verification
const verifyAadhar = async (req, res, next) => {
  try {
    const { aadhar_no, otp } = req.body;

    if (!aadhar_no || !otp) {
      throw new Error('Aadhar number and OTP are required');
    }

    // In a real implementation, this would call an Aadhar verification API
    // For demo purposes, we'll just check if OTP is '123456'
    if (otp === '123456') {
      successResponse(res, { verified: true, message: 'Aadhar verified successfully' });
    } else {
      successResponse(res, { verified: false, message: 'Invalid OTP' });
    }
  } catch (error) {
    errorResponse(res, error.message, 400, error);
  }
};

const sendAadharOtp = async (req, res, next) => {
  try {
    const { aadhar_no } = req.body;

    if (!aadhar_no || aadhar_no.length !== 12) {
      throw new Error('Valid 12-digit Aadhar number is required');
    }

    // In a real implementation, this would call an Aadhar OTP service
    // For demo purposes, we'll just return a static OTP
    successResponse(res, {
      success: true,
      message: 'OTP sent to registered mobile number',
      otp: '123456' // Demo OTP
    });
  } catch (error) {
    errorResponse(res, error.message, 400, error);
  }
};

// Payment methods
const getPaymentMethods = async (req, res, next) => {
  try {
    const methods = [
      { id: 'cash', name: 'Cash', description: 'Full payment in cash' },
      { id: 'bank_transfer', name: 'Bank Transfer', description: 'Full payment via bank transfer' },
      { id: 'partial_cash', name: 'Partial Cash', description: 'Partial payment in cash' },
      { id: 'partial_bank', name: 'Partial Bank', description: 'Partial payment via bank transfer' },
      { id: 'partial_both', name: 'Cash + Bank', description: 'Split payment (cash + bank transfer)' }
    ];

    successResponse(res, methods);
  } catch (error) {
    errorResponse(res, 'Failed to fetch payment methods', 500, error);
  }
};

// Record payment
const recordPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { payment_method, amount, bank_details, transaction_reference } = req.body;
    const { user } = req;

    // Get purchase details
    const purchase = await purchaseService.getPurchaseById(id);
    if (!purchase) {
      return errorResponse(res, 'Purchase not found', 404);
    }

    // Record payment
    const payment = await purchaseService.recordPayment({
      purchase_id: id,
      payment_method,
      amount,
      bank_details,
      transaction_reference,
      recorded_by: user.id
    });

    // Update purchase status if fully paid
    if (payment.remaining_amount <= 0) {
      await purchaseService.updatePurchase(id, { status: 'paid' });
    }

    successResponse(res, payment);
  } catch (error) {
    errorResponse(res, error.message, 400, error);
  }
};

// Get payment history
const getPaymentHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const history = await purchaseService.getPaymentHistory(id);
    successResponse(res, history);
  } catch (error) {
    errorResponse(res, 'Failed to fetch payment history', 500, error);
  }
};

// Generate barcode
const generateBarcode = async (req, res, next) => {
  try {
    const { id } = req.params;
    const barcode = await purchaseService.generateBarcode(id);
    successResponse(res, { barcode });
  } catch (error) {
    errorResponse(res, 'Failed to generate barcode', 500, error);
  }
};

// Download barcode
const downloadBarcode = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get purchase details
    const purchase = await purchaseService.getPurchaseById(id);
    if (!purchase || !purchase.barcode_path) {
      return errorResponse(res, 'Barcode not found', 404);
    }

    const barcodePath = path.join(__dirname, '../../public', purchase.barcode_path);
    if (!fs.existsSync(barcodePath)) {
      return errorResponse(res, 'Barcode file not found', 404);
    }

    res.download(barcodePath, `barcode-${purchase.purchase_id}.png`);
  } catch (error) {
    errorResponse(res, 'Failed to download barcode', 500, error);
  }
};

// Generate QR Code
const generateQRCode = async (req, res, next) => {
  try {
    const { id } = req.params;
    const qrData = await purchaseService.generateQRCode(id);
    successResponse(res, { qr_data: qrData });
  } catch (error) {
    errorResponse(res, 'Failed to generate QR code', 500, error);
  }
};

// Download QR Code
const downloadQRCode = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get purchase details
    const purchase = await purchaseService.getPurchaseById(id);
    if (!purchase || !purchase.qr_code_path) {
      return errorResponse(res, 'QR code not found', 404);
    }

    const qrPath = path.join(__dirname, '../../public', purchase.qr_code_path);
    if (!fs.existsSync(qrPath)) {
      return errorResponse(res, 'QR code file not found', 404);
    }

    res.download(qrPath, `qrcode-${purchase.purchase_id}.png`);
  } catch (error) {
    errorResponse(res, 'Failed to download QR code', 500, error);
  }
};

// Generate bill PDF
const generateBillPDF = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get purchase details
    const purchase = await purchaseService.getPurchaseById(id);
    if (!purchase) {
      return errorResponse(res, 'Purchase not found', 404);
    }

    // Get customer details
    const customer = await getCustomerById(purchase.customer_id);

    // Get user details
    const user = await getUserById(purchase.created_by || purchase.updated_by);

    // Prepare bill data
    const billData = {
      purchase_id: purchase.purchase_id,
      date: new Date(purchase.created_at).toLocaleDateString('en-IN'),
      customer_name: customer.customer_name,
      customer_address: `${customer.address_1}, ${customer.city}, ${customer.state}`,
      customer_phone: customer.phoneno,
      aadhar_no: customer.aadhar_no,
      pan_no: customer.pan_no,
      products: purchase.products.map(p => ({
        description: `${p.metal} ${p.product} (${p.sub_product})`,
        gross_weight: p.gross_weight,
        net_weight: p.net_weight,
        rate: p.rate,
        amount: p.amount
      })),
      total_amount: purchase.total_amount,
      payment_method: purchase.payment_method,
      prepared_by: user ? user.username : 'System'
    };

    // Generate PDF
    const pdfBuffer = await generatePDFDocument(billData);

    // Save PDF to server
    const uploadDir = path.join(__dirname, '../../public/uploads/purchases', id.toString());
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const pdfPath = path.join(uploadDir, 'bill.pdf');
    fs.writeFileSync(pdfPath, pdfBuffer);

    // Update purchase with bill path
    await purchaseService.updatePurchase(id, { bill_pdf_path: `/uploads/purchases/${id}/bill.pdf` });

    // Return PDF as response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=bill-${purchase.purchase_id}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    errorResponse(res, 'Failed to generate bill', 500, error);
  }
};

// Download bill
const downloadBill = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get purchase details
    const purchase = await purchaseService.getPurchaseById(id);
    if (!purchase || !purchase.bill_pdf_path) {
      return errorResponse(res, 'Bill not found', 404);
    }

    const billPath = path.join(__dirname, '../../public', purchase.bill_pdf_path);
    if (!fs.existsSync(billPath)) {
      return errorResponse(res, 'Bill file not found', 404);
    }

    res.download(billPath, `bill-${purchase.purchase_id}.pdf`);
  } catch (error) {
    errorResponse(res, 'Failed to download bill', 500, error);
  }
};

// Search purchases
const searchPurchases = async (req, res, next) => {
  try {
    const { query } = req.params;
    const purchases = await purchaseService.searchPurchases(query);
    successResponse(res, purchases);
  } catch (error) {
    errorResponse(res, 'Search failed', 500, error);
  }
};

// Filter purchases
const filterPurchases = async (req, res, next) => {
  try {
    const filters = req.query;
    const purchases = await purchaseService.filterPurchases(filters);
    successResponse(res, purchases);
  } catch (error) {
    errorResponse(res, 'Filter failed', 500, error);
  }
};

// Helper function to save uploaded files
const saveUploadedFile = async (file, purchaseId, type) => {
  if (!file) return null;

  const uploadDir = path.join(__dirname, '../../public/uploads/purchases', purchaseId.toString());

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const newFilename = `${type}-${Date.now()}${path.extname(file.originalname)}`;
  const filePath = path.join(uploadDir, newFilename);

  await fs.promises.rename(file.path, filePath);

  return `/uploads/purchases/${purchaseId}/${newFilename}`;
};

// Helper function to generate PDF document
const generatePDFDocument = async (billData) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // Add header
    doc.fontSize(20).text('AMAYA GOLD POINT', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text('PURCHASE BILL', { align: 'center' });
    doc.moveDown();

    // Add purchase info
    doc.fontSize(10).text(`Bill No: ${billData.purchase_id}`, { align: 'left' });
    doc.text(`Date: ${billData.date}`, { align: 'right' });
    doc.moveDown();

    // Add customer info
    doc.fontSize(12).text('Customer Details:', { underline: true });
    doc.fontSize(10).text(`Name: ${billData.customer_name}`);
    doc.text(`Address: ${billData.customer_address}`);
    doc.text(`Phone: ${billData.customer_phone}`);
    doc.text(`Aadhar: ${billData.aadhar_no}`);
    doc.text(`PAN: ${billData.pan_no}`);
    doc.moveDown();

    // Add products table
    const table = {
      headers: ['Description', 'Gross Wt', 'Net Wt', 'Rate', 'Amount'],
      rows: billData.products.map(p => [
        p.description,
        p.gross_weight.toFixed(3) + 'g',
        p.net_weight.toFixed(3) + 'g',
        '₹' + p.rate.toFixed(2),
        '₹' + p.amount.toFixed(2)
      ])
    };

    // Draw table
    drawTable(doc, table);
    doc.moveDown();

    // Add total
    doc.fontSize(12).text(`Total Amount: ₹${billData.total_amount.toFixed(2)}`, { align: 'right' });
    doc.moveDown();

    // Add payment method
    doc.fontSize(10).text(`Payment Method: ${formatPaymentMethod(billData.payment_method)}`);
    doc.moveDown();

    // Add footer
    doc.fontSize(10).text('Thank you for your business!', { align: 'center' });
    doc.moveDown();
    doc.text(`Prepared by: ${billData.prepared_by}`, { align: 'right' });

    doc.end();
  });
};

// Helper function to draw table
const drawTable = (doc, table) => {
  const initialY = doc.y;
  const columnWidth = (doc.page.width - 100) / table.headers.length;
  const rowHeight = 20;

  // Draw headers
  table.headers.forEach((header, i) => {
    doc.font('Helvetica-Bold')
      .text(header, 50 + (i * columnWidth), initialY, {
        width: columnWidth,
        align: 'center'
      });
  });

  // Draw rows
  table.rows.forEach((row, rowIndex) => {
    const y = initialY + (rowIndex + 1) * rowHeight;

    row.forEach((cell, cellIndex) => {
      doc.font('Helvetica')
        .text(cell, 50 + (cellIndex * columnWidth), y, {
          width: columnWidth,
          align: cellIndex === 0 ? 'left' : 'right'
        });
    });

    // Draw line under each row
    doc.moveTo(50, y + rowHeight - 5)
      .lineTo(doc.page.width - 50, y + rowHeight - 5)
      .stroke();
  });
};

// Helper function to format payment method
const formatPaymentMethod = (method) => {
  const methods = {
    cash: 'Cash',
    bank_transfer: 'Bank Transfer',
    partial_cash: 'Partial Payment (Cash)',
    partial_bank: 'Partial Payment (Bank)',
    partial_both: 'Partial Payment (Cash + Bank)'
  };
  return methods[method] || method;
};

module.exports = {
  createPurchase,
  getPurchaseById,
  getAllPurchases,
  updatePurchase,
  deletePurchase,
  verifyAadhar,
  sendAadharOtp,
  getPaymentMethods,
  recordPayment,
  getPaymentHistory,
  generateBarcode,
  downloadBarcode,
  generateQRCode,
  downloadQRCode,
  generateBillPDF,
  downloadBill,
  searchPurchases,
  filterPurchases,
  getPurchaseByQuotationId,
  getAllPurchasesRegional,
  updatePurchaseReligionStatus,
  updatePurchaseAccountsStatus,
  getAllPurchasesAccounts,getAllPurchasesAccounts,createSales
};