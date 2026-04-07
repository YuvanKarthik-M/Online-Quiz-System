import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Profile = () => {
  const [userProfile, setUserProfile] = useState({ name: '', email: '', role: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserProfile(res.data);
      } catch (err) {
        setError('Failed to load profile.');
        if (err.response?.status === 401) {
          localStorage.clear();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    setUserProfile({ ...userProfile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    const token = localStorage.getItem('token');

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/user/profile`,
        { name: userProfile.name },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUserProfile(res.data);
      setMessage('Profile updated successfully!');

      // Update local storage user data for the Dashboard
      const localUser = JSON.parse(localStorage.getItem('user'));
      localStorage.setItem('user', JSON.stringify({ ...localUser, name: res.data.name }));
    } catch (err) {
      setError('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="login-wrapper">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="login-wrapper">
      <div className="login-card glass-panel animate-fade-in" style={{ maxWidth: '500px' }}>
        <div className="login-header">
          <h1 className="text-gradient">Your Profile</h1>
          <p className="subtitle">Manage your account information</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {message && <div style={{ padding: '0.8rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#6EE7B7', borderRadius: '12px', fontSize: '0.9rem', textAlign: 'center' }}>{message}</div>}

        <form className="email-login-form" onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
          <div className="input-group">
            <label>Role</label>
            <input
              type="text"
              value={userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)}
              disabled
              style={{ opacity: 0.7 }}
            />
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              value={userProfile.email}
              disabled
              style={{ opacity: 0.7 }}
            />
          </div>

          <div className="input-group">
            <label>Full Name</label>
            <input
              name="name"
              type="text"
              value={userProfile.name}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="login-button" disabled={saving}>
            {saving ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </form>

        <div className="login-footer" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link to="/dashboard" className="signup-link">Back to Dashboard</Link>
          <button
            onClick={handleLogout}
            className="nav-btn"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '0.6rem 1.2rem',
              width: '100%',
              borderRadius: '8px'
            }}
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
