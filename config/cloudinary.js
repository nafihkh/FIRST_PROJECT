const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 1️⃣ Default Folder Upload (for existing 100 routes)
const defaultStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "default_uploads",   // change folder name as per need
    allowed_formats: ["jpg", "png", "jpeg", "webp", "gif"],
  },
});

const upload = multer({ storage: defaultStorage });

// 2️⃣ Dynamic Folder Upload (when needed specifically)
upload.dynamic = (folderName) => {
  const customStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: folderName,
      allowed_formats: ["jpg", "png", "jpeg"],
    },
  });
  return multer({ storage: customStorage });
};

module.exports = upload;
