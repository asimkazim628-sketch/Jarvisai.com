import { Schema, model, models } from 'mongoose';

const messageSchema = new Schema({
  role: { type: String, enum: ['system', 'user', 'assistant'], required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const conversationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, default: 'New JARVIS Session' },
  messages: { type: [messageSchema], default: [] }
}, { timestamps: true });

/**
 * Performance optimization:
 * Compound index on { userId: 1, _id: 1 } supports the frequent query
 * in chat controller: `Conversation.findOne({ _id: conversationId, userId: req.userId })`.
 * This enables direct index seeks without index intersection or unindexed filtering.
 */
conversationSchema.index({ userId: 1, _id: 1 });

export const Conversation = models.Conversation || model('Conversation', conversationSchema);
