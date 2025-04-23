import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { serveStatic } from 'hono/bun';
import { dashboardsRoute } from './routes/dashboard';
import { authRoute } from './routes/auth';
import { cors } from 'hono/cors';

const app = new Hono();

// Middleware
app.use('*', logger());

// For production, allow your Render domain
app.use('*', cors({ 
  origin: ["http://localhost:5173", "https://your-app-name.onrender.com"], 
  credentials: true 
}));

// API Routes
app.route('/api/dashboard', dashboardsRoute);
app.route('/auth', authRoute);

// Serve static assets (JS, CSS, images, etc.)
app.use('/static/*', serveStatic({ root: './frontend/dist' }));

// Serve all other routes (SPA fallback)
app.use('*', serveStatic({ path: './frontend/dist/index.html' }));

export default app;

export type apiRoute = typeof app;
