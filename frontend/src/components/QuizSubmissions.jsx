import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './AttendQuiz.css'; // Reusing some glassmorphism

const API_URL = 'http://localhost:5000/api';

const QuizSubmissions = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const res = await axios.get(`${API_URL}/quiz/${id}/submissions`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setData(res.data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch submissions');
                setLoading(false);
            }
        };

        fetchSubmissions();
    }, [id, token]);

    const handleDelete = async (submissionId) => {
        if (!window.confirm('Are you sure you want to delete this submission? The student will be able to retake the quiz.')) return;
        
        try {
            await axios.delete(`${API_URL}/quiz/submissions/${submissionId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData({
                ...data,
                submissions: data.submissions.filter(sub => sub._id !== submissionId)
            });
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete submission');
        }
    };

    if (loading) return (
        <div className="attend-quiz-container loading-container">
            <div className="spinner"></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                <p>Loading student scores...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="attend-quiz-container">
            <h2 style={{ color: 'var(--error)' }}>Error</h2>
            <p>{error}</p>
            <button className="nav-btn" onClick={() => navigate('/dashboard')} style={{ marginTop: '1rem' }}>
                Go Back
            </button>
        </div>
    );

    return (
        <div className="attend-quiz-container" style={{ maxWidth: '1000px' }}>
            <div className="quiz-header" style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'var(--primary-gradient)', padding: '0.8rem', borderRadius: '12px' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>
                    </div>
                    <div>
                        <h1 style={{ margin: 0 }}>Submissions: {data.quizTitle}</h1>
                        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Found {data.submissions.length} total attempts</p>
                    </div>
                </div>
                <button className="nav-btn" style={{ padding: '0.6rem 1.2rem', whiteSpace: 'nowrap' }} onClick={() => navigate('/dashboard')}>
                    Back to Dashboard
                </button>
            </div>

            {data.submissions.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--text-muted)', borderRadius: '24px' }}>
                    <div style={{ marginBottom: '1.2rem', display: 'flex', justifyContent: 'center' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v11z"></path></svg>
                    </div>
                    <p style={{ fontSize: '1.2rem' }}>No students have taken this quiz yet.</p>
                </div>
            ) : (
                <div style={{ overflowX: 'auto', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-main)' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255, 255, 255, 0.05)', textAlign: 'left' }}>
                                <th style={{ padding: '1.2rem', color: 'var(--primary)' }}>Student Name</th>
                                <th style={{ padding: '1.2rem', color: 'var(--primary)' }}>Email</th>
                                <th style={{ padding: '1.2rem', color: 'var(--primary)' }}>Score</th>
                                <th style={{ padding: '1.2rem', color: 'var(--primary)' }}>Submitted At</th>
                                <th style={{ padding: '1.2rem', textAlign: 'right', color: 'var(--primary)' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.submissions.map((sub, idx) => (
                                <tr key={sub._id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.2s', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                                    <td style={{ padding: '1.2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                            {sub.studentId?.name || 'Unknown User'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.2rem', color: 'var(--text-muted)' }}>{sub.studentId?.email || 'N/A'}</td>
                                    <td style={{ padding: '1.2rem' }}>
                                        <span style={{ 
                                            fontWeight: 'bold', 
                                            color: sub.score / sub.totalPoints >= 0.5 ? 'var(--secondary)' : 'var(--error)',
                                            background: sub.score / sub.totalPoints >= 0.5 ? 'rgba(34, 211, 238, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                            padding: '0.4rem 1rem',
                                            borderRadius: '50px',
                                            fontSize: '0.9rem'
                                        }}>
                                            {sub.score} / {sub.totalPoints}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.2rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        {new Date(sub.completedAt).toLocaleString()}
                                    </td>
                                    <td style={{ padding: '1.2rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
                                            <button 
                                                className="nav-btn" 
                                                style={{ fontSize: '0.8rem', padding: '0.4rem 1rem', borderRadius: '8px' }}
                                                onClick={() => alert(`Detailed analysis for ${sub.studentId?.name} - Feature coming soon!`)}
                                            >
                                                Details
                                            </button>
                                            <button 
                                                className="nav-btn" 
                                                style={{ fontSize: '0.8rem', padding: '0.4rem 1rem', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px' }}
                                                onClick={() => handleDelete(sub._id)}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default QuizSubmissions;
