import type { Response } from 'express';
import { z } from 'zod';
import { askJarvis, generateWebsiteBrief } from '../services/ai.service.js';
import { Conversation } from '../models/Conversation.js';
import type { AuthRequest } from '../middleware/auth.js';

const chatSchema = z.object({ message: z.string().min(1), conversationId: z.string().optional() });
const websiteSchema = z.object({ requirement: z.string().min(10) });

export async function chat(req: AuthRequest, res: Response) {
  const { message, conversationId } = chatSchema.parse(req.body);

  if (conversationId) {
    // Optimization: Retrieve only the last 12 messages using $slice and .lean()
    // to reduce memory overhead and avoid fetching full conversation history over the wire.
    const conversation = await Conversation.findOne(
      { _id: conversationId, userId: req.userId },
      { messages: { $slice: -12 } }
    ).lean();

    if (!conversation) return res.status(404).json({ message: 'Conversation not found.' });

    const recent = [
      ...(conversation.messages || []),
      { role: 'user' as const, content: message }
    ].map((m) => ({ role: m.role as 'user' | 'assistant' | 'system', content: m.content }));

    const answer = await askJarvis(recent);

    // Optimization: Atomically push new messages ($push) instead of re-saving full array
    // Reduces network payload from O(N) to O(1) where N is total message count.
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

    return res.json({ conversationId: conversation._id.toString(), answer });
  }

  // Handle new conversation creation: generate answer first, then perform a single DB create write
  const answer = await askJarvis([{ role: 'user', content: message }]);

  const conversation = await Conversation.create({
    userId: req.userId,
    title: message.slice(0, 60),
    messages: [
      { role: 'user', content: message },
      { role: 'assistant', content: answer }
    ]
  });

  return res.json({ conversationId: conversation.id, answer });
}

export async function websiteGenerator(req: AuthRequest, res: Response) {
  const { requirement } = websiteSchema.parse(req.body);
  const plan = await generateWebsiteBrief(requirement);
  return res.json({ plan });
}
