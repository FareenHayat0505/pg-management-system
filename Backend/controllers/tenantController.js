const Tenant = require('../models/Tenant');
const User = require('../models/User');
const Room = require('../models/Room'); 


// @desc    Add new tenant
// @route   POST /api/tenants
// @access  Admin only
const addTenant = async (req, res) => {
  try {
    const { name, email, password, phone, roomId, bedNumber, emergencyContact } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if room is full
    if (room.occupied >= room.capacity) {
      return res.status(400).json({ message: 'Room is already full' });
    }

    // Create user account for tenant
    const user = await User.create({
      name, email, password,
      role: 'tenant',
      phone
    });

    // Create tenant profile
    const tenant = await Tenant.create({
      user: user._id,
      room: roomId,
      bedNumber,
      emergencyContact: emergencyContact || {}
    });

    // Update room occupied count
    room.occupied += 1;
    if (room.occupied >= room.capacity) {
      room.status = 'full';
    }
    await room.save();

    // Return tenant with user and room details
    const populatedTenant = await Tenant.findById(tenant._id)
      .populate('user', '-password')
      .populate('room');

    res.status(201).json(populatedTenant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all tenants
// @route   GET /api/tenants
// @access  Admin only
const getTenants = async (req, res) => {
  try {
    const tenants = await Tenant.find({ isActive: true })
      .populate('user', '-password')
      .populate('room');
    res.json(tenants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single tenant
// @route   GET /api/tenants/:id
// @access  Private
const getTenantById = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id)
      .populate('user', '-password')
      .populate('room');

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    res.json(tenant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get tenant by user id (for tenant login)
// @route   GET /api/tenants/my-profile
// @access  Tenant only
const getMyProfile = async (req, res) => {
  try {
    const tenant = await Tenant.findOne({ user: req.user._id })
      .populate('user', '-password')
      .populate('room');

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant profile not found' });
    }

    res.json(tenant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update tenant
// @route   PUT /api/tenants/:id
// @access  Admin only
const updateTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    const updatedTenant = await Tenant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('user', '-password').populate('room');

    res.json(updatedTenant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove tenant (checkout)
// @route   PUT /api/tenants/:id/checkout
// @access  Admin only
const checkoutTenant = async (req, res) => {
  try {
    const tenantId = req.params.id;

    // 1. Find tenant
    const tenant = await Tenant.findById(tenantId);

    if (!tenant) {
      return res.status(404).json({
        message: 'Tenant not found'
      });
    }

    // 2. Mark tenant inactive
    tenant.isActive = false;
    tenant.leaveDate = new Date();
    await tenant.save();

    // 3. Update room occupancy
    const room = await Room.findById(tenant.room);

    if (room && room.occupied > 0) {
      room.occupied -= 1;

      if (room.occupied < room.capacity) {
        room.status = 'available';
      }

      await room.save();
    }

    // 4. Deactivate linked user (CRITICAL FIX)
    const userId = tenant.user;

    await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    );

    res.json({
      message: 'Tenant checked out successfully'
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Server error'
    });
  }
};
module.exports = {
  addTenant, getTenants, getTenantById,
  getMyProfile, updateTenant, checkoutTenant
};