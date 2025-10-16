const mongoose = require('mongoose');

const SongSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  artist: {
    type: String,
    required: true,
  },
  songUrl: {
    type: String,
    required: true,
  },
  coverPhotoUrl: {
    type: String,
    required: true,
  },
  mood: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
  },

  // --- ADDED THESE FIELDS ---
  playCount: {
    type: Number,
    default: 0
  },
  likeCount: {
    type: Number,
    default: 0
  }
  // -------------------------

}, { timestamps: true });

module.exports = mongoose.model('Song', SongSchema);