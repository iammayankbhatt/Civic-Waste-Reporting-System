const express = require('express');
const router = express.Router();
const { askSummarizer } = require('../controllers/aiController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Only allow authenticated administrators to query system intelligence
router.post('/chat', protect, adminOnly, askSummarizer);

module.exports = router;