import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createNote, createReminder, listNotes, listReminders } from '../controllers/productivity.controller.js';

export const productivityRoutes = Router()
  .use(requireAuth)
  .get('/notes', listNotes)
  .post('/notes', createNote)
  .get('/reminders', listReminders)
  .post('/reminders', createReminder);
