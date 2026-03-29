const express = require('express');
const router = express.Router();
const {
  addTenant, getTenants, getTenantById,
  getMyProfile, updateTenant, checkoutTenant
} = require('../controllers/tenantController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/my-profile', protect, getMyProfile);
router.get('/', protect, adminOnly, getTenants);
router.post('/', protect, adminOnly, addTenant);
router.get('/:id', protect, getTenantById);
router.put('/:id', protect, adminOnly, updateTenant);
router.put('/:id/checkout', protect, adminOnly, checkoutTenant);

module.exports = router;