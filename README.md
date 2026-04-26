# ⛅ India Daily Weather Analytics System

A full-stack web application for exploring and analyzing daily weather data across 10 major Indian cities from 2000–2024.

Built as a DBMS Mini Project using **MySQL**, **Node.js/Express**, and **HTML/CSS/JS**.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express |
| Database | MySQL |

---

## 📁 Folder Structure

```
weather-app/
├── backend/
│   ├── server.js          ← Express server + all REST APIs
│   ├── db.js              ← MySQL connection pool
│   ├── package.json       ← Node.js dependencies
│   └── .env.example       ← Environment variables template
├── frontend/
│   ├── index.html         ← Main UI
│   ├── style.css          ← Stylesheet
│   └── app.js             ← API calls & UI logic
└── database/
    ├── schema.sql         ← CREATE TABLE statements
    └── import_data.py     ← Generates seed SQL from CSV dataset
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v16+
- MySQL v8+
- Python 3

---

### Step 1 — Create the Database

```bash
mysql -u root -p
```
```sql
source database/schema.sql
```

---

### Step 2 — Import the Dataset

Download the dataset CSV and place it at `data/weather_data.csv`, then:

```bash
python3 database/import_data.py
mysql -u root -p weather_db < database/seed_data.sql
```

> Inserts ~91,000 rows — may take 1–3 minutes.

---

### Step 3 — Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=weather_db
PORT=3000
```

---

### Step 4 — Install & Run

```bash
cd backend
npm install
npm start
```

Open **http://localhost:3000** in your browser.

---

## 🔌 REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/cities` | List all cities |
| GET | `/weather` | Fetch weather records (filterable) |
| GET | `/analytics` | Aggregated analytics per city |
| POST | `/weather` | Add a new weather record |
| DELETE | `/weather/:id` | Delete a record by ID |

### Supported Query Parameters (`/weather`, `/analytics`)
- `city_id` — filter by city
- `start_date` — e.g. `2023-01-01`
- `end_date` — e.g. `2023-12-31`
- `limit` — max rows returned (default: 100)

---

## ✨ Features

- 🏙️ City dropdown populated from database
- 📅 Date range filtering
- 🔗 SQL JOIN between `city` and `daily_weather` tables
- 📊 Analytics — avg/max/min temperature, total rainfall, avg wind speed
- ➕ Add new weather records via form
- 🗑️ Delete records with confirmation
- 📱 Responsive dark dashboard UI

---

## 🗃️ Dataset

- **Cities**: Delhi, Mumbai, Chennai, Bangalore, Kolkata, Hyderabad, Pune, Ahmedabad, Jaipur, Lucknow
- **Period**: 2000–2024 (daily records)
- **Total rows**: ~91,300
- **Source**: Open-Meteo Historical Weather API
