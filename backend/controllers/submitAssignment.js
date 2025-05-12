const submitAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  
  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }

  // Check if user is enrolled in the class
  const classObj = await Class.findById(assignment.class);
  const isStudent = classObj.students.some(student => student.toString() === req.user._id.toString());
  
  if (!isStudent) {
    res.status(403);
    throw new Error('Not authorized to submit this assignment');
  }

  // Check if already submitted
  const existingSubmission = await Submission.findOne({
    assignment: assignment._id,
    student: req.user._id
  });

  if (existingSubmission) {
    res.status(400);
    throw new Error('Assignment already submitted');
  }

  if (!req.file) {
    res.status(400);
    throw new Error('Please upload a file');
  }

  const submission = await Submission.create({
    assignment: assignment._id,
    student: req.user._id,
    file: req.file.path,
    comments: req.body.comments || ''
  });

  res.status(201).json(submission);
});