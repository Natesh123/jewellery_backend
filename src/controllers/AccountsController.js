const masterGroupingService = require('../services/AccountsService');
const { successResponse, errorResponse } = require('../utills/apiResponse');


const createMasterGrouping = async (req, res, next) => {
    try {
        const result = await masterGroupingService.createMasterGrouping(req.body);
        successResponse(res, result, 201);
    } catch (error) {
        console.error('Error in createMasterGrouping:', error);
        errorResponse(res, error.message, 400, error);
    }
};

const getMasterGroupings = async (req, res) => {
    try {
        const { search } = req.query;
        const groupings = await masterGroupingService.getAllMasterGroupings(search);
        res.json({ success: true, data: groupings });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to fetch groupings" });
    }
};


const createAccountHead = async (req, res, next) => {
    try {
        const result = await masterGroupingService.createAccountHead(req.body);
        successResponse(res, result, 201);
    } catch (error) {
        console.error('Error in createMasterGrouping:', error);
        errorResponse(res, error.message, 400, error);
    }
};

const getAllAccountHeads = async (req, res) => {
    try {
        const { search } = req.query;
        const groupings = await masterGroupingService.getAllAccountHeads(search);
        res.json({ success: true, data: groupings });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to fetch groupings" });
    }
};


const createReceipt = async (req, res, next) => {
    try {
        const result = await masterGroupingService.createReceipt(req.body);
        successResponse(res, result, 201);
    } catch (error) {
        console.error('Error in createMasterGrouping:', error);
        errorResponse(res, error.message, 400, error);
    }
};

const getAllReceipts = async (req, res) => {
    try {
        const { search } = req.query;
        const groupings = await masterGroupingService.getAllReceipts(search);
        res.json({ success: true, data: groupings });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to fetch groupings" });
    }
};

const createState = async (req, res, next) => {
    try {
        const result = await masterGroupingService.createState(req.body);
        successResponse(res, result, 201);
    } catch (error) {
        console.error('Error in createMasterGrouping:', error);
        errorResponse(res, error.message, 400, error);
    }
};

const getAllState = async (req, res) => {
    try {
        const { search } = req.query;
        const groupings = await masterGroupingService.getAllState(search);
        res.json({ success: true, data: groupings });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to fetch groupings" });
    }
};

const createOpeningBalance = async (req, res, next) => {
    try {
        const result = await masterGroupingService.createOpeningBalance(req.body);
        successResponse(res, result, 201);
    } catch (error) {
        console.error('Error in createOpeningBalance:', error);
        errorResponse(res, error.message, 400, error);
    }
};

const getAllOpeningBalances = async (req, res) => {
    try {
        const { search } = req.query;
        const result = await masterGroupingService.getAllOpeningBalances(search);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to fetch opening balances" });
    }
};

const updateOpeningBalance = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await masterGroupingService.updateOpeningBalance(id, req.body);
        successResponse(res, result, 200);
    } catch (error) {
        console.error('Error in updateOpeningBalance:', error);
        errorResponse(res, error.message, 400, error);
    }
};

const deleteOpeningBalance = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await masterGroupingService.deleteOpeningBalance(id);
        successResponse(res, result, 200);
    } catch (error) {
        console.error('Error in deleteOpeningBalance:', error);
        errorResponse(res, error.message, 400, error);
    }
};

const createOpeningStock = async (req, res, next) => {
    try {
        const result = await masterGroupingService.createOpeningStock(req.body);
        successResponse(res, result, 201);
    } catch (error) {
        console.error('Error in createOpeningStock:', error);
        errorResponse(res, error.message, 400, error);
    }
};

const getAllOpeningStocks = async (req, res) => {
    try {
        const { search } = req.query;
        const result = await masterGroupingService.getAllOpeningStocks(search);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to fetch opening stocks" });
    }
};

const updateOpeningStock = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await masterGroupingService.updateOpeningStock(id, req.body);
        successResponse(res, result, 200);
    } catch (error) {
        console.error('Error in updateOpeningStock:', error);
        errorResponse(res, error.message, 400, error);
    }
};

const deleteOpeningStock = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await masterGroupingService.deleteOpeningStock(id);
        successResponse(res, result, 200);
    } catch (error) {
        console.error('Error in deleteOpeningStock:', error);
        errorResponse(res, error.message, 400, error);
    }
};



module.exports = {
    createMasterGrouping,
    getMasterGroupings,
    createAccountHead,
    getAllAccountHeads,
    createReceipt,
    getAllReceipts,
    createState,
    getAllState,
    createOpeningBalance,
    getAllOpeningBalances,
    updateOpeningBalance,
    deleteOpeningBalance,
    createOpeningStock,
    getAllOpeningStocks,
    updateOpeningStock,
    deleteOpeningStock
};