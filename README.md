# Job Application Tracker
This application is a drag-and-drop job management tool for tracking job applications. Users can add, edit, delete, and move jobs between columns such as "Applied," "Interview," "Offered," and "Rejected." The backend is built using Hono, Drizzle ORM, and SQLite, while the frontend uses React with react-beautiful-dnd for drag-and-drop functionality.

To install dependencies:

```bash
bun install
```

To run:

```bash
bun dev
```

This project was created using `bun init` in bun v1.1.36. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## Features

1. **Authentication**
   - Authenticated users can access the dashboard.
   - User authentication is handled via Kinde.

2. **Job Management**
   - Add new jobs with details such as title, company, section (status), and description.
   - Edit job details and update their status.
   - Delete jobs directly from the modal.
   - Drag and drop jobs between different sections.

3. **Backend API**
   - Fetch dashboard data.
   - Add a new job to the database.
   - Update job status and position.
   - Delete a job.

4. **Frontend**
   - Dynamic drag-and-drop interface with `react-beautiful-dnd`.
   - Modal for adding and editing jobs.
   - Fully responsive design.
## Tech Stack

### Backend
- **Framework:** [Hono](https://hono.dev)
- **Database:** SQLite with [Drizzle ORM](https://drizzle.team)
- **Authentication:** Kinde
- **Validation:** `zod` with `@hono/zod-validator`

### Frontend
- **Framework:** React with `@tanstack/react-router`
- **Drag-and-Drop:** `react-beautiful-dnd`
- **State Management:** React hooks
- **HTTP Client:** Axios


