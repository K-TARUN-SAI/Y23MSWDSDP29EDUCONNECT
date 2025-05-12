const express = require('express');
const router = express.Router();
const { gradeSubmission } = require('../controllers/assignmentController');
const { protect } = require('../middleware/auth');

// PUT grade a submission
router.put('/:id/grade', protect, gradeSubmission);

module.exports = router;
