// server/models/Submission.js
const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  file: {
    filename: {
      type: String,
      required: true
    },
    originalname: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    }
  },
  comments: {
    type: String
  },
  grade: {
    type: String
  },
  tutorFeedback: {
    type: String
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Submission', submissionSchema);