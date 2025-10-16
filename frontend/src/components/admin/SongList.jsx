import React from 'react';
import axios from 'axios';
import { FaTrash } from 'react-icons/fa';

const SongList = ({ songs, onSongDeleted }) => {
  const handleDelete = async (songId) => {
    // Confirm before deleting
    if (window.confirm('Are you sure you want to delete this song? This will also remove it from all playlists.')) {
      try {
        const token = localStorage.getItem('authToken');
        const config = { headers: { 'x-auth-token': token } };
        await axios.delete(`http://localhost:5000/api/admin/songs/${songId}`, config);
        onSongDeleted(); // Trigger a refresh of the song list in the parent
      } catch (err) {
        console.error('Failed to delete song', err);
        alert('Could not delete the song.');
      }
    }
  };

  return (
    <div className="item-list">
      <h3>Manage Songs ({songs.length})</h3>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Artist</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {songs.map(song => (
            <tr key={song._id}>
              <td>{song.title}</td>
              <td>{song.artist}</td>
              <td>
                <button className="delete-button" onClick={() => handleDelete(song._id)}>
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

export default SongList;