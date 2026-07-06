/**
 * Vercel serverless entry point. Re-exports the same Express app used by the
 * standalone server so the REST API can be deployed as a single function.
 *
 * IMPORTANT: Vercel's serverless filesystem is read-only outside of /tmp, and
 * each invocation may run on a different, ephemeral instance. That means
 * writes to /data/*.json made through the deployed API (creating/editing
 * crushes from /admin) will NOT persist across requests or deployments.
 * For a fully read-write deployment, run the server (see /server) on a
 * persistent host (Docker, a VPS, Render, Fly.io, etc.) instead. See the
 * README's "Deployment" section for details.
 */
import { createApp } from '../server/src/app.js';

const app = createApp();

export default app;
