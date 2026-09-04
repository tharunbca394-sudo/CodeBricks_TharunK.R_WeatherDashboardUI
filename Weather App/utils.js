// Utility functions for the Weather App

// Function to format the date
export function formatDate(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Function to convert temperature from Kelvin to Celsius
export function kelvinToCelsius(kelvin) {
  return Math.round(kelvin - 273.15);
}

// Function to convert temperature from Kelvin to Fahrenheit
export function kelvinToFahrenheit(kelvin) {
  return Math.round(((kelvin - 273.15) * 9) / 5 + 32);
}

// Function to handle API errors
export function handleApiError(error) {
  console.error("API Error:", error);
  alert(
    "There was an error fetching the weather data. Please try again later.",
  );
}

// Function to get a random background image based on weather condition
export function getBackgroundImage(condition) {
  const images = {
    clear: "none",
    cloudy: "none",
    rainy: "none",
    snowy: "none",
    // Add more conditions and corresponding images as needed
  };
  return images[condition] || images.clear; // Default to clear if condition not found
}

// Function to format wind speed
export function formatWindSpeed(speed) {
  return `${Math.round(speed)} m/s`;
}

// Function to format humidity
export function formatHumidity(humidity) {
  return `${humidity}%`;
}

// Function to validate city name input
export function isValidCityName(city) {
  return city && city.trim().length > 0;
}
