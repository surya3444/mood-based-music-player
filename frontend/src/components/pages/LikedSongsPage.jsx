import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import '../Dashboard.css';

const LikedSongsPage = () => {
  const { handleSongSelect } = useOutletContext();
  const [likedSongs, setLikedSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikedSongs = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const config = { headers: { 'x-auth-token': token } };
        const res = await axios.get('http://localhost:5000/api/songs/liked', config);
        setLikedSongs(res.data);
      } catch (err) {
        console.error("Failed to fetch liked songs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLikedSongs();
  }, []);

  if (loading) {
    return <p className="status-message">Loading your liked songs...</p>;
  }

  return (
    <div className="page-container">
      <h1>Your Liked Songs</h1>
      {likedSongs.length > 0 ? (
        <div className="songs-grid">
          {likedSongs.map(song => (
            <div key={song._id} className="song-card" onClick={() => handleSongSelect(song, likedSongs)}>
              <img src={song.coverPhotoUrl} alt={song.title} className="song-cover" />
              <p className="song-title">{song.title}</p>
              <p className="song-artist">{song.artist}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="status-message">You haven't liked any songs yet.</p>
      )}
    </div>
  );
};

export default LikedSongsPage;