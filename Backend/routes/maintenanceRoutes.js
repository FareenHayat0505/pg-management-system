const express = require('express');
const router = express.Router();
const {
  createRequest, getAllRequests, getMyRequests,
  sendMessage, updateStatus, getSummary
} = require('../controllers/maintenanceController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/summary',       protect, adminOnly, getSummary);
router.get('/my-requests',   protect, getMyRequests);
router.get('/',              protect, adminOnly, getAllRequests);
router.post('/',             protect, createRequest);
router.post('/:id/message',  protect, sendMessage);
router.put('/:id/status',    protect, adminOnly, updateStatus);

module.exports = router;