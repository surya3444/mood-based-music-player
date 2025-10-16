import React, { useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';

const TokenHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      localStorage.setItem('authToken', token);
      navigate('/dashboard', { replace: true });
    }
  }, [location, navigate]);

  // If there's no token in the URL, check if user is already logged in
  const existingToken = localStorage.getItem('authToken');
  if (existingToken) {
    return <Navigate to="/dashboard" />;
  }
  
  // Otherwise, default to the login page
  return <Navigate to="/login" />;
};

export default TokenHandler;