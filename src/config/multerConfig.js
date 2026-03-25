const multer = require('multer');
const path = require('path');
const fs = require('fs');  // Add this line to import the fs module

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create the full path relative to project root
    const uploadPath = path.join(__dirname, '../../public/uploads/pledge_items/');
    
    // Ensure directory exists (with error handling)
    try {
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (err) {
      cb(err); // Pass error to Multer if directory creation fails
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to only accept images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB limit
  }
});

module.exports = upload;