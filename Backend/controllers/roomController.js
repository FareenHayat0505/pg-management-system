const Room = require('../models/Room');

// @desc    Add a new room
// @route   POST /api/rooms
// @access  Admin only
const addRoom = async (req, res) => {
  try {
    const { property, roomNumber, floor, type, capacity, rent, amenities } = req.body;

    if (!property) {
      return res.status(400).json({ message: 'Property is required' });
    }

    const roomExists = await Room.findOne({ roomNumber, property });
    if (roomExists) {
      return res.status(400).json({ message: 'Room already exists in this property' });
    }

    const room = await Room.create({
      property, roomNumber, floor, type,
      capacity, rent, amenities: amenities || []
    });

    const populated = await Room.findById(room._id).populate('property', 'name city');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Private
const getRooms = async (req, res) => {
  try {
    const filter = {};
    if (req.query.property) filter.property = req.query.property;

    const rooms = await Room.find(filter)
      .populate('property', 'name city')
      .sort({ roomNumber: 1 });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single room
// @route   GET /api/rooms/:id
// @access  Private
const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('property', 'name city');
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update room
// @route   PUT /api/rooms/:id
// @access  Admin only
const updateRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id, req.body, { new: true }
    ).populate('property', 'name city');

    res.json(updatedRoom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Admin only
const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.occupied > 0) {
      return res.status(400).json({ message: 'Cannot delete room with active tenants' });
    }

    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get available rooms
// @route   GET /api/rooms/available
// @access  Private
const getAvailableRooms = async (req, res) => {
  try {
    const filter = { status: 'available' };
    if (req.query.property) filter.property = req.query.property;

    const rooms = await Room.find(filter)
      .populate('property', 'name city');
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 
const getBedSummary = async (req, res) => {
  try {
    const rooms = await Room.find().populate('property', 'name city');

    const summary = rooms.map(room => ({
      _id: room._id,
      property: room.property,
      roomNumber: room.roomNumber,
      floor: room.floor,
      type: room.type,
      rent: room.rent,
      totalBeds: room.capacity,
      occupiedBeds: room.occupied,
      availableBeds: room.capacity - room.occupied,
      status: room.status,
      amenities: room.amenities,
      beds: Array.from({ length: room.capacity }, (_, i) => ({
        bedLabel: String.fromCharCode(65 + i),
        isOccupied: i < room.occupied
      }))
    }));

    const totalBeds = summary.reduce((a, r) => a + r.totalBeds, 0);
    const occupiedBeds = summary.reduce((a, r) => a + r.occupiedBeds, 0);
    const availableBeds = summary.reduce((a, r) => a + r.availableBeds, 0);

    res.json({
      totalBeds,
      occupiedBeds,
      availableBeds,
      occupancyRate: totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
      rooms: summary
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  addRoom, getRooms, getRoomById,
  updateRoom, deleteRoom, getAvailableRooms,
  getBedSummary
};