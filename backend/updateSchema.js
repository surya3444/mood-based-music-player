const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Song = require('./models/Song'); // Adjust the path if necessary

// Load environment variables
dotenv.config();

const updateSongs = async () => {
  try {
    // 1. Connect to the database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for script...');

    // 2. Find all songs that DO NOT have a 'playCount' field and update them
    const result = await Song.updateMany(
      { playCount: { $exists: false } }, // The condition to find old songs
      { $set: { playCount: 0, likeCount: 0 } } // The update to apply
    );

    console.log('Script finished.');
    console.log(`Matched ${result.matchedCount} songs.`);
    console.log(`Updated ${result.modifiedCount} songs.`);

    // 3. Disconnect from the database
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  } catch (error) {
    console.error('Error running update script:', error);
    process.exit(1);
  }
};

// Run the function
updateSongs();