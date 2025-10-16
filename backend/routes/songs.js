const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
// Assuming you have an admin middleware function imported here or defined elsewhere
// const admin = require('../middleware/admin'); 
const User = require('../models/User');
const Song = require('../models/Song');

// ----------------------------------------------------------------------
// 1. LIKE / UNLIKE SONG (PUT api/songs/:id/like)
// Updates User.likedSongs array AND Song.likeCount number
// ----------------------------------------------------------------------
router.put('/:id/like', auth, async (req, res) => {
  try {
    const songId = req.params.id;
    const userId = req.user.id; 

    // Find the user to determine the current state
    const user = await User.findById(userId).select('likedSongs');
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Check if the song is already liked
    const isLiked = user.likedSongs.map(id => id.toString()).includes(songId);
    
    // Determine the operators for atomic updates
    const userUpdateOperator = isLiked ? '$pull' : '$push'; // Array modification
    const songCountChange = isLiked ? -1 : 1; // Number modification
    
    // 1. Atomic Update 1: Update the User's likedSongs array
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { [userUpdateOperator]: { likedSongs: songId } }, 
      { new: true } 
    );

    // 2. Atomic Update 2: Update the Song's likeCount number
    const updatedSong = await Song.findByIdAndUpdate(
        songId,
        { $inc: { likeCount: songCountChange } }, 
        { new: true }
    );
    
    if (!updatedSong) {
        console.error(`Song ID ${songId} not found during likeCount update.`);
    }

    res.json({
      msg: isLiked ? 'Song unliked' : 'Song liked',
      likedSongs: updatedUser.likedSongs.map(id => id.toString()),
      newLikeCount: updatedSong ? updatedSong.likeCount : 0 
    });

  } catch (err) {
    console.error('!!! ERROR IN /like ROUTE !!!:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});


// ----------------------------------------------------------------------
// 2. LOG SONG PLAY (POST api/songs/:id/play)
// Updates Song.playCount number AND User.songPlays Map
// ----------------------------------------------------------------------
router.post('/:id/play', auth, async (req, res) => {
  try {
    const songId = req.params.id;
    const userId = req.user.id; 

    // 1. Atomic Update 1: Update Global Play Count (Song Schema)
    await Song.findByIdAndUpdate(
      songId,
      { $inc: { playCount: 1 } }, 
      { new: true }
    );
    
    // 2. Atomic Update 2: Update User-Specific Play Count (User Schema Map)
    // Use dot notation to target the specific key in the Map
    const userUpdateKey = `songPlays.${songId}`;
    
    await User.findByIdAndUpdate(
        userId,
        { $inc: { [userUpdateKey]: 1 } }, // Dynamically increment the count in the Map
        { new: true, upsert: true } // upsert: true ensures the map key is created if needed
    );

    res.json({ msg: 'Play logged successfully' });
  } catch (err) {
    console.error('!!! ERROR IN /play ROUTE !!!:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});


// ----------------------------------------------------------------------
// 3. GET LIKED SONGS (GET api/songs/liked)
// ----------------------------------------------------------------------
router.get('/liked', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('likedSongs');
    
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Fetch the full song documents based on the IDs in the user's likedSongs array
    const likedSongs = await Song.find({
        _id: { $in: user.likedSongs }
    });
    
    res.json(likedSongs);

  } catch (err) {
    console.error('!!! ERROR IN /liked ROUTE !!!:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});


// ----------------------------------------------------------------------
// 4. SEARCH FOR SONGS (GET api/songs/search)
// ----------------------------------------------------------------------
router.get('/search', auth, async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ msg: 'Search query is required' });

    const searchRegex = new RegExp(query, 'i');

    const songs = await Song.find({
      $or: [
        { title: searchRegex },
        { artist: searchRegex }
      ]
    }).limit(20);

    res.json(songs);
  } catch (err) {
    console.error('!!! ERROR IN /search ROUTE !!!:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});


// ----------------------------------------------------------------------
// 5. GET MOST RECENT SONGS (GET api/songs/recent)
// ----------------------------------------------------------------------
router.get('/recent', auth, async (req, res) => {
  try {
    const recentSongs = await Song.find()
      .sort({ createdAt: -1 }) // Sort by creation date descending
      .limit(12); 

    res.json(recentSongs);
  } catch (err) {
    console.error('!!! ERROR IN /recent ROUTE !!!:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});


// ----------------------------------------------------------------------
// 6. GET RANDOM SONGS (GET api/songs/random)
// ----------------------------------------------------------------------
router.get('/random', auth, async (req, res) => {
  try {
    const randomSongs = await Song.aggregate([
      { $sample: { size: 10 } } 
    ]);

    res.json(randomSongs);
  } catch (err) {
    console.error('!!! ERROR IN /random ROUTE !!!:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});


// ----------------------------------------------------------------------
// 7. GET FAVORITES (TOP PLAYED SONGS) (GET api/songs/favorites)
// This uses the per-user 'songPlays' map for accurate top favorites.
// ----------------------------------------------------------------------
router.get('/favorites', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('songPlays');
    if (!user || !user.songPlays || user.songPlays.size === 0) {
      return res.json([]); 
    }

    // Convert map entries to an array of [songId, count]
    const sortedPlays = [...user.songPlays.entries()]
      .sort((a, b) => b[1] - a[1]) // Sort by count (descending)
      .slice(0, 5); // Get the top 5

    const topSongIds = sortedPlays.map(item => item[0]);

    // Fetch the full song documents for these IDs
    const topSongs = await Song.find({ '_id': { $in: topSongIds } });
    
    // Re-sort the final documents to match the play count order (Mongoose returns them unsorted)
    const sortedTopSongs = topSongIds
        .map(id => topSongs.find(song => song._id.toString() === id))
        .filter(song => song); // Filter out any null songs if an ID was bad

    res.json(sortedTopSongs);
  } catch (err) {
    console.error('!!! ERROR IN /favorites ROUTE !!!:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});


// ----------------------------------------------------------------------
// 8. ADMIN ANALYTICS (GET api/songs/analytics/songs)
// ----------------------------------------------------------------------
// router.get('/analytics/songs', [auth, admin], async (req, res) => { /* ... */ });


module.exports = router;