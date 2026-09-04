// Weather API helpers

const API_KEY = "YOUR_API_KEY"; // Replace with your actual API key
const BASE_URL = "https://api.openweathermap.org/data/2.5/";

async function fetchWeatherData(city) {
  try {
    const response = await fetch(
      `${BASE_URL}weather?q=${city}&appid=${API_KEY}&units=metric`,
    );
    if (!response.ok) {
      throw new Error("Failed to fetch weather data");
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function fetchForecastData(city) {
  try {
    const response = await fetch(
      `${BASE_URL}forecast?q=${city}&appid=${API_KEY}&units=metric`,
    );
    if (!response.ok) {
      throw new Error("Failed to fetch forecast data");
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function fetchWeatherByGeolocation(lat, lon) {
  try {
    const response = await fetch(
      `${BASE_URL}weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`,
    );
    if (!response.ok) {
      throw new Error("Failed to fetch weather data by geolocation");
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export { fetchWeatherData, fetchForecastData, fetchWeatherByGeolocation };
