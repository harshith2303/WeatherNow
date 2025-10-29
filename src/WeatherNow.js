import './App.css';
import React, { useState } from "react";

const SearchBar = ({ onSearch }) => {
  const [city, setCity] = useState("");

  const handleSearch = () => {
    if (city.trim()) {
      onSearch(city.trim());
    }
  };

  return (
    <div
      style={{ marginBottom: "20px", display: "flex", alignItems: "center" }}
    >
      <input
        type="text"
        placeholder="Enter city name"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        style={{
          padding: "10px",
          fontSize: "16px",
          borderRadius: "4px",
          border: "1px solid #ccc",
          width: "250px",
        }}
      />
      <button
        onClick={handleSearch}
        style={{
          padding: "10px 20px",
          marginLeft: "10px",
          fontSize: "16px",
          borderRadius: "4px",
          border: "none",
          backgroundColor: "#007bff",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        Search
      </button>
    </div>
  );
};

const WeatherCard = ({ title, data }) => (
  <div
    style={{
      flex: "1 1 200px",
      border: "1px solid #ddd",
      borderRadius: "8px",
      padding: "15px",
      margin: "10px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      backgroundColor: "#fafafa",
    }}
  >
    <h4 style={{ marginBottom: "10px", color: "#333" }}>{title}</h4>
    <p style={{ fontSize: "18px", fontWeight: "bold", margin: 0 }}>{data}</p>
  </div>
);

const WeatherDisplay = ({ city, onFetchComplete }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchCoordinates = async (cityName) => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        cityName
      )}`
    );
    const data = await response.json();
    if (data.length === 0) throw new Error("City not found");
    const { lat, lon } = data[0];
    return { lat, lon };
  };

  const fetchWeather = async () => {
    setLoading(true);
    setError("");
    setWeatherData(null);
    try {
      const { lat, lon } = await fetchCoordinates(city);
      const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,soil_temperature_6cm,soil_moisture_1_to_3cm`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (!data || !data.hourly) throw new Error("Weather data unavailable");
      setWeatherData(data.hourly);
      onFetchComplete();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getParameterData = (parameter) => {
    if (!weatherData || !weatherData[parameter]) return "N/A";
    return weatherData[parameter].slice(0, 5).join(", ");
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <button
        onClick={fetchWeather}
        disabled={loading}
        style={{
          padding: "12px 24px",
          fontSize: "16px",
          borderRadius: "4px",
          border: "none",
          backgroundColor: "#28a745",
          color: "#fff",
          cursor: "pointer",
          marginBottom: "20px",
        }}
      >
        {loading ? "Loading..." : `Check Weather in ${city} (7-day forecast)`}
      </button>

      {error && (
        <p style={{ color: "red", marginBottom: "20px" }}>Error: {error}</p>
      )}

      {weatherData && !loading && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          <WeatherCard
            title="Temperature (°C)"
            data={getParameterData("temperature_2m")}
          />
          <WeatherCard
            title="Relative Humidity (%)"
            data={getParameterData("relative_humidity_2m")}
          />
          <WeatherCard
            title="Wind Speed (km/h)"
            data={getParameterData("wind_speed_10m")}
          />
          <WeatherCard
            title="Soil Temperature (°C)"
            data={getParameterData("soil_temperature_6cm")}
          />
          <WeatherCard
            title="Soil Moisture"
            data={getParameterData("soil_moisture_1_to_3cm")}
          />
        </div>
      )}
    </div>
  );
};

function App() {
  const [city, setCity] = useState("");
  const [hasFetched, setHasFetched] = useState(false);

  const handleSearch = (cityName) => {
    setCity(cityName);
    setHasFetched(false);
  };

  const handleFetchComplete = () => {
    setHasFetched(true);
  };

  return (
    <div
      style={{
        padding: "50px",
        maxWidth: "900px",
        margin: "0 auto",
        fontFamily: "Arial, sans-serif",
        textAlign: "center",
      }}
    >
      <h1 style={{ marginBottom: "20px" }}>Weather Now</h1>
      <SearchBar onSearch={handleSearch} />

      {city && !hasFetched && (
        <p style={{ fontStyle: "italic", marginBottom: "20px" }}>
          Click "Check Weather in {city}" button to fetch weather data.
        </p>
      )}

      {city && (
        <WeatherDisplay city={city} onFetchComplete={handleFetchComplete} />
      )}
    </div>
  );
}

export default App;
