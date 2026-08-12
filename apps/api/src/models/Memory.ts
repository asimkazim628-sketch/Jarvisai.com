import { Schema, model, models } from 'mongoose';

export interface MemoryDocument {
  _id: string;
  userId: Schema.Types.ObjectId;
  key: string;
  value: string;
  category: 'profile' | 'preference' | 'project' | 'automation';
  createdAt: Date;
  updatedAt: Date;
}

const memorySchema = new Schema<MemoryDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  key: { type: String, required: true, trim: true, maxlength: 80 },
  value: { type: String, required: true, trim: true, maxlength: 2000 },
  category: { type: String, enum: ['profile', 'preference', 'project', 'automation'], default: 'preference' }
}, { timestamps: true });

memorySchema.index({ userId: 1, key: 1 }, { unique: true });

export const Memory = models.Memory || model<MemoryDocument>('Memory', memorySchema);
