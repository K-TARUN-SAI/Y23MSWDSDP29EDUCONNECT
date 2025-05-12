const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Class = require('../models/Class');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureUploadDirectories = () => {
  const dirs = [
    path.join(__dirname, '../uploads/assignments'),
    path.join(__dirname, '../uploads/submissions')
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// @desc    Create a new assignment with attachments
// @route   POST /api/assignments
// @access  Tutor/Admin
const createAssignment = asyncHandler(async (req, res) => {
  const { title, description, classId, dueDate } = req.body;

  // Validate class and permissions
  const classObj = await Class.findById(classId);
  if (!classObj) {
    res.status(404);
    throw new Error('Class not found');
  }

  if (classObj.tutor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to create assignments for this class');
  }

  // Process file attachments
  const attachments = [];
  if (req.files && req.files.length > 0) {
    req.files.forEach(file => {
      attachments.push({
        filename: file.filename,
        originalname: file.originalname,
        path: file.path
      });
    });
  }

  // Create the assignment
  const assignment = await Assignment.create({
    title,
    description,
    class: classId,
    tutor: req.user._id,
    dueDate,
    attachments
  });

  res.status(201).json({
    ...assignment.toObject(),
    submissions: [],
    tutor: {
      _id: req.user._id,
      name: req.user.name,
      avatar: req.user.avatar
    }
  });
});

const submitAssignment = asyncHandler(async (req, res) => {
  console.log('submitAssignment called');
  console.log('req.file:', req.file);
  console.log('req.body:', req.body);

  ensureUploadDirectories();

  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }

  // Verify student enrollment
  const classObj = await Class.findById(assignment.class);
  const isStudent = classObj.students.some(s => s.toString() === req.user._id.toString());
  if (!isStudent) {
    res.status(403);
    throw new Error('Not authorized to submit this assignment');
  }

  // Check for existing submission
  const existingSubmission = await Submission.findOne({
    assignment: assignment._id,
    student: req.user._id
  });
  if (existingSubmission) {
    res.status(400);
    throw new Error('You have already submitted this assignment');
  }

  if (!req.file) {
    res.status(400);
    throw new Error('Please upload a submission file');
  }

  // Create submission record
  const submission = await Submission.create({
    assignment: assignment._id,
    student: req.user._id,
    file: {
      filename: req.file.filename,
      originalname: req.file.originalname,
      path: req.file.path
    },
    comments: req.body.comments || '',
    submittedAt: new Date()
  });

  // Populate student info in response
  const submissionWithStudent = await Submission.findById(submission._id)
    .populate('student', 'name email avatar');

  res.status(201).json(submissionWithStudent);
});

// @desc    Get all assignments for a class
// @route   GET /api/assignments/class/:classId
// @access  Tutor and enrolled students
const getAssignmentsByClass = asyncHandler(async (req, res) => {
  const classId = req.params.classId;

  const classObj = await Class.findById(classId);
  if (!classObj) {
    res.status(404);
    throw new Error('Class not found');
  }

  // Verify permissions
  const isTutor = classObj.tutor.toString() === req.user._id.toString();
  const isStudent = classObj.students.some(s => s.toString() === req.user._id.toString());
  const isAdmin = req.user.role === 'admin';
  
  if (!isTutor && !isStudent && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized to view these assignments');
  }

  const assignments = await Assignment.find({ class: classId })
    .sort('-createdAt')
    .populate('tutor', 'name avatar')
    .lean();

  // Add submission status for students
  if (isStudent) {
    const submissions = await Submission.find({
      student: req.user._id,
      assignment: { $in: assignments.map(a => a._id) }
    });

    assignments.forEach(assignment => {
      const submission = submissions.find(s => s.assignment.toString() === assignment._id.toString());
      assignment.submitted = !!submission;
      assignment.submission = submission || null;
    });
  }

  res.json(assignments);
});

// @desc    Get assignment details
// @route   GET /api/assignments/:id
// @access  Tutor and enrolled students
const getAssignmentDetails = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id)
    .populate('tutor', 'name avatar')
    .populate('class', 'title tutor');

  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }

  // Verify permissions
  const isTutor = assignment.class.tutor._id.toString() === req.user._id.toString();
  const isStudent = assignment.class.students.some(s => s.toString() === req.user._id.toString());
  const isAdmin = req.user.role === 'admin';
  
  if (!isTutor && !isStudent && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized to view this assignment');
  }

  // Add submission info for students
  if (isStudent) {
    const submission = await Submission.findOne({
      assignment: assignment._id,
      student: req.user._id
    });
    assignment.submitted = !!submission;
    assignment.submission = submission || null;
  }

  res.json(assignment);
});

// @desc    Get submissions for an assignment
// @route   GET /api/assignments/:id/submissions
// @access  Tutor
const getAssignmentSubmissions = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id)
    .populate('class', 'tutor');

  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }

  // Verify tutor permissions
  if (assignment.class.tutor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view these submissions');
  }

  const submissions = await Submission.find({ assignment: assignment._id })
    .populate('student', 'name email avatar')
    .sort('-submittedAt');

  res.json(submissions);
});

// @desc    Grade a submission
// @route   PUT /api/submissions/:id/grade
// @access  Tutor
const gradeSubmission = asyncHandler(async (req, res) => {
  const { grade, feedback } = req.body;

  const submission = await Submission.findById(req.params.id)
    .populate('assignment', 'class')
    .populate('student', '_id');

  if (!submission) {
    res.status(404);
    throw new Error('Submission not found');
  }

  // Verify tutor permissions
  const classObj = await Class.findById(submission.assignment.class);
  if (classObj.tutor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to grade this submission');
  }

  submission.grade = grade;
  submission.tutorFeedback = feedback;
  submission.gradedAt = new Date();
  await submission.save();

  res.json(submission);
});

// @desc    Download assignment attachment
// @route   GET /api/assignments/download/:filename
// @access  Tutor and enrolled students
const downloadAssignmentFile = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findOne({ 'attachments.filename': req.params.filename });
  
  if (!assignment) {
    res.status(404);
    throw new Error('File not found');
  }

  // Verify permissions
  const classObj = await Class.findById(assignment.class);
  const isTutor = classObj.tutor.toString() === req.user._id.toString();
  const isStudent = classObj.students.some(s => s.toString() === req.user._id.toString());
  const isAdmin = req.user.role === 'admin';
  
  if (!isTutor && !isStudent && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized to access this file');
  }

  const attachment = assignment.attachments.find(a => a.filename === req.params.filename);
  if (!attachment) {
    res.status(404);
    throw new Error('File not found');
  }

  res.download(attachment.path, attachment.originalname);
});

// @desc    Download submission file
// @route   GET /api/assignments/submissions/download/:filename
// @access  Tutor and student owner
const downloadSubmissionFile = asyncHandler(async (req, res) => {
  console.log('downloadSubmissionFile called with filename:', req.params.filename);
  const submission = await Submission.findOne({ 'file.filename': req.params.filename })
    .populate('assignment', 'class')
    .populate('student', '_id');

  if (!submission) {
    console.log('Submission not found for filename:', req.params.filename);
    res.status(404);
    throw new Error('Submission not found');
  }

  // Verify permissions
  const classObj = await Class.findById(submission.assignment.class);
  const isTutor = classObj.tutor.toString() === req.user._id.toString();
  const isStudent = submission.student._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  
  if (!isTutor && !isStudent && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized to access this file');
  }

  res.download(submission.file.path, submission.file.originalname);
});

// @desc    Get all assignments for current student
// @route   GET /api/assignments/student
// @access  Student
const getStudentAssignments = asyncHandler(async (req, res) => {
  const classes = await Class.find({ students: req.user._id });
  
  const assignments = await Assignment.find({ 
    class: { $in: classes.map(c => c._id) }
  })
    .populate('tutor', 'name avatar')
    .populate('class', 'title')
    .sort('-dueDate');

  const submissions = await Submission.find({
    student: req.user._id,
    assignment: { $in: assignments.map(a => a._id) }
  });

  const assignmentsWithStatus = assignments.map(assignment => {
    const submission = submissions.find(s => s.assignment.toString() === assignment._id.toString());
    return {
      ...assignment.toObject(),
      submitted: !!submission,
      submission: submission || null
    };
  });

  res.json(assignmentsWithStatus);
});

// @desc    Get all assignments for current tutor
// @route   GET /api/assignments/tutor
// @access  Tutor
// @desc    Get tutor's assignments
// @route   GET /api/assignments/tutor
// @access  Tutor/Admin
// In assignmentController.js - fix the duplicate function
// @desc    Get all assignments for current tutor
// @route   GET /api/assignments/tutor
// @access  Tutor
const getTutorAssignments = asyncHandler(async (req, res) => {
  // Get classes where user is tutor
  const classes = await Class.find({ tutor: req.user._id });
  
  // Get assignments
  const assignments = await Assignment.find({ 
    class: { $in: classes.map(c => c._id) }
  })
    .populate('class', 'title')
    .sort('-createdAt')
    .lean();

  // For each assignment, fetch submissions and attach
  for (let assignment of assignments) {
    const submissions = await Submission.find({ assignment: assignment._id })
      .populate('student', 'name email avatar')
      .sort('-submittedAt')
      .lean();
    assignment.submissions = submissions;
  }

  res.json(assignments);
});

module.exports = {
  createAssignment,
  submitAssignment,
  getAssignmentsByClass,
  getAssignmentDetails,
  getAssignmentSubmissions,
  gradeSubmission,
  downloadAssignmentFile,
  downloadSubmissionFile,
  getStudentAssignments,
  getTutorAssignments
};