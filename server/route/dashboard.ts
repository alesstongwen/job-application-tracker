import { Hono } from "hono";
import { z } from "zod"; 
import { zValidator } from '@hono/zod-validator';
import { getUser } from "../kinde";
import { db, jobs as jobsTable } from "../db";
import { eq } from "drizzle-orm";

type Column = {
  id: string;
  name: string;
  tasks: {
    id: string;
    content: string;
    company: string;
    addedAt: Date;
  }[];
};

type Dashboard = Record<string, Column>;

export const dashboardsRoute = new Hono()
  .use(getUser)
  // Get the current dashboard data
  .get("/", async (c) => {
    const user = c.var.user;
    const jobs = await db.select().from(jobsTable).where(eq(jobsTable.userId, user.id));
    
    try {
      // Fetch jobs belonging to the user
      const jobs = await db.select().from(jobsTable).where(eq(jobsTable.userId, user.id));

     
const dashboard: Dashboard = jobs.reduce<Dashboard>((acc, job) => {
  const status = job.status || "applied"; // Default status to "applied" if not set

  // If the status column doesn't exist, initialize it
  if (!acc[status]) {
    acc[status] = {
      id: status,
      name: status.charAt(0).toUpperCase() + status.slice(1),
      tasks: [],
    };
  }

  // Push the job into the corresponding column
  acc[status].tasks.push({
    id: job.id.toString(),
    content: job.title,
    company: job.company,
    addedAt: job.createdAt ? new Date(job.createdAt) : new Date(),
  });

  return acc;
}, {});


      return c.json(dashboard);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      return c.json({ error: "Failed to fetch jobs" }, 500);
    }
  })

  // Update task positions or move between columns
  .post(
    "/update",
    zValidator(
      "json",
      z.object({
        taskId: z.string(),
        sourceCol: z.string(),
        destCol: z.string(),
        destIndex: z.number(),
      })
    ),
   async (c) => {
      const { taskId, sourceCol, destCol, destIndex } = c.req.valid("json");

      try {
        // Fetch the job being moved
        const job = await db.select().from(jobsTable).where(eq(jobsTable.id, parseInt(taskId, 10))).limit(1);

        if (!job.length) {
          return c.json({ error: "Job not found" }, 404);
        }

        // Update the job's status in the database
        await db.update(jobsTable).set({ status: destCol }).where(eq(jobsTable.id, parseInt(taskId, 10)));

        return c.json({ success: true });
      } catch (error) {
        console.error("Error updating job status:", error);
        return c.json({ error: "Failed to update job status" }, 500);
      }
    }
  );
