const Property = require('../models/Property');
const Room = require('../models/Room');
const Tenant = require('../models/Tenant');

// @desc    Create a new property/PG
// @route   POST /api/properties
// @access  Admin only
const createProperty = async (req, res) => {
  try {
    const { name, address, city, totalFloors, amenities, contactPhone } = req.body;

    const property = await Property.create({
      name, address, city, totalFloors,
      amenities: amenities || [],
      contactPhone,
      createdBy: req.user._id
    });

    res.status(201).json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all properties
// @route   GET /api/properties
// @access  Admin only
const getProperties = async (req, res) => {
  try {
    const properties = await Property.find({ isActive: true });

    const enriched = await Promise.all(properties.map(async (p) => {
      const rooms = await Room.find({ property: p._id });
      const tenants = await Tenant.find({
        room: { $in: rooms.map(r => r._id) },
        isActive: true
      });

      const totalBeds    = rooms.reduce((a, r) => a + (r.capacity || 0), 0);
      const occupiedBeds = rooms.reduce((a, r) => a + (r.occupied  || 0), 0);

      return {
        ...p.toObject(),
        totalRooms:    rooms.length,
        tenantCount:   tenants.length,
        totalBeds,
        occupiedBeds,
        occupancyRate: totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
      };
    }));

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Admin only
const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const rooms = await Room.find({ property: property._id });
    const totalBeds = rooms.reduce((a, r) => a + r.capacity, 0);
    const occupiedBeds = rooms.reduce((a, r) => a + r.occupied, 0);

    res.json({
      ...property.toObject(),
      rooms,
      totalBeds,
      occupiedBeds,
      occupancyRate: totalBeds > 0
        ? Math.round((occupiedBeds / totalBeds) * 100) : 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Admin only
const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const updated = await Property.findByIdAndUpdate(
      req.params.id, req.body, { new: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Admin only
const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const rooms = await Room.find({ property: req.params.id });
    if (rooms.length > 0) {
      return res.status(400).json({
        message: 'Cannot delete property with existing rooms. Remove rooms first.'
      });
    }

    await Property.findByIdAndDelete(req.params.id);
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProperty, getProperties,
  getPropertyById, updateProperty, deleteProperty
};

