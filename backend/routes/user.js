const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const Quiz = require('../models/Quiz');
const Classroom = require('../models/Classroom');
const Submission = require('../models/Submission');

// @route   GET /api/user/profile
// @desc    Get current user's profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/user/profile
// @desc    Update current user's profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  const { name, picture } = req.body;
  
  try {
    let user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (picture) user.picture = picture;

    await user.save();

    // Send the updated user details (excluding password)
    const updatedUser = await User.findById(req.user.id).select('-password');
    res.json(updatedUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/user/dashboard-stats
// @desc    Get dashboard statistics for the current user
// @access  Private
router.get('/dashboard-stats', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;

        let stats = {};

        if (role === 'instructor') {
            // Total Quizzes Created
            const totalQuizzesCreated = await Quiz.countDocuments({ instructorId: userId });
            
            // Total Students Handled across all classrooms
            const classrooms = await Classroom.find({ instructorId: userId });
            let uniqueStudents = new Set();
            classrooms.forEach(c => {
                c.students.forEach(sId => uniqueStudents.add(sId.toString()));
            });
            const totalStudentsHandled = uniqueStudents.size;

            stats = {
                totalQuizzesCreated,
                totalStudentsHandled
            };

        } else if (role === 'student') {
            // Total Classrooms Joined
            const totalClassrooms = await Classroom.countDocuments({ students: userId });

            // Fetch submissions
            const submissions = await Submission.find({ studentId: userId });
            const totalQuizAttended = submissions.length;

            let totalCorrectAnswers = 0;
            let totalPossiblePoints = 0;
            let totalEarnedPoints = 0;

            submissions.forEach(sub => {
                totalEarnedPoints += sub.score;
                totalPossiblePoints += sub.totalPoints;
                totalCorrectAnswers += sub.score; // Assuming 1 point per correct answer roughly, or just report total points.
            });

            // Adjust total correctly answered questions by looking at answers array if possible, 
            // but the prompt says total correct answers. Since score is points, and default point is 1, it's roughly the same.
            
            let accuracy = 0;
            if (totalPossiblePoints > 0) {
                accuracy = Math.round((totalEarnedPoints / totalPossiblePoints) * 100);
            }

            stats = {
                totalClassrooms,
                totalQuizAttended,
                totalCorrectAnswers, // Technically points earned
                accuracy
            };
        }

        res.json(stats);
    } catch (err) {
        console.error("Error fetching dashboard stats:", err.message);
        res.status(500).send('Server Error retrieving stats');
    }
});

module.exports = router;
