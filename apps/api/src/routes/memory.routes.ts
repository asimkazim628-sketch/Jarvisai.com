import { Router } from 'express';
import { listMemories, upsertMemory } from '../controllers/memory.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const memoryRoutes = Router().use(requireAuth).get('/', listMemories).post('/', upsertMemory);
