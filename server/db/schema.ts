import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const jobs = sqliteTable("jobs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  description: text("description"),
  status: text("status").notNull(),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});