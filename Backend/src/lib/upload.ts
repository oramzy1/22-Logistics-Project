import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

console.log("Cloudinary config:", { cloudName, apiKey: !!apiKey, apiSecret: !!apiSecret }); 

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error("Cloudinary configuration is missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment variables.");
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: '22logistics',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill' }], // auto-resize
  } as any,
});

export const upload = multer({ storage });