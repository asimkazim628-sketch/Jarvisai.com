import type { Response } from 'express';
import { z } from 'zod';
import { askJarvis, generateWebsiteBrief } from '../services/ai.service.js';
import { Conversation, type IConversation } from '../models/Conversation.js';
import type { AuthRequest } from '../middleware/auth.js';

const chatSchema = z.object({ message: z.string().min(1), conversationId: z.string().optional() });
const websiteSchema = z.object({ requirement: z.string().min(10) });

export async function chat(req: AuthRequest, res: Response) {
  const { message, conversationId } = chatSchema.parse(req.body);

  let conversationIdToReturn: string;
  let recentMessages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;

  if (conversationId) {
    // ⚡ OPTIMIZATION: Use MongoDB $slice projection to fetch only the last 11 messages from DB.
    // Avoids loading potentially thousands of past conversation messages into Node.js memory.
    // Expected impact: ~80-95% decrease in MongoDB-to-API network payload & memory allocation for long chats.
    const conversation = await Conversation.findOne(
      { _id: conversationId, userId: req.userId },
      { title: 1, userId: 1, messages: { $slice: -11 } }
    ).lean<IConversation | null>();

    if (!conversation) return res.status(404).json({ message: 'Conversation not found.' });

    conversationIdToReturn = String(conversation._id);
    recentMessages = (conversation.messages || []).map((m) => ({
      role: m.role,
      content: m.content
    }));
    recentMessages.push({ role: 'user', content: message });
  } else {
    const newConv = await Conversation.create({
      userId: req.userId,
      title: message.slice(0, 60),
      messages: []
    });
    conversationIdToReturn = String(newConv._id);
    recentMessages = [{ role: 'user', content: message }];
  }

  const answer = await askJarvis(recentMessages);

  // ⚡ OPTIMIZATION: Append new user message and assistant answer using $push atomically to DB,
  // preventing full document overwrites and subdocument array transfers over network.
  await Conversation.updateOne(
    { _id: conversationIdToReturn, userId: req.userId },
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

  return res.json({ conversationId: conversationIdToReturn, answer });
}

export async function websiteGenerator(req: AuthRequest, res: Response) {
  const { requirement } = websiteSchema.parse(req.body);
  const plan = await generateWebsiteBrief(requirement);
  return res.json({ plan });
}
