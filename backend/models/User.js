const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String
  },
  googleId: {
    type: String
  },
  otp: {
    type: String
  },
  otpExpires: {
    type: Date
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  likedSongs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song'
  }],
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },

  // --- ADDED THIS FIELD ---
  // A map to store play counts. The key is the songId and the value is the count.
  songPlays: {
    type: Map,
    of: Number,
    default: {}
  }
  // -------------------------

}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);