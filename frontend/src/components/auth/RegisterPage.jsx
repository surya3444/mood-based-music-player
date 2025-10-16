import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BsSpotify } from 'react-icons/bs'; // Import the icon for the logo
import './LoginPage.css'; // Reusing the login page's CSS

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { name, email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', {
        name,
        email,
        password,
      });

      setMessage(res.data.msg);
      setTimeout(() => {
        navigate('/verify-otp', { state: { email: formData.email } });
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed. Please try again.');
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
        {message && <p className="status-message">{message}</p>}

        <form onSubmit={onSubmit}>
          <div className="input-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={onChange}
              required
              placeholder="Your Name"
            />
          </div>
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
              onChange={onChange}
              minLength="6"
              required
              placeholder="At least 6 characters"
            />
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Registering...' : 'Sign Up'}
          </button>
        </form>

        <div className="separator">OR</div>

        <a href={googleAuthUrl} className="google-button">
          <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google logo" />
          Continue with Google
        </a>
        
        <p className="signup-link">
          Already have an account? <Link to="/login">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;