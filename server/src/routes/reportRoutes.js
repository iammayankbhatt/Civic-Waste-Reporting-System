const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });
const { createReport, getReports, updateStatus } = require('../controllers/reportController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/', protect, upload.single('image'), createReport);
router.get('/', getReports); // Public or Protect based on preference
router.patch('/:id/status', protect, adminOnly, updateStatus);

module.exports = router;