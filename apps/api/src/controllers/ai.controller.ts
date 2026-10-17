import type { Response } from 'express';
import { z } from 'zod';
import { askJarvis, generateWebsiteBrief } from '../services/ai.service.js';
import { Conversation } from '../models/Conversation.js';
import type { AuthRequest } from '../middleware/auth.js';

const chatSchema = z.object({ message: z.string().min(1), conversationId: z.string().optional() });
const websiteSchema = z.object({ requirement: z.string().min(10) });

export async function chat(req: AuthRequest, res: Response) {
  const { message, conversationId } = chatSchema.parse(req.body);

  let targetId: string;
  let historyMessages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [];

  if (conversationId) {
    // Optimization: Use MongoDB $slice projection and .lean() to fetch only the last 11 messages
    // required for prompt context. This avoids loading full message history (O(N) data transfer)
    // and bypasses Mongoose document hydration overhead.
    const existing = await Conversation.findOne(
      { _id: conversationId, userId: req.userId },
      { messages: { $slice: -11 } }
    ).lean();

    if (!existing) return res.status(404).json({ message: 'Conversation not found.' });
    targetId = existing._id.toString();
    historyMessages = (existing.messages || []) as Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  } else {
    const created = await Conversation.create({ userId: req.userId, title: message.slice(0, 60) });
    targetId = created.id || created._id.toString();
  }

  // Construct recent message history (max 12 messages: up to 11 previous + current user message)
  const recent = [
    ...historyMessages.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user' as const, content: message }
  ];

  const answer = await askJarvis(recent);

  // Optimization: Use atomic MongoDB $push operator to append new user and assistant messages directly on DB server.
  // This eliminates sending the full conversation document back over network on save (reducing DB payload from O(N) to O(1)).
  await Conversation.updateOne(
    { _id: targetId },
    {
      $push: {
        messages: {
          $each: [
            { role: 'user', content: message },
            { role: 'assistant', content: answer }
          ]
        }
      }
    }
  );

  return res.json({ conversationId: targetId, answer });
}

export async function websiteGenerator(req: AuthRequest, res: Response) {
  const { requirement } = websiteSchema.parse(req.body);
  const plan = await generateWebsiteBrief(requirement);
  return res.json({ plan });
}
