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
    // Bolt Optimization: Use projection with $slice to fetch only the last 11 historical messages from DB
    // (so 11 context messages + 1 current user message = 12 messages sent to AI model)
    // instead of transferring the entire unbounded conversation history into Node memory.
    const conversation = await Conversation.findOne(
      { _id: conversationId, userId: req.userId },
      { messages: { $slice: -11 } }
    ).lean();

    if (!conversation) return res.status(404).json({ message: 'Conversation not found.' });

    const recent = [
      ...((conversation.messages || []) as Array<{ role: 'user' | 'assistant' | 'system'; content: string }>).map((m) => ({
        role: m.role,
        content: m.content
      })),
      { role: 'user' as const, content: message }
    ];

    const answer = await askJarvis(recent);

    // Bolt Optimization: Use atomic $push update to append messages directly in MongoDB
    // instead of replacing the entire messages array via .save().
    const now = new Date();
    await Conversation.updateOne(
      { _id: conversation._id },
      {
        $push: {
          messages: {
            $each: [
              { role: 'user', content: message, createdAt: now },
              { role: 'assistant', content: answer, createdAt: now }
            ]
          }
        }
      }
    );

    return res.json({ conversationId: conversation._id.toString(), answer });
  }

  // Bolt Optimization: For new sessions, call AI service first, then save conversation in a single
  // DB write operation (reducing 2 DB writes down to 1).
  const answer = await askJarvis([{ role: 'user', content: message }]);
  const newConversation = await Conversation.create({
    userId: req.userId,
    title: message.slice(0, 60),
    messages: [
      { role: 'user', content: message },
      { role: 'assistant', content: answer }
    ]
  });

  return res.json({ conversationId: newConversation.id, answer });
}

export async function websiteGenerator(req: AuthRequest, res: Response) {
  const { requirement } = websiteSchema.parse(req.body);
  const plan = await generateWebsiteBrief(requirement);
  return res.json({ plan });
}
