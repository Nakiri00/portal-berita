const multer = require('multer');
const path = require('path');
const UPLOAD_BASE_PATH = path.join(__dirname,'..','..', 'src', 'uploads');
const fs = require('fs');

const ensureDirExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const articleStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const thumbnailPath = path.join(UPLOAD_BASE_PATH, 'thumbnails'); 
        ensureDirExists(thumbnailPath);
        cb(null, thumbnailPath); 
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        // Nama file: imageFile-timestamp.ekstensi
        cb(null, `${file.fieldname}-${Date.now()}${ext}`);
    }
});

// --- 3. Konfigurasi untuk Profile Pictures ---
const profilePictureStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const profilePath = path.join(UPLOAD_BASE_PATH, 'avatars');
        ensureDirExists(profilePath);
        cb(null, profilePath); 
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const userId = req.user ? req.user.id : 'unknown';
        cb(null, `profile-${userId}-${Date.now()}${ext}`);
    }
});

// --- 4. Buat Instance Multer ---
const uploadArticle = multer({ storage: articleStorage }).single('imageFile');
const uploadProfilePicture = multer({ storage: profilePictureStorage }).single('avatar');
module.exports = { 
    uploadArticle,
    uploadProfilePicture 
};