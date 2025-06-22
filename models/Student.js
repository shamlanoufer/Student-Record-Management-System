const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  SID: { type: Number, required: true, unique: true },
  FirstName: { type: String, required: true },
  LastName: { type: String, required: true },
  Email: { type: String, required: true, unique: true },
  NearCity: { type: String, required: true },
  Course: { type: [String], required: true },
  Guardian: { type: String, required: true },
  Subjects: { type: [String], required: true }
});

module.exports = mongoose.model('Student', studentSchema);