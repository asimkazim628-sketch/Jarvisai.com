import type { Response } from 'express';
import { z } from 'zod';
import type { AuthRequest } from '../middleware/auth.js';
import { Note } from '../models/Note.js';
import { Reminder } from '../models/Reminder.js';

const noteSchema = z.object({
  title: z.string().min(1).max(120),
  content: z.string().min(1).max(8000),
  tags: z.array(z.string().min(1).max(30)).default([])
});

const reminderSchema = z.object({
  title: z.string().min(1).max(160),
  remindAt: z.coerce.date().refine((date) => date.getTime() > Date.now(), 'Reminder time must be in the future')
});

export async function createNote(req: AuthRequest, res: Response) {
  const body = noteSchema.parse(req.body);
  const note = await Note.create({ ...body, userId: req.userId });
  return res.status(201).json({ note });
}

export async function listNotes(req: AuthRequest, res: Response) {
  const notes = await Note.find({ userId: req.userId }).sort({ updatedAt: -1 }).limit(50);
  return res.json({ notes });
}

export async function createReminder(req: AuthRequest, res: Response) {
  const body = reminderSchema.parse(req.body);
  const reminder = await Reminder.create({ ...body, userId: req.userId });
  return res.status(201).json({ reminder });
}

export async function listReminders(req: AuthRequest, res: Response) {
  const reminders = await Reminder.find({ userId: req.userId, completed: false }).sort({ remindAt: 1 }).limit(50);
  return res.json({ reminders });
}
