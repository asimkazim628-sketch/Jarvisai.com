import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { ZodError } from 'zod';
import { env } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { authRoutes } from './routes/auth.routes.js';
import { aiRoutes } from './routes/ai.routes.js';
import { toolsRoutes } from './routes/tools.routes.js';
import { productivityRoutes } from './routes/productivity.routes.js';
import { memoryRoutes } from './routes/memory.routes.js';
import { projectsRoutes } from './routes/projects.routes.js';

const app = express();
app.use(helmet());
app.use(cors({ origin: env.WEB_ORIGIN, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(rateLimit({ windowMs: 60_000, limit: 120 }));
app.get('/health', (_req, res) => res.json({ ok: true, service: 'JARVIS API' }));
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/tools', toolsRoutes);
app.use('/api/productivity', productivityRoutes);
app.use('/api/memory', memoryRoutes);
app.use('/api/projects', projectsRoutes);
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof ZodError) return res.status(422).json({ message: 'Validation failed', issues: err.issues });
  console.error(err);
  return res.status(500).json({ message: 'Internal server error' });
});

connectDatabase().then(() => app.listen(env.PORT, () => console.log(`JARVIS API running on ${env.PORT}`)));
