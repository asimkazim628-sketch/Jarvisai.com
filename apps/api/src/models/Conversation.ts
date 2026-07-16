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

export const Conversation = models.Conversation || model('Conversation', conversationSchema);
