import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  // Check for the auth token in local storage
  const isAuthenticated = localStorage.getItem('authToken');

  // If the user is authenticated, render the children components (e.g., Dashboard).
  // Otherwise, redirect them to the login page.
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;