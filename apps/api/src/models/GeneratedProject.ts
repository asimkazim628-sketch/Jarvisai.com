import { Schema, model, models } from 'mongoose';

export interface ProjectFile {
  path: string;
  content: string;
}

export interface GeneratedProjectDocument {
  _id: string;
  userId: Schema.Types.ObjectId;
  name: string;
  stack: string[];
  prompt: string;
  files: ProjectFile[];
  createdAt: Date;
  updatedAt: Date;
}

const fileSchema = new Schema<ProjectFile>({
  path: { type: String, required: true, trim: true, maxlength: 180 },
  content: { type: String, required: true, maxlength: 30000 }
}, { _id: false });

const generatedProjectSchema = new Schema<GeneratedProjectDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 90 },
  stack: { type: [String], default: ['Next.js', 'Tailwind CSS'] },
  prompt: { type: String, required: true, trim: true, maxlength: 4000 },
  files: { type: [fileSchema], default: [] }
}, { timestamps: true });

export const GeneratedProject = models.GeneratedProject || model<GeneratedProjectDocument>('GeneratedProject', generatedProjectSchema);
