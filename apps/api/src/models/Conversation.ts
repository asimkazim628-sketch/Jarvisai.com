import { Schema, model, models, type Document, type Types } from 'mongoose';

export interface IMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  createdAt?: Date;
}

export interface IConversation {
  _id: Types.ObjectId | string;
  userId: Types.ObjectId | string;
  title: string;
  messages: IMessage[];
  createdAt?: Date;
  updatedAt?: Date;
}

const messageSchema = new Schema<IMessage>({
  role: { type: String, enum: ['system', 'user', 'assistant'], required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const conversationSchema = new Schema<IConversation>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, default: 'New JARVIS Session' },
  messages: { type: [messageSchema], default: [] }
}, { timestamps: true });

export const Conversation = models.Conversation || model<IConversation>('Conversation', conversationSchema);
