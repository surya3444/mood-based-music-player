// Import required packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const passport = require('passport');
const path = require('path'); // Make sure to require 'path'


// Load environment variables from .env file
dotenv.config();

// --- DATABASE CONNECTION ---
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully. ✅');
  } catch (err) {
    console.error(`MongoDB Connection Error: ${err.message} 🛑`);
    // Exit process with failure
    process.exit(1);
  }
};

// Connect to the database
connectDB();

// --- EXPRESS APP INITIALIZATION ---
const app = express();

// --- MIDDLEWARE ---
// 1. CORS: Allows cross-origin requests from your frontend
app.use(cors());

// 2. Body Parser: Enables the app to accept JSON in request bodies
app.use(express.json());

// 3. Passport Middleware: Initializes Passport for authentication strategies
require('./config/passport')(passport); // Pass passport for configuration
app.use(passport.initialize());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// --- API ROUTES ---
// Mount the authentication routes under the '/api/auth' path
app.use('/api/auth', require('./routes/auth'));
app.use('/api/playlists', require('./routes/playlists'));
app.use('/api/songs', require('./routes/songs'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/auth', require('./routes/auth'));



// Simple root route for testing if the server is up
app.get('/', (req, res) => {
  res.send('🎶 Mood Music API is running...');
});

// --- SERVER LISTENING ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is listening on http://localhost:${PORT}`);
});