import { Hono } from "hono";
import { z } from "zod"; 
import { zValidator } from '@hono/zod-validator';

type Dashboard = {
    totalApplication: number;
    interviews: number;
    offers: number;
    rejections: number;
};

export const dashboardsRoute = new Hono()
    .get("/", (c) => {
        return c.json({ Dashboard: [] });
    })
    .post("/", (c) => {
        return c.json({});
    });