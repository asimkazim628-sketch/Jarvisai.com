import type { Response } from 'express';
import { z } from 'zod';
import { askJarvis, generateWebsiteBrief } from '../services/ai.service.js';
import { Conversation } from '../models/Conversation.js';
import type { AuthRequest } from '../middleware/auth.js';

const chatSchema = z.object({ message: z.string().min(1), conversationId: z.string().optional() });
const websiteSchema = z.object({ requirement: z.string().min(10) });

export async function chat(req: AuthRequest, res: Response) {
  const { message, conversationId } = chatSchema.parse(req.body);
  const conversation = conversationId ? await Conversation.findOne({ _id: conversationId, userId: req.userId }) : await Conversation.create({ userId: req.userId, title: message.slice(0, 60) });
  if (!conversation) return res.status(404).json({ message: 'Conversation not found.' });
  conversation.messages.push({ role: 'user', content: message });
  const recent = conversation.messages.slice(-12).map((m: { role: 'user' | 'assistant' | 'system'; content: string }) => ({ role: m.role, content: m.content }));
  const answer = await askJarvis(recent);
  conversation.messages.push({ role: 'assistant', content: answer });
  await conversation.save();
  return res.json({ conversationId: conversation.id, answer });
}

export async function websiteGenerator(req: AuthRequest, res: Response) {
  const { requirement } = websiteSchema.parse(req.body);
  const plan = await generateWebsiteBrief(requirement);
  return res.json({ plan });
}
