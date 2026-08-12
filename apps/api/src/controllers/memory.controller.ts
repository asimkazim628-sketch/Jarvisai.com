import type { Response } from 'express';
import { z } from 'zod';
import type { AuthRequest } from '../middleware/auth.js';
import { Memory } from '../models/Memory.js';

const memorySchema = z.object({
  key: z.string().min(1).max(80),
  value: z.string().min(1).max(2000),
  category: z.enum(['profile', 'preference', 'project', 'automation']).default('preference')
});

export async function upsertMemory(req: AuthRequest, res: Response) {
  const body = memorySchema.parse(req.body);
  const memory = await Memory.findOneAndUpdate(
    { userId: req.userId, key: body.key },
    { ...body, userId: req.userId },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return res.status(201).json({ memory });
}

export async function listMemories(req: AuthRequest, res: Response) {
  const memories = await Memory.find({ userId: req.userId }).sort({ updatedAt: -1 }).limit(100);
  return res.json({ memories });
}
