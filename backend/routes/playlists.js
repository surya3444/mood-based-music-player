const express = require('express');
const router = express.Router();
const Playlist = require('../models/Playlist'); // Assuming you have a Playlist model
const auth = require('../middleware/auth'); // We'll create this middleware to protect routes

// @route   GET api/playlists/mood/:mood
// @desc    Get playlists by mood
// @access  Private
router.get('/mood/:mood', auth, async (req, res) => {
  try {
    // Find playlists that match the mood from the URL parameter
    const playlists = await Playlist.find({
      mood: new RegExp(req.params.mood, 'i') // Case-insensitive match
    }).populate('songs'); // IMPORTANT: This replaces song IDs with actual song objects

    if (!playlists || playlists.length === 0) {
      return res.status(404).json({ msg: 'No playlists found for this mood' });
    }

    res.json(playlists);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;