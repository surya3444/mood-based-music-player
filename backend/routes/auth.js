const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const passport = require('passport');


// Helper function to send email
const sendOtpEmail = async (email, otp) => {
  // Configure nodemailer
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  let mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your Music App Verification Code',
    text: `Your OTP is: ${otp}. It is valid for 10 minutes.`,
  };

  await transporter.sendMail(mailOptions);
};

// 1. REGISTER USER
router.post('/register', async (req, res) => {
  // --- ADDED FOR DEBUGGING ---
  console.log('--- Register Endpoint Hit ---');
  console.log('Request Body:', req.body);
  // This next log is the most important one. It checks if your .env variables are loaded.
  console.log('Email User from .env:', process.env.EMAIL_USER);
  // --- END OF DEBUGGING LOGS ---

  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ msg: 'Please enter all fields.' });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    user = new User({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpires,
    });
    await user.save();

    console.log('User saved to DB. Attempting to send email...');
    await sendOtpEmail(email, otp);
    console.log('Email sent successfully!');

    res.status(201).json({ msg: 'Registration successful! Please check your email for an OTP to verify your account.' });

  } catch (err) {
    // --- IMPROVED ERROR HANDLING ---
    // This will print the actual error to your backend terminal.
    console.error('!!! ERROR IN /register ROUTE !!!:', err);
    res.status(500).json({ msg: 'Server Error during registration.' });
    // --- END OF IMPROVEMENT ---
  }
});

// 2. VERIFY OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: 'User not found.' });
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ msg: 'Invalid or expired OTP.' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ msg: 'Email verified successfully! You can now log in.' });

  } catch (err) {
    // --- IMPROVED ERROR HANDLING ---
    console.error('!!! ERROR IN /verify-otp ROUTE !!!:', err);
    res.status(500).json({ msg: 'Server Error during OTP verification.' });
    // --- END OF IMPROVEMENT ---
  }
});


// 3. LOGIN USER
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials.' });
    }
    
    if (!user.password) {
      return res.status(400).json({ msg: 'Please log in using Google.' });
    }
    
    if (!user.isVerified) {
      return res.status(400).json({ msg: 'Please verify your email first.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials.' });
    }

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ token });

  } catch (err) {
    // --- IMPROVED ERROR HANDLING ---
    console.error('!!! ERROR IN /login ROUTE !!!:', err);
    res.status(500).json({ msg: 'Server Error during login.' });
    // --- END OF IMPROVEMENT ---
  }
});

// GOOGLE OAUTH
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    const payload = { user: { id: req.user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.redirect(`http://localhost:3000?token=${token}`);
  }
);

// Add this to backend/routes/auth.js

const auth = require('../middleware/auth'); // Make sure you have this middleware imported

// @route   GET api/auth/user
// @desc    Get logged in user's data
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    // req.user.id is available from the auth middleware
    const user = await User.findById(req.user.id).select('-password'); // .select('-password') prevents sending the password hash
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('!!! ERROR IN /auth/user ROUTE !!!:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// ... (rest of your file, e.g., Google routes, module.exports)

module.exports = router;