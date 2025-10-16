const mongoose = require('mongoose');

const PlaylistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  songs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song'
  }],
  coverPhotoUrl: {
    type: String,
  },
  createdBy: {
    type: String,
    default: 'admin',
  },
  mood: {
    type: String,
    required: true,
    // --- THIS IS THE CORRECTED LINE ---
    // Changed all enum values to lowercase to match the data being sent.
    enum: ['happy', 'sad', 'neutral', 'angry', 'surprised', 'calm', 'energetic'],
  },
}, { timestamps: true });

module.exports = mongoose.model('Playlist', PlaylistSchema);