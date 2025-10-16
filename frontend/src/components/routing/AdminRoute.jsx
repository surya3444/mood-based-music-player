import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import axios from 'axios';

const AdminRoute = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setLoading(false);
          return;
        }
        const config = { headers: { 'x-auth-token': token } };
        const res = await axios.get('http://localhost:5000/api/auth/user', config);
        
        if (res.data.role === 'admin') {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error('Admin check failed', error);
      } finally {
        setLoading(false);
      }
    };
    checkAdminStatus();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  return isAdmin ? <Outlet /> : <Navigate to="/dashboard" />;
};

export default AdminRoute;