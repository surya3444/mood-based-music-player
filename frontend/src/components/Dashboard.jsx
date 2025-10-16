import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import * as faceapi from 'face-api.js';
import { IoPlay } from 'react-icons/io5';
import { FaRedo } from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
  const { handleSongSelect } = useOutletContext();
  const videoRef = useRef(null);

  const [isDetectingMood, setIsDetectingMood] = useState(true);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [mood, setMood] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [loadingMessage, setLoadingMessage] = useState('Loading face-api models...');
  const [error, setError] = useState(null);
  const detectionInterval = useRef(null);

  // --- NEW STATE for the language filter ---
  const [selectedLanguage, setSelectedLanguage] = useState('all');

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models'),
        ]);
        setModelsLoaded(true);
      } catch (err) {
        setError('Failed to load face-api models. Please refresh the page.');
        console.error("Model loading error:", err);
      }
    };
    loadModels();
  }, []);

  const stopWebcam = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    clearInterval(detectionInterval.current);
  }, []);

  useEffect(() => {
    if (isDetectingMood && modelsLoaded) {
      startWebcam();
      setLoadingMessage('Starting webcam...');
    } else {
      stopWebcam();
    }
    
    return () => {
      stopWebcam();
    };
  }, [isDetectingMood, modelsLoaded, stopWebcam]);

  useEffect(() => {
    if (mood) {
      setLoadingMessage(`Mood detected: ${mood}. Finding your vibe...`);
      fetchPlaylists(mood);
    }
  }, [mood]);

  const startWebcam = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(err => {
        setError('Webcam access denied. Please enable it in your browser settings.');
      });
  };

  const handleVideoPlay = () => {
    setLoadingMessage('Look at the camera...');
    detectionInterval.current = setInterval(async () => {
      if (videoRef.current && !videoRef.current.paused) {
        const detections = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceExpressions();
        if (detections) {
          const dominantExpression = Object.keys(detections.expressions).reduce((a, b) =>
            detections.expressions[a] > detections.expressions[b] ? a : b
          );
          setMood(dominantExpression);
          setIsDetectingMood(false);
          stopWebcam();
        }
      }
    }, 1500);
  };
  
  const restartMoodDetection = () => {
    setMood(null);
    setPlaylists([]);
    setError(null);
    setSelectedLanguage('all'); // <-- Reset the language filter
    setIsDetectingMood(true);
  };

  const fetchPlaylists = async (detectedMood) => {
    try {
      const token = localStorage.getItem('authToken');
      const config = { headers: { 'x-auth-token': token } };
      const res = await axios.get(`http://localhost:5000/api/playlists/mood/${detectedMood}`, config);
      setPlaylists(res.data);
      setLoadingMessage('');
    } catch (err) {
      setError(`Could not find playlists for "${detectedMood}". Try another expression.`);
      setLoadingMessage('');
    }
  };

  // --- DYNAMICALLY get unique languages from the fetched songs ---
  const availableLanguages = [...new Set(
    playlists.flatMap(playlist => playlist.songs.map(song => song.language))
  )];

  return (
    <div className="dashboard-content">
      <h1>Let's Find Your Vibe</h1>

      {isDetectingMood ? (
        <div className="video-container">
          <video ref={videoRef} onPlay={handleVideoPlay} autoPlay muted playsInline />
        </div>
      ) : (
        <div className="mood-result-container">
          <button onClick={restartMoodDetection} className="find-mood-button">
            <FaRedo /> Find Mood Again
          </button>
          
          {/* --- NEW: The Language Filter Dropdown --- */}
          {availableLanguages.length > 0 && (
            <select
              className="language-filter"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
            >
              <option value="all">All Languages</option>
              {availableLanguages.map(lang => (
                <option key={lang} value={lang}>{lang.charAt(0).toUpperCase() + lang.slice(1)}</option>
              ))}
            </select>
          )}
        </div>
      )}

      {loadingMessage && <p className="status-message">{loadingMessage}</p>}
      {error && <p className="error-message">{error}</p>}

      {!isDetectingMood && playlists.length > 0 && (
        <div className="playlists-container">
          {playlists.map(playlist => {
            // --- Filter songs for this specific playlist ---
            const filteredSongs = playlist.songs.filter(song => 
              selectedLanguage === 'all' || song.language.toLowerCase() === selectedLanguage.toLowerCase()
            );

            // --- Only render the playlist section if it has songs after filtering ---
            if (filteredSongs.length === 0) {
              return null;
            }

            return (
              <div key={playlist._id} className="playlist-section">
                <h2>{playlist.name}</h2>
                <div className="songs-grid">
                  {filteredSongs.map(song => (
                      <div 
                        key={song._id} 
                        className="song-card" 
                        onClick={() => handleSongSelect(song, filteredSongs)} // Pass the filtered list for correct next/prev
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;