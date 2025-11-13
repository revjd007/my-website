const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '../data/chatplatform.db');

let db;

function initDatabase() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }
      console.log('Connected to SQLite database');
      createTables().then(resolve).catch(reject);
    });
  });
}

function createTables() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT,
        role TEXT DEFAULT 'user',
        avatar TEXT,
        status TEXT DEFAULT 'offline',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Servers table
      db.run(`CREATE TABLE IF NOT EXISTS servers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        ownerId INTEGER NOT NULL,
        icon TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ownerId) REFERENCES users(id)
      )`);

      // Channels table
      db.run(`CREATE TABLE IF NOT EXISTS channels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        serverId INTEGER NOT NULL,
        name TEXT NOT NULL,
        type TEXT DEFAULT 'text',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (serverId) REFERENCES servers(id)
      )`);

      // Messages table
      db.run(`CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        channelId INTEGER,
        dmId INTEGER,
        userId INTEGER NOT NULL,
        content TEXT NOT NULL,
        type TEXT DEFAULT 'text',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (channelId) REFERENCES channels(id)
      )`);

      // Direct Messages table
      db.run(`CREATE TABLE IF NOT EXISTS direct_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user1Id INTEGER NOT NULL,
        user2Id INTEGER NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user1Id) REFERENCES users(id),
        FOREIGN KEY (user2Id) REFERENCES users(id),
        UNIQUE(user1Id, user2Id)
      )`);

      // Server Members table
      db.run(`CREATE TABLE IF NOT EXISTS server_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        serverId INTEGER NOT NULL,
        userId INTEGER NOT NULL,
        joinedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (serverId) REFERENCES servers(id),
        FOREIGN KEY (userId) REFERENCES users(id),
        UNIQUE(serverId, userId)
      )`);

      db.run(`PRAGMA foreign_keys = ON`, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });
}

function getDb() {
  return db;
}

module.exports = { initDatabase, getDb };

