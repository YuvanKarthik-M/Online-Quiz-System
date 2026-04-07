const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  type: { type: String, enum: ['mcq', 'fill_in', 'true_false'], default: 'mcq' },
  text: { type: String, required: true },
  image: { type: String }, // Optional image for the question
  options: [{ type: mongoose.Schema.Types.Mixed }], // Can be String or { text: String, image: String }
  correctAnswer: { type: mongoose.Schema.Types.Mixed, required: true }, // Index for mcq, string for fill_in
  points: { type: Number, default: 1 },
  isRequired: { type: Boolean, default: true }
});

const quizSchema = new mongoose.Schema({
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom' }, // Optional classroom for restriction
  title: { type: String, required: true },
  description: { type: String },
  timer: { type: Number, required: true }, // duration in minutes
  isPublic: { type: Boolean, default: true },
  deadline: { type: Date },
  showResultBeforeDeadline: { type: Boolean, default: false },
  questions: [questionSchema]
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
