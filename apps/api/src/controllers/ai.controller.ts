import type { Response } from 'express';
import { z } from 'zod';
import { askJarvis, generateWebsiteBrief } from '../services/ai.service.js';
import { Conversation } from '../models/Conversation.js';
import type { AuthRequest } from '../middleware/auth.js';

const chatSchema = z.object({ message: z.string().min(1), conversationId: z.string().optional() });
const websiteSchema = z.object({ requirement: z.string().min(10) });

export async function chat(req: AuthRequest, res: Response) {
  const { message, conversationId } = chatSchema.parse(req.body);

  // Bolt Optimization:
  // 1. Fetch only the last 11 messages from MongoDB using `$slice: -11`.
  //    Avoids transferring and deserializing unbounded conversation history into Node.js memory.
  // 2. Append new user and assistant messages atomically via `$push` with `updateOne`,
  //    bypassing heavy full-document serialization and write amplification with `.save()`.
  const conversation = conversationId
    ? await Conversation.findOne({ _id: conversationId, userId: req.userId }, { messages: { $slice: -11 } })
    : await Conversation.create({ userId: req.userId, title: message.slice(0, 60) });

  if (!conversation) return res.status(404).json({ message: 'Conversation not found.' });

  const history = conversation.messages.map((m: { role: 'user' | 'assistant' | 'system'; content: string }) => ({
    role: m.role,
    content: m.content
  }));
  const recent = [...history, { role: 'user' as const, content: message }];

  const answer = await askJarvis(recent);

  await Conversation.updateOne(
    { _id: conversation._id },
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

  return res.json({ conversationId: conversation.id, answer });
}

export async function websiteGenerator(req: AuthRequest, res: Response) {
  const { requirement } = websiteSchema.parse(req.body);
  const plan = await generateWebsiteBrief(requirement);
  return res.json({ plan });
}
