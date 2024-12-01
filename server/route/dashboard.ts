import { Hono } from "hono";
import { z } from "zod"; 
import { zValidator } from '@hono/zod-validator';

type Task = {
  id: string;
  content: string;
  company: string;
  addedAt: string;
};

type Column = {
  id: string;
  name: string;
  tasks: Task[];
};

type Dashboard = Record<string, Column>;

const initialDashboard: Dashboard = {
    "applied": {
      "id": "applied",
      "name": "Applied",
      "tasks": [
        {
          "id": "1",
          "content": "My Dream Job Title",
          "company": "My Dream Company",
          "addedAt": "Added 6 hours ago"
        }
      ]
    },
    "interviewing": {
      "id": "interviewing",
      "name": "Interviewing",
      "tasks": []
    },
    "offer": {
      "id": "offer",
      "name": "Offer",
      "tasks": []
    },
    "rejected": {
      "id": "rejected",
      "name": "Rejected",
      "tasks": []
    }
  }
  

export const dashboardsRoute = new Hono()
  // Get the current dashboard data
  .get("/", (c) => {
    return c.json(initialDashboard);
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
    (c) => {
      const { taskId, sourceCol, destCol, destIndex } = c.req.valid("json");

      const sourceColumn = initialDashboard[sourceCol];
      const destColumn = initialDashboard[destCol];

      if (!sourceColumn || !destColumn) {
        return c.json({ error: "Invalid source or destination column" }, 400);
      }

      // Find and remove the task from the source column
      const taskIndex = sourceColumn.tasks.findIndex((task) => task.id === taskId);
      if (taskIndex === -1) {
        return c.json({ error: "Task not found in source column" }, 400);
      }
      const [movedTask] = sourceColumn.tasks.splice(taskIndex, 1);

      // Add the task to the destination column at the specified index
      destColumn.tasks.splice(destIndex, 0, movedTask);

      return c.json({ success: true, updatedDashboard: initialDashboard });
    }
  );
