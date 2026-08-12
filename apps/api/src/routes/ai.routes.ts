import { Router } from 'express';
import { chat, websiteGenerator } from '../controllers/ai.controller.js';
import { requireAuth } from '../middleware/auth.js';
export const aiRoutes = Router().use(requireAuth).post('/chat', chat).post('/website', websiteGenerator);
