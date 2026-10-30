-- ====================================================================
-- DATABASE 1: CLIENTS DATABASE (clients.db)
-- Stores passenger / client registration information for SkyQ.com
-- ====================================================================

CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    flight_number TEXT NOT NULL,
    flight_date TEXT NOT NULL,
    language TEXT DEFAULT 'en',
    ip_address TEXT,
    user_agent TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_clients_uuid ON clients(uuid);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_flight ON clients(flight_number, flight_date);
