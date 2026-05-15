const reportService = require('../services/reportService');
const asyncHandler = require('../utills/asyncHandler');

const getStockReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const data = await reportService.getStockReport(startDate, endDate);
  res.json({ success: true, data });
});

const getSmithPaymentReport = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const data = await reportService.getSmithPaymentReport(startDate, endDate);
    res.json({ success: true, data });
});

const getDayBookReport = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const data = await reportService.getDayBookReport(startDate, endDate);
    res.json({ success: true, data });
});

const getLedgerReport = asyncHandler(async (req, res) => {
    const { accountHead, startDate, endDate } = req.query;
    const data = await reportService.getLedgerReport(accountHead, startDate, endDate);
    res.json({ success: true, data });
});

const getTrialBalance = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const data = await reportService.getTrialBalance(startDate, endDate);
    res.json({ success: true, data });
});

const getProfitAndLoss = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const data = await reportService.getProfitAndLossReport(startDate, endDate);
    res.json({ success: true, data });
});

module.exports = {
  getStockReport,
  getSmithPaymentReport,
  getDayBookReport,
  getLedgerReport,
  getTrialBalance,
  getProfitAndLoss
};
