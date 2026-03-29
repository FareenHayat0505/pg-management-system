const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  bedNumber: {
    type: String,
    required: true
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  leaveDate: {
    type: Date,
    default: null
  },
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  },
  idProof: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Tenant', tenantSchema);
