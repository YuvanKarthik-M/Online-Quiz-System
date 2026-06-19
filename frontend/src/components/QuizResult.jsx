import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './AttendQuiz.css'; // Reusing some CSS

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const QuizResult = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const res = await axios.get(`${API_URL}/quiz/${id}/result`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setResult(res.data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch result');
                setLoading(false);
            }
        };

        fetchResult();
    }, [id, token]);

    if (loading) return (
        <div className="attend-quiz-container loading-container">
            <div className="spinner"></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                <p>Gathering your results...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="attend-quiz-container">
            <h2 style={{ color: 'var(--error)' }}>Result Error</h2>
            <p>{error}</p>
            <button className="nav-btn" onClick={() => navigate('/dashboard')} style={{ marginTop: '1rem' }}>
                Go Back Dashboard
            </button>
        </div>
    );

    const { submission, quiz, message, isResultHidden } = result;

    return (
        <div className="attend-quiz-container">
            <div className="quiz-header" style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'var(--secondary-gradient)', padding: '0.8rem', borderRadius: '12px' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                    </div>
                    <div>
                        <h1 style={{ margin: 0 }}>Result for {quiz?.title || 'Quiz'}</h1>
                        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Completion Time: {new Date(submission?.completedAt || Date.now()).toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', margin: '2.5rem 0' }}>
                <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', textAlign: 'center' }}>
                    <h3 style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Your Score</h3>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                        {submission?.score || result.score} / {submission?.totalPoints || result.totalPoints}
                    </div>
                </div>
                <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', textAlign: 'center' }}>
                    <h3 style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Accuracy</h3>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--secondary)' }}>
                        {Math.round(((submission?.score || result.score) / (submission?.totalPoints || result.totalPoints)) * 100)}%
                    </div>
                </div>
            </div>

            {isResultHidden ? (
                <div style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)', padding: '2rem', borderRadius: '16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: '#fbbf24' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                    </div>
                    <p style={{ color: '#fbbf24', fontSize: '1.1rem', fontWeight: '600' }}>{message}</p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        The instructor has disabled the option to view correct answers before the deadline has passed.
                    </p>
                </div>
            ) : (
                <div className="detailed-results">
                    <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                        Post-Quiz Review
                    </h2>
                    {quiz.questions.map((q, qIndex) => {
                        const studentAnswer = submission.answers.find(a => a.questionId === q._id);
                        
                        let isCorrect = false;
                        if (q.type === 'fill_in') {
                            isCorrect = String(studentAnswer?.answerIndex || '').trim().toLowerCase() === String(q.correctAnswer || '').trim().toLowerCase();
                        } else {
                            isCorrect = String(studentAnswer?.answerIndex) === String(q.correctAnswer);
                        }
                        
                        return (
                            <div key={qIndex} className="quiz-question-card" style={{ borderLeft: `6px solid ${isCorrect ? 'var(--secondary)' : 'var(--error)'}`, background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div style={{ flex: 1, paddingRight: '1rem' }}>
                                        <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--text-main)' }}>{qIndex + 1}. {q.text}</h3>
                                        {q.image && (
                                            <div style={{ marginTop: '1rem' }}>
                                                <img src={q.image} alt="Question" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', border: '1px solid var(--glass-border)' }} />
                                            </div>
                                        )}
                                    </div>
                                    <span style={{ 
                                        padding: '0.4rem 1rem', 
                                        borderRadius: '50px', 
                                        fontSize: '0.8rem', 
                                        fontWeight: 'bold',
                                        background: isCorrect ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                        color: isCorrect ? '#4ade80' : '#f87171',
                                        border: isCorrect ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)'
                                    }}>
                                        {isCorrect ? 'Correct' : 'Incorrect'}
                                    </span>
                                </div>
                                
                                {q.type === 'fill_in' ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.95rem' }}>
                                        <div style={{ padding: '0.8rem 1rem', borderRadius: '10px', background: isCorrect ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: isCorrect ? '1px solid var(--secondary)' : '1px solid var(--error)', color: isCorrect ? '#4ade80' : '#f87171' }}>
                                            <strong>Your Answer:</strong> {studentAnswer?.answerIndex || <span style={{ fontStyle: 'italic', opacity: 0.6 }}>No answer provided</span>}
                                        </div>
                                        {!isCorrect && (
                                            <div style={{ padding: '0.8rem 1rem', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid var(--secondary)', color: '#4ade80' }}>
                                                <strong>Correct Answer:</strong> {q.correctAnswer}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                                        {q.options.map((opt, oIndex) => {
                                            const optText = typeof opt === 'string' ? opt : opt.text;
                                            const optImage = typeof opt === 'string' ? '' : opt.image;
                                            let borderStyle = '1px solid var(--glass-border)';
                                            let background = 'transparent';
                                            let icon = null;
                                            
                                            const isThisCorrect = String(oIndex) === String(q.correctAnswer);
                                            const isSelected = String(oIndex) === String(studentAnswer?.answerIndex);

                                            if (isThisCorrect) {
                                                borderStyle = '1px solid var(--secondary)';
                                                background = 'rgba(34, 197, 94, 0.1)';
                                                icon = <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
                                            } else if (isSelected) {
                                                borderStyle = '1px solid var(--error)';
                                                background = 'rgba(239, 68, 68, 0.1)';
                                                icon = <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
                                            }

                                            return (
                                                <div key={oIndex} style={{ 
                                                    padding: '0.8rem 1rem', 
                                                    borderRadius: '10px', 
                                                    border: borderStyle,
                                                    background: background,
                                                    fontSize: '0.9rem',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'flex-start',
                                                    color: isThisCorrect ? '#4ade80' : (isSelected ? '#f87171' : 'var(--text-muted)')
                                                }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                        {optText && <span style={{ marginTop: optImage ? '0.2rem' : '0' }}>{optText}</span>}
                                                        {optImage && <img src={optImage} alt="Option" style={{ maxWidth: '150px', borderRadius: '8px', border: '1px solid var(--glass-border)' }} />}
                                                    </div>
                                                    <div style={{ marginTop: optImage ? '0.2rem' : '0' }}>{icon}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                <button className="submit-btn" onClick={() => navigate('/dashboard')} style={{ width: 'auto', padding: '0.8rem 2.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', margin: '0 auto' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                    Return to Dashboard
                </button>
            </div>
        </div>
    );
};

export default QuizResult;
