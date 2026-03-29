const express = require('express');
const router = express.Router();
const {
  addRoom, getRooms, getRoomById,
  updateRoom, deleteRoom, getAvailableRooms,
  getBedSummary
} = require('../controllers/roomController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/bed-summary', protect, adminOnly, getBedSummary);
router.get('/available', protect, getAvailableRooms);
router.get('/', protect, getRooms);
router.post('/', protect, adminOnly, addRoom);
router.get('/:id', protect, getRoomById);
router.put('/:id', protect, adminOnly, updateRoom);
router.delete('/:id', protect, adminOnly, deleteRoom);

module.exports = router;