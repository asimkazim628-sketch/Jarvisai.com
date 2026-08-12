import type { Response } from 'express';
import { z } from 'zod';
import type { AuthRequest } from '../middleware/auth.js';
import { GeneratedProject } from '../models/GeneratedProject.js';
import { generateProjectFiles } from '../services/project.service.js';

const projectSchema = z.object({ requirement: z.string().min(10).max(4000) });

export async function createGeneratedProject(req: AuthRequest, res: Response) {
  const { requirement } = projectSchema.parse(req.body);
  const generated = await generateProjectFiles(requirement);
  const project = await GeneratedProject.create({
    userId: req.userId,
    name: generated.name ?? 'jarvis-project',
    stack: generated.stack ?? ['Next.js'],
    prompt: requirement,
    files: generated.files ?? []
  });
  return res.status(201).json({ project });
}

export async function listGeneratedProjects(req: AuthRequest, res: Response) {
  const projects = await GeneratedProject.find({ userId: req.userId }).select('name stack prompt createdAt updatedAt').sort({ updatedAt: -1 }).limit(30);
  return res.json({ projects });
}
