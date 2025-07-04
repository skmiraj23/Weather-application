import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './weather.css';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import 'dotenv/config'

const Weather = () => {
  const [darkMode, setDarkMode] = useState(false);  // Start with dark mode
  const [current, setCurrent] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [hourly, setHourly] = useState([]);
  const [loc, setLoc] = useState('');
  const [status, setStatus] = useState('');

  const API_KEY = process.env.API_KEY;

  const getWeather = async (city) => {
    try {
      const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`);
      setCurrent(res.data);

      const forecastRes = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}`);
      const daily = forecastRes.data.list.filter((_, i) => i % 8 === 0);
      const hourlyData = forecastRes.data.list.slice(0, 6);

      setForecast(daily);
      setHourly(hourlyData);
      setStatus('');
    } catch (err) {
      setStatus('City not found.');
      setCurrent(null);
      setForecast([]);
      setHourly([]);
    }
  };

  useEffect(() => {
    getWeather('London');
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loc.trim()) {
      getWeather(loc);
      setLoc('');
    }
  };

  return (
    <div className={`weather-app ${darkMode ? 'dark' : 'light'}`}>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Enter Location..."
          value={loc}
          onChange={(e) => setLoc(e.target.value)}
        />
        <button onClick={handleSubmit}>Search</button>
        <button onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>

      {current && (
        <div className="grid">
          <div className="card gradient">
            <h2>{current.name}, {current.sys.country}</h2>
            <h3>{current.weather[0].main}</h3>
            <h1>{(current.main.temp - 273.15).toFixed(1)}°C</h1>
          </div>
          <div className="card glass">
            <h3>Feels Like</h3>
            <p>{(current.main.feels_like - 273.15).toFixed(1)}°C</p>
          </div>
          <div className="card glass">
            <h3>Humidity</h3>
            <p>{current.main.humidity}%</p>
          </div>
          <div className="card glass">
            <h3>Wind Speed</h3>
            <p>{current.wind.speed} m/s</p>
          </div>
        </div>
      )}

      <h3 className="section-title">Hourly Forecast</h3>
      <div className="forecast-grid">
        {hourly.map((h, i) => (
          <div className="card small" key={i}>
            <h4>{new Date(h.dt_txt).getHours()}:00</h4>
            <img src={`https://openweathermap.org/img/wn/${h.weather[0].icon}.png`} alt="icon" />
            <p>{(h.main.temp - 273.15).toFixed(1)}°C</p>
          </div>
        ))}
      </div>

      <div className="chart-section">
        <div className="chart-card">
          <h4>Next Hours Temperature</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={hourly.map(h => ({
              time: `${new Date(h.dt_txt).getHours()}:00`,
              temp: (h.main.temp - 273.15).toFixed(1)
            }))}>
              <XAxis dataKey="time" />
              <Tooltip />
              <Line type="monotone" dataKey="temp" stroke="#ff7b00" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h4>5-Day Temperature Trend</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={forecast.map(f => ({
              date: new Date(f.dt_txt).toLocaleDateString(),
              temp: (f.main.temp - 273.15).toFixed(1)
            }))}>
              <XAxis dataKey="date" />
              <Tooltip />
              <Line type="monotone" dataKey="temp" stroke="#ffb347" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {status && <h4 className="error">{status}</h4>}
    </div>
  );
};

export default Weather;
