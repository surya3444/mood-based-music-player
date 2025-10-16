import React, { useState } from 'react';
import axios from 'axios';
import { MOODS } from '../../constants'; // <-- Import the moods constant

const UploadSongForm = ({ onSongUploaded }) => { // <-- Accept the prop
  const [formData, setFormData] = useState({ title: '', artist: '', mood: MOODS[0], language: '' });
  const [songFile, setSongFile] = useState(null);
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { title, artist, mood, language } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (!songFile || !coverPhoto) {
      setError('Please select both a song file and a cover photo.');
      return;
    }
    setLoading(true);

    const uploadData = new FormData();
    uploadData.append('title', title);
    uploadData.append('artist', artist);
    uploadData.append('mood', mood);
    uploadData.append('language', language);
    uploadData.append('songFile', songFile);
    uploadData.append('coverPhoto', coverPhoto);

    try {
      const token = localStorage.getItem('authToken');
      const config = { headers: { 'x-auth-token': token, 'Content-Type': 'multipart/form-data' } };
      const res = await axios.post('http://localhost:5000/api/admin/upload-song', uploadData, config);
      setMessage(res.data.msg);
      onSongUploaded(); // <-- Call the callback to trigger a refresh
      // Optionally reset the form
      setFormData({ title: '', artist: '', mood: MOODS[0], language: '' });
      e.target.reset();
    } catch (err) {
      setError(err.response?.data?.msg || 'Upload failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="upload-form">
      {message && <p className="status-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
      <input type="text" name="title" value={title} onChange={onChange} placeholder="Song Title" required />
      <input type="text" name="artist" value={artist} onChange={onChange} placeholder="Artist Name" required />
      
      {/* --- MOOD DROPDOWN --- */}
      <select name="mood" value={mood} onChange={onChange} required>
        {MOODS.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
      </select>

      <input type="text" name="language" value={language} onChange={onChange} placeholder="Language" required />
      
      <label>Song File (MP3, etc.):</label>
      <input type="file" name="songFile" onChange={(e) => setSongFile(e.target.files[0])} accept="audio/*" required />
      
      <label>Cover Photo (JPG, PNG):</label>
      <input type="file" name="coverPhoto" onChange={(e) => setCoverPhoto(e.target.files[0])} accept="image/*" required />
      
      <button type="submit" disabled={loading}>{loading ? 'Uploading...' : 'Upload Song'}</button>
    </form>
  );
};

export default UploadSongForm;