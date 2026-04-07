import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './AttendQuiz.css';

const API_URL = 'http://localhost:5000/api';

const AttendQuiz = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = useCallback(async () => {
        if (submitting) return;
        setSubmitting(true);
        try {
            const formattedAnswers = answers.map((ans, idx) => ({
                questionId: quiz.questions[idx]._id,
                answerIndex: ans === null ? -1 : ans
            }));

            await axios.post(`${API_URL}/quiz/${id}/submit`, { 
                answers: formattedAnswers 
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            navigate(`/quiz/${id}/result`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit quiz');
            setSubmitting(false);
        }
    }, [id, answers, quiz, token, navigate, submitting]);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const res = await axios.get(`${API_URL}/quiz/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.data.isSubmitted) {
                    setError('You have already submitted this quiz.');
                    setLoading(false);
                    return;
                }

                setQuiz(res.data);
                setAnswers(new Array(res.data.questions.length).fill(null));
                setTimeLeft(res.data.timer * 60); // minutes to seconds
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch quiz');
                setLoading(false);
            }
        };

        fetchQuiz();
    }, [id, token]);

    useEffect(() => {
        if (timeLeft <= 0 || loading || !quiz) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, loading, quiz, handleSubmit]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleOptionSelect = (optionIndex) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestionIndex] = optionIndex;
        setAnswers(newAnswers);
    };

    if (loading) return (
        <div className="attend-quiz-container loading-container">
            <div className="spinner"></div>
            <p>Readying the challenges... ⚡</p>
        </div>
    );

    if (error) return (
        <div className="attend-quiz-container">
            <h2 style={{ color: 'var(--error)' }}>Oops!</h2>
            <p>{error}</p>
            <button className="nav-btn" onClick={() => navigate('/dashboard')} style={{ marginTop: '1rem' }}>
                Go Back Dashboard
            </button>
        </div>
    );

    const currentQuestion = quiz.questions[currentQuestionIndex];

    return (
        <div className="attend-quiz-page">
            <div className="quiz-sidebar glass-panel">
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>Questions Navigation</h3>
                <div className="quiz-navigation-grid">
                    {quiz.questions.map((q, idx) => {
                        const isAnswered = answers[idx] !== null && String(answers[idx]).trim() !== '';
                        const isActive = idx === currentQuestionIndex;
                        return (
                            <button
                                key={idx}
                                className={`nav-matrix-btn ${isAnswered ? 'answered' : ''} ${isActive ? 'active' : ''}`}
                                onClick={() => setCurrentQuestionIndex(idx)}
                            >
                                {idx + 1}
                            </button>
                        );
                    })}
                </div>
                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                        <div style={{ width: 14, height: 14, borderRadius: '4px', background: 'var(--primary)' }}></div> Attempted
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                        <div style={{ width: 14, height: 14, borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)' }}></div> Unattempted
                    </div>
                </div>
            </div>
            
            <div className="attend-quiz-main">
                <div className="attend-quiz-container">
            <div className="quiz-header">
                <div>
                    <h1>{quiz.title}</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Attempting as Student</p>
                </div>
                <div className="timer-box">
                    <span>⏱️</span>
                    <span style={{ color: timeLeft < 60 ? 'var(--error)' : 'inherit' }}>
                        {formatTime(timeLeft)}
                    </span>
                </div>
            </div>

            <div className="question-status">
                Question <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{currentQuestionIndex + 1}</span> of {quiz.questions.length}
            </div>

            <div className="quiz-question-card animate-fade-in" key={currentQuestionIndex}>
                <h2 className="quiz-question-text">
                    {currentQuestion.text}
                    {currentQuestion.isRequired !== false && <span style={{ color: 'var(--error)', marginLeft: '0.3rem' }} title="Required">*</span>}
                </h2>
                {currentQuestion.image && (
                    <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                        <img src={currentQuestion.image} alt="Question" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '12px', border: '1px solid var(--glass-border)' }} />
                    </div>
                )}
                <div className="quiz-options-list">
                    {(!currentQuestion.type || currentQuestion.type === 'mcq' || currentQuestion.type === 'true_false') && currentQuestion.options.map((opt, i) => {
                        const optText = typeof opt === 'string' ? opt : opt.text;
                        const optImage = typeof opt === 'string' ? '' : opt.image;
                        return (
                            <label 
                                key={i} 
                                className={`quiz-option ${answers[currentQuestionIndex] === i ? 'selected' : ''}`}
                                style={{ alignItems: 'flex-start' }}
                            >
                                <input 
                                    type="radio" 
                                    name="option" 
                                    checked={answers[currentQuestionIndex] === i} 
                                    onChange={() => handleOptionSelect(i)} 
                                    style={{ marginTop: optImage ? '0.4rem' : '0' }}
                                />
                                {(!currentQuestion.type || currentQuestion.type === 'mcq') && (
                                    <span className="option-index" style={{ marginTop: optImage ? '0.2rem' : '0' }}>{String.fromCharCode(65 + i)}</span>
                                )}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                    {optText && <span style={{ marginTop: optImage ? '0.2rem' : '0' }}>{optText}</span>}
                                    {optImage && <img src={optImage} alt={`Option ${String.fromCharCode(65 + i)}`} style={{ maxWidth: '200px', borderRadius: '8px', border: '1px solid var(--glass-border)' }} />}
                                </div>
                            </label>
                        );
                    })}

                    {currentQuestion.type === 'fill_in' && (
                        <div style={{ marginTop: '1rem', width: '100%' }}>
                            <input 
                                type="text"
                                className="form-input"
                                style={{ padding: '1rem', fontSize: '1rem', width: '100%', boxSizing: 'border-box' }}
                                placeholder="Type your answer here..."
                                value={answers[currentQuestionIndex] || ''}
                                onChange={(e) => {
                                    const newAnswers = [...answers];
                                    newAnswers[currentQuestionIndex] = e.target.value;
                                    setAnswers(newAnswers);
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="quiz-footer">
                <button 
                    className="nav-btn" 
                    disabled={currentQuestionIndex === 0} 
                    onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                >
                    Previous
                </button>
                
                {currentQuestionIndex < quiz.questions.length - 1 ? (
                    <button 
                        className="nav-btn" 
                        onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                        disabled={currentQuestion.isRequired !== false && (answers[currentQuestionIndex] === null || String(answers[currentQuestionIndex]).trim() === '')}
                        style={{ 
                            background: (currentQuestion.isRequired !== false && (answers[currentQuestionIndex] === null || String(answers[currentQuestionIndex]).trim() === '')) ? 'rgba(255,255,255,0.1)' : 'var(--primary)', 
                            color: 'white', 
                            border: 'none',
                            cursor: (currentQuestion.isRequired !== false && (answers[currentQuestionIndex] === null || String(answers[currentQuestionIndex]).trim() === '')) ? 'not-allowed' : 'pointer',
                            opacity: (currentQuestion.isRequired !== false && (answers[currentQuestionIndex] === null || String(answers[currentQuestionIndex]).trim() === '')) ? 0.5 : 1
                        }}
                    >
                        Next Question
                    </button>
                ) : (
                    <button 
                        className="submit-quiz-btn" 
                        onClick={handleSubmit}
                        disabled={submitting || (currentQuestion.isRequired !== false && (answers[currentQuestionIndex] === null || String(answers[currentQuestionIndex]).trim() === ''))}
                        style={{
                            opacity: (currentQuestion.isRequired !== false && (answers[currentQuestionIndex] === null || String(answers[currentQuestionIndex]).trim() === '')) ? 0.5 : 1,
                            cursor: (currentQuestion.isRequired !== false && (answers[currentQuestionIndex] === null || String(answers[currentQuestionIndex]).trim() === '')) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {submitting ? 'Submitting...' : '🎉 Finish Quiz'}
                    </button>
                )}
            </div>
          </div>
        </div>
    </div>
    );
};

export default AttendQuiz;
