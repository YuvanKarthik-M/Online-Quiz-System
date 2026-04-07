const Quiz = require('../models/Quiz');
const Classroom = require('../models/Classroom');
const Submission = require('../models/Submission');

// Create a new quiz
exports.createQuiz = async (req, res) => {
  try {
    const { title, description, timer, isPublic, classroomId, questions, deadline, showResultBeforeDeadline } = req.body;
    const instructorId = req.user.id;

    const quiz = await Quiz.create({
      instructorId,
      title,
      description,
      timer,
      isPublic,
      classroomId: isPublic ? null : classroomId,
      questions,
      deadline,
      showResultBeforeDeadline
    });

    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Error creating quiz', error });
  }
};

// Get all quizzes (public ones and those the user has access to)
exports.getQuizzes = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let query;
    if (role === 'instructor') {
      // Instructors see their own quizzes
      query = { instructorId: userId };
    } else {
      // Students see public quizzes OR quizzes in classrooms they belong to
      const studentClassrooms = await Classroom.find({ students: userId }).select('_id');
      const classroomIds = studentClassrooms.map(c => c._id);
      
      query = { 
        $or: [
            { isPublic: true },
            { classroomId: { $in: classroomIds } }
        ]
      };
    }

    let quizzes = await Quiz.find(query).populate('instructorId', 'name').select('-questions'); // Don't send questions for the list view

    if (role === 'student') {
        // For students, check if they have submitted each quiz
        const submissions = await Submission.find({ studentId: userId }).select('quizId');
        const submittedQuizIds = submissions.map(s => s.quizId.toString());

        quizzes = quizzes.map(q => {
            const quizObj = q.toObject();
            quizObj.isSubmitted = submittedQuizIds.includes(q._id.toString());
            return quizObj;
        });
    }

    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching quizzes', error });
  }
};

// Get a single quiz by ID with access check
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Access logic:
    // 1. If public, anyone can view.
    // 2. If restricted, must be instructor or a student in the linked classroom.
    if (!quiz.isPublic) {
      if (!req.user) return res.status(401).json({ message: 'User not authenticated' });
      
      const isInstructorOwner = req.user.role === 'instructor' && quiz.instructorId.toString() === req.user.id;
      
      if (!isInstructorOwner) {
        // If student, check classroom membership
        if (req.user.role === 'student') {
            const classroom = await Classroom.findOne({ _id: quiz.classroomId, students: req.user.id });
            if (!classroom) {
                return res.status(403).json({ message: 'Access denied: You are not enrolled in the required classroom' });
            }
        } else {
            return res.status(403).json({ message: 'Access denied' });
        }
      }
    }

    // If the user is a student, we omit the correct answers and check for submissions.
    if (req.user && req.user.role === 'student') {
      try {
        const sanitizedQuiz = quiz.toObject();
        sanitizedQuiz.questions = sanitizedQuiz.questions.map(q => {
          const { correctAnswer, ...rest } = q;
          return rest;
        });

        // Check if student has already submitted this quiz
        const existingSubmission = await Submission.exists({ quizId: quiz._id, studentId: req.user.id });
        sanitizedQuiz.isSubmitted = !!existingSubmission;

        return res.status(200).json(sanitizedQuiz);
      } catch (err) {
        console.error("Sanitization error:", err);
        return res.status(500).json({ message: 'Error processing quiz data' });
      }
    }

    res.status(200).json(quiz);
  } catch (error) {
    console.error("Error in getQuizById:", error);
    res.status(500).json({ message: 'Error fetching quiz', error: error.message });
  }
};

// Submit a quiz
exports.submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body; // Array of { questionId, answerIndex }
    const quizId = req.params.id;
    const studentId = req.user.id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    // Check deadline
    if (quiz.deadline && new Date() > new Date(quiz.deadline)) {
      return res.status(403).json({ message: 'The deadline for this quiz has passed' });
    }

    // Check if already submitted
    const existingSubmission = await Submission.findOne({ quizId, studentId });
    if (existingSubmission) {
      return res.status(400).json({ message: 'You have already submitted this quiz' });
    }

    // Calculate score
    let score = 0;
    let totalPoints = 0;
    
    quiz.questions.forEach(q => {
      totalPoints += q.points || 1;
      const studentAnswer = answers.find(a => a.questionId.toString() === q._id.toString());
      if (studentAnswer && studentAnswer.answerIndex !== null && studentAnswer.answerIndex !== undefined && studentAnswer.answerIndex !== '') {
        const type = q.type || 'mcq';
        let isCorrect = false;
        
        if (type === 'fill_in') {
          isCorrect = String(studentAnswer.answerIndex).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
        } else {
          isCorrect = String(studentAnswer.answerIndex) === String(q.correctAnswer);
        }
        
        if (isCorrect) {
          score += q.points || 1;
        }
      }
    });

    const submission = await Submission.create({
      studentId,
      quizId,
      answers,
      score,
      totalPoints
    });

    res.status(201).json({ 
        message: 'Quiz submitted successfully', 
        score, 
        totalPoints,
        submissionId: submission._id
    });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting quiz', error });
  }
};

// Get quiz result
exports.getQuizResult = async (req, res) => {
  try {
    const quizId = req.params.id;
    const studentId = req.user.id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    const submission = await Submission.findOne({ quizId, studentId });
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    const deadlinePassed = quiz.deadline && new Date() > new Date(quiz.deadline);
    const canSeeResult = !quiz.deadline || quiz.showResultBeforeDeadline || deadlinePassed;

    if (!canSeeResult) {
      return res.status(200).json({ 
          message: 'Results are hidden until the deadline has passed',
          score: submission.score, // Maybe return only score or nothing? 
          totalPoints: submission.totalPoints,
          isResultHidden: true
      });
    }

    // Return full result with correct answers
    res.status(200).json({
      submission,
      quiz: quiz // Include full quiz with correct answers
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching result', error });
  }
};

// Update quiz settings (deadline, result visibility)
exports.updateQuizSettings = async (req, res) => {
  try {
    const { deadline, showResultBeforeDeadline } = req.body;
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    if (quiz.instructorId.toString() !== req.user.id) {
       return res.status(403).json({ message: 'Not authorized' });
    }

    quiz.deadline = deadline !== undefined ? deadline : quiz.deadline;
    quiz.showResultBeforeDeadline = showResultBeforeDeadline !== undefined ? showResultBeforeDeadline : quiz.showResultBeforeDeadline;

    await quiz.save();
    res.status(200).json({ message: 'Quiz settings updated', quiz });
  } catch (error) {
    res.status(500).json({ message: 'Error updating settings', error });
  }
};

// Update entire quiz
exports.updateQuiz = async (req, res) => {
  try {
    const { title, description, timer, isPublic, classroomId, questions, deadline, showResultBeforeDeadline } = req.body;
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    if (quiz.instructorId.toString() !== req.user.id) {
       return res.status(403).json({ message: 'Not authorized' });
    }

    quiz.title = title || quiz.title;
    quiz.description = description || quiz.description;
    quiz.timer = timer || quiz.timer;
    quiz.isPublic = isPublic !== undefined ? isPublic : quiz.isPublic;
    quiz.classroomId = isPublic ? null : (classroomId || quiz.classroomId);
    quiz.questions = questions || quiz.questions;
    quiz.deadline = deadline !== undefined ? deadline : quiz.deadline;
    quiz.showResultBeforeDeadline = showResultBeforeDeadline !== undefined ? showResultBeforeDeadline : quiz.showResultBeforeDeadline;

    await quiz.save();
    res.status(200).json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Error updating quiz', error });
  }
};

// Get all submissions for a quiz (Instructor only)
exports.getQuizSubmissions = async (req, res) => {
  try {
    const quizId = req.params.id;
    const instructorId = req.user.id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    if (quiz.instructorId.toString() !== instructorId) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    const submissions = await Submission.find({ quizId })
        .populate('studentId', 'name email')
        .sort('-completedAt');

    res.status(200).json({
        quizTitle: quiz.title,
        submissions
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching submissions', error });
  }
};

// Delete a submission (Instructor only)
exports.deleteSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const instructorId = req.user.id;

    const submission = await Submission.findById(submissionId).populate('quizId');
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    if (submission.quizId.instructorId.toString() !== instructorId) {
      return res.status(403).json({ message: 'Not authorized to delete this submission' });
    }

    await Submission.findByIdAndDelete(submissionId);
    res.status(200).json({ message: 'Submission deleted successfully. Student can retake the quiz.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting submission', error });
  }
};

// Delete a quiz entirely (Instructor only)
exports.deleteQuiz = async (req, res) => {
  try {
    const quizId = req.params.id;
    const instructorId = req.user.id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    if (quiz.instructorId.toString() !== instructorId) {
        return res.status(403).json({ message: 'Not authorized to delete this quiz' });
    }

    // We no longer delete submissions here so students can maintain their dashboard stats/history.
    // Submission.deleteMany({ quizId }).exec(); // Optional for cleanup if needed, but per-req we keep them.

    // Delete the quiz itself
    await Quiz.findByIdAndDelete(quizId);

    res.status(200).json({ message: 'Quiz deleted successfully. (Student performance history preserved)' });
  } catch (error) {
    console.error("Error deleting quiz", error);
    res.status(500).json({ message: 'Error deleting quiz', error });
  }
};
