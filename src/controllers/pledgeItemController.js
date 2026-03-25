// const pledgeItemService = require('../services/pledgeItemService');
// const { successResponse, errorResponse } = require('../utills/apiResponse');

// // controllers/pledgeItemController.js
// const createPledge = async (req, res, next) => {
//     try {
//         // Changed from createPledgeStep1 to createPledge
//         const pledge = await pledgeItemService.createPledge(req.body);
//         successResponse(res, pledge, 201);
//     } catch (error) {
//         errorResponse(res, error.message, 400, error);
//     }
// };

// const getAllUpdateExecutive = async (_, res, next) => {
//     try {
//         const pledge = await pledgeItemService.getAllUpdateExecutive();
//         successResponse(res, pledge, 201);
//     } catch (error) {
//         errorResponse(res, error.message, 400, error);
//     }
// };

// const getAllUpdateManager = async (_, res, next) => {
//     try {
//         const pledge = await pledgeItemService.getAllUpdateManager();
//         successResponse(res, pledge, 201);
//     } catch (error) {
//         errorResponse(res, error.message, 400, error);
//     }
// };

// const updatePledge = async (req, res, next) => {
//     try {
//         console.log(req.files)
//         const updateData = {
//             ...req.body,
//             ornament_photo: req.files?.ornament_photo?.[0]?.filename || null,
//             bill: req.files?.bill?.[0]?.filename || null
//         };

//         const pledge = await pledgeItemService.updatePledge(req.params.id, updateData);
//         successResponse(res, pledge, 200);
//     } catch (error) {
//         errorResponse(res, error.message, 400, error);
//     }
// };

// const updateExecutive = async (req, res, next) => {
//     try {
//         const pledge = await pledgeItemService.updateExecutive(req.params.id, req.body);
//         successResponse(res, pledge, 200);
//     } catch (error) {
//         errorResponse(res, error.message, 400, error);
//     }
// };

// const assigneExecutive = async (req, res, next) => {
//     try {
//         const pledge = await pledgeItemService.assigneExecutive(req.params.id, req.body);
//         successResponse(res, pledge, 200);
//     } catch (error) {
//         errorResponse(res, error.message, 400, error);
//     }
// };

// const getPledge = async (req, res, next) => {
//     try {
//         // Changed to use params.id instead of req.body
//         const pledge = await pledgeItemService.getPledgeById(req.params.id);
//         successResponse(res, pledge, 200); // Changed to 200 for successful gets
//     } catch (error) {
//         errorResponse(res, error.message, 400, error);
//     }
// };

// const getAllPledges = async (req, res, next) => {
//     try {
//         // Changed to use params.id instead of req.body
//         const pledge = await pledgeItemService.getAllPledges(req.params.page, req.params.limit,req.params.id);
//         console.log(pledge);
//         successResponse(res, pledge, 200); // Changed to 200 for successful gets
//     } catch (error) {
//         errorResponse(res, error.message, 400, error);
//     }
// };

// const getAllOfficePledges = async (req, res, next) => {
//     try {
//         // Changed to use params.id instead of req.body
//         console.log(req.params);
//         const pledge = await pledgeItemService.getAllOfficePledges(req.params.page, req.params.limit,req.params.id);
//         console.log("hie conftroller",pledge);
//         successResponse(res, pledge, 200); // Changed to 200 for successful gets
//     } catch (error) {
//         errorResponse(res, error.message, 400, error);
//     }
// };

// const getAllManagerPledges = async (req, res, next) => {
//     try {
//         // Changed to use params.id instead of req.body
//         const pledge = await pledgeItemService.getAllManagerPledges(req.params.page, req.params.limit,req.params.id);
//         successResponse(res, pledge, 200); // Changed to 200 for successful gets
//     } catch (error) {
//         errorResponse(res, error.message, 400, error);
//     }
// };

// // services/pledgeItemService.js
// module.exports = {
//     createPledge,       // Not createPledgeStep1
//     updatePledge,       // Not updatePledgeStep2
//     getPledge,
//     getAllPledges,
//     assigneExecutive,
//     updateExecutive,
//     getAllUpdateExecutive,
//     getAllOfficePledges,
//     getAllManagerPledges,
//     getAllUpdateManager
// };




// controllers/pledgeItemController.js
const pledgeItemService = require('../services/pledgeItemService');
const { successResponse, errorResponse } = require('../utills/apiResponse');

const createPledge = async (req, res) => {
    try {
        const pledge = await pledgeItemService.createPledge(req.body);
        successResponse(res, pledge, 201);
    } catch (error) {
        errorResponse(res, error.message, 400, error);
    }
};

const getAllUpdateExecutive = async (req, res) => {
    try {
        const pledge = await pledgeItemService.getAllUpdateExecutive(req);
        successResponse(res, pledge, 201);
    } catch (error) {
        errorResponse(res, error.message, 400, error);
    }
};

const getAllUpdateManager = async (_, res) => {
    try {
        const pledge = await pledgeItemService.getAllUpdateManager();
        successResponse(res, pledge, 201);
    } catch (error) {
        errorResponse(res, error.message, 400, error);
    }
};



const updatePledge = async (req, res) => {
    try {
        const updateData = {
            ...req.body,
            ornament_photo: req.files?.ornament_photo?.[0]?.filename || null,
            bill: req.files?.bill?.[0]?.filename || null
        };

        const pledge = await pledgeItemService.updatePledge(req.params.id, updateData);
        successResponse(res, pledge, 200);
    } catch (error) {
        errorResponse(res, error.message, 400, error);
    }
};

const updateExecutive = async (req, res) => {
    try {
        const pledge = await pledgeItemService.updateExecutive(req.params.id, req.body);
        successResponse(res, pledge, 200);
    } catch (error) {
        errorResponse(res, error.message, 400, error);
    }
};

const updateSalesExecutive = async (req, res) => {
    try {
        const pledge = await pledgeItemService.updateSalesExecutive(req.params.id, req.body);
        successResponse(res, pledge, 200);
    } catch (error) {
        errorResponse(res, error.message, 400, error);
    }
};

const updateMoneyRequest = async (req, res) => {
    try {
        const pledge = await pledgeItemService.updateMoneyRequest(req.params.id, req.body);
        successResponse(res, pledge, 200);
    } catch (error) {
        errorResponse(res, error.message, 400, error);
    }
};

const updateManageApprovalRequest = async (req, res) => {
    try {
        const pledge = await pledgeItemService.updateManageApprovalRequest(req.params.id, req.body);
        successResponse(res, pledge, 200);
    } catch (error) {
        errorResponse(res, error.message, 400, error);
    }
};

const updateAccountRequest = async (req, res) => {
    try {
        const pledge = await pledgeItemService.updateAccountRequest(req.params.id, req.body);
        successResponse(res, pledge, 200);
    } catch (error) {
        errorResponse(res, error.message, 400, error);
    }
};
const updateCollectionRequest = async (req, res) => {
    try {
        const pledge = await pledgeItemService.updateCollectionRequest(req.params.id, req.body);
        successResponse(res, pledge, 200);
    } catch (error) {
        errorResponse(res, error.message, 400, error);
    }
};

const updateBankCollectionRequest = async (req, res) => {
    try {
        const pledge = await pledgeItemService.updateBankCollectionRequest(req.params.id, req.body);
        successResponse(res, pledge, 200);
    } catch (error) {
        errorResponse(res, error.message, 400, error);
    }
};

const updategoldcollectRequest = async (req, res) => {
    try {
        const pledge = await pledgeItemService.updategoldcollectRequest(req.params.id, req.body);
        successResponse(res, pledge, 200);
    } catch (error) {
        errorResponse(res, error.message, 400, error);
    }
};

const updateFinanceInstituteRequest = async (req, res) => {
    try {
        const pledge = await pledgeItemService.updateFinanceInstituteRequest(req.params.id, req.body);
        successResponse(res, pledge, 200);
    } catch (error) {
        errorResponse(res, error.message, 400, error);
    }
};
const assigneRegigonalApproval = async (req, res) => {
    try {
        const pledge = await pledgeItemService.assigneRegigonalApproval(req.params.id, req.body);
        successResponse(res, pledge, 200);
    } catch (error) {
        errorResponse(res, error.message, 400, error);
    }
};

const assignAccountsApproval = async (req, res) => {
    try {
        const pledge = await pledgeItemService.assignAccountsApproval(req.params.id, req.body);
        successResponse(res, pledge, 200);
    } catch (error) {
        errorResponse(res, error.message, 400, error);
    }
};

const assigneExecutive = async (req, res) => {
    try {
        const pledge = await pledgeItemService.assigneExecutive(req.params.id, req.body);
        successResponse(res, pledge, 200);
    } catch (error) {
        errorResponse(res, error.message, 400, error);
    }
};

const getPledge = async (req, res) => {
    try {
        const pledge = await pledgeItemService.getPledgeById(req.params.id);
        successResponse(res, pledge, 200);
    } catch (error) {
        errorResponse(res, error.message, 400, error);
    }
};

const getAllPledges = async (req, res) => {
    try {
        const pledge = await pledgeItemService.getAllPledges(req.params.page, req.params.limit, req.params.id);
        successResponse(res, pledge, 200);
    } catch (error) {
        errorResponse(res, error.message, 400, error);
    }
};
const getPledges = async (req, res) => {
    try {
        const { page = 1, limit = 10, ...filters } = req.query;
        const pledge = await pledgeItemService.getPledges(page, limit, filters);
        successResponse(res, pledge, 200);
    } catch (error) {
        errorResponse(res, error.message, 400, error);
    }
};

const getAllMoneyRequestPledges = async (req, res) => {
    try {
        const pledge = await pledgeItemService.getAllMoneyRequestPledges(req.params.page, req.params.limit, req.params.id);
        successResponse(res, pledge, 200);
    } catch (error) {
        errorResponse(res, error.message, 400, error);
    }
};

const getAllManagerApprovalPledges = async (req, res) => {
    try {
        const pledge = await pledgeItemService.getAllManagerApprovalPledges(req.params.page, req.params.limit, req.params.id);
        successResponse(res, pledge, 200);
    } catch (error) {
        errorResponse(res, error.message, 400, error);
    }
};

const getAllManagersApprovalPledges = async (req, res) => {
    try {
        const pledge = await pledgeItemService.getAllManagersApprovalPledges(req.params.page, req.params.limit, req.params.id);
        successResponse(res, pledge, 200);
    } catch (error) {
        errorResponse(res, error.message, 400, error);
    }
};

const getAllOfficePledges = async (req, res) => {
    try {
        const pledge = await pledgeItemService.getAllOfficePledges(req.params.page, req.params.limit, req.params.id);
        successResponse(res, pledge, 200);
    } catch (error) {
        errorResponse(res, error.message, 400, error);
    }
};

const getAllAccountsPledges = async (req, res) => {
    try {
        const pledge = await pledgeItemService.getAllAccountsPledges(req.params.page, req.params.limit, req.params.id);
        successResponse(res, pledge, 200);
    } catch (error) {
        errorResponse(res, error.message, 400, error);
    }
};

const getAllCollectionPledges = async (req, res) => {
    try {
        const pledge = await pledgeItemService.getAllCollectionPledges(req.params.page, req.params.limit, req.params.id);
        successResponse(res, pledge, 200);
    } catch (error) {
        errorResponse(res, error.message, 400, error);
    }
};

const getAllBankCollectionPledges = async (req, res) => {
    try {
        const pledge = await pledgeItemService.getAllBankCollectionPledges(req.params.page, req.params.limit, req.params.id);
        successResponse(res, pledge, 200);
    } catch (error) {
        errorResponse(res, error.message, 400, error);
    }
};

const getAllFinanceInstitutePledges = async (req, res) => {
    try {
        const pledge = await pledgeItemService.getAllFinanceInstitutePledges(req.params.page, req.params.limit, req.params.id);
        successResponse(res, pledge, 200);
    } catch (error) {
        errorResponse(res, error.message, 400, error);
    }
};

const getAllGoldCollectPledges = async (req, res) => {
    try {
        const pledge = await pledgeItemService.getAllGoldCollectPledges(req.params.page, req.params.limit, req.params.id);
        successResponse(res, pledge, 200);
    } catch (error) {
        errorResponse(res, error.message, 400, error);
    }
};

const getAllManagerPledges = async (req, res) => {
    try {
        const pledge = await pledgeItemService.getAllManagerPledges(req.params.page, req.params.limit, req.params.id);
        successResponse(res, pledge, 200);
    } catch (error) {
        errorResponse(res, error.message, 400, error);
    }
};
const getAllManagerPledges1 = async (req, res) => {
    try {
        const pledge = await pledgeItemService.getAllManagerPledges1(req.params.page, req.params.limit, req.params.id);
        successResponse(res, pledge, 200);
    } catch (error) {
        errorResponse(res, error.message, 400, error);
    }
};

const getAllRegionalManagerPledges = async (req, res) => {
    try {
        const pledge = await pledgeItemService.getAllRegionalManagerPledges(req.params.page, req.params.limit, req.params.id);
        successResponse(res, pledge, 200);
    } catch (error) {
        errorResponse(res, error.message, 400, error);
    }
};
const getAllAccountsApprovalPledges = async (req, res) => {
    try {
        const pledge = await pledgeItemService.getAllAccountsApprovalPledges(req.params.page, req.params.limit, req.params.id);
        successResponse(res, pledge, 200);
    } catch (error) {
        errorResponse(res, error.message, 400, error);
    }
};

module.exports = {
    createPledge,
    updatePledge,
    getPledge,
    getAllPledges,
    assigneExecutive,
    updateExecutive,
    getAllUpdateExecutive,
    getAllOfficePledges,
    getAllManagerPledges,
    getAllUpdateManager,
    getAllMoneyRequestPledges,
    updateMoneyRequest,
    getAllAccountsPledges,
    updateAccountRequest,
    getAllCollectionPledges,
    updateCollectionRequest,
    getAllBankCollectionPledges,
    updateBankCollectionRequest,
    getAllFinanceInstitutePledges,
    updateFinanceInstituteRequest,
    getAllGoldCollectPledges,
    updategoldcollectRequest,
    getAllManagerApprovalPledges,
    getAllRegionalManagerPledges,
    assigneRegigonalApproval,
    getAllAccountsApprovalPledges,
    assignAccountsApproval,
    updateSalesExecutive,
    getAllManagersApprovalPledges,
    updateManageApprovalRequest,
    getAllManagerPledges1,
    getPledges
};
