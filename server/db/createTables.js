const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const client = new Client(process.env.DEV_DB_URI);

const createTables = `
  DROP TABLE IF EXISTS users CASCADE;
  DROP TABLE IF EXISTS todos;
  CREATE TABLE users(id UUID PRIMARY KEY, username VARCHAR(50) UNIQUE NOT NULL, email VARCHAR(320) UNIQUE NOT NULL, password VARCHAR(4000) NOT NULL, registration_date TIMESTAMPTZ NOT NULL DEFAULT NOW());
  CREATE TABLE todos(id UUID PRIMARY KEY, user_id UUID REFERENCES users(id) ON DELETE CASCADE, name TEXT NOT NULL, done BOOLEAN NOT NULL DEFAULT FALSE, creation_date TIMESTAMPTZ NOT NULL DEFAULT NOW());
`;

client.connect();

client.query(createTables)
  .catch((error) => {
    throw error.stack;
  })
  .then(() => client.end());
