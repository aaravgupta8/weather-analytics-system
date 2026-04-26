-- Remove these two lines if present:
-- CREATE DATABASE IF NOT EXISTS weather_db;
-- USE weather_db;

CREATE TABLE IF NOT EXISTS city (
    city_id INT AUTO_INCREMENT PRIMARY KEY,
    city_name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS daily_weather (
    weather_id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    temperature_2m_max FLOAT,
    temperature_2m_min FLOAT,
    apparent_temperature_max FLOAT,
    apparent_temperature_min FLOAT,
    precipitation_sum FLOAT,
    rain_sum FLOAT,
    weather_code VARCHAR(10),
    wind_speed_10m_max FLOAT,
    wind_gusts_10m_max FLOAT,
    wind_direction_10m_dominant VARCHAR(10),
    city_id INT,
    FOREIGN KEY (city_id) REFERENCES city(city_id) ON DELETE CASCADE
);