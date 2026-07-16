import { Schema, model, models } from 'mongoose';

export interface UserDocument {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  preferredLanguage: 'hi' | 'ur' | 'en';
  emailVerified: boolean;
  createdAt: Date;
}

const userSchema = new Schema<UserDocument>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  preferredLanguage: { type: String, enum: ['hi', 'ur', 'en'], default: 'en' },
  emailVerified: { type: Boolean, default: false }
}, { timestamps: true });

export const User = models.User || model<UserDocument>('User', userSchema);
