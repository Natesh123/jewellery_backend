// routes/pledgeItemRoutes.js
const express = require('express');
const router = express.Router();
const pledgeItemController = require('../controllers/pledgeItemController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../config/multerConfig');

// Protect all routes with authentication
router.use(authMiddleware.protect);

router.route('/')
  .post(pledgeItemController.createPledge)
router.route('/pledge_all').get(pledgeItemController.getPledges);
router.route('/:page/:limit/:id').get(pledgeItemController.getAllPledges); 
router.route('/executive/:page/:limit/:id').get(pledgeItemController.getAllOfficePledges); 
router.route('/accounts/:page/:limit/:id').get(pledgeItemController.getAllAccountsPledges); 
router.route('/collection/:page/:limit/:id').get(pledgeItemController.getAllCollectionPledges); 
router.route('/bank_collection/:page/:limit/:id').get(pledgeItemController.getAllBankCollectionPledges); 
router.route('/gold_collect/:page/:limit/:id').get(pledgeItemController.getAllGoldCollectPledges); 
router.route('/finance_institute/:page/:limit/:id').get(pledgeItemController.getAllFinanceInstitutePledges); 
router.route('/money_request/:page/:limit/:id').get(pledgeItemController.getAllMoneyRequestPledges); 
router.route('/manager_approval/:page/:limit/:id').get(pledgeItemController.getAllManagerApprovalPledges); 
router.route('/manager_approvals/:page/:limit/:id').get(pledgeItemController.getAllManagerApprovalPledges); 
router.route('/manager/:page/:limit/:id').get(pledgeItemController.getAllManagerPledges);
router.route('/manager_first/:page/:limit/:id').get(pledgeItemController.getAllManagerPledges1);
router.route('/regional_manager/:page/:limit/:id').get(pledgeItemController.getAllRegionalManagerPledges);
router.route('/accounts_approval/:page/:limit/:id').get(pledgeItemController.getAllAccountsApprovalPledges);
router.route('/status/:id').put(pledgeItemController.updateExecutive); 
router.route('/assign_sales_executive/:id').put(pledgeItemController.updateSalesExecutive); 
router.route('/assign/:id').put(pledgeItemController.assigneExecutive); 
router.route('/accounts/:id').put(pledgeItemController.updateAccountRequest); 
router.route('/gold_collect/:id').put(pledgeItemController.updategoldcollectRequest); 
router.route('/collection/:id').put(pledgeItemController.updateCollectionRequest); 
router.route('/bank_collection/:id').put(pledgeItemController.updateBankCollectionRequest); 
router.route('/finance_institute/:id').put(pledgeItemController.updateFinanceInstituteRequest);
router.route('/assign_regional/:id').put(pledgeItemController.assigneRegigonalApproval);
router.route('/accounts_approval/:id').put(pledgeItemController.assignAccountsApproval);
router.route('/executive/:id').get(pledgeItemController.getAllUpdateExecutive);
router.route('/money_request/:id').put(pledgeItemController.updateMoneyRequest);
router.route('/manager_approvals/:id').put(pledgeItemController.updateManageApprovalRequest);
router.route('/manager/').get(pledgeItemController.getAllUpdateManager); 

router.route('/:id')
  .put(
    upload.fields([
      { name: 'ornament_photo', maxCount: 1 },
      { name: 'bill', maxCount: 1 }
    ]),
    pledgeItemController.updatePledge
  )
  // Add if needed
  .get(pledgeItemController.getPledge); // Add if needed

module.exports = router;