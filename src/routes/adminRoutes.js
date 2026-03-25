const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');
const {
  loginAdmin,
  getAdminProfile,
  updateAdminProfile,
  getAdminDashboard,
  createAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  resetAdminPassword
} = require('../controllers/adminController');

// Public routes
router.post('/login', loginAdmin);

router.post('/reset-password', resetAdminPassword);

// Protected admin routes
router.use(protect);
router.use(admin);

router.route('/profile')
  .get(getAdminProfile)
  .put(updateAdminProfile);

router.get('/dashboard', getAdminDashboard);

router.route('/')
  .post(createAdmin)
  .get(getAllAdmins);

router.route('/:id')
  .get(getAdminById)
  .put(updateAdmin)
  .delete(deleteAdmin);

module.exports = router;