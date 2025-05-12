// server/routes/classRoutes.js
const express = require('express');
const Class = require('../models/Class'); // You'll need to create this model
const { protect: auth } = require('../middleware/auth'); // Import auth middleware as 'auth'
const router = express.Router();

// Create a new class
router.post('/', async (req, res) => {
  try {
    const newClass = new Class({
      title: req.body.title,
      subject: req.body.subject,
      tutor: req.body.tutorId,
      schedule: req.body.schedule,
      meetingId: `meeting-${Math.random().toString(36).substr(2, 9)}`
    });
    
    await newClass.save();
    res.status(201).json(newClass);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get classes for tutor
router.get('/tutor/:tutorId', async (req, res) => {
  try {
    const classes = await Class.find({ tutor: req.params.tutorId });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const mongoose = require('mongoose');

// Get classes for student
router.get('/student/:studentId', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.studentId)) {
      return res.status(400).json({ error: 'Invalid studentId format' });
    }
    const studentObjectId = new mongoose.Types.ObjectId(req.params.studentId);

    const totalClassesCount = await Class.countDocuments();
    console.log('Total classes count:', totalClassesCount);

    // Get both enrolled classes and available classes without schedule filter
    let enrolledClasses = await Class.find({
      students: studentObjectId
    }).sort({ schedule: 1 });

    let availableClasses = await Class.find({
      students: { $ne: studentObjectId }
    }).sort({ schedule: 1 });

    // Add default values for maxStudents and duration if missing
    enrolledClasses = enrolledClasses.map(cls => ({
      ...cls.toObject(),
      maxStudents: cls.maxStudents || 10,
      duration: cls.duration || 60
    }));

    availableClasses = availableClasses.map(cls => ({
      ...cls.toObject(),
      maxStudents: cls.maxStudents || 10,
      duration: cls.duration || 60
    }));

    console.log('Enrolled classes:', enrolledClasses);
    console.log('Available classes:', availableClasses);
    res.json({
      enrolledClasses,
      availableClasses
    });
  } catch (err) {
    console.error('Error fetching classes for student:', err);
    res.status(500).json({ error: err.message });
  }
});
router.get('/verify-access/:meetingId', auth, async (req, res) => {
    try {
      const classObj = await Class.findOne({ 
        meetingId: req.params.meetingId,
        students: req.user._id 
      });
      
      res.json({ 
        hasAccess: !!classObj,
        class: classObj || null
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

router.post('/:classId/add-student', async (req, res) => {
  const { classId } = req.params;
  const { studentId } = req.body;

  if (!studentId) {
    return res.status(400).json({ message: 'studentId is required' });
  }

  try {
    const classObj = await Class.findById(classId);
    if (!classObj) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check if student already enrolled
    if (classObj.students.includes(studentId)) {
      return res.status(400).json({ message: 'Student already enrolled in class' });
    }

    classObj.students.push(studentId);
    await classObj.save();

    res.status(200).json({ message: 'Student added to class', class: classObj });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:classId', async (req, res) => {
  const { classId } = req.params;
  try {
    const classObj = await Class.findById(classId);
    if (!classObj) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Update fields if provided
    if (req.body.title !== undefined) classObj.title = req.body.title;
    if (req.body.subject !== undefined) classObj.subject = req.body.subject;
    if (req.body.tutorId !== undefined) classObj.tutor = req.body.tutorId;
    if (req.body.schedule !== undefined) classObj.schedule = req.body.schedule;

    await classObj.save();
    res.json(classObj);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:classId', async (req, res) => {
  const { classId } = req.params;
  try {
    const classObj = await Class.findById(classId);
    if (!classObj) {
      return res.status(404).json({ message: 'Class not found' });
    }

    await classObj.remove();
    res.json({ message: 'Class deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/available', async (req, res) => {
  try {
    // Return classes that are not full and scheduled in the future
    const classes = await Class.find({
      schedule: { $gte: new Date() }
    }).sort({ schedule: 1 });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
