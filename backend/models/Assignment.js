// server/models/Assignment.js
const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please enter assignment title']
  },
  description: {
    type: String,
    required: [true, 'Please enter assignment description']
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dueDate: {
    type: Date,
    required: [true, 'Please enter due date']
  },
  attachments: [{
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
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Assignment', assignmentSchema);