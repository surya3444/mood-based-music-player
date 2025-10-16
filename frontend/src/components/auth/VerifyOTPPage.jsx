import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './LoginPage.css';

const VerifyOTPPage = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the email from the state passed by the RegisterPage
  const email = location.state?.email;

  // If the user lands on this page without an email (e.g., direct URL), redirect them.
  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);


  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/verify-otp', {
        email,
        otp,
      });
      
      setMessage(res.data.msg); // "Email verified successfully! You can now log in."
      // Redirect to login page after successful verification
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.msg || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <h2 className="login-title">Verify Your Email</h2>
        <p className="login-subtitle">An OTP has been sent to <strong>{email}</strong></p>
        
        {error && <p className="error-message">{error}</p>}
        {message && <p className="status-message">{message}</p>}

        <form onSubmit={onSubmit}>
          <div className="input-group">
            <label htmlFor="otp">Enter OTP</label>
            <input
              type="text"
              id="otp"
              name="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              placeholder="6-digit code"
            />
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTPPage;