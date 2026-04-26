# ⛅ India Daily Weather Analytics System
### DBMS Mini Project | MySQL + Node.js + HTML/CSS/JS

🔗 **Live Demo**: https://weather-analytics-system-production.up.railway.app

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express |
| Database | MySQL (hosted on Railway) |
| Deployment | Railway |

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
├── database/
│   ├── schema.sql         ← CREATE TABLE statements
│   └── import_data.py     ← Generates seed SQL from CSV dataset
├── railway.json           ← Railway deployment config
└── package.json           ← Root package.json for Railway
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js v16+
- MySQL v8+
- Python 3

### Step 1 — Clone the repo
```bash
git clone https://github.com/aaravgupta8/weather-analytics-system.git
cd weather-analytics-system
```

### Step 2 — Create the Database
```bash
mysql -u root -p
```
```sql
source database/schema.sql
```

### Step 3 — Import the Dataset
Place the CSV at `data/weather_data.csv` then:
```bash
python database/import_data.py
mysql -u root -p weather_db < database/seed_data.sql
```

### Step 4 — Configure Environment
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

### Step 5 — Install & Run
```bash
cd backend
npm install
npm start
```
Open **http://localhost:3000**

---

## 🔌 REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/cities` | List all cities |
| GET | `/weather` | Fetch weather records (filterable) |
| GET | `/analytics` | Aggregated analytics per city |
| POST | `/weather` | Add a new weather record |
| DELETE | `/weather/:id` | Delete a record by ID |

### Query Parameters (`/weather`, `/analytics`)
- `city_id` — filter by city
- `start_date` — e.g. `2023-01-01`
- `end_date` — e.g. `2023-12-31`
- `limit` — max rows returned (default: 100, `/weather` only)

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

---

## ☁️ Deployment (Railway)

- Backend + MySQL both hosted on [Railway](https://railway.app)
- Auto-deploys on every `git push` to main
- Environment variables configured in Railway dashboard
