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
    // Bolt Optimization: Lean query with MongoDB $slice projection to fetch only the last 12 messages.
    // Avoids Mongoose document hydration overhead and transferring potentially thousands of messages over network (O(1) memory/bandwidth).
    const conversation = await Conversation.findOne(
      { _id: conversationId, userId: req.userId },
      { messages: { $slice: -12 } }
    ).lean();

    if (!conversation) return res.status(404).json({ message: 'Conversation not found.' });

    const recentHistory = (conversation.messages || []).map((m: { role: 'user' | 'assistant' | 'system'; content: string }) => ({
      role: m.role,
      content: m.content
    }));
    recentHistory.push({ role: 'user', content: message });

    const answer = await askJarvis(recentHistory.slice(-12));

    // Bolt Optimization: Atomic $push appends only the 2 new messages rather than rewriting the full messages array.
    await Conversation.updateOne(
      { _id: conversationId, userId: req.userId },
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

    return res.json({ conversationId, answer });
  }

  // Create new conversation with initial user message and JARVIS answer
  const userMsg = { role: 'user' as const, content: message };
  const answer = await askJarvis([userMsg]);
  const newConversation = await Conversation.create({
    userId: req.userId,
    title: message.slice(0, 60),
    messages: [userMsg, { role: 'assistant', content: answer }]
  });

  return res.json({ conversationId: newConversation.id, answer });
}

export async function websiteGenerator(req: AuthRequest, res: Response) {
  const { requirement } = websiteSchema.parse(req.body);
  const plan = await generateWebsiteBrief(requirement);
  return res.json({ plan });
}
