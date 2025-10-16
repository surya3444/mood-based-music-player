import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Import Layout and Auth Components
import MainLayout from './components/MainLayout';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import VerifyOTPPage from './components/auth/VerifyOTPPage';
import PrivateRoute from './components/routing/PrivateRoute';
import AdminRoute from './components/routing/AdminRoute'; // Import the AdminRoute
import TokenHandler from './components/auth/TokenHandler';

// Import Main App Pages
import Dashboard from './components/Dashboard';
import SearchPage from './components/pages/SearchPage';
import LikedSongsPage from './components/pages/LikedSongsPage';

// Import Admin Page
import AdminDashboard from './components/admin/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* --- Public Authentication Routes --- */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<VerifyOTPPage />} />
        
        {/* --- Route to handle initial load and Google OAuth token --- */}
        <Route path="/" element={<TokenHandler />} />

        {/* --- Protected User Routes (with MainLayout) --- */}
        <Route 
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/liked" element={<LikedSongsPage />} />
        </Route>

        {/* --- Protected Admin Route --- */}
        {/* This route is separate and does not use the MainLayout */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;