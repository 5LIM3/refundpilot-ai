const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'store.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  approvedRefundsLast90Days INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customerId TEXT NOT NULL,
  item TEXT NOT NULL,
  amount REAL NOT NULL,
  deliveredAt TEXT NOT NULL,
  finalSale INTEGER DEFAULT 0,
  opened INTEGER DEFAULT 0,
  FOREIGN KEY (customerId) REFERENCES customers(id)
);

CREATE TABLE IF NOT EXISTS refund_requests (
  id TEXT PRIMARY KEY,
  customerId TEXT NOT NULL,
  orderId TEXT NOT NULL,
  reason TEXT NOT NULL,
  message TEXT NOT NULL,
  decision TEXT NOT NULL,
  policyReasons TEXT NOT NULL,
  aiSummary TEXT,
  aiFlags TEXT,
  createdAt TEXT NOT NULL
);
`);

module.exports = db;
