import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CreateQuiz.css';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const ClassroomView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    const isInstructor = user?.role === 'instructor';

    const [classroom, setClassroom] = useState(null);
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [saveLoading, setSaveLoading] = useState(false);

    // activeTab: 'details', 'quizzes', 'students'
    const [activeTab, setActiveTab] = useState('quizzes');

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchClassroomDetails = async () => {
            try {
                const res = await axios.get(`${API_URL}/classroom/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setClassroom(res.data.classroom);
                setQuizzes(res.data.quizzes || []);
                setEditName(res.data.classroom.name);
                setEditDescription(res.data.classroom.description);
            } catch (err) {
                console.error("Error fetching classroom", err);
                setError(err.response?.data?.message || 'Failed to load classroom');
            } finally {
                setLoading(false);
            }
        };

        fetchClassroomDetails();
    }, [id, token, navigate]);

    const handleUpdate = async () => {
        setSaveLoading(true);
        try {
            const res = await axios.put(`${API_URL}/classroom/${id}`, {
                name: editName,
                description: editDescription
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClassroom(res.data.classroom);
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            alert("Failed to update classroom.");
        } finally {
            setSaveLoading(false);
        }
    };

    const handleDeleteClassroom = async () => {
        if (!window.confirm("Are you sure you want to delete this classroom? All its quizzes and student scores will be permanently deleted.")) return;
        try {
            await axios.delete(`${API_URL}/classroom/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            alert("Failed to delete classroom.");
        }
    };

    const handleLeaveClassroom = async () => {
        if (!window.confirm("Are you sure you want to leave this classroom?")) return;
        try {
            await axios.delete(`${API_URL}/classroom/${id}/leave`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            alert("Failed to leave classroom.");
        }
    };

    const handleRemoveStudent = async (studentId) => {
        if (!window.confirm("Remove this student from the classroom?")) return;
        try {
            await axios.delete(`${API_URL}/classroom/${id}/students/${studentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClassroom({
                ...classroom,
                students: classroom.students.filter(s => s._id !== studentId)
            });
        } catch (err) {
            console.error(err);
            alert("Failed to remove student.");
        }
    };

    const handleDeleteQuiz = async (quizId) => {
        if (!window.confirm("Are you sure you want to delete this quiz?")) return;
        try {
            await axios.delete(`${API_URL}/quiz/${quizId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQuizzes(quizzes.filter(q => q._id !== quizId));
        } catch (err) {
            console.error(err);
            alert("Failed to delete quiz.");
        }
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}><div className="spinner"></div></div>;
    if (error) return <div style={{ color: 'var(--error)', textAlign: 'center', padding: '2rem' }}>{error}</div>;
    if (!classroom) return null;

    return (
        <div className="create-quiz-container animate-fade-in" style={{ width: '95%', maxWidth: '1500px', margin: '2rem auto', padding: '0', overflow: 'hidden' }}>
            {/* Header Banner */}
            <div style={{ background: 'linear-gradient(135deg, #3730A3, #7E22CE)', padding: '2.5rem', position: 'relative', borderRadius: '16px 16px 0 0' }}>
                <button onClick={() => navigate(-1)} className="nav-btn" style={{ position: 'absolute', top: '1.2rem', left: '1.5rem', background: 'rgba(0,0,0,0.2)', border: 'none', color: 'white', padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '12px' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    Back
                </button>
                <button
                    onClick={() => navigate('/profile')}
                    className="nav-btn"
                    style={{ position: 'absolute', top: '1.2rem', right: '1.5rem', background: 'rgba(34, 211, 238, 0.2)', border: '1px solid rgba(34, 211, 238, 0.4)', color: 'white', padding: '0.5rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.6rem', borderRadius: '50px' }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    <span style={{ fontWeight: '500' }}>{user?.name}</span>
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '3rem' }}>
                    <div style={{ flex: 1 }}>
                        {isEditing ? (
                            <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '1.5rem', borderRadius: '12px', marginTop: '1rem' }}>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    className="form-input"
                                    style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: 'white', background: 'transparent', borderBottom: '2px solid var(--primary)' }}
                                />
                                <textarea
                                    value={editDescription}
                                    onChange={e => setEditDescription(e.target.value)}
                                    className="form-input"
                                    style={{ color: 'var(--text-main)', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', resize: 'vertical' }}
                                    rows="2"
                                />
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <button onClick={handleUpdate} disabled={saveLoading} className="submit-btn" style={{ width: 'auto', padding: '0.4rem 1.2rem', background: 'var(--primary)' }}>Save</button>
                                    <button onClick={() => setIsEditing(false)} className="nav-btn" style={{ width: 'auto', padding: '0.4rem 1.2rem' }}>Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <h1 style={{ fontSize: '2.5rem', color: 'white', marginBottom: '0.5rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{classroom.name}</h1>
                                <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.9)', maxWidth: '800px' }}>{classroom.description}</p>
                            </>
                        )}
                    </div>

                    <div style={{ textAlign: 'right', background: 'rgba(0,0,0,0.2)', padding: '1rem 1.5rem', borderRadius: '12px', marginLeft: '2rem' }}>
                        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Instructor</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white', marginBottom: isInstructor ? '1rem' : '0', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            {classroom.instructorId.name}
                        </div>
                        {isInstructor && (
                            <>
                                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Join Code</div>
                                <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'white', letterSpacing: '4px' }}>{classroom.joinCode}</div>
                                {!isEditing && (
                                    <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1rem' }}>
                                        <button onClick={() => setIsEditing(true)} className="nav-btn" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '0.5rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '10px' }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                            Edit Details
                                        </button>
                                        <button onClick={handleDeleteClassroom} className="nav-btn" style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ffb3b3', padding: '0.5rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '10px' }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                            Delete Class
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                        {!isInstructor && (
                            <button onClick={handleLeaveClassroom} className="nav-btn" style={{ marginTop: '1rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ffb3b3', padding: '0.5rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '10px' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                                Leave Classroom
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', padding: '0 2.5rem', background: 'rgba(15, 23, 42, 0.4)', borderBottom: '1px solid var(--glass-border)' }}>
                <button
                    onClick={() => setActiveTab('quizzes')}
                    style={{ padding: '1.2rem 2rem', background: 'none', border: 'none', borderBottom: activeTab === 'quizzes' ? '3px solid var(--primary)' : '3px solid transparent', color: activeTab === 'quizzes' ? 'var(--primary)' : 'var(--text-muted)', fontSize: '1.05rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        Quizzes ({quizzes.length})
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('students')}
                    style={{ padding: '1.2rem 2rem', background: 'none', border: 'none', borderBottom: activeTab === 'students' ? '3px solid var(--secondary)' : '3px solid transparent', color: activeTab === 'students' ? 'var(--secondary)' : 'var(--text-muted)', fontSize: '1.05rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        Enrolled Students ({classroom.students.length})
                    </div>
                </button>
            </div>

            {/* Main Content Area */}
            <div style={{ padding: '2.5rem' }}>
                {activeTab === 'quizzes' && (
                    <div className="animate-fade-in">
                        {quizzes.length === 0 ? (
                            <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem', borderRadius: '20px' }}>
                                <div style={{ color: 'var(--text-muted)', marginBottom: '1.2rem', display: 'flex', justifyContent: 'center' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v11z"></path></svg>
                                </div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>No quizzes posted in this classroom yet.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
                                {quizzes.map(q => (
                                    <div key={q._id} className="question-card" style={{ display: 'flex', flexDirection: 'column', opacity: (q.deadline && new Date() > new Date(q.deadline) && !q.isSubmitted) ? 0.7 : 1, padding: '1.5rem' }}>
                                        <div style={{ flex: 1, marginBottom: '1.5rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.3rem', color: 'var(--primary)' }}>{q.title}</h3>
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    {!q.isPublic && <span style={{ fontSize: '0.7rem', fontWeight: 'bold', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '0.3rem 0.6rem', borderRadius: '12px' }}>RESTRICTED</span>}
                                                    {isInstructor && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteQuiz(q._id); }}
                                                            style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '8px', padding: 0 }}
                                                            title="Delete Quiz"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{q.description}</p>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.6rem', borderRadius: '10px' }}>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DURATION</div>
                                                    <div style={{ fontSize: '0.95rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                                        {q.timer} mins
                                                    </div>
                                                </div>
                                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.6rem', borderRadius: '10px', textAlign: 'center' }}>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>QUESTIONS</div>
                                                    <div style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>{q.questions?.length || 0}</div>
                                                </div>
                                            </div>

                                            {q.deadline && (
                                                <div style={{ marginTop: '0.8rem', fontSize: '0.85rem', color: (new Date() > new Date(q.deadline)) ? 'var(--error)' : 'var(--warning-light, #fbbf24)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                                    Deadline: {new Date(q.deadline).toLocaleString()}
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '1.2rem' }}>
                                            {isInstructor ? (
                                                <>
                                                    <button onClick={() => navigate(`/edit-quiz/${q._id}`)} className="submit-btn" style={{ flex: 1, padding: '0.6rem', fontSize: '0.85rem', background: 'var(--primary)' }}>Edit</button>
                                                    <button onClick={() => navigate(`/quiz/${q._id}/submissions`)} className="submit-btn" style={{ flex: 1, padding: '0.6rem', fontSize: '0.85rem', background: 'var(--secondary-gradient)' }}>Scores</button>
                                                </>
                                            ) : q.isSubmitted ? (
                                                <button onClick={() => navigate(`/quiz/${q._id}/result`)} className="submit-btn" style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem', background: 'var(--secondary-gradient)' }}>VIEW RESULTS</button>
                                            ) : (q.deadline && new Date() > new Date(q.deadline)) ? (
                                                <div style={{ width: '100%', textAlign: 'center', color: 'var(--error)', fontWeight: 'bold', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px' }}>EXPIRED</div>
                                            ) : (
                                                <button onClick={() => navigate(`/attend-quiz/${q._id}`)} className="submit-btn" style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem' }}>START QUIZ</button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'students' && (
                    <div className="animate-fade-in glass-panel" style={{ padding: '2rem', borderRadius: '16px' }}>
                        {classroom.students.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                                <div style={{ color: 'var(--text-muted)', marginBottom: '1.2rem', display: 'flex', justifyContent: 'center' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                </div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>No students have joined this classroom yet.</p>
                                {isInstructor && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Share the join code <b style={{ color: 'var(--secondary)' }}>{classroom.joinCode}</b> with them!</p>}
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ background: 'rgba(15, 23, 42, 0.5)' }}>
                                    <tr style={{ textAlign: 'left' }}>
                                        <th style={{ padding: '1.2rem', borderBottom: '2px solid var(--glass-border)', color: 'var(--primary)' }}>Student Name</th>
                                        <th style={{ padding: '1.2rem', borderBottom: '2px solid var(--glass-border)', color: 'var(--primary)' }}>Email</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {classroom.students.map(s => (
                                        <tr key={s._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                                            <td style={{ padding: '1.2rem', fontSize: '1.05rem', color: 'var(--text-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                                    {s.name}
                                                </div>
                                                {isInstructor && (
                                                    <button
                                                        onClick={() => handleRemoveStudent(s._id)}
                                                        className="nav-btn"
                                                        style={{
                                                            background: 'rgba(239, 68, 68, 0.1)',
                                                            border: '1px solid rgba(239, 68, 68, 0.2)',
                                                            color: '#ef4444',
                                                            padding: '0.4rem 0.8rem',
                                                            fontSize: '0.8rem',
                                                            borderRadius: '8px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.4rem'
                                                        }}
                                                        title="Remove student from classroom"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="18" y1="8" x2="23" y2="13"></line><line x1="23" y1="8" x2="18" y2="13"></line></svg>
                                                        Remove
                                                    </button>
                                                )}
                                            </td>
                                            <td style={{ padding: '1.2rem', color: 'var(--text-muted)' }}>{s.email}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClassroomView;
