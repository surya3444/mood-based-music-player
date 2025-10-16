const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    // Determine the folder and resource type based on the file's field name
    let folder;
    let resource_type;
    if (file.fieldname === 'songFile') {
      folder = 'songs';
      resource_type = 'video'; // Cloudinary treats audio as video
    } else if (file.fieldname === 'coverPhoto') {
      folder = 'cover_photos';
      resource_type = 'image';
    } else {
      folder = 'others';
      resource_type = 'auto';
    }

    return {
      folder: folder,
      resource_type: resource_type,
      // You can also specify the format you want to convert to
      // format: 'mp3', 
    };
  },
});

// Create the Multer upload instance
const upload = multer({ storage: storage });

module.exports = upload;