import type { Response } from 'express';
import { z } from 'zod';
import { askJarvis, generateWebsiteBrief } from '../services/ai.service.js';
import { Conversation } from '../models/Conversation.js';
import type { AuthRequest } from '../middleware/auth.js';

const chatSchema = z.object({ message: z.string().min(1), conversationId: z.string().optional() });
const websiteSchema = z.object({ requirement: z.string().min(10) });

export async function chat(req: AuthRequest, res: Response) {
  const { message, conversationId } = chatSchema.parse(req.body);
  const userMsg = { role: 'user' as const, content: message };

  if (conversationId) {
    // ⚡ Bolt Optimization: Use Mongo projection `{ messages: { $slice: -11 } }` with `.lean()`
    // to load only the recent 11 messages needed for context instead of fetching the entire conversation history.
    const conversation = await Conversation.findOne(
      { _id: conversationId, userId: req.userId },
      { messages: { $slice: -11 } }
    ).lean();

    if (!conversation) return res.status(404).json({ message: 'Conversation not found.' });

    const recent = [
      ...(conversation.messages ?? []).map((m: { role: 'user' | 'assistant' | 'system'; content: string }) => ({
        role: m.role,
        content: m.content
      })),
      userMsg
    ];

    const answer = await askJarvis(recent);
    const assistantMsg = { role: 'assistant' as const, content: answer };

    // ⚡ Bolt Optimization: Perform an atomic `$push` update instead of loading and re-saving the full messages array.
    await Conversation.updateOne(
      { _id: conversation._id },
      { $push: { messages: { $each: [userMsg, assistantMsg] } } }
    );

    return res.json({ conversationId: conversation._id.toString(), answer });
  }

  // ⚡ Bolt Optimization: For new conversations, construct messages up front and perform a single write operation.
  const answer = await askJarvis([userMsg]);
  const assistantMsg = { role: 'assistant' as const, content: answer };

  const conversation = await Conversation.create({
    userId: req.userId,
    title: message.slice(0, 60),
    messages: [userMsg, assistantMsg]
  });

  return res.json({ conversationId: conversation.id, answer });
}

export async function websiteGenerator(req: AuthRequest, res: Response) {
  const { requirement } = websiteSchema.parse(req.body);
  const plan = await generateWebsiteBrief(requirement);
  return res.json({ plan });
}
