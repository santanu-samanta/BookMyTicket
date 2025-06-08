const multer = require('multer');
const path = require('path');

// Map of allowed file types
const FILE_TYPE_MAP = {
  'image/png': 'images',
  'image/jpeg': 'images',
  'image/jpg': 'images',
  'video/mp4': 'videos',
  'video/mkv': 'videos',
  'video/avi': 'videos'
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folder = FILE_TYPE_MAP[file.mimetype];
    
    if (!folder) {
      return cb(new Error('Invalid file type'), false);
    }

    cb(null, path.join('uploads', folder)); 
  },

  filename: function (req, file, cb) {
    const fileName = file.originalname.split(' ').join('-');
    const extension = path.extname(file.originalname);
    cb(null, `${fileName}-${Date.now()}${extension}`);
  }
});


const uploadImage = multer({ storage: storage });

module.exports = uploadImage;
