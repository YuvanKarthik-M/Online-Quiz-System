import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(location.pathname !== '/signup');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    setIsLogin(location.pathname !== '/signup');
  }, [location.pathname]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleMode = () => {
    const newIsLogin = !isLogin;
    setIsLogin(newIsLogin);
    setError('');
    navigate(newIsLogin ? '/login' : '/signup', { replace: true });
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleLoading(true);
    setError('');
    
    try {
      const { credential } = credentialResponse;
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/google`, {
        credential
      });

      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Authentication failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailLoading(true);
    setError('');

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}${endpoint}`, formData);
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed.');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google Login failed.');
  };

  return (
    <div className="auth-container">
      {/* Left Column (Branding) */}
      <div className="auth-left">
        <div className="auth-brand animate-fade-in">
           <div className="logo-icon pulse-ring glass-panel">
             <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
               <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="url(#paint0_linear)" strokeWidth="2"/>
               <path d="M7 12L10 15L17 8" stroke="url(#paint0_linear)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
               <defs>
                 <linearGradient id="paint0_linear" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                   <stop stopColor="#818CF8"/>
                   <stop offset="1" stopColor="#C084FC"/>
                 </linearGradient>
               </defs>
             </svg>
           </div>
           <h1 className="text-gradient">QuizMaster</h1>
           <p className="auth-subtitle">Elevate your learning experience.</p>
        </div>
      </div>

      {/* Right Column (Form) */}
      <div className="auth-right">
        <div className="login-card" key={isLogin ? 'login' : 'signup'}>
          <div className="login-header">
            <h2 className="text-gradient form-title">{isLogin ? 'Sign In' : 'Sign Up'}</h2>
          </div>

          <div className="auth-methods">
            {error && <div className="error-message animate-fade-in">{error}</div>}
            
            {isLogin && (
              <>
                <div className="google-auth-container">
                  <div style={{ visibility: googleLoading ? 'hidden' : 'visible', width: '100%', display: googleLoading ? 'none' : 'block' }}>
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      useOneTap
                      theme="filled_black"
                      shape="pill"
                      size="large"
                      context="signin"
                      text="continue_with_google"
                      width="100%"
                    />
                  </div>
                  {googleLoading && <div className="loading-spinner"></div>}
                </div>
                
                <div className="divider">
                  <span>OR</span>
                </div>
              </>
            )}

            <form className="email-login-form animate-fade-in" onSubmit={handleSubmit}>
               {!isLogin && (
                  <div className="input-group">
                     <label>Name</label>
                     <input 
                       name="name"
                       type="text" 
                       placeholder="Full Name" 
                       required 
                       onChange={handleChange}
                       value={formData.name}
                     />
                  </div>
               )}

               <div className="input-group">
                  <label>Email</label>
                  <input 
                    name="email"
                    type="email" 
                    placeholder="Email Address" 
                    required 
                    onChange={handleChange}
                    value={formData.email}
                  />
               </div>
               
               <div className="input-group">
                  <label>Password</label>
                  <input 
                    name="password"
                    type="password" 
                    placeholder="Password" 
                    required 
                    onChange={handleChange}
                    value={formData.password}
                  />
               </div>

               {!isLogin && (
                  <div className="input-group">
                     <label>Role</label>
                     <select name="role" onChange={handleChange} className="role-select" value={formData.role}>
                       <option value="student">Student</option>
                       <option value="instructor">Instructor</option>
                     </select>
                  </div>
               )}

               {isLogin && (
                  <div className="forgot-password">
                     <a href="#">Forgot password?</a>
                  </div>
               )}

               <button type="submit" className="login-button" disabled={emailLoading || googleLoading}>
                  {emailLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
               </button>
            </form>
          </div>

          <div className="login-footer">
            <p className="switch-text">
              {isLogin ? "New here? " : "Already user? "}
              <button type="button" className="switch-mode-btn" onClick={toggleMode} disabled={emailLoading || googleLoading}>
                {isLogin ? 'Create Account' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
