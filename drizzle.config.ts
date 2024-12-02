import { defineConfig } from "drizzle-kit";

export default defineConfig({
    dialect: "sqlite",
    schema: "./server/db/schema",
    out: "./server/db/migrations",
    dbCredentials: {
        url: "./server/db/sqlite.db",
  },
});


