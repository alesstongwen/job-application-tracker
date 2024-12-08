import { Hono } from "hono";
import { z } from "zod"; 
import { zValidator } from '@hono/zod-validator';
import { getUser } from "../kinde";
import { db, jobs as jobsTable } from "../db";
import { eq } from "drizzle-orm";
import { type UserType } from "@kinde-oss/kinde-typescript-sdk";

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

type CustomContext =  {
  Variables: {user: UserType;
  }
};

type Dashboard = Record<string, Column>;

export const dashboardsRoute = new Hono<CustomContext>()
  // Get the current dashboard data
  .get("/", getUser, async (c) => {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    try {
      // Fetch jobs belonging to the user
      const jobs = await db.select().from(jobsTable).where(eq(jobsTable.userId, user.id.toString()));
      console.log("Fetched Jobs:", jobs); // Debugging statement

     
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

      
      console.log("Dashboard:", dashboard); // Debugging statement
      return c.json(dashboard);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      return c.json({ error: "Failed to fetch jobs" }, 500);
    }
  })

  .post(
    "/add", getUser, zValidator("json", z.object({title: z.string(),company: z.string(),
      status: z.string(),
      description: z.string().optional(),})
    ), 
    async (c) => {
      console.log("Raw Body:", await c.req.json()); // Logs the incoming JSON body
      console.log("Validated Body:", c.req.valid("json"));
      const user = c.get("user");
      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }
      
      const { title, company, status, description } = c.req.valid("json");

      try {
        // Insert a new job into the database
        await db.insert(jobsTable).values({
          title,
          company,
          status,
          description: description || null,
          userId: user.id,
          createdAt: new Date().toISOString()
        });

        const jobs = await db.select().from(jobsTable).where(eq(jobsTable.userId, user.id.toString()));
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

          acc[status].tasks.push({
            id: job.id.toString(),
            content: job.title,
            company: job.company,
            addedAt: job.createdAt ? new Date(job.createdAt) : new Date(),
          });

          return acc;
        }, {});

        // Return success response if no exception occurs
        return c.json({ success: true });
      } catch (error) {
        console.error("Error adding new job:", error);
        return c.json({ error: "Failed to add new job" }, 500);
      }
    }
  )
  // Update task positions or move between columns
  .post(
    "/update", getUser,
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
      const { taskId, sourceCol, destCol } = c.req.valid("json");
      const user = c.get("user");

      if (!user) {
        console.error("No authenticated user");
        return c.json({ error: "Unauthorized" }, 401);
      }
  
      console.log("Updating Job with ID:", taskId);
      console.log("Source Column:", sourceCol, "Destination Column:", destCol);

      try {
        // Perform the update
        const result = await db
        .update(jobsTable)
        .set({ status: destCol })
        .where(eq(jobsTable.id, parseInt(taskId, 10))); // Ensure taskId matches integer type

        console.log("Update Result:", result);

        // Return success response if no exception occurs
        return c.json({ success: true });
      } catch (error) {
        console.error("Error updating job status:", error);
        return c.json({ error: "Failed to update job status" }, 500);
      }
    }
  );
