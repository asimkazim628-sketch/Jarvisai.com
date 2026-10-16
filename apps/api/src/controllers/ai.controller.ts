import type { Response } from 'express';
import { z } from 'zod';
import { askJarvis, generateWebsiteBrief } from '../services/ai.service.js';
import { Conversation } from '../models/Conversation.js';
import type { AuthRequest } from '../middleware/auth.js';

const chatSchema = z.object({ message: z.string().min(1), conversationId: z.string().optional() });
const websiteSchema = z.object({ requirement: z.string().min(10) });

export async function chat(req: AuthRequest, res: Response) {
  const { message, conversationId } = chatSchema.parse(req.body);

  let activeConversationId = conversationId;
  let recentMessages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [];

  if (conversationId) {
    // Optimization: Use MongoDB $slice projection to retrieve only the last 12 messages from DB
    // instead of transferring the entire message history over network, and use .lean() to bypass
    // Mongoose document hydration overhead.
    const conversation = await Conversation.findOne(
      { _id: conversationId, userId: req.userId },
      { messages: { $slice: -12 } }
    ).lean();

    if (!conversation) return res.status(404).json({ message: 'Conversation not found.' });

    activeConversationId = String(conversation._id);
    recentMessages = (conversation.messages || []).map((m: { role: 'user' | 'assistant' | 'system'; content: string }) => ({
      role: m.role,
      content: m.content
    }));
  } else {
    const newConv = await Conversation.create({
      userId: req.userId,
      title: message.slice(0, 60),
      messages: []
    });
    activeConversationId = String(newConv._id);
  }

  // Include current user message in context window for AI service
  const recent = [...recentMessages, { role: 'user' as const, content: message }];
  const answer = await askJarvis(recent);

  // Optimization: Atomically append user and assistant messages via $push + $each
  // without downloading/saving the full array back to MongoDB.
  await Conversation.updateOne(
    { _id: activeConversationId, userId: req.userId },
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

  return res.json({ conversationId: activeConversationId, answer });
}

export async function websiteGenerator(req: AuthRequest, res: Response) {
  const { requirement } = websiteSchema.parse(req.body);
  const plan = await generateWebsiteBrief(requirement);
  return res.json({ plan });
}
