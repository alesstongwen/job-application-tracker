import { Hono } from "hono";
import { z } from "zod"; 
import { zValidator } from '@hono/zod-validator';
import { getUser } from "../kinde";
import { db, jobs as jobsTable } from "../db";
import { eq } from "drizzle-orm";
import { userInfo } from "os";
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
    "/add",
    zValidator(
      "json",
      z.object({
        title: z.string(),
        company: z.string(),
        status: z.string(),
        description: z.string().optional(),
      })
    ),
    async (c) => {
      // Safely retrieve the user object from context
      const user = c.get("user"); // Ensure `UserType` is imported

      if (!user || !user.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const { title, company, status, description } = c.req.valid("json");

      try {
        // Insert job into the database
        await db.insert(jobsTable).values({
          title,
          company,
          status,
          description: description || null,
          userId: user.id, // Pass the user ID to the schema
          createdAt: new Date().toISOString(), // Add timestamp
        });

        return c.json({ success: true });
      } catch (error) {
        console.error("Error inserting job:", error);
        return c.json({ error: "Failed to add job" }, 500);
      }
    }
  )
  
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
      const { taskId, sourceCol, destCol } = c.req.valid("json");

      try {
        // Perform the update
        await db
          .update(jobsTable)
          .set({ status: destCol })
          .where(eq(jobsTable.id, parseInt(taskId, 10)));
  
        // Return success response if no exception occurs
        return c.json({ success: true });
      } catch (error) {
        console.error("Error updating job status:", error);
        return c.json({ error: "Failed to update job status" }, 500);
      }
    }
  );
