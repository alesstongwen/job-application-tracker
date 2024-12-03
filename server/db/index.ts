import { drizzle } from "drizzle-orm/better-sqlite3";
import sqlite3 from "sqlite3";
import { jobs } from "./schema";

// Initialize SQLite database connection
const sqlite = new sqlite3.Database("./server/db/sqlite.db");
export const db = drizzle(sqlite); 

export { jobs };

