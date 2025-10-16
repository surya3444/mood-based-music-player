// initCounts.js

const mongoose = require('mongoose');
// Adjust this path if your Song model is in a different location
const Song = require('./models/Song'); 

// Replace with your actual MongoDB connection string
const MONGO_URI = 'mongodb+srv://isuryakarthikvarma:w8MYN7oYulqMYi39@cluster0.qnzhf.mongodb.net/'; 

async function initializeCounts() {
    console.log('Connecting to MongoDB...');
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected successfully. Starting migration...');

        // Find all Song documents that are missing the 'likeCount' field
        // or where the fields might be null/undefined.
        const filter = { 
            $or: [
                { likeCount: { $exists: false } },
                { playCount: { $exists: false } }
            ]
        };
        
        // Use $set to explicitly add the fields with a default value of 0
        const update = { 
            $set: { likeCount: 0, playCount: 0 } 
        };

        // Use updateMany to apply the change to ALL matching documents
        const result = await Song.updateMany(filter, update);

        console.log('Migration Complete:');
        console.log(`- Documents Matched: ${result.matchedCount}`);
        console.log(`- Documents Modified: ${result.modifiedCount}`);

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('MongoDB disconnected.');
    }
}

initializeCounts();