import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import { jobs } from './schema'; // 引用 jobs 資料表


const sqlite = new Database('./server/db/sqlite.db');
export const db = drizzle(sqlite);

console.log('SQLite connection initialized!');

// 如果需要清空資料表，取消註解以下行
// clearDatabase();


export { jobs };

