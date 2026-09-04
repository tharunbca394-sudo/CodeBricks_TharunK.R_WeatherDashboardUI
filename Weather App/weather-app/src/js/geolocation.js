// Geolocation functionality for the Weather App

// Check if Geolocation is supported
if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(success, error);
} else {
    alert("Geolocation is not supported by this browser.");
}

// Success callback function
function success(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    fetchWeatherData(latitude, longitude);
}

// Error callback function
function error() {
    alert("Unable to retrieve your location. Please enter a city manually.");
}

// Function to fetch weather data using latitude and longitude
function fetchWeatherData(lat, lon) {
    // Assuming there's a function in api.js to fetch weather data
    import { getWeatherByCoordinates } from './api.js';
    getWeatherByCoordinates(lat, lon)
        .then(data => {
            // Update UI with fetched weather data
            import { updateWeatherUI } from './ui.js';
            updateWeatherUI(data);
        })
        .catch(err => {
            console.error("Error fetching weather data:", err);
            alert("Failed to fetch weather data. Please try again.");
        });
}