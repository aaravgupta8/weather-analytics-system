// server.js — Main Express server for Daily Weather Analytics System
// Runs on http://localhost:3000 by default

const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const db = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());                          // Allow cross-origin requests (frontend <-> backend)
app.use(express.json());                  // Parse JSON request bodies
app.use(express.static(path.join(__dirname, "../frontend"))); // Serve frontend files

// ─── Route: GET /cities ────────────────────────────────────────────────────────
// Returns all cities from the city table
app.get("/cities", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM city ORDER BY city_name");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching cities:", err);
    res.status(500).json({ error: "Failed to fetch cities" });
  }
});

// ─── Route: GET /weather ──────────────────────────────────────────────────────
// Returns weather records with JOIN on city table
// Query params: city_id, start_date, end_date, limit (default 100)
app.get("/weather", async (req, res) => {
  const { city_id, start_date, end_date, limit = 100 } = req.query;

  // Build query dynamically based on provided filters
  let query = `
    SELECT 
      dw.weather_id,
      dw.date,
      c.city_name,
      dw.temperature_2m_max,
      dw.temperature_2m_min,
      dw.apparent_temperature_max,
      dw.apparent_temperature_min,
      dw.precipitation_sum,
      dw.rain_sum,
      dw.wind_speed_10m_max,
      dw.wind_gusts_10m_max,
      dw.wind_direction_10m_dominant
    FROM daily_weather dw
    JOIN city c ON dw.city_id = c.city_id
    WHERE 1=1
  `;

  const params = [];

  if (city_id) {
    query += " AND dw.city_id = ?";
    params.push(city_id);
  }
  if (start_date) {
    query += " AND dw.date >= ?";
    params.push(start_date);
  }
  if (end_date) {
    query += " AND dw.date <= ?";
    params.push(end_date);
  }

  query += " ORDER BY dw.date DESC LIMIT ?";
  params.push(parseInt(limit));

  try {
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching weather:", err);
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

// ─── Route: GET /analytics ────────────────────────────────────────────────────
// Returns aggregated analytics: avg/max/min temp and total rainfall
// Query params: city_id, start_date, end_date
app.get("/analytics", async (req, res) => {
  const { city_id, start_date, end_date } = req.query;

  // Main aggregation query using GROUP BY city
  let query = `
    SELECT 
      c.city_name,
      COUNT(dw.weather_id)                      AS total_records,
      ROUND(AVG(dw.temperature_2m_max), 2)      AS avg_temp_max,
      ROUND(AVG(dw.temperature_2m_min), 2)      AS avg_temp_min,
      ROUND((AVG(dw.temperature_2m_max) + AVG(dw.temperature_2m_min)) / 2, 2) AS avg_temp,
      ROUND(MAX(dw.temperature_2m_max), 2)      AS max_temp,
      ROUND(MIN(dw.temperature_2m_min), 2)      AS min_temp,
      ROUND(SUM(dw.rain_sum), 2)                AS total_rainfall,
      ROUND(AVG(dw.wind_speed_10m_max), 2)      AS avg_wind_speed
    FROM daily_weather dw
    JOIN city c ON dw.city_id = c.city_id
    WHERE 1=1
  `;

  const params = [];

  if (city_id) {
    query += " AND dw.city_id = ?";
    params.push(city_id);
  }
  if (start_date) {
    query += " AND dw.date >= ?";
    params.push(start_date);
  }
  if (end_date) {
    query += " AND dw.date <= ?";
    params.push(end_date);
  }

  query += " GROUP BY c.city_id, c.city_name ORDER BY c.city_name";

  try {
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching analytics:", err);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

// ─── Route: POST /weather ─────────────────────────────────────────────────────
// Adds a new weather record
app.post("/weather", async (req, res) => {
  const {
    date,
    temperature_2m_max,
    temperature_2m_min,
    apparent_temperature_max,
    apparent_temperature_min,
    precipitation_sum,
    rain_sum,
    wind_speed_10m_max,
    wind_gusts_10m_max,
    wind_direction_10m_dominant,
    city_id,
  } = req.body;

  // Basic validation
  if (!date || !city_id) {
    return res.status(400).json({ error: "date and city_id are required" });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO daily_weather 
        (date, temperature_2m_max, temperature_2m_min, apparent_temperature_max,
         apparent_temperature_min, precipitation_sum, rain_sum,
         wind_speed_10m_max, wind_gusts_10m_max, wind_direction_10m_dominant, city_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        date,
        temperature_2m_max || null,
        temperature_2m_min || null,
        apparent_temperature_max || null,
        apparent_temperature_min || null,
        precipitation_sum || null,
        rain_sum || null,
        wind_speed_10m_max || null,
        wind_gusts_10m_max || null,
        wind_direction_10m_dominant || null,
        city_id,
      ]
    );
    res.status(201).json({ message: "Record added successfully", weather_id: result.insertId });
  } catch (err) {
    console.error("Error inserting weather:", err);
    res.status(500).json({ error: "Failed to add weather record" });
  }
});

// ─── Route: DELETE /weather/:id ───────────────────────────────────────────────
// Deletes a weather record by ID
app.delete("/weather/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query("DELETE FROM daily_weather WHERE weather_id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    res.json({ message: "Record deleted successfully" });
  } catch (err) {
    console.error("Error deleting record:", err);
    res.status(500).json({ error: "Failed to delete record" });
  }
});

// ─── Root route serves the frontend ──────────────────────────────────────────
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🌦  Weather Analytics Server running at http://localhost:${PORT}`);
  console.log(`   Press Ctrl+C to stop\n`);
});
