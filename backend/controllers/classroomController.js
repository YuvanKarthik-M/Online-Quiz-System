const Classroom = require('../models/Classroom');
const crypto = require('crypto');

// Instructor creates a classroom
exports.createClassroom = async (req, res) => {
  try {
    const { name, description } = req.body;
    const instructorId = req.user.id;

    // Generate a simple join code (6 chars)
    const joinCode = crypto.randomBytes(3).toString('hex').toUpperCase();

    const classroom = await Classroom.create({
        instructorId,
        name,
        description,
        joinCode
    });

    res.status(201).json(classroom);
  } catch (error) {
    res.status(500).json({ message: 'Error creating classroom', error });
  }
};

// Student joins a classroom using a code
exports.joinClassroom = async (req, res) => {
  try {
    const { joinCode } = req.body;
    const studentId = req.user.id;

    const classroom = await Classroom.findOne({ joinCode });
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found with this code' });
    }

    if (classroom.students.includes(studentId)) {
        return res.status(400).json({ message: 'You are already in this classroom' });
    }

    classroom.students.push(studentId);
    await classroom.save();

    res.status(200).json({ message: 'Joined classroom successfully', classroom });
  } catch (error) {
    res.status(500).json({ message: 'Error joining classroom', error });
  }
};

// Get classrooms for an instructor or student
exports.getClassrooms = async (req, res) => {
    try {
        const userId = req.user.id;
        let query;

        if (req.user.role === 'instructor') {
            query = { instructorId: userId };
        } else {
            query = { students: userId };
        }

        const classrooms = await Classroom.find(query)
            .populate('instructorId', 'name')
            .populate('students', 'name email');
        res.status(200).json(classrooms);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching classrooms', error });
    }
}

// Get single classroom with its students, instructor, and quizzes
exports.getClassroomById = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;
        const classroomId = req.params.id;

        // Fetch Classrooms with populated relations
        const classroom = await Classroom.findById(classroomId)
            .populate('instructorId', 'name email')
            .populate('students', 'name email');

        if (!classroom) return res.status(404).json({ message: 'Classroom not found' });

        // Authorization check
        if (role === 'instructor' && classroom.instructorId._id.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to view this classroom' });
        }
        if (role === 'student' && !classroom.students.some(s => s._id.toString() === userId)) {
            return res.status(403).json({ message: 'You are not enrolled in this classroom' });
        }

        // Import Quiz and Submission here specifically
        const Quiz = require('../models/Quiz');
        const Submission = require('../models/Submission');
        let quizzes = await Quiz.find({ classroomId });

        if (role === 'student') {
            const submissions = await Submission.find({ studentId: userId }).select('quizId');
            const submittedQuizIds = submissions.map(s => s.quizId.toString());

            quizzes = quizzes.map(q => {
                const quizObj = q.toObject ? q.toObject() : q;
                quizObj.isSubmitted = submittedQuizIds.includes(quizObj._id.toString());
                return quizObj;
            });
        }

        res.status(200).json({ classroom, quizzes });
    } catch (error) {
        console.error("Error fetching classroom by ID", error);
        res.status(500).json({ message: 'Error fetching classroom details', error });
    }
};

// Update classroom details
exports.updateClassroom = async (req, res) => {
    try {
        const { name, description } = req.body;
        const classroomId = req.params.id;

        const classroom = await Classroom.findById(classroomId);
        if (!classroom) return res.status(404).json({ message: 'Classroom not found' });

        if (classroom.instructorId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this classroom' });
        }

        if (name) classroom.name = name;
        if (description) classroom.description = description;

        await classroom.save();
        res.status(200).json({ message: 'Classroom updated successfully', classroom });
    } catch (error) {
        console.error("Error updating classroom", error);
        res.status(500).json({ message: 'Error updating classroom', error });
    }
};

// Delete a classroom entirely (Instructor only)
exports.deleteClassroom = async (req, res) => {
    try {
        const classroomId = req.params.id;
        const instructorId = req.user.id;

        const classroom = await Classroom.findById(classroomId);
        if (!classroom) return res.status(404).json({ message: 'Classroom not found' });

        if (classroom.instructorId.toString() !== instructorId) {
            return res.status(403).json({ message: 'Not authorized to delete this classroom' });
        }

        // Delete all quizzes associated with this classroom
        const Quiz = require('../models/Quiz');
        const Submission = require('../models/Submission');
        
        const quizzes = await Quiz.find({ classroomId });
        // const quizIds = quizzes.map(q => q._id);

        // We no longer delete submissions here to maintain the history for students.
        // await Submission.deleteMany({ quizId: { $in: quizIds } });

        await Quiz.deleteMany({ classroomId });
        await Classroom.findByIdAndDelete(classroomId);

        res.status(200).json({ message: 'Classroom and quizzes deleted. (Student performance statistics preserved)' });
    } catch (error) {
        console.error("Error deleting classroom", error);
        res.status(500).json({ message: 'Error deleting classroom', error });
    }
};

// Instructor removes a student from a classroom
exports.removeStudent = async (req, res) => {
    try {
        const { id, studentId } = req.params;
        const instructorId = req.user.id;

        const classroom = await Classroom.findById(id);
        if (!classroom) return res.status(404).json({ message: 'Classroom not found' });

        if (classroom.instructorId.toString() !== instructorId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        classroom.students = classroom.students.filter(s => s.toString() !== studentId);
        await classroom.save();

        res.status(200).json({ message: 'Student removed successfully' });
    } catch (error) {
        console.error("Error removing student", error);
        res.status(500).json({ message: 'Error removing student', error });
    }
};

// Student leaves a classroom
exports.leaveClassroom = async (req, res) => {
    try {
        const classroomId = req.params.id;
        const studentId = req.user.id;

        const classroom = await Classroom.findById(classroomId);
        if (!classroom) return res.status(404).json({ message: 'Classroom not found' });

        if (!classroom.students.includes(studentId)) {
            return res.status(400).json({ message: 'You are not in this classroom' });
        }

        classroom.students = classroom.students.filter(s => s.toString() !== studentId);
        await classroom.save();

        res.status(200).json({ message: 'Left classroom successfully' });
    } catch (error) {
        console.error("Error leaving classroom", error);
        res.status(500).json({ message: 'Error leaving classroom', error });
    }
};
