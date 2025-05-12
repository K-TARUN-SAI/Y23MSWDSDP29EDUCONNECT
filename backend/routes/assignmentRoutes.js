const express = require('express');
const router = express.Router();
const { getTutorAssignments, getStudentAssignments, createAssignment, submitAssignment, downloadAssignmentFile, downloadSubmissionFile } = require('../controllers/assignmentController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware');

// POST create a new assignment
router.post('/', protect, upload.array('attachments'), createAssignment);

// POST submit assignment
router.post('/:id/submit', protect, upload.single('file'), submitAssignment);

// GET assignments for tutor (no param)
router.get('/tutor', protect, getTutorAssignments);

// Existing route with tutorId param (optional, can be removed if unused)
router.get('/tutor/:tutorId', async (req, res) => {
  try {
    // Placeholder: return empty array or implement actual DB query
    res.json([]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET assignments for current student (no param)
router.get('/student', protect, getStudentAssignments);

// GET download assignment attachment
router.get('/download/:filename', protect, downloadAssignmentFile);

// GET download submission file
router.get('/submissions/download/:filename', protect, downloadSubmissionFile);

module.exports = router;
