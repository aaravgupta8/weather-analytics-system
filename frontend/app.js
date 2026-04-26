const API = "weather-analytics-system-production.up.railway.app";

// ─── On Page Load ─────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  loadCities();
});

// ─── Load Cities ─────────────────────────────────────────────
async function loadCities() {
  try {
    const res = await fetch(`${API}/cities`);
    const cities = await res.json();

    const selectFilter = document.getElementById("citySelect");
    const selectAdd = document.getElementById("addCity");

    cities.forEach(city => {
      const opt1 = document.createElement("option");
      opt1.value = city.city_id;
      opt1.textContent = city.city_name;
      selectFilter.appendChild(opt1);

      const opt2 = document.createElement("option");
      opt2.value = city.city_id;
      opt2.textContent = city.city_name;
      selectAdd.appendChild(opt2);
    });
  } catch (err) {
    showToast("Could not connect to server. Is the backend running?", "error");
  }
}

// ─── Fetch Weather ─────────────────────────────────────────────
async function fetchWeather() {
  const city_id  = document.getElementById("citySelect").value;
  const start    = document.getElementById("startDate").value;
  const end      = document.getElementById("endDate").value;
  const limit    = document.getElementById("limitSelect").value;

  const params = new URLSearchParams();
  if (city_id) params.append("city_id", city_id);
  if (start) params.append("start_date", start);
  if (end) params.append("end_date", end);
  if (limit) params.append("limit", limit);

  const tableSection = document.getElementById("tableSection");
  const tbody = document.getElementById("weatherTableBody");

  tableSection.style.display = "block";
  tbody.innerHTML = `<tr><td colspan="13" class="loading">⏳ Loading weather data...</td></tr>`;

  try {
    const res = await fetch(`${API}/weather?${params}`);
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Server error");

    document.getElementById("recordCount").textContent = `${data.length} record(s)`;

    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="13" class="loading">No data found.</td></tr>`;
      return;
    }

    tbody.innerHTML = data.map(row => `
      <tr>
        <td>${row.weather_id}</td>
        <td>${row.date?.substring(0, 10)}</td>
        <td class="city-cell">${row.city_name}</td>
        <td class="temp-hot">${row.temperature_2m_max ?? "—"}°</td>
        <td class="temp-cold">${row.temperature_2m_min ?? "—"}°</td>
        <td>${row.apparent_temperature_max ?? "—"}°</td>
        <td>${row.apparent_temperature_min ?? "—"}°</td>
        <td>${row.precipitation_sum ?? "—"}</td>
        <td class="rain-cell">${row.rain_sum ?? "—"}</td>
        <td>${row.wind_speed_10m_max ?? "—"}</td>
        <td>${row.wind_gusts_10m_max ?? "—"}</td>
        <td>${row.wind_direction_10m_dominant ?? "—"}</td>
        <td>
          <button class="btn-delete" onclick="deleteRecord(${row.weather_id}, this)">✕</button>
        </td>
      </tr>
    `).join("");

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="13" class="loading" style="color:var(--red)">Error: ${err.message}</td></tr>`;
    showToast(err.message, "error");
  }
}

// ─── Analytics ─────────────────────────────────────────────
async function fetchAnalytics() {
  const city_id = document.getElementById("citySelect").value;
  const start   = document.getElementById("startDate").value;
  const end     = document.getElementById("endDate").value;

  const params = new URLSearchParams();
  if (city_id) params.append("city_id", city_id);
  if (start) params.append("start_date", start);
  if (end) params.append("end_date", end);

  const section = document.getElementById("analyticsSection");
  const cardsDiv = document.getElementById("analyticsCards");

  section.style.display = "block";
  cardsDiv.innerHTML = `<div class="loading">⏳ Loading analytics...</div>`;

  try {
    const res = await fetch(`${API}/analytics?${params}`);
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Server error");

    if (data.length === 0) {
      cardsDiv.innerHTML = `<div class="loading">No analytics data found.</div>`;
      return;
    }

    cardsDiv.innerHTML = data.map(row => `
      <div class="city-card">
        <h3>${row.city_name}</h3>
        <div class="stat-row"><span>Records</span><span>${row.total_records}</span></div>
        <div class="stat-row"><span>Avg Temp</span><span>${row.avg_temp}</span></div>
        <div class="stat-row"><span>Max Temp</span><span>${row.max_temp}</span></div>
        <div class="stat-row"><span>Min Temp</span><span>${row.min_temp}</span></div>
        <div class="stat-row"><span>Rainfall</span><span>${row.total_rainfall}</span></div>
      </div>
    `).join("");

  } catch (err) {
    cardsDiv.innerHTML = `<div class="loading">Error loading analytics</div>`;
  }
}

// ─── Add Record ─────────────────────────────────────────────
async function addRecord() {
  const payload = {
    city_id: document.getElementById("addCity").value,
    date: document.getElementById("addDate").value,
    temperature_2m_max: document.getElementById("addTempMax").value,
    temperature_2m_min: document.getElementById("addTempMin").value,
    apparent_temperature_max: document.getElementById("addApparentMax").value,
    apparent_temperature_min: document.getElementById("addApparentMin").value,
    precipitation_sum: document.getElementById("addPrecip").value,
    rain_sum: document.getElementById("addRain").value,
    wind_speed_10m_max: document.getElementById("addWind").value,
    wind_gusts_10m_max: document.getElementById("addGust").value,
    wind_direction_10m_dominant: document.getElementById("addWindDir").value,
  };

  if (!payload.date || !payload.city_id) {
    showToast("Date and City are required!", "error");
    return;
  }

  try {
    const res = await fetch(`${API}/weather`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to add");

    showToast(`Record added successfully!`, "success");

    // removed addCode from clearing list
    ["addDate","addTempMax","addTempMin","addApparentMax","addApparentMin",
     "addPrecip","addRain","addWind","addGust","addWindDir"].forEach(id => {
      document.getElementById(id).value = "";
    });

  } catch (err) {
    showToast(`Error: ${err.message}`, "error");
  }
}

// ─── Delete ─────────────────────────────────────────────
async function deleteRecord(id, btnEl) {
  if (!confirm(`Delete record ID ${id}?`)) return;

  try {
    await fetch(`${API}/weather/${id}`, { method: "DELETE" });

    const row = btnEl.closest("tr");
    row.remove();

    showToast(`Deleted`, "success");

  } catch (err) {
    showToast(`Error deleting`, "error");
  }
}

// ─── Reset ─────────────────────────────────────────────
function resetFilters() {
  document.getElementById("citySelect").value = "";
  document.getElementById("startDate").value = "2023-01-01";
  document.getElementById("endDate").value = "2023-12-31";
  document.getElementById("limitSelect").value = "100";
  document.getElementById("tableSection").style.display = "none";
  document.getElementById("analyticsSection").style.display = "none";
}

// ─── Toast ─────────────────────────────────────────────
let toastTimer;
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `toast show ${type}`;

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.className = "toast";
  }, 3500);
}