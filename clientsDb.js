const { DatabaseSync } = require('node:sqlite');
const fs = require('node:fs');
const crypto = require('node:crypto');
const config = require('../config');

let db = null;

function getDb() {
  if (!db) {
    db = new DatabaseSync(config.DB_PATHS.clients);
  }
  return db;
}

function init() {
  const database = getDb();
  if (fs.existsSync(config.SQL_PATHS.clients)) {
    const schemaSql = fs.readFileSync(config.SQL_PATHS.clients, 'utf-8');
    database.exec(schemaSql);
  }
  return database;
}

function createClient({ firstName, lastName, email, flightNumber, flightDate, language = 'en', ip = '', userAgent = '' }) {
  const database = getDb();
  const uuid = crypto.randomUUID();
  const now = new Date().toISOString();

  const stmt = database.prepare(`
    INSERT INTO clients (
      uuid, first_name, last_name, email, flight_number, flight_date, language, ip_address, user_agent, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);

  stmt.run(
    uuid,
    firstName.trim(),
    lastName.trim(),
    email.trim().toLowerCase(),
    flightNumber.trim().toUpperCase(),
    flightDate.trim(),
    language,
    ip,
    userAgent,
    now,
    now
  );

  return getClientByUuid(uuid);
}

function getClientByUuid(uuid) {
  const database = getDb();
  const stmt = database.prepare('SELECT * FROM clients WHERE uuid = ?');
  return stmt.get(uuid);
}

function getAllClients(limit = 100) {
  const database = getDb();
  const stmt = database.prepare('SELECT * FROM clients ORDER BY id DESC LIMIT ?');
  return stmt.all(limit);
}

module.exports = {
  getDb,
  init,
  createClient,
  getClientByUuid,
  getAllClients
};
