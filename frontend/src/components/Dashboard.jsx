import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './CreateQuiz.css';

const API_URL = 'http://localhost:5000/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  const isInstructor = user?.role === 'instructor';

  const [quizzes, setQuizzes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tabs: 'home' | 'quizzes' | 'completed' (for student)
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [quizRes, statsRes] = await Promise.all([
          axios.get(`${API_URL}/quiz`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/user/dashboard-stats`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setQuizzes(quizRes.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error("Error fetching data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm("Are you sure you want to delete this quiz? This will also remove all student scores for this quiz.")) return;
    try {
      await axios.delete(`${API_URL}/quiz/${quizId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuizzes(quizzes.filter(q => q._id !== quizId));
    } catch (err) {
      console.error("Error deleting quiz", err);
      alert("Failed to delete quiz.");
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: "0", borderRadius: "24px", width: "95%", maxWidth: "1500px", margin: "2rem auto", overflow: 'hidden' }}>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2rem 2.5rem', background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--glass-border)' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: "2.2rem", marginBottom: "0.4rem" }}>
            Welcome, {user?.name || 'User'}!
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1rem" }}>
            Active as a <strong>{user?.role}</strong>.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <Link to="/profile">
            <button className="login-button" style={{ width: "auto", padding: "0.6rem 1.4rem", background: "rgba(255, 255, 255, 0.05)", boxShadow: "none", fontSize: '0.9rem', color: 'var(--text-main)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                Profile
              </div>
            </button>
          </Link>
          <button
            onClick={handleLogout}
            className="submit-btn"
            style={{ width: "auto", padding: "0.6rem 1.4rem", fontSize: '0.9rem', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', boxShadow: 'none' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              Logout
            </div>
          </button>
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', padding: '0 2.5rem', borderBottom: '1px solid var(--glass-border)', background: 'rgba(15, 23, 42, 0.3)', overflowX: 'auto' }}>
        <button
          onClick={() => setActiveTab('home')}
          style={{ padding: '1.2rem 2rem', background: 'none', border: 'none', borderBottom: activeTab === 'home' ? '3px solid var(--primary)' : '3px solid transparent', color: activeTab === 'home' ? 'var(--primary)' : 'var(--text-muted)', fontSize: '1.05rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            Home
          </div>
        </button>
        <button
          onClick={() => setActiveTab('quizzes')}
          style={{ padding: '1.2rem 2rem', background: 'none', border: 'none', borderBottom: activeTab === 'quizzes' ? '3px solid var(--primary)' : '3px solid transparent', color: activeTab === 'quizzes' ? 'var(--primary)' : 'var(--text-muted)', fontSize: '1.05rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            {isInstructor ? 'Quizzes' : 'Available Quizzes'}
          </div>
        </button>
        {!isInstructor && (
          <button
            onClick={() => setActiveTab('completed')}
            style={{ padding: '1.2rem 2rem', background: 'none', border: 'none', borderBottom: activeTab === 'completed' ? '3px solid var(--primary)' : '3px solid transparent', color: activeTab === 'completed' ? 'var(--primary)' : 'var(--text-muted)', fontSize: '1.05rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Completed Quizzes
            </div>
          </button>
        )}
        <button
          onClick={() => navigate('/manage-classroom')}
          style={{ padding: '1.2rem 2rem', background: 'none', border: 'none', borderBottom: '3px solid transparent', color: 'var(--text-muted)', fontSize: '1.05rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path></svg>
            Classrooms
          </div>
        </button>
      </div>

      <div style={{ padding: '2.5rem' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner"></div></div>
        ) : activeTab === 'home' ? (

          /* HOME TAB */
          <div className="animate-fade-in">

            {/* DASHBOARD STATS */}
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', color: 'var(--text-main)' }}>Overview Analytics</h2>
            <div style={{ display: 'grid', gridTemplateColumns: isInstructor ? '1fr 1fr' : '1fr 1fr 1fr 1fr', gap: '1.5rem', marginBottom: '3rem' }}>
              {isInstructor && stats ? (
                <>
                  <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', borderRadius: '20px' }}>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.totalQuizzesCreated || 0}</div>
                    <div style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '1.1rem' }}>Total Quizzes Created</div>
                  </div>
                  <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', borderRadius: '20px' }}>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--secondary)' }}>{stats.totalStudentsHandled || 0}</div>
                    <div style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '1.1rem' }}>Students Handled</div>
                  </div>
                </>
              ) : stats ? (
                <>
                  <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', borderRadius: '20px' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.totalQuizAttended || 0}</div>
                    <div style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.9rem' }}>Quizzes Attended</div>
                  </div>
                  <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', borderRadius: '20px' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--secondary)' }}>{stats.totalCorrectAnswers || 0}</div>
                    <div style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.9rem' }}>Points Earned</div>
                  </div>
                  <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', borderRadius: '20px' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#4ade80' }}>{stats.accuracy || 0}%</div>
                    <div style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.9rem' }}>Overall Accuracy</div>
                  </div>
                  <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', borderRadius: '20px' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f87171' }}>{stats.totalClassrooms || 0}</div>
                    <div style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.9rem' }}>Joined Classrooms</div>
                  </div>
                </>
              ) : null}
            </div>

            {/* QUICK ACTIONS */}
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', color: 'var(--text-main)' }}>Quick Actions</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              {isInstructor ? (
                <>
                  <Link to="/create-quiz" style={{ textDecoration: 'none' }}>
                    <div className="glass-panel quick-action-card qa-primary" style={{ padding: "2rem", borderRadius: "20px", cursor: 'pointer', textAlign: 'center', background: 'rgba(192, 132, 252, 0.08)', border: '1px solid rgba(192, 132, 252, 0.3)' }}>
                      <div style={{ marginBottom: '1rem', color: 'var(--primary)' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </div>
                      <h3 style={{ color: 'var(--primary)', fontSize: '1.4rem' }}>Create Quiz</h3>
                      <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", marginTop: '0.5rem' }}>Draft new questions and set limits.</p>
                    </div>
                  </Link>
                  <Link to="/manage-classroom" style={{ textDecoration: 'none' }}>
                    <div className="glass-panel quick-action-card qa-secondary" style={{ padding: "2rem", borderRadius: "20px", cursor: 'pointer', textAlign: 'center', background: 'rgba(34, 211, 238, 0.08)', border: '1px solid rgba(34, 211, 238, 0.3)' }}>
                      <div style={{ marginBottom: '1rem', color: 'var(--secondary)' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                      </div>
                      <h3 style={{ color: 'var(--secondary)', fontSize: '1.4rem' }}>Manage Classrooms</h3>
                      <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", marginTop: '0.5rem' }}>Create groups and manage student access.</p>
                    </div>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/manage-classroom" style={{ textDecoration: 'none' }}>
                    <div className="glass-panel quick-action-card qa-secondary" style={{ padding: "2rem", borderRadius: "20px", cursor: 'pointer', textAlign: 'center', background: 'rgba(34, 211, 238, 0.08)', border: '1px solid rgba(34, 211, 238, 0.3)' }}>
                      <div style={{ marginBottom: '1rem', color: 'var(--secondary)' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                      </div>
                      <h3 style={{ color: 'var(--secondary)', fontSize: '1.4rem' }}>Join Classroom</h3>
                      <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", marginTop: '0.5rem' }}>Enter a code to join an instructor's class.</p>
                    </div>
                  </Link>
                  <div className="glass-panel quick-action-card qa-primary" style={{ padding: "2rem", borderRadius: "20px", cursor: 'pointer', textAlign: 'center', background: 'rgba(192, 132, 252, 0.08)', border: '1px solid rgba(192, 132, 252, 0.3)' }} onClick={() => setActiveTab('completed')}>
                    <div style={{ marginBottom: '1rem', color: 'var(--primary)' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                    </div>
                    <h3 style={{ color: 'var(--primary)', fontSize: '1.4rem' }}>View Scores</h3>
                    <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", marginTop: '0.5rem' }}>Check your past quiz performance.</p>
                  </div>
                </>
              )}
            </div>
          </div>

        ) : (

          /* QUIZZES TAB */
          <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.6rem', color: 'var(--text-main)', margin: 0 }}>
                {isInstructor ? 'Your Created Quizzes' : 'Available Quizzes'}
              </h2>
              {isInstructor && (
                <button onClick={() => navigate('/create-quiz')} className="submit-btn" style={{ width: 'auto', padding: '0.6rem 1.2rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  New Quiz
                </button>
              )}
            </div>

            {/* Handle Quizzes and Completed Quizzes tabs */}
            {(activeTab === 'quizzes' || activeTab === 'completed') && (
              (() => {
                let displayQuizzes = quizzes;
                if (!isInstructor && activeTab === 'quizzes') {
                  displayQuizzes = quizzes.filter(q => !q.isSubmitted);
                } else if (!isInstructor && activeTab === 'completed') {
                  displayQuizzes = quizzes.filter(q => q.isSubmitted);
                }

                return displayQuizzes.length === 0 ? (
                  <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem', borderRadius: '20px' }}>
                    <div style={{ color: 'var(--text-muted)', marginBottom: '1.2rem', display: 'flex', justifyContent: 'center' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v11z"></path></svg>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                      {isInstructor ? "You haven't created any quizzes yet. Create your first one!" : (activeTab === 'completed' ? "You haven't completed any quizzes yet." : "No available quizzes right now. Check back later.")}
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
                    {displayQuizzes.map(q => (
                      <div key={q._id} className="question-card" style={{ display: 'flex', flexDirection: 'column', opacity: (q.deadline && new Date() > new Date(q.deadline) && !q.isSubmitted) ? 0.7 : 1, padding: '1.5rem' }}>
                        <div style={{ flex: 1, marginBottom: '1.5rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.3rem', color: 'var(--primary)' }}>{q.title}</h3>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              {!q.isPublic && <span style={{ fontSize: '0.7rem', fontWeight: 'bold', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '0.3rem 0.6rem', borderRadius: '12px' }}>RESTRICTED</span>}
                              {isInstructor && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDeleteQuiz(q._id); }}
                                  style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', transition: 'all 0.2s', padding: 0 }}
                                  onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                                  onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.transform = 'scale(1)'; }}
                                  title="Delete Quiz"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
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
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.6rem', borderRadius: '10px' }}>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{isInstructor ? 'VISIBILITY' : 'INSTRUCTOR'}</div>
                              <div style={{ fontSize: '0.95rem', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                {isInstructor ? (
                                  <>
                                    {q.isPublic ? (
                                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                                    ) : (
                                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                    )}
                                    {q.isPublic ? 'Public' : 'Private'}
                                  </>
                                ) : (
                                  <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                    {q.instructorId?.name}
                                  </>
                                )}
                              </div>
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
                              <button
                                onClick={() => navigate(`/edit-quiz/${q._id}`)}
                                className="submit-btn"
                                style={{ flex: 1, padding: '0.6rem', fontSize: '0.85rem', background: 'var(--primary)' }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => navigate(`/quiz/${q._id}/submissions`)}
                                className="submit-btn"
                                style={{ flex: 1, padding: '0.6rem', fontSize: '0.85rem', background: 'var(--secondary-gradient)' }}
                              >
                                Scores
                              </button>
                            </>
                          ) : q.isSubmitted ? (
                            <button
                              onClick={() => navigate(`/quiz/${q._id}/result`)}
                              className="submit-btn"
                              style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem', background: 'var(--secondary-gradient)' }}
                            >
                              VIEW RESULTS
                            </button>
                          ) : (q.deadline && new Date() > new Date(q.deadline)) ? (
                            <div style={{ width: '100%', textAlign: 'center', color: 'var(--error)', fontWeight: 'bold', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px' }}>
                              EXPIRED
                            </div>
                          ) : (
                            <button
                              onClick={() => navigate(`/attend-quiz/${q._id}`)}
                              className="submit-btn"
                              style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem' }}
                            >
                              START QUIZ
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
