const multer = require('multer');
const path = require('path');
const fs = require('fs');

const createUploader = (subfolder) => {
  const uploadDir = path.join(__dirname, `../public/uploads/${subfolder}`);
  
  // Ensure upload directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const tempDir = path.join(uploadDir, 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      cb(null, tempDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });

  const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error(`Only images (JPEG/JPG/PNG/GIF), PDFs and DOC/DOCX are allowed for ${file.fieldname}`));
    }
  };

  return multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB limit
    }
  });
};

// Create uploaders for different purposes
const userUpload = createUploader('users').fields([
  { name: 'profile_photo', maxCount: 1 },
  { name: 'resume', maxCount: 1 },
  { name: 'degree_certificate', maxCount: 1 }
]);

const companyUpload = createUploader('companies').fields([
  // Define company-related upload fields if needed
]);

// Single file upload for general purposes
const upload = createUploader('general').single('file');

module.exports = {
  userUpload,
  companyUpload,
  upload
};