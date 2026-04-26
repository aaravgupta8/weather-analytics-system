// db.js — MySQL connection using mysql2 + connection pool
// A pool reuses connections instead of creating a new one for each query (more efficient)

const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "dailyweatherdb",
  port: process.env.DB_PORT || 3306,  // add this
  waitForConnections: true,
  connectionLimit: 10,   // max 10 simultaneous connections
  queueLimit: 0,
});

// .promise() lets us use async/await instead of callbacks
module.exports = pool.promise();
