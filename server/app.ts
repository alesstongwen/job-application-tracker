import { Hono } from 'hono'
import {logger} from 'hono/logger'
import { serveStatic } from 'hono/bun'
import { dashboardsRoute } from './routes/dashboard'
import { authRoute } from './routes/auth'
import { cors } from 'hono/cors';

const app = new Hono()

app.use("*", logger())

app.use("*", cors({ origin: "http://localhost:5173", credentials: true }));

app.route("/api/dashboard", dashboardsRoute);
app.route("/auth", authRoute); 

app.get("*", serveStatic({root: "/frontend/dist"}));
app.get("*", serveStatic({root: "/frontend/dist/index.html"}));

export default app;

export type apiRoute = typeof app;