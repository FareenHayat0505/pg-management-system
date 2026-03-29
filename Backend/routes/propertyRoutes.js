const express = require('express');
const router = express.Router();
const {
  createProperty, getProperties,
  getPropertyById, updateProperty, deleteProperty
} = require('../controllers/propertyController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, adminOnly, getProperties);
router.post('/', protect, adminOnly, createProperty);
router.get('/:id', protect, adminOnly, getPropertyById);
router.put('/:id', protect, adminOnly, updateProperty);
router.delete('/:id', protect, adminOnly, deleteProperty);

module.exports = router;