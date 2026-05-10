import Database from 'better-sqlite3';
import path from 'path';

const db = new Database('database.sqlite');

// Initialize Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'customer',
    isAdmin BOOLEAN DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS cars (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price INTEGER NOT NULL,
    transmission TEXT NOT NULL,
    isDriverIncluded BOOLEAN DEFAULT 0,
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
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(userId) REFERENCES users(id),
    FOREIGN KEY(carId) REFERENCES cars(id)
  );
`);

export default db;
