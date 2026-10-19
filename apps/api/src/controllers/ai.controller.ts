import type { Response } from 'express';
import { z } from 'zod';
import { askJarvis, generateWebsiteBrief } from '../services/ai.service.js';
import { Conversation } from '../models/Conversation.js';
import type { AuthRequest } from '../middleware/auth.js';

const chatSchema = z.object({ message: z.string().min(1), conversationId: z.string().optional() });
const websiteSchema = z.object({ requirement: z.string().min(10) });

export async function chat(req: AuthRequest, res: Response) {
  const { message, conversationId } = chatSchema.parse(req.body);
  let conversationIdToUse = conversationId;
  let recentMessages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [];

  if (conversationId) {
    // PERFORMANCE OPTIMIZATION:
    // 1. MongoDB projection `{ messages: { $slice: -12 } }`: Fetches only the last 12 messages from DB
    //    instead of loading and transferring full message history (O(1) payload size vs O(N)).
    // 2. `.lean()` avoids Mongoose document hydration overhead for lighter memory footprint.
    const conversation = await Conversation.findOne(
      { _id: conversationId, userId: req.userId },
      { messages: { $slice: -12 } }
    ).lean();

    if (!conversation) return res.status(404).json({ message: 'Conversation not found.' });

    recentMessages = conversation.messages.map((m: { role: 'user' | 'assistant' | 'system'; content: string }) => ({
      role: m.role,
      content: m.content
    }));
  } else {
    const newDoc = await Conversation.create({ userId: req.userId, title: message.slice(0, 60) });
    conversationIdToUse = newDoc.id;
  }

  recentMessages.push({ role: 'user', content: message });
  const answer = await askJarvis(recentMessages.slice(-12));

  // PERFORMANCE OPTIMIZATION:
  // Atomic `$push` update appends only the new messages directly in MongoDB.
  // This replaces full document re-saves, cutting database write payloads from O(N) down to O(1).
  await Conversation.updateOne(
    { _id: conversationIdToUse, userId: req.userId },
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

  return res.json({ conversationId: conversationIdToUse, answer });
}

export async function websiteGenerator(req: AuthRequest, res: Response) {
  const { requirement } = websiteSchema.parse(req.body);
  const plan = await generateWebsiteBrief(requirement);
  return res.json({ plan });
}
