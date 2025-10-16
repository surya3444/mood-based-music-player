const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let dir;
    // Check the fieldname to determine the correct folder
    if (file.fieldname === 'songFile') {
      dir = 'uploads/songs/';
    } else if (file.fieldname === 'coverPhoto') {
      dir = 'uploads/covers/';
    }
    
    // Ensure the directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    // Create a unique filename
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Export a single multer instance configured with our storage
const upload = multer({ storage: storage });
module.exports = upload;