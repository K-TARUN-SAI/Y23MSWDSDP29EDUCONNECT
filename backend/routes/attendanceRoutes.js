const express = require('express');
const router = express.Router();

// GET attendance for tutor
router.get('/tutor/:tutorId', async (req, res) => {
  try {
    // Return a default attendance structure instead of empty object
    const defaultAttendance = {
      totalClasses: 0,
      attendedClasses: 0,
      attendancePercentage: 0
    };
    res.json(defaultAttendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
