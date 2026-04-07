const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  joinCode: { type: String, unique: true, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Classroom', classroomSchema);
