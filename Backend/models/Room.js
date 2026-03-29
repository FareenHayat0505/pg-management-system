const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  roomNumber: {
    type: String,
    required: true
  },
  floor: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['single', 'double', 'triple'],
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  occupied: {
    type: Number,
    default: 0
  },
  rent: {
    type: Number,
    required: true
  },
  amenities: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['available', 'full', 'maintenance'],
    default: 'available'
  }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);



