import React from 'react';
import { IoClose } from 'react-icons/io5';
import './QueueSidebar.css';

const QueueSidebar = ({ playlist, currentSong, onClose, onSongSelect }) => {
  return (
    <div className="queue-sidebar-overlay">
      <div className="queue-sidebar">
        <header className="queue-header">
          <h2>Queue</h2>
          <button onClick={onClose} className="close-button">
            <IoClose size={24} />
          </button>
        </header>
        <ul className="queue-list">
          {playlist.slice(0, 50).map((song) => {
            const isCurrent = currentSong._id === song._id;
            return (
              <li
                key={song._id}
                className={`queue-item ${isCurrent ? 'active' : ''}`}
                onClick={() => onSongSelect(song, playlist)}
              >
                <img src={song.coverPhotoUrl} alt={song.title} className="queue-item-cover" />
                <div className="queue-item-details">
                  <p className="queue-item-title">{song.title}</p>
                  <p className="queue-item-artist">{song.artist}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default QueueSidebar;