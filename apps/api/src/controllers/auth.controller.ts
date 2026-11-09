import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env.js';
import { User } from '../models/User.js';

const signupSchema = z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(8), preferredLanguage: z.enum(['hi', 'ur', 'en']).default('en') });
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8) });
const tokenFor = (id: string) => jwt.sign({ sub: id }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] });

export async function signup(req: Request, res: Response) {
  const body = signupSchema.parse(req.body);
  // Performance optimization: select only '_id' and use .lean() to check for existence
  // without hydrating full Mongoose document instance or fetching unnecessary fields.
  const exists = await User.findOne({ email: body.email }).select('_id').lean();
  if (exists) return res.status(409).json({ message: 'Email already registered.' });
  const user = await User.create({ ...body, passwordHash: await bcrypt.hash(body.password, 12) });
  return res.status(201).json({ token: tokenFor(user.id), user: { id: user.id, name: user.name, email: user.email, preferredLanguage: user.preferredLanguage } });
}

export async function login(req: Request, res: Response) {
  const body = loginSchema.parse(req.body);
  // Performance optimization: select needed fields and use .lean() to return plain JS objects,
  // bypassing expensive Mongoose document hydration and internal state tracking.
  const user = await User.findOne({ email: body.email }).select('_id name email passwordHash preferredLanguage').lean();
  if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) return res.status(401).json({ message: 'Invalid credentials.' });
  const userId = String(user._id);
  return res.json({ token: tokenFor(userId), user: { id: userId, name: user.name, email: user.email, preferredLanguage: user.preferredLanguage } });
}
