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



module.exports = {
    createMasterGrouping,
    getMasterGroupings,
    createAccountHead,
    getAllAccountHeads,
    createReceipt,
    getAllReceipts,
    createState,
    getAllState
};