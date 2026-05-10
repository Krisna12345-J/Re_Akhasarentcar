import Database from 'better-sqlite3';
import path from 'path';
import pg from 'pg';

const { Pool } = pg;

let db: any;
let isPostgres = false;

if (process.env.POSTGRES_URL) {
  db = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
  isPostgres = true;
  console.log('Using Postgres Database');
} else {
  const dbPath = process.env.NODE_ENV === 'production' 
    ? path.join('/tmp', 'database.sqlite') 
    : 'database.sqlite';
  db = new Database(dbPath);
  console.log('Using SQLite Database');
}

// Initialize Schema
const initSchema = async () => {
  const schema = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone TEXT,
      role TEXT DEFAULT 'customer',
      isAdmin BOOLEAN DEFAULT ${isPostgres ? 'FALSE' : '0'},
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cars (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price INTEGER NOT NULL,
      transmission TEXT NOT NULL,
      isDriverIncluded BOOLEAN DEFAULT ${isPostgres ? 'FALSE' : '0'},
      status TEXT DEFAULT 'tersedia'
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      userId TEXT,
      userName TEXT,
      userPhone TEXT,
      carId TEXT,
      startDate TEXT,
      endDate TEXT,
      totalPrice INTEGER,
      status TEXT DEFAULT 'menunggu',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  if (isPostgres) {
    await db.query(schema);
  } else {
    db.exec(schema);
  }
};

initSchema().catch(console.error);

// ... (existing imports)

export const query = async (text: string, params: any[] = []) => {
  if (isPostgres) {
    const res = await db.query(text, params);
    return res.rows;
  } else {
    // Convert Postgres $1, $2 to SQLite ?
    const sqliteText = text.replace(/\$(\d+)/g, '?');
    return db.prepare(sqliteText).all(...params);
  }
};

export const getOne = async (text: string, params: any[] = []) => {
  if (isPostgres) {
    const res = await db.query(text, params);
    return res.rows[0];
  } else {
    const sqliteText = text.replace(/\$(\d+)/g, '?');
    return db.prepare(sqliteText).get(...params);
  }
};

export const execute = async (text: string, params: any[] = []) => {
  if (isPostgres) {
    return db.query(text, params);
  } else {
    const sqliteText = text.replace(/\$(\d+)/g, '?');
    return db.prepare(sqliteText).run(...params);
  }
};

export default db;
export { isPostgres };
