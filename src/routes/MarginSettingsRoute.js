const express = require('express')
const router = express.Router();
const marginController = require('../controllers/MarginSettingsController')
const authMiddleware =  require('../middlewares/authMiddleware');

router.use(authMiddleware.protect);

router.route('/')
  .post(marginController.createMarginSettings)
  .get(marginController.getAllMarginSettings);

router.route('/:role_id')
  .get(marginController.getMarginSettingsByRoleId)
  .put(marginController.updateMarginSettings);

module.exports = router;