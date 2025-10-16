import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash } from 'react-icons/fa';

const PlaylistList = () => {
  const [playlists, setPlaylists] = useState([]);

  const fetchPlaylists = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const config = { headers: { 'x-auth-token': token } };
      // We need a new backend route to get all playlists for the admin
      const res = await axios.get('http://localhost:5000/api/admin/playlists', config);
      setPlaylists(res.data);
    } catch (err) {
      console.error('Failed to fetch playlists', err);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const handleDelete = async (playlistId) => {
    if (window.confirm('Are you sure you want to delete this playlist?')) {
      try {
        const token = localStorage.getItem('authToken');
        const config = { headers: { 'x-auth-token': token } };
        await axios.delete(`http://localhost:5000/api/admin/playlists/${playlistId}`, config);
        fetchPlaylists(); // Refresh the list after deletion
      } catch (err) {
        console.error('Failed to delete playlist', err);
        alert('Could not delete the playlist.');
      }
    }
  };

  return (
    <div className="item-list">
      <h3>Manage Playlists ({playlists.length})</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Mood</th>
            <th>Songs</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {playlists.map(playlist => (
            <tr key={playlist._id}>
              <td>{playlist.name}</td>
              <td>{playlist.mood}</td>
              <td>{playlist.songs.length}</td>
              <td>
                <button className="delete-button" onClick={() => handleDelete(playlist._id)}>
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlaylistList;