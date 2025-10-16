import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { IoPlay, IoSearch } from 'react-icons/io5';
import '../Dashboard.css';

const SearchPage = () => {
  const { handleSongSelect } = useOutletContext();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [initialSongs, setInitialSongs] = useState([]); // <-- State for the initial songs
  const [loading, setLoading] = useState(true); // Start with loading true
  const [message, setMessage] = useState('');

  // Effect 1: Fetch initial "recent" songs only on component mount
  useEffect(() => {
    const fetchInitialSongs = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const config = { headers: { 'x-auth-token': token } };
        const res = await axios.get('http://localhost:5000/api/songs/recent', config);
        setInitialSongs(res.data);
      } catch (err) {
        setMessage('Could not load initial songs.');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialSongs();
  }, []);

  // Effect 2: Debounced search for live results as the user types
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]); // Clear search results when query is empty
      setMessage('');
      return;
    }

    setLoading(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const token = localStorage.getItem('authToken');
        const config = { headers: { 'x-auth-token': token } };
        const res = await axios.get(`http://localhost:5000/api/songs/search?q=${query}`, config);
        
        setSearchResults(res.data);
        if (res.data.length === 0) {
          setMessage(`No results found for "${query}"`);
        }
      } catch (err) {
        setMessage('Search failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Determine which list of songs to display
  const isSearching = query.trim() !== '';
  const songsToDisplay = isSearching ? searchResults : initialSongs;

  return (
    <div className="search-container">
      <h1>Search</h1>
      <div className="search-bar">
        <IoSearch className="search-icon" />
        <input 
          type="text" 
          placeholder="What do you want to listen to?" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="search-results">
        {loading && <p className="status-message">Loading...</p>}
        
        {!loading && songsToDisplay.length > 0 && (
          // Add a title for the initial state
          !isSearching && <h2>Recently Added</h2>
        )}

        {!loading && songsToDisplay.length > 0 ? (
          <div className="songs-grid">
            {songsToDisplay.map(song => (
              <div 
                key={song._id} 
                className="song-card" 
                onClick={() => handleSongSelect(song, songsToDisplay)} // Pass the correct context
              >
                <div className="song-card-image-wrapper">
                  <img src={song.coverPhotoUrl} alt={song.title} className="song-cover" />
                  <div className="play-icon-overlay">
                    <IoPlay size={28} color="black" />
                  </div>
                </div>
                <p className="song-title">{song.title}</p>
                <p className="song-artist">{song.artist}</p>
              </div>
            ))}
          </div>
        ) : (
          !loading && <p className="status-message">{message}</p>
        )}
      </div>
    </div>
  );
};

export default SearchPage;