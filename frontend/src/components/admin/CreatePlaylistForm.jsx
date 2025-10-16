import React, { useState } from 'react';
import axios from 'axios';
import { MOODS } from '../../constants'; // <-- Import moods

const CreatePlaylistForm = ({ allSongs }) => { // <-- Accept songs as a prop
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [playlistDetails, setPlaylistDetails] = useState({ name: '', description: '', mood: MOODS[0] });
  const [searchTerm, setSearchTerm] = useState(''); // <-- Search term state
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // No longer needs useEffect to fetch songs

  const handleDetailChange = (e) => {
    setPlaylistDetails({ ...playlistDetails, [e.target.name]: e.target.value });
  };

  const handleSongSelect = (songId) => {
    setSelectedSongs(prev => 
      prev.includes(songId) ? prev.filter(id => id !== songId) : [...prev, songId]
    );
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const config = { headers: { 'x-auth-token': token } };
      const body = { ...playlistDetails, songs: selectedSongs };
      const res = await axios.post('http://localhost:5000/api/admin/create-playlist', body, config);
      setMessage(res.data.msg);
      setPlaylistDetails({ name: '', description: '', mood: MOODS[0] });
      setSelectedSongs([]);
      setSearchTerm('');
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to create playlist.');
    } finally {
      setLoading(false);
    }
  };

  // Filter songs based on the search term
  const filteredSongs = allSongs.filter(song => 
    song.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    song.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <form onSubmit={onSubmit} className="playlist-form">
      {message && <p className="status-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
      <input type="text" name="name" value={playlistDetails.name} onChange={handleDetailChange} placeholder="Playlist Name" required />
      <input type="text" name="description" value={playlistDetails.description} onChange={handleDetailChange} placeholder="Playlist Description" />
      
      {/* --- MOOD DROPDOWN --- */}
      <select name="mood" value={playlistDetails.mood} onChange={handleDetailChange} required>
        {MOODS.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
      </select>
      
      <h4>Select Songs ({selectedSongs.length} selected)</h4>
      
      {/* --- SONG SEARCH INPUT --- */}
      <input 
        type="text" 
        placeholder="Search songs..." 
        className="search-input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      
      <div className="song-selection-list">
        {filteredSongs.length > 0 ? (
          filteredSongs.map(song => (
            <div key={song._id} className="song-selection-item">
              <input 
                type="checkbox" 
                id={song._id}
                checked={selectedSongs.includes(song._id)}
                onChange={() => handleSongSelect(song._id)}
              />
              <label htmlFor={song._id}>{song.title} - <em>{song.artist}</em></label>
            </div>
          ))
        ) : (
          <p>No songs match your search.</p>
        )}
      </div>

      <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Playlist'}</button>
    </form>
  );
};

export default CreatePlaylistForm;