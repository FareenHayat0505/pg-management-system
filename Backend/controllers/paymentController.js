const Payment = require('../models/Payment');
const Tenant  = require('../models/Tenant');

const populate = {
  path: 'tenant',
  populate: [
    { path: 'user',  select: 'name email phone' },
    { path: 'room',  select: 'roomNumber rent floor' }
  ]
};

// @desc    Create payment
// @route   POST /api/payments
// @access  Admin
const createPayment = async (req, res) => {
  try {
    const { tenantId, amount, month, year, method } = req.body;

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

    // Check duplicate
    const existing = await Payment.findOne({
      tenant: tenantId,
      month: Number(month),
      year:  Number(year)
    });
    if (existing) return res.status(400).json({ message: 'Payment already exists for this month' });

    const dueDate = new Date(Number(year), Number(month) - 1, 1);

    const payment = await Payment.create({
      tenant:  tenantId,
      amount:  Number(amount),
      month:   Number(month),
      year:    Number(year),
      method:  method || 'cash',
      dueDate,
      status: 'pending'
    });

    const populated = await Payment.findById(payment._id).populate(populate);
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all payments
// @route   GET /api/payments
// @access  Admin
const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate(populate)
      .sort({ year: -1, month: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my payments (tenant)
// @route   GET /api/payments/my-payments
// @access  Tenant
const getMyPayments = async (req, res) => {
  try {
    const tenant = await Tenant.findOne({ user: req.user._id });
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

    const payments = await Payment.find({ tenant: tenant._id })
      .populate(populate)
      .sort({ year: -1, month: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark payment as paid
// @route   PUT /api/payments/:id/pay
// @access  Admin
const markAsPaid = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    payment.status   = 'paid';
    payment.paidDate = new Date();
    payment.method   = req.body.method || payment.method || 'cash';
    await payment.save();

    const populated = await Payment.findById(payment._id).populate(populate);
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark overdue payments
// @route   PUT /api/payments/mark-overdue
// @access  Admin
const markOverdue = async (req, res) => {
  try {
    const today = new Date();
    const result = await Payment.updateMany(
      {
        status: 'pending',
        dueDate: { $lt: today }
      },
      { $set: { status: 'overdue' } }
    );
    res.json({ message: `${result.modifiedCount} payments marked as overdue` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get payment summary
// @route   GET /api/payments/summary
// @access  Admin
const getPaymentSummary = async (req, res) => {
  try {
    const payments = await Payment.find();

    const totalCollected = payments.filter(p => p.status === 'paid')
      .reduce((a, p) => a + p.amount, 0);
    const totalPending = payments.filter(p => p.status === 'pending')
      .reduce((a, p) => a + p.amount, 0);
    const totalOverdue = payments.filter(p => p.status === 'overdue')
      .reduce((a, p) => a + p.amount, 0);

    res.json({
      totalCollected,
      totalPending,
      totalOverdue,
      paid:    payments.filter(p => p.status === 'paid').length,
      pending: payments.filter(p => p.status === 'pending').length,
      overdue: payments.filter(p => p.status === 'overdue').length,
      totalPayments: payments.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPayment,
  getPayments,
  getMyPayments,
  markAsPaid,
  markOverdue,
  getPaymentSummary
};