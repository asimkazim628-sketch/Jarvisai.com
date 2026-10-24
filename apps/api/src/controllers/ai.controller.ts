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
    // Optimization: Query with $slice projection and .lean() to fetch only the last 10 messages for context.
    // This avoids loading and hydrating full conversation histories into memory (O(N) -> O(1) memory & network overhead).
    const conversation = await Conversation.findOne(
      { _id: conversationId, userId: req.userId },
      { messages: { $slice: -10 } }
    ).lean();

    if (!conversation) return res.status(404).json({ message: 'Conversation not found.' });

    const recent = conversation.messages.map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content
    }));
    recent.push({ role: 'user', content: message });

    const answer = await askJarvis(recent);

    // Optimization: Use atomic $push update to append new messages instead of re-serializing the entire messages array via .save()
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
  } else {
    // New conversation creation
    const conversation = await Conversation.create({
      userId: req.userId,
      title: message.slice(0, 60),
      messages: [{ role: 'user', content: message }]
    });

    const answer = await askJarvis([{ role: 'user', content: message }]);

    // Atomic $push append of assistant answer
    await Conversation.updateOne(
      { _id: conversation._id },
      { $push: { messages: { role: 'assistant', content: answer } } }
    );

    return res.json({ conversationId: conversation.id, answer });
  }
}

export async function websiteGenerator(req: AuthRequest, res: Response) {
  const { requirement } = websiteSchema.parse(req.body);
  const plan = await generateWebsiteBrief(requirement);
  return res.json({ plan });
}
