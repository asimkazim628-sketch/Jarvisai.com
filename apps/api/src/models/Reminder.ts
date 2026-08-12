import { Schema, model, models } from 'mongoose';

export interface ReminderDocument {
  _id: string;
  userId: Schema.Types.ObjectId;
  title: string;
  remindAt: Date;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reminderSchema = new Schema<ReminderDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 160 },
  remindAt: { type: Date, required: true, index: true },
  completed: { type: Boolean, default: false }
}, { timestamps: true });

export const Reminder = models.Reminder || model<ReminderDocument>('Reminder', reminderSchema);
