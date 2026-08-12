import { Router } from 'express';
import { createGeneratedProject, listGeneratedProjects } from '../controllers/projects.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const projectsRoutes = Router().use(requireAuth).get('/', listGeneratedProjects).post('/generate', createGeneratedProject);
