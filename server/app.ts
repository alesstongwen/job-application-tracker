import { Hono } from 'hono'
import {logger} from 'hono/logger'
import { serveStatic } from 'hono/bun'
import { dashboardsRoute } from './route/dashboard'
import { authRoute } from './route/auth'

const app = new Hono()

app.use("*", logger())

app.route("/api/dashboard", dashboardsRoute);
app.route("/auth", authRoute); 

app.get("*", serveStatic({root: "/frontend/dist"}));
app.get("*", serveStatic({root: "/frontend/dist/index.html"}));

export default app;

export type apiRoute = typeof app;