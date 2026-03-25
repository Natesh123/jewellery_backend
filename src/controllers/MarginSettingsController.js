const marginService = require('../services/MarginSettingsService')
const { successResponse, errorResponse } = require('../utills/apiResponse');

const validateMarginData = (data) => {
    if (data.min_percent === undefined || data.min_percent === null) {
        throw new Error("Minimum Percent is required");
    }

    if (data.max_percent === undefined || data.max_percent === null) {
        throw new Error("Maximum Percent is required");
    }

    if (Number(data.min_percent) < 0) {
        throw new Error("Minimum Percent cannot be negative");
    }

    if (Number(data.max_percent) < 0) {
        throw new Error("Maximum Percent cannot be negative");
    }

    if (Number(data.min_percent) > Number(data.max_percent)) {
        throw new Error("Minimum Percent cannot exceed Maximum Percent");
    }
};


const createMarginSettings = async (req, res, next) => {
    try {
        const { body } = req;

        validateMarginData(body);

        const margin = await marginService.createMarginSettings(body);

        successResponse(res, margin, 201);

    } catch (error) {
        errorResponse(res, error.message, 404, error);
    }
}

const getMarginSettingsByRoleId = async (req, res, next) => {
    try {
        const margin = await marginService.getMarginSettingsByRoleId(req.params.role_id);
        if (!margin) {
            return errorResponse(res, 'Role Id not found', 404);
        }
        successResponse(res, margin);
    } catch (error) {
        errorResponse(res, 'Failed to fetch Margin', 500, error);
    }
};

const getAllMarginSettings = async (req, res, next) => {
    try {
        const response = await marginService.getMarginSettings();

        successResponse(res, response);
    } catch (error) {
        errorResponse(res, 'Failed to fetch margin values', 500, error);
    }
};

const updateMarginSettings = async (req, res, next) => {
    try {
        const { role_id } = req.params;
        const { body } = req;

        const data = { ...body, role_id: role_id }

        // Validate input data
        validateMarginData(data);

        // Update category
        const updatedMargin = await marginService.updateMarginSettings(role_id, body);
        successResponse(res, updatedMargin);
    } catch (error) {
        errorResponse(res, error.message, 400, error);
    }
};

module.exports = {
    createMarginSettings,
    getAllMarginSettings,
    getMarginSettingsByRoleId,
    updateMarginSettings
}