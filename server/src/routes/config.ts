import { Router } from 'express';
import { getConfig } from '../storage/configStore.js';

export const configRouter = Router();

configRouter.get('/config', (_req, res) => {
  res.json(getConfig());
});
