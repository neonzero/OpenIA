const { Pool } = require('pg');

let pool;

function createPool(overrides = {}) {
  if (pool) {
    return pool;
  }

  const {
    connectionString = process.env.DATABASE_URL,
    host = process.env.PGHOST || 'localhost',
    port = process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
    database = process.env.PGDATABASE || 'openia',
    user = process.env.PGUSER || 'postgres',
    password = process.env.PGPASSWORD || 'postgres',
    max = 10
  } = overrides;

  pool = new Pool(
    connectionString
      ? { connectionString, max }
      : { host, port, database, user, password, max }
  );

  return pool;
}

module.exports = { createPool };
