import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './components/Login';
import Profile from './components/Profile';
import Dashboard from './components/Dashboard';
import CreateQuiz from './components/CreateQuiz';
import ManageClassroom from './components/ManageClassroom';
import ClassroomView from './components/ClassroomView';
import AttendQuiz from './components/AttendQuiz';
import QuizResult from './components/QuizResult';
import QuizSubmissions from './components/QuizSubmissions';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/create-quiz" element={<CreateQuiz />} />
        <Route path="/edit-quiz/:id" element={<CreateQuiz />} />
        <Route path="/manage-classroom" element={<ManageClassroom />} />
        <Route path="/classroom/:id" element={<ClassroomView />} />
        <Route path="/attend-quiz/:id" element={<AttendQuiz />} />
        <Route path="/quiz/:id/result" element={<QuizResult />} />
        <Route path="/quiz/:id/submissions" element={<QuizSubmissions />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;
