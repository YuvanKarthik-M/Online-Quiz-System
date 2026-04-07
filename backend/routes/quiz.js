const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

// Create a quiz (Instructor only)
router.post('/', authMiddleware, roleMiddleware(['instructor']), quizController.createQuiz);

// Get all quizzes the user can access
router.get('/', authMiddleware, quizController.getQuizzes);

// Get a single quiz by ID (Includes access check internally)
router.get('/:id', authMiddleware, quizController.getQuizById);

// Submit a quiz
router.post('/:id/submit', authMiddleware, roleMiddleware(['student']), quizController.submitQuiz);

// Get quiz result
router.get('/:id/result', authMiddleware, quizController.getQuizResult);

// Update quiz settings (Instructor only)
router.patch('/:id/settings', authMiddleware, roleMiddleware(['instructor']), quizController.updateQuizSettings);

// Update entire quiz (Instructor only)
router.put('/:id', authMiddleware, roleMiddleware(['instructor']), quizController.updateQuiz);

// Delete entire quiz (Instructor only)
router.delete('/:id', authMiddleware, roleMiddleware(['instructor']), quizController.deleteQuiz);

// Get submissions for a quiz (Instructor only)
router.get('/:id/submissions', authMiddleware, roleMiddleware(['instructor']), quizController.getQuizSubmissions);

// Delete a specific submission (Instructor only)
router.delete('/submissions/:submissionId', authMiddleware, roleMiddleware(['instructor']), quizController.deleteSubmission);

module.exports = router;
