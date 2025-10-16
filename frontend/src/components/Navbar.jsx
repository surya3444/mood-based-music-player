import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { BsSpotify } from 'react-icons/bs'; // Spotify Icon
import './Navbar.css';

const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="navbar">
      <Link to="/dashboard" className="nav-logo-link">
        <BsSpotify color="#1db954" />
        <span>Moodify</span>
      </Link>
      <div className="nav-links">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Mood</NavLink>
        <NavLink to="/search" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Search</NavLink>
        <NavLink to="/liked" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Liked Songs</NavLink>
      </div>
      <div className="nav-user">
        {user && <span className="user-name">{user.name}</span>}
        <button onClick={onLogout} className="logout-button">Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;