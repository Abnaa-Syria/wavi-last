import multer from 'multer';
import { AppError } from '../utils/error.util.js';

// Store files directly in memory as buffer streams
const storage = multer.memoryStorage();

/**
 * Filter file formats. Enforce image-only JPEG, PNG, and WEBP uploads.
 */
const fileFilter = (_req: any, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new AppError('Only image files (JPEG, PNG, WEBP) are allowed!', 400));
  }
};

/**
 * Custom-configured multer instance for file stream capturing
 */
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB maximum limit
  },
});

export default upload;
