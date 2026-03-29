const express = require('express');
const router = express.Router();
const {
  createNotice, getNotices, getNoticeById,
  updateNotice, deleteNotice
} = require('../controllers/noticeController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, getNotices);
router.post('/', protect, adminOnly, createNotice);
router.get('/:id', protect, getNoticeById);
router.put('/:id', protect, adminOnly, updateNotice);
router.delete('/:id', protect, adminOnly, deleteNotice);

module.exports = router;