// server/models/Class.js
const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  title: String,
  subject: String,
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  schedule: Date,
  meetingId: String,
  maxStudents: { type: Number, default: 10 },
  duration: { type: Number, default: 60 }, // duration in minutes
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Class', classSchema);