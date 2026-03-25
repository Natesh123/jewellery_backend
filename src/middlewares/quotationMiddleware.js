const { errorResponse } = require('../utills/apiResponse');

const validateMarginChange = (req, res, next) => {
  const { body, user } = req;

  // Check if margin is being changed
  if (body.margin_percent === undefined) {
    return next();
  }

  // Get user's allowed margin range based on role
  const marginRange = getMarginRangeForRole(user.role);

  // Validate new margin is within allowed range
  if (body.margin_percent < marginRange.min || body.margin_percent > marginRange.max) {
    return errorResponse(
      res,
      `Margin percentage must be between ${marginRange.min} and ${marginRange.max} for your role`,
      400
    );
  }

  // If sales executive is trying to reduce margin below 3%, require reason
  if (user.role === 'sales_executive' && body.margin_percent < 3) {
    if (!body.margin_change_reason) {
      return errorResponse(
        res,
        'Please provide a reason for reducing margin below 3%',
        400
      );
    }
  }

  next();
};

const getMarginRangeForRole = (role) => {
  switch (role) {
    case 'superadmin':
      return { min: 0, max: 3 };
    case 'admin':
      return { min: 0, max: 3 };
    case 'regional manager':
      return { min: 3, max: 4 };
    case 'manager':
      return { min: 4, max: 5 };
    case 'sales_executive':
      return { min: 5, max: 7 }; // Fixed at 3%
    default:
      return { min: 5, max: 7 };
  }
};

module.exports = {
  validateMarginChange
};