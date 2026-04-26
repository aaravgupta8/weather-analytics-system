import csv
import os

CSV_PATH = os.path.join(os.path.dirname(__file__), "../data/weather_data.csv")
OUT_PATH = os.path.join(os.path.dirname(__file__), "seed_data.sql")

cities = {}
rows = []

with open(CSV_PATH, newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        city_name = row["city"].strip()
        if city_name not in cities:
            cities[city_name] = len(cities) + 1

        # Fix date from DD-MM-YYYY to YYYY-MM-DD
        date_parts = row["date"].strip().split("-")
        row["date"] = f"{date_parts[2]}-{date_parts[1]}-{date_parts[0]}"

        rows.append(row)

with open(OUT_PATH, "w", encoding="utf-8") as out:
    out.write("USE railway;\n\n")

    out.write("INSERT INTO city (city_id, city_name) VALUES\n")
    city_values = [f"  ({cid}, '{cname}')" for cname, cid in sorted(cities.items(), key=lambda x: x[1])]
    out.write(",\n".join(city_values) + "\nON DUPLICATE KEY UPDATE city_name=VALUES(city_name);\n\n")

    batch_size = 500
    batch = []

    def flush(batch):
        out.write(
            "INSERT INTO daily_weather "
            "(date, temperature_2m_max, temperature_2m_min, apparent_temperature_max, "
            "apparent_temperature_min, precipitation_sum, rain_sum, weather_code, "
            "wind_speed_10m_max, wind_gusts_10m_max, wind_direction_10m_dominant, city_id) VALUES\n"
        )
        out.write(",\n".join(batch) + ";\n")

    for row in rows:
        city_id = cities[row["city"].strip()]
        val = (
            f"  ('{row['date']}', "
            f"{row['temperature_2m_max'] or 'NULL'}, "
            f"{row['temperature_2m_min'] or 'NULL'}, "
            f"{row['apparent_temperature_max'] or 'NULL'}, "
            f"{row['apparent_temperature_min'] or 'NULL'}, "
            f"{row['precipitation_sum'] or 'NULL'}, "
            f"{row['rain_sum'] or 'NULL'}, "
            f"'{row['weather_code']}', "
            f"{row['wind_speed_10m_max'] or 'NULL'}, "
            f"{row['wind_gusts_10m_max'] or 'NULL'}, "
            f"'{row['wind_direction_10m_dominant']}', "
            f"{city_id})"
        )
        batch.append(val)
        if len(batch) == batch_size:
            flush(batch)
            batch = []

    if batch:
        flush(batch)

print(f"Done! {len(rows)} rows, {len(cities)} cities.")