import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CreateQuiz.css'; // Reusing some styles

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const ManageClassroom = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    const isInstructor = user?.role === 'instructor';

    const [classrooms, setClassrooms] = useState([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchClassrooms = async () => {
            try {
                const res = await axios.get(`${API_URL}/classroom`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setClassrooms(res.data);
            } catch (err) {
                console.error("Error fetching classrooms", err);
            }
        };

        fetchClassrooms();
    }, [token]);

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await axios.post(`${API_URL}/classroom`, { name, description }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClassrooms([...classrooms, res.data]);
            setName('');
            setDescription('');
            setSuccess(`Classroom '${res.data.name}' created with code: ${res.data.joinCode}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create classroom');
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await axios.post(`${API_URL}/classroom/join`, { joinCode }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccess('Joined classroom successfully!');
            // Re-fetch
            const list = await axios.get(`${API_URL}/classroom`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClassrooms(list.data);
            setJoinCode('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to join classroom');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-quiz-container" style={{ width: '95%', maxWidth: '1500px', margin: '2rem auto', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <button 
                    onClick={() => navigate('/dashboard')} 
                    className="nav-btn" 
                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    ← Dashboard
                </button>
                <button 
                    onClick={() => navigate('/profile')} 
                    className="nav-btn" 
                    style={{ background: 'rgba(34, 211, 238, 0.15)', border: '1px solid rgba(34, 211, 238, 0.3)', color: 'white', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '50px' }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    <span style={{ fontWeight: '500' }}>{user?.name}</span>
                </button>
            </div>

            <h1 className="section-title" style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                {isInstructor ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>
                )}
                {isInstructor ? 'Manage Classrooms' : 'My Classrooms'}
            </h1>
            
            {error && <div style={{ color: 'var(--error)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
            {success && <div style={{ color: 'var(--success)', marginBottom: '1rem', textAlign: 'center' }}>{success}</div>}

            {isInstructor ? (
                <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', background: 'rgba(255,255,255,0.03)' }}>
                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Create a New Classroom
                    </h2>
                    <form onSubmit={handleCreate}>
                        <div className="form-group">
                            <label className="form-label">Class Name</label>
                            <input 
                                type="text" 
                                className="form-input" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                placeholder="e.g. Physics Section A"
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea 
                                className="form-textarea" 
                                value={description} 
                                onChange={(e) => setDescription(e.target.value)} 
                                placeholder="e.g. Advanced dynamics and mechanics"
                                rows="2"
                            />
                        </div>
                        <button type="submit" className="submit-btn" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}>
                            {loading ? 'Creating...' : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                                    Create Classroom
                                </>
                            )}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', background: 'rgba(255,255,255,0.03)' }}>
                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
                        Join a Classroom
                    </h2>
                    <form onSubmit={handleJoin} style={{ display: 'flex', gap: '1rem' }}>
                        <input 
                            type="text" 
                            className="form-input" 
                            value={joinCode} 
                            onChange={(e) => setJoinCode(e.target.value.toUpperCase())} 
                            placeholder="Enter 6-digit code"
                            required 
                        />
                        <button type="submit" className="submit-btn" style={{ flex: '0 0 150px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }} disabled={loading}>
                            {loading ? 'Joining...' : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                                    Join
                                </>
                            )}
                        </button>
                    </form>
                </div>
            )}

            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.4rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                {isInstructor ? 'Your Classrooms' : 'Joined Classrooms'}
            </h2>

            {classrooms.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                    {isInstructor ? "You haven't created any classrooms yet." : "You haven't joined any classrooms yet."}
                </p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
                    {classrooms.map(c => (
                        <div 
                            key={c._id} 
                            className="question-card" 
                            style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', padding: '1.5rem', transition: 'all 0.3s ease' }} 
                            onClick={() => navigate(`/classroom/${c._id}`)}
                            title="Click to view full classroom details"
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flex: 1 }}>
                                <div>
                                    <h3 style={{ fontSize: '1.3rem', marginBottom: '0.4rem', color: 'var(--primary)' }}>{c.name}</h3>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{c.description || 'No description'}</p>
                                    {!isInstructor && (
                                        <p style={{ fontSize: '0.85rem', color: 'var(--secondary)', marginTop: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                            {c.instructorId?.name}
                                        </p>
                                    )}
                                </div>
                                {isInstructor && (
                                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginLeft: '1rem' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Join Code</div>
                                        <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'white', letterSpacing: '2px', background: 'var(--primary-gradient)', padding: '0.3rem 0.8rem', borderRadius: '8px', marginTop: '0.3rem' }}>{c.joinCode}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--secondary)', marginTop: '0.8rem', fontWeight: '600', padding: '0.3rem 0.8rem', background: 'rgba(34, 211, 238, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                            {c.students.length} Student(s)
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManageClassroom;
