import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiCalendar, FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        const data = await signIn(email, password);
        if (data?.user) {
          // Navigation handled by App.js based on role
          navigate('/redirect');
        }
      } else {
        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        await signUp(email, password, fullName);
        setSuccess('Account created successfully! You can now sign in.');
        setIsLogin(true);
        setPassword('');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setEmail('');
    setPassword('');
    setFullName('');
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-branding">
          <div className="brand-icon">
            <FiCalendar />
          </div>
          <h1>EventSphere</h1>
          <p>Your all-in-one event management platform. Create, discover, and manage events effortlessly.</p>
          <div className="brand-features">
            <div className="feature-item">
              <span className="feature-dot"></span>
              <span>Discover & register for events</span>
            </div>
            <div className="feature-item">
              <span className="feature-dot"></span>
              <span>Create & manage your own events</span>
            </div>
            <div className="feature-item">
              <span className="feature-dot"></span>
              <span>Track registrations in real-time</span>
            </div>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-container">
          <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="login-subtitle">
            {isLogin
              ? 'Sign in to access your dashboard'
              : 'Join EventSphere today'}
          </p>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group">
                <label>Full Name</label>
                <div className="input-with-icon">
                  <FiUser className="input-icon" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Email Address</label>
              <div className="input-with-icon">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-with-icon">
                <FiLock className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <FiEye /> : <FiEyeOff />}
                </button>
              </div>
            </div>



            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner-small"></span>
                  {isLogin ? 'Signing In...' : 'Creating Account...'}
                </span>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <div className="login-toggle">
            <span>
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
            </span>
            <button type="button" className="toggle-link" onClick={toggleMode}>
              {isLogin ? 'Create Account' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
