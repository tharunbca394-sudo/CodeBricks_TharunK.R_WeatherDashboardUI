// ui.js - Manages the user interface updates for the Weather App

// Function to render current weather data
function renderCurrentWeather(data) {
    const weatherContainer = document.getElementById('current-weather');
    weatherContainer.innerHTML = `
        <h2>${data.name}, ${data.sys.country}</h2>
        <p>${Math.round(data.main.temp)}° ${getTemperatureUnit()}</p>
        <p>${data.weather[0].description}</p>
        <p>Humidity: ${data.main.humidity}%</p>
        <p>Wind Speed: ${data.wind.speed} m/s</p>
    `;
}

// Function to render 5-day weather forecast
function renderForecast(forecastData) {
    const forecastContainer = document.getElementById('forecast');
    forecastContainer.innerHTML = '';
    forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        forecastContainer.innerHTML += `
            <div class="forecast-item">
                <h3>${date.toLocaleDateString()}</h3>
                <p>${Math.round(item.main.temp)}° ${getTemperatureUnit()}</p>
                <p>${item.weather[0].description}</p>
            </div>
        `;
    });
}

// Function to display loading indicator
function showLoading() {
    const loadingIndicator = document.getElementById('loading');
    loadingIndicator.style.display = 'block';
}

// Function to hide loading indicator
function hideLoading() {
    const loadingIndicator = document.getElementById('loading');
    loadingIndicator.style.display = 'none';
}

// Function to display error messages
function showError(message) {
    const errorContainer = document.getElementById('error');
    errorContainer.innerText = message;
    errorContainer.style.display = 'block';
}

// Function to clear error messages
function clearError() {
    const errorContainer = document.getElementById('error');
    errorContainer.innerText = '';
    errorContainer.style.display = 'none';
}

// Function to get the current temperature unit
function getTemperatureUnit() {
    return document.getElementById('unit-toggle').checked ? '°F' : '°C';
}

// Function to update the UI based on user preferences
function updateUI() {
    const favoriteLocations = getFavoriteLocations();
    // Logic to update UI with favorite locations
}

// Event listener for search functionality
document.getElementById('search-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const location = document.getElementById('search-input').value;
    if (location) {
        clearError();
        showLoading();
        // Call function to fetch weather data for the location
    } else {
        showError('Please enter a location.');
    }
});

// Event listener for temperature unit toggle
document.getElementById('unit-toggle').addEventListener('change', () => {
    // Logic to update displayed temperatures
});

// Initial UI setup
document.addEventListener('DOMContentLoaded', () => {
    updateUI();
});