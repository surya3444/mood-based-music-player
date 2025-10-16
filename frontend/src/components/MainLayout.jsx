import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import MusicPlayer from './MusicPlayer';
import QueueSidebar from './QueueSidebar';
import FavoritesSuggestion from './FavoritesSuggestion';

const MainLayout = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [currentPlaylist, setCurrentPlaylist] = useState([]);
  const [error, setError] = useState('');
  const [isQueueVisible, setIsQueueVisible] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [favoriteSongs, setFavoriteSongs] = useState([]);
  const favoritesTimerRef = useRef(null); // Ref to hold the timer ID

  const handleLogout = useCallback(() => {
    localStorage.removeItem('authToken');
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          handleLogout();
          return;
        }
        const config = { headers: { 'x-auth-token': token } };
        const res = await axios.get('http://localhost:5000/api/auth/user', config);
        setUser(res.data);
      } catch (err) {
        handleLogout();
      }
    };
    fetchUserData();
  }, [handleLogout]);

  const handleLikeToggle = async (songId) => {
    if (!user) return;
    try {
      const token = localStorage.getItem('authToken');
      const config = { headers: { 'x-auth-token': token } };
      const res = await axios.put(`http://localhost:5000/api/songs/${songId}/like`, null, config);
      setUser({ ...user, likedSongs: res.data.likedSongs });
    } catch (err) {
      setError("Could not update like status.");
    }
  };

  const handleSongSelect = (song, playlist) => {
    setCurrentSong(song);
    setCurrentPlaylist(playlist);
  };

  const handleSongEnd = async (songId) => {
    try {
      const token = localStorage.getItem('authToken');
      const config = { headers: { 'x-auth-token': token } };
      await axios.post(`http://localhost:5000/api/songs/${songId}/play`, null, config);
    } catch (err) {
      console.error("Failed to log song play", err);
    }
  };

  const fetchAndPlayRadio = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const config = { headers: { 'x-auth-token': token } };
      const res = await axios.get('http://localhost:5000/api/songs/random', config);
      
      if (res.data && res.data.length > 0) {
        setCurrentPlaylist(res.data);
        setCurrentSong(res.data[0]);
      }
    } catch (err) {
      console.error("Failed to fetch radio songs", err);
      setError("Could not start radio mode.");
    }
  };
  
  const handleCloseFavoritesAndStartRadio = useCallback(() => {
    clearTimeout(favoritesTimerRef.current); // Clear timer on manual close
    setShowFavorites(false);
    fetchAndPlayRadio();
  }, []); // This function is stable and doesn't need dependencies that change

  useEffect(() => {
    if (showFavorites) {
      favoritesTimerRef.current = setTimeout(() => {
        handleCloseFavoritesAndStartRadio(); // Automatically close and start radio after 10s
      }, 10000); // 10 seconds
    }
    // Cleanup: clear the timer if the modal is closed before 10s
    return () => {
      clearTimeout(favoritesTimerRef.current);
    };
  }, [showFavorites, handleCloseFavoritesAndStartRadio]);

  const fetchAndShowFavorites = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const config = { headers: { 'x-auth-token': token } };
      const res = await axios.get('http://localhost:5000/api/songs/favorites', config);
      if (res.data.length > 0) {
        setFavoriteSongs(res.data);
        setShowFavorites(true);
      } else {
        fetchAndPlayRadio();
      }
    } catch (err) {
      console.error("Failed to fetch favorites", err);
      fetchAndPlayRadio();
    }
  };

  const handleNextSong = () => {
    if (!currentSong || currentPlaylist.length === 0) return;
    const currentIndex = currentPlaylist.findIndex(song => song._id === currentSong._id);

    if (currentIndex === currentPlaylist.length - 1) {
      fetchAndShowFavorites();
    } else if (currentIndex >= 0) {
      setCurrentSong(currentPlaylist[currentIndex + 1]);
    }
  };

  const handlePrevSong = () => {
    if (!currentSong || currentPlaylist.length === 0) return;
    const currentIndex = currentPlaylist.findIndex(song => song._id === currentSong._id);
    if (currentIndex > 0) {
      setCurrentSong(currentPlaylist[currentIndex - 1]);
    }
  };

  const toggleQueue = () => {
    setIsQueueVisible(!isQueueVisible);
  };
  
  const closeQueue = () => {
    setIsQueueVisible(false);
  };
  
  const handleSelectFavorite = (song, playlist) => {
    clearTimeout(favoritesTimerRef.current); // Clear timer when a song is selected
    handleSongSelect(song, playlist);
    setShowFavorites(false);
  };

  return (
    <div className="app-container">
      <Navbar user={user} onLogout={handleLogout} />
      <main className="content-wrap">
        <Outlet context={{ handleSongSelect, user, error }} />
      </main>
      
      {isQueueVisible && currentSong && (
        <QueueSidebar 
          playlist={currentPlaylist}
          currentSong={currentSong}
          onClose={closeQueue}
          onSongSelect={handleSongSelect}
        />
      )}
      
      {showFavorites && (
        <FavoritesSuggestion 
          songs={favoriteSongs}
          onClose={handleCloseFavoritesAndStartRadio}
          onSongSelect={handleSelectFavorite}
        />
      )}

      {currentSong && user && (
        <MusicPlayer 
          song={currentSong} 
          likedSongs={user.likedSongs}
          onLikeToggle={handleLikeToggle}
          onNext={handleNextSong}
          onPrev={handlePrevSong}
          onToggleQueue={toggleQueue}
          onSongEnd={handleSongEnd}
        />
      )}
    </div>
  );
};

export default MainLayout;