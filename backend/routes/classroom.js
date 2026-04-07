const express = require('express');
const router = express.Router();
const classroomController = require('../controllers/classroomController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

// Create a classroom (Instructor only)
router.post('/', authMiddleware, roleMiddleware(['instructor']), classroomController.createClassroom);

// Join a classroom using a code (Student only)
router.post('/join', authMiddleware, roleMiddleware(['student']), classroomController.joinClassroom);

// Get classrooms for an instructor or a student
router.get('/', authMiddleware, classroomController.getClassrooms);

// Get single classroom with details and quizzes
router.get('/:id', authMiddleware, classroomController.getClassroomById);

// Update classroom details (Instructor only)
router.put('/:id', authMiddleware, roleMiddleware(['instructor']), classroomController.updateClassroom);

// Delete classroom (Instructor only)
router.delete('/:id', authMiddleware, roleMiddleware(['instructor']), classroomController.deleteClassroom);

// Remove student from classroom (Instructor only)
router.delete('/:id/students/:studentId', authMiddleware, roleMiddleware(['instructor']), classroomController.removeStudent);

// Leave classroom (Student only)
router.delete('/:id/leave', authMiddleware, roleMiddleware(['student']), classroomController.leaveClassroom);

module.exports = router;
