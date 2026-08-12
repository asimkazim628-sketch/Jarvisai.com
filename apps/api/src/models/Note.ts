import { Schema, model, models } from 'mongoose';

export interface NoteDocument {
  _id: string;
  userId: Schema.Types.ObjectId;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<NoteDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  content: { type: String, required: true, trim: true, maxlength: 8000 },
  tags: { type: [String], default: [] }
}, { timestamps: true });

export const Note = models.Note || model<NoteDocument>('Note', noteSchema);
