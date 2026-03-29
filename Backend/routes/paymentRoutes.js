const express = require('express');
const router = express.Router();
const {
  createPayment, getPayments, getMyPayments,
  markAsPaid, markOverdue, getPaymentSummary
} = require('../controllers/paymentController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/my-payments', protect, getMyPayments);
router.get('/summary', protect, adminOnly, getPaymentSummary);
router.put('/mark-overdue', protect, adminOnly, markOverdue);
router.get('/', protect, adminOnly, getPayments);
router.post('/', protect, adminOnly, createPayment);
router.put('/:id/pay', protect, adminOnly, markAsPaid);

module.exports = router;