const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const upload = require('../config/multer'); // Import the single multer instance
const Song = require('../models/Song');
const User = require('../models/User');
const Playlist = require('../models/Playlist');

// @route   POST api/admin/upload-song
// @desc    Upload a song and its cover photo locally
// @access  Admin
router.post(
  '/upload-song',
  [
    auth,
    admin,
    // Use the .fields() method to accept two specific fields
    upload.fields([
      { name: 'songFile', maxCount: 1 },
      { name: 'coverPhoto', maxCount: 1 }
    ])
  ],
  async (req, res) => {
    try {
      const { title, artist, mood, language } = req.body;
      
      // req.files will be an object: { songFile: [file], coverPhoto: [file] }
      const songFile = req.files['songFile'] ? req.files['songFile'][0] : null;
      const coverPhoto = req.files['coverPhoto'] ? req.files['coverPhoto'][0] : null;

      if (!songFile || !coverPhoto) {
        return res.status(400).json({ msg: 'Please upload both a song file and a cover photo.' });
      }

      // Construct the full URL for the frontend to access the files
      const songUrl = `${req.protocol}://${req.get('host')}/${songFile.path.replace(/\\/g, "/")}`;
      const coverPhotoUrl = `${req.protocol}://${req.get('host')}/${coverPhoto.path.replace(/\\/g, "/")}`;

      const newSong = new Song({
        title,
        artist,
        mood,
        language,
        songUrl: songUrl,
        coverPhotoUrl: coverPhotoUrl,
      });

      await newSong.save();
      res.status(201).json({ msg: 'Song uploaded successfully', song: newSong });
    } catch (err) {
      console.error('!!! ERROR IN /upload-song ROUTE !!!:', err);
      // Check if it's a Multer error
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ msg: err.message });
      }
      res.status(500).json({ msg: 'Server Error' });
    }
  }
);

// @route   GET api/admin/users
// @desc    Get all users (for activity view)
// @access  Admin
router.get('/users', [auth, admin], async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});


router.get('/songs', [auth, admin], async (req, res) => {
  try {
    const songs = await Song.find().sort({ createdAt: -1 }); // Get newest songs first
    res.json(songs);
  } catch (err) {
    console.error('!!! ERROR IN GET /admin/songs ROUTE !!!:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// --- ADD NEW ROUTE 2: CREATE A PLAYLIST ---
// @route   POST api/admin/create-playlist
// @desc    Create a new playlist with selected songs
// @access  Admin
router.post('/create-playlist', [auth, admin], async (req, res) => {
  try {
    const { name, description, mood, songs } = req.body;

    // Basic validation
    if (!name || !mood || !songs || songs.length === 0) {
      return res.status(400).json({ msg: 'Please provide a name, mood, and select at least one song.' });
    }

    const newPlaylist = new Playlist({
      name,
      description,
      mood,
      songs, // This is an array of song IDs from the frontend
      createdBy: 'admin',
    });

    await newPlaylist.save();
    res.status(201).json({ msg: 'Playlist created successfully', playlist: newPlaylist });
  } catch (err) {
    console.error('!!! ERROR IN /create-playlist ROUTE !!!:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

router.delete('/songs/:id', [auth, admin], async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);

    if (!song) {
      return res.status(404).json({ msg: 'Song not found' });
    }

    // Optional: Before deleting the song, you might want to remove it from any playlists that contain it.
    // This prevents "dead" song IDs in your playlists.
    await Playlist.updateMany(
      { songs: req.params.id },
      { $pull: { songs: req.params.id } }
    );

    // Note: This does not delete the actual file from your /uploads folder.
    // For a production app with cloud storage, you would add a step here to
    // delete the file from Cloudinary, S3, etc.

    await song.deleteOne();

    res.json({ msg: 'Song deleted successfully' });
  } catch (err) {
    console.error('!!! ERROR IN DELETE /admin/songs/:id ROUTE !!!:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});


// --- ADD NEW ROUTE 2: DELETE A PLAYLIST ---
// @route   DELETE api/admin/playlists/:id
// @desc    Delete a playlist by its ID
// @access  Admin
router.delete('/playlists/:id', [auth, admin], async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ msg: 'Playlist not found' });
    }

    await playlist.deleteOne();

    res.json({ msg: 'Playlist deleted successfully' });
  } catch (err) {
    console.error('!!! ERROR IN DELETE /admin/playlists/:id ROUTE !!!:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

router.get('/playlists', [auth, admin], async (req, res) => {
  try {
    const playlists = await Playlist.find().sort({ createdAt: -1 });
    res.json(playlists);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

router.get('/analytics/songs', [auth, admin], async (req, res) => {
  try {
    // Fetch all songs, sorted by playCount descending by default
    const songs = await Song.find().sort({ playCount: -1 });
    res.json(songs);
  } catch (err) {
    console.error('!!! ERROR IN /analytics/songs ROUTE !!!:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});


module.exports = router;