import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BsSpotify } from 'react-icons/bs'; // Import the icon for the logo
import './LoginPage.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      localStorage.setItem('authToken', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const googleAuthUrl = 'http://localhost:5000/api/auth/google';

  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <div className="login-logo">
          <BsSpotify size={48} />
          <h1>Moodify</h1>
        </div>
        
        {error && <p className="error-message">{error}</p>}

        <form onSubmit={onSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={onChange}
              required
              placeholder="you@example.com"
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={onChange} // Corrected placement
              minLength="6"
              required
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging In...' : 'Log In'}
          </button>
        </form>

        <div className="separator">OR</div>

        <a href={googleAuthUrl} className="google-button">
          <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google logo" />
          Continue with Google
        </a>
        
        <p className="signup-link">
          Don't have an account? <Link to="/register">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;