const User = require('../models/User');

const admin = async (req, res, next) => {
  try {
    // We assume the 'auth' middleware has already run and attached the user id to req
    const user = await User.findById(req.user.id);

    if (user && user.role === 'admin') {
      next(); // User is an admin, proceed to the next middleware/route handler
    } else {
      res.status(403).json({ msg: 'Access denied. Not an admin.' });
    }
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = admin;