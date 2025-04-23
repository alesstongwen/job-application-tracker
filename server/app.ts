import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { serveStatic } from 'hono/bun';
import { dashboardsRoute } from './routes/dashboard';
import { authRoute } from './routes/auth';
import { cors } from 'hono/cors';

const app = new Hono();

app.use('*', logger());

app.use('*', cors({ 
  origin: ["http://localhost:5173", "https://job-application-tracker-4r9c.onrender.com/"], 
  credentials: true 
}));

app.use('/assets/*', serveStatic({ root: './frontend/dist' }));
app.use('/favicon.ico', serveStatic({ root: './frontend/dist' }));

app.route('/api/dashboard', dashboardsRoute);
app.route('/auth', authRoute);

app.use('*', serveStatic({ path: './frontend/dist/index.html' }));

export default app;
