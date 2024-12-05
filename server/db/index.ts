import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import { jobs } from './schema'; 


const sqlite = new Database('./server/db/sqlite.db');
export const db = drizzle(sqlite);

console.log('SQLite connection initialized!');



export { jobs };

