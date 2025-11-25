import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import * as faceapi from 'face-api.js';
import { IoPlay, IoMusicalNotes } from 'react-icons/io5';
import { FaRedo } from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
  const { handleSongSelect } = useOutletContext();
  const videoRef = useRef(null);

  const [isDetectingMood, setIsDetectingMood] = useState(true);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  
  // --- STATE MANAGEMENT ---
  const [mood, setMood] = useState(null);
  const [previousMood, setPreviousMood] = useState(null); // <-- NEW STATE
  const [moodConfidence, setMoodConfidence] = useState(null);
  // ------------------------

  const [playlists, setPlaylists] = useState([]);
  const [loadingMessage, setLoadingMessage] = useState('Loading face-api models...');
  const [error, setError] = useState(null);
  const detectionInterval = useRef(null);

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

  const speakMood = (detectedMood) => {
    if ('speechSynthesis' in window) {
      const synth = window.speechSynthesis;
      synth.cancel(); 
      
      const text = `You look ${detectedMood}. Here is some music for you.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      
      synth.speak(utterance);
    }
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
          
          const confidence = detections.expressions[dominantExpression];
          setMoodConfidence(confidence);

          speakMood(dominantExpression); 
          setMood(dominantExpression);
          setIsDetectingMood(false);
          stopWebcam();
        }
      }
    }, 1500);
  };
  
  const restartMoodDetection = () => {
    // --- SAVE PREVIOUS MOOD BEFORE RESETTING ---
    if (mood) {
      setPreviousMood(mood);
    }
    // ------------------------------------------
    setMood(null);
    setMoodConfidence(null);
    setPlaylists([]);
    setError(null);
    setSelectedLanguage('all');
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
          <div className="mood-info">
            {/* --- SHOW PREVIOUS MOOD IF EXISTS --- */}
            {previousMood && (
              <p className="previous-mood">
                Previous: <span className="prev-highlight">{previousMood}</span>
              </p>
            )}
            {/* ------------------------------------ */}
            
            <h2>
              Mood: <span className="highlight">{mood}</span>
            </h2>
            {moodConfidence && (
              <p className="accuracy-text">
                Match Accuracy: {(moodConfidence * 100).toFixed(1)}%
              </p>
            )}
          </div>

          <div className="controls-row">
            <button onClick={restartMoodDetection} className="find-mood-button">
              <FaRedo /> Find Mood Again
            </button>
            
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
        </div>
      )}

      {loadingMessage && (
        <div className="loading-container">
          <IoMusicalNotes className="loading-icon" />
          <p className="status-message">{loadingMessage}</p>
        </div>
      )}
      
      {error && <p className="error-message">{error}</p>}

      {!isDetectingMood && playlists.length > 0 && (
        <div className="playlists-container">
          {playlists.map(playlist => {
            const filteredSongs = playlist.songs.filter(song => 
              selectedLanguage === 'all' || song.language.toLowerCase() === selectedLanguage.toLowerCase()
            );

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
                        onClick={() => handleSongSelect(song, filteredSongs)}
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