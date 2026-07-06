import express, { type Express } from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { renderRouter } from './routes/render.js';
import { checkRouter } from './routes/check.js';
import { crushesRouter } from './routes/crushes.js';
import { configRouter } from './routes/config.js';
import { errorHandler } from './middleware/errorHandler.js';
import { CLIENT_DIST_DIR, IS_PRODUCTION } from './env.js';

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '2mb' }));

  app.use('/api', renderRouter);
  app.use('/api', checkRouter);
  app.use('/api', crushesRouter);
  app.use('/api', configRouter);

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  // In production, serve the built client (single-process deployment).
  if (IS_PRODUCTION && fs.existsSync(CLIENT_DIST_DIR)) {
    app.use(express.static(CLIENT_DIST_DIR));
    app.get(/^(?!\/api).*/, (_req, res) => {
      res.sendFile(path.join(CLIENT_DIST_DIR, 'index.html'));
    });
  }

  app.use((req, res) => {
    res.status(404).json({ error: `No route for ${req.method} ${req.path}` });
  });

  app.use(errorHandler);

  return app;
}
