const express = require('express');
const router = express.Router();

// GET students for tutor
router.get('/tutor/:tutorId', async (req, res) => {
  try {
    // Placeholder: return empty array or implement actual DB query
    res.json([]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
