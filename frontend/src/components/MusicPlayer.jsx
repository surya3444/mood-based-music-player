import React, { useRef, useEffect } from 'react';
import { FaHeart, FaRegHeart, FaListUl } from 'react-icons/fa';
import { IoPlaySkipBack, IoPlaySkipForward } from 'react-icons/io5';
import './MusicPlayer.css';

// 1. Accept the new 'onSongEnd' prop
const MusicPlayer = ({ song, likedSongs, onLikeToggle, onNext, onPrev, onToggleQueue, onSongEnd }) => {
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current && song) {
      audioRef.current.src = song.songUrl;
      audioRef.current.play().catch(error => console.log("Autoplay was prevented:", error));
    }
  }, [song]);

  if (!song) return null;

  const isLiked = likedSongs.includes(song._id);

  // 2. This function handles the song finishing
  const handleSongEnd = () => {
    if (onSongEnd) {
      onSongEnd(song._id); // Log that the song has been played
    }
    onNext(); // Proceed to the next song
  };

  return (
    <div className="music-player-bar">
      <div className="song-details">
        <img src={song.coverPhotoUrl} alt={song.title} className="player-cover-art" />
        <div>
          <p className="player-title">{song.title}</p>
          <p className="player-artist">{song.artist}</p>
        </div>
      </div>
      
      <div className="player-controls">
        <div className="player-buttons">
          <button className="control-button" onClick={onPrev}><IoPlaySkipBack /></button>
          <button className="control-button" onClick={onNext}><IoPlaySkipForward /></button>
        </div>
        <audio
          ref={audioRef}
          controls
          className="audio-controls"
          onEnded={handleSongEnd} // 3. Use the new handler here
        >
          Your browser does not support the audio element.
        </audio>
      </div>

      <div className="player-actions">
        <button 
          className={`like-button ${isLiked ? 'liked' : ''}`}
          onClick={() => onLikeToggle(song._id)}
        >
          {isLiked ? <FaHeart /> : <FaRegHeart />}
        </button>
        
        <button className="control-button queue-button" onClick={onToggleQueue}>
          <FaListUl />
        </button>
      </div>
    </div>
  );
};

export default MusicPlayer;