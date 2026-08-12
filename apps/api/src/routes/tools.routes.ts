import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import { ocrImage, summarizeDocument } from '../controllers/tools.controller.js';
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });
export const toolsRoutes = Router().use(requireAuth).post('/summary', upload.single('file'), summarizeDocument).post('/ocr', upload.single('image'), ocrImage);
