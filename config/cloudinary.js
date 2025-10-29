const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const defaultStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "default_uploads",  
    allowed_formats: ["jpg", "png", "jpeg", "webp", "gif"],
  },
});

const upload = multer({ storage: defaultStorage });


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
