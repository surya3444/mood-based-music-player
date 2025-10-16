import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import UploadSongForm from './UploadSongForm';
import CreatePlaylistForm from './CreatePlaylistForm';
import SongList from './SongList';
import PlaylistList from './PlaylistList';
import UserActivity from './UserActivity';
import SongAnalytics from './SongAnalytics'; // <-- 1. Import the new component
import './Admin.css';

const AdminDashboard = () => {
  const [allSongs, setAllSongs] = useState([]);

  const fetchAllSongs = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      const config = { headers: { 'x-auth-token': token } };
      const res = await axios.get('http://localhost:5000/api/admin/songs', config);
      setAllSongs(res.data);
    } catch (err) {
      console.error('Failed to load songs.');
    }
  }, []);

  useEffect(() => {
    fetchAllSongs();
  }, [fetchAllSongs]);

  const handleSongUpdate = () => {
    fetchAllSongs();
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Panel</h1>
      <div className="admin-sections">
        <div className="admin-section">
          <h2>Upload New Song</h2>
          <UploadSongForm onSongUploaded={handleSongUpdate} />
        </div>

        <div className="admin-section">
          <h2>Create New Playlist</h2>
          <CreatePlaylistForm allSongs={allSongs} />
        </div>

        {/* --- 2. ADDED: Song Analytics Section --- */}
        <div className="admin-section full-width">
          <SongAnalytics />
        </div>
        {/* -------------------------------------- */}

        <div className="admin-section full-width">
          <SongList songs={allSongs} onSongDeleted={handleSongUpdate} />
        </div>

        <div className="admin-section full-width">
          <PlaylistList />
        </div>
        
        <div className="admin-section full-width">
          <h2>User Activity</h2>
          <UserActivity />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;