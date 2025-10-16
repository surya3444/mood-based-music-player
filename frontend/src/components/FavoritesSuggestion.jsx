import React from 'react';
import { IoPlay, IoClose } from 'react-icons/io5';
import './FavoritesSuggestion.css';

const FavoritesSuggestion = ({ songs, onSongSelect, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="suggestion-modal">
        <header className="modal-header">
          <h2>Your All-Time Favorites</h2>
          <button onClick={onClose} className="close-button"><IoClose size={24} /></button>
        </header>
        <div className="favorites-list">
          {songs.map(song => (
            <div 
              key={song._id} 
              className="song-card" 
              onClick={() => onSongSelect(song, songs)}
            >
              <div className="song-card-image-wrapper">
                <img src={song.coverPhotoUrl} alt={song.title} className="song-cover" />
                <div className="play-icon-overlay"><IoPlay size={28} color="black" /></div>
              </div>
              <p className="song-title">{song.title}</p>
              <p className="song-artist">{song.artist}</p>
            </div>
          ))}
        </div>
        {/* --- NEW: Progress Bar --- */}
        <div className="modal-progress-bar"></div>
      </div>
    </div>
  );
};

export default FavoritesSuggestion;