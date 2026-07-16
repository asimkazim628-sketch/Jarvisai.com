import { Router } from 'express';
import { login, signup } from '../controllers/auth.controller.js';
export const authRoutes = Router().post('/signup', signup).post('/login', login);
