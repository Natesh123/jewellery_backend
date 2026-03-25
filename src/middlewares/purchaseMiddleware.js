// middlewares/purchaseMiddleware.js
const { errorResponse } = require('../utills/apiResponse');

// Validate payment data
const validatePayment = (req, res, next) => {
  const { payment_method, amount, cashAmount, bankAmount } = req.body;
  const purchase = req.purchase; // Assuming purchase is attached to request
  
  if (!payment_method) {
    return errorResponse(res, 'Payment method is required', 400);
  }
  
  // Validate full payment
  if (payment_method === 'cash' || payment_method === 'bank_transfer') {
    if (parseFloat(amount) !== purchase.total_amount) {
      return errorResponse(res, 'Payment amount must equal total amount', 400);
    }
  }
  
  // Validate partial payment
  if (payment_method.includes('partial')) {
    const cash = parseFloat(cashAmount) || 0;
    const bank = parseFloat(bankAmount) || 0;
    const total = cash + bank;
    
    if (Math.abs(total - purchase.total_amount) > 0.01) {
      return errorResponse(res, 'Partial payments must equal total amount', 400);
    }
    
    if (payment_method === 'partial_bank' && !req.body.bank_details) {
      return errorResponse(res, 'Bank details are required for bank transfer', 400);
    }
  }
  
  next();
};

// Attach purchase to request
const getPurchase = async (req, res, next) => {
  try {
    const purchase = await purchaseService.getPurchaseById(req.params.id);
    if (!purchase) {
      return errorResponse(res, 'Purchase not found', 404);
    }
    
    req.purchase = purchase;
    next();
  } catch (error) {
    errorResponse(res, 'Failed to fetch purchase', 500, error);
  }
};

module.exports = {
  validatePayment,
  getPurchase
};