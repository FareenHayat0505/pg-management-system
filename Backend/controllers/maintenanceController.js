const Maintenance = require('../models/Maintenance');
const Tenant = require('../models/Tenant');

// @desc    Raise a maintenance request
// @route   POST /api/maintenance
// @access  Tenant
const createRequest = async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;

    const tenant = await Tenant.findOne({ user: req.user._id });
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant profile not found' });
    }

    const request = await Maintenance.create({
      tenant: tenant._id,
      title,
      description,
      category,
      priority: priority || 'medium',
      messages: [{
        sender: req.user._id,
        senderRole: 'tenant',
        text: description
      }]
    });

    const populated = await Maintenance.findById(request._id)
      .populate({ path: 'tenant', populate: { path: 'user', select: '-password' } });

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all maintenance requests
// @route   GET /api/maintenance
// @access  Admin only
const getAllRequests = async (req, res) => {
  try {
    const requests = await Maintenance.find()
      .populate({ path: 'tenant', populate: { path: 'user', select: '-password' } })
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my maintenance requests
// @route   GET /api/maintenance/my-requests
// @access  Tenant
const getMyRequests = async (req, res) => {
  try {
    const tenant = await Tenant.findOne({ user: req.user._id });
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    const requests = await Maintenance.find({ tenant: tenant._id })
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single request
// @route   GET /api/maintenance/:id
// @access  Private
const getRequestById = async (req, res) => {
  try {
    const request = await Maintenance.findById(req.params.id)
      .populate({ path: 'tenant', populate: { path: 'user', select: '-password' } })
      .populate('messages.sender', 'name role');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send a message in maintenance chat
// @route   POST /api/maintenance/:id/message
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const request = await Maintenance.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const message = {
      sender: req.user._id,
      senderRole: req.user.role,
      text: req.body.text
    };

    request.messages.push(message);
    await request.save();

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update request status
// @route   PUT /api/maintenance/:id/status
// @access  Admin only
const updateStatus = async (req, res) => {
  try {
    const request = await Maintenance.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.status = req.body.status;
    await request.save();

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get maintenance summary
// @route   GET /api/maintenance/summary
// @access  Admin only
const getSummary = async (req, res) => {
  try {
    const total = await Maintenance.countDocuments();
    const open = await Maintenance.countDocuments({ status: 'open' });
    const inProgress = await Maintenance.countDocuments({ status: 'in-progress' });
    const resolved = await Maintenance.countDocuments({ status: 'resolved' });

    res.json({ total, open, inProgress, resolved });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 


module.exports = {
  createRequest,
  getAllRequests,
  getMyRequests,
  getRequestById,
  sendMessage,
  updateStatus,
  getSummary
};