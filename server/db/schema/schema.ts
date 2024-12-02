import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({autoIncrement: true}), 
  username: text("username").notNull(),
  email: text("email").notNull().unique(),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const jobs = sqliteTable("jobs", {
  id: integer("id").primaryKey({autoIncrement: true}), 
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  company: text("company").notNull(),
  description: text("description"),
  status: text("status").notNull(),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});
