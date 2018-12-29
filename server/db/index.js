const { Pool } = require('pg');
const dotenv = require('dotenv');
const { ENV } = require('../../constants');

const { PRODUCTION, TEST } = ENV;
const ENVIRONMENT = process.env.NODE_ENV;

dotenv.config();

let connectionString;

switch (ENVIRONMENT) {
  case PRODUCTION:
    connectionString = process.env.PRO_DB_URI;
    break;
  case TEST:
    connectionString = process.env.TEST_DB_URI;
    break;
  default:
    connectionString = process.env.DEV_DB_URI;
    break;
}

const pool = new Pool({ connectionString });

module.exports = pool;
