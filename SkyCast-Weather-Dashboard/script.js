/* =========================================
   SKYCAST — WEATHER DASHBOARD
   Vanilla JavaScript + Open-Meteo API
   ========================================= */


/* ---------- API URLs ---------- */

const GEOCODING_API =
    "https://geocoding-api.open-meteo.com/v1/search";

const WEATHER_API =
    "https://api.open-meteo.com/v1/forecast";
const AIR_QUALITY_API =
    "https://air-quality-api.open-meteo.com/v1/air-quality";


/* ---------- DOM Elements ---------- */

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const themeToggle = document.getElementById("themeToggle");
const clearSearch = document.getElementById("clearSearch");
const unitToggle = document.getElementById("unitToggle");
const recentSearches = document.getElementById("recentSearches");

const loadingState = document.getElementById("loadingState");
const errorMessage = document.getElementById("errorMessage");
const errorText = document.getElementById("errorText");

const dashboard = document.getElementById("dashboard");
const emptyState = document.getElementById("emptyState");

const cityName = document.getElementById("cityName");
const weatherDate = document.getElementById("weatherDate");

const weatherIcon = document.getElementById("weatherIcon");
const weatherCondition =
    document.getElementById("weatherCondition");

const temperature =
    document.getElementById("temperature");

const feelsLike =
    document.getElementById("feelsLike");

const humidity =
    document.getElementById("humidity");

const windSpeed =
    document.getElementById("windSpeed");

const visibility =
    document.getElementById("visibility");

const pressure =
    document.getElementById("pressure");

const sunrise =
    document.getElementById("sunrise");

const sunset =
    document.getElementById("sunset");

const forecastGrid =
    document.getElementById("forecastGrid");
const airQuality = document.getElementById("airQuality");
const lastUpdated = document.getElementById("lastUpdated");
const sunProgress = document.getElementById("sunProgress");
const daylightProgress = document.getElementById("daylightProgress");

let temperatureUnit = localStorage.getItem("skycast-unit") || "celsius";
let latestWeatherData = null;


/* =========================================
   WEATHER CODE INFORMATION
   ========================================= */

function getWeatherInfo(code) {

    const weatherCodes = {

        0: {
            condition: "Clear Sky",
            icon: "☀️"
        },

        1: {
            condition: "Mainly Clear",
            icon: "🌤️"
        },

        2: {
            condition: "Partly Cloudy",
            icon: "⛅"
        },

        3: {
            condition: "Overcast",
            icon: "☁️"
        },

        45: {
            condition: "Foggy",
            icon: "🌫️"
        },

        48: {
            condition: "Depositing Rime Fog",
            icon: "🌫️"
        },

        51: {
            condition: "Light Drizzle",
            icon: "🌦️"
        },

        53: {
            condition: "Moderate Drizzle",
            icon: "🌦️"
        },

        55: {
            condition: "Dense Drizzle",
            icon: "🌧️"
        },

        61: {
            condition: "Light Rain",
            icon: "🌦️"
        },

        63: {
            condition: "Moderate Rain",
            icon: "🌧️"
        },

        65: {
            condition: "Heavy Rain",
            icon: "🌧️"
        },

        71: {
            condition: "Light Snow",
            icon: "🌨️"
        },

        73: {
            condition: "Moderate Snow",
            icon: "❄️"
        },

        75: {
            condition: "Heavy Snow",
            icon: "❄️"
        },

        77: {
            condition: "Snow Grains",
            icon: "🌨️"
        },

        80: {
            condition: "Light Showers",
            icon: "🌦️"
        },

        81: {
            condition: "Moderate Showers",
            icon: "🌧️"
        },

        82: {
            condition: "Heavy Showers",
            icon: "⛈️"
        },

        85: {
            condition: "Snow Showers",
            icon: "🌨️"
        },

        86: {
            condition: "Heavy Snow Showers",
            icon: "❄️"
        },

        95: {
            condition: "Thunderstorm",
            icon: "⛈️"
        },

        96: {
            condition: "Thunderstorm with Hail",
            icon: "⛈️"
        },

        99: {
            condition: "Heavy Thunderstorm",
            icon: "⛈️"
        }

    };

    return weatherCodes[code] || {
        condition: "Unknown Weather",
        icon: "🌤️"
    };
}

function renderRecentSearches() {
    const cities = JSON.parse(localStorage.getItem("skycast-recent-cities") || "[]");
    recentSearches.innerHTML = "";
    recentSearches.classList.toggle("hidden", cities.length === 0);

    cities.forEach((city) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "recent-city";
        button.textContent = city;
        button.addEventListener("click", () => searchCity(city));
        recentSearches.appendChild(button);
    });
}

function rememberCity(city) {
    const cities = JSON.parse(localStorage.getItem("skycast-recent-cities") || "[]");
    const nextCities = [city, ...cities.filter((item) => item.toLowerCase() !== city.toLowerCase())].slice(0, 4);
    localStorage.setItem("skycast-recent-cities", JSON.stringify(nextCities));
    renderRecentSearches();
}


/* =========================================
   DATE FORMATTING
   ========================================= */

function formatDate(dateString) {

    const date = new Date(`${dateString}T12:00:00`);

    return date.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}


function formatDay(dateString) {

    const date = new Date(`${dateString}T12:00:00`);

    return date.toLocaleDateString("en-IN", {
        weekday: "short"
    });
}


/* =========================================
   TIME FORMATTING
   ========================================= */

function formatTime(timeString) {

    if (!timeString) {
        return "--:--";
    }

    const timePart = timeString.split("T")[1];

    if (!timePart) {
        return "--:--";
    }

    const [hour, minute] =
        timePart.split(":");

    const date = new Date();

    date.setHours(
        Number(hour),
        Number(minute),
        0,
        0
    );

    return date.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });
}


/* =========================================
   LOADING STATE
   ========================================= */

function showLoading() {

    loadingState.classList.remove("hidden");

    errorMessage.classList.add("hidden");

    dashboard.classList.add("hidden");

    emptyState.classList.add("hidden");

    searchBtn.disabled = true;
    locationBtn.disabled = true;
}


function hideLoading() {

    loadingState.classList.add("hidden");

    searchBtn.disabled = false;
    locationBtn.disabled = false;
}


/* =========================================
   ERROR HANDLING
   ========================================= */

function showError(message) {

    hideLoading();

    dashboard.classList.add("hidden");

    emptyState.classList.add("hidden");

    errorText.textContent = message;

    errorMessage.classList.remove("hidden");
}


function hideError() {

    errorMessage.classList.add("hidden");
}


/* =========================================
   CITY SEARCH
   ========================================= */

async function searchCity(city) {

    const cleanCity =
        city.trim();

    if (!cleanCity) {

        showError(
            "Please enter a city name."
        );

        return;
    }

    showLoading();

    hideError();

    try {

        const url =
            `${GEOCODING_API}?name=${encodeURIComponent(cleanCity)}&count=1&language=en&format=json`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(
                "Geocoding request failed."
            );
        }

        const data =
            await response.json();
        if (
            !data.results ||
            data.results.length === 0
        ) {

            showError(
                `We couldn't find "${cleanCity}". Please check the city name.`
            );

            return;
        }

        const location =
            data.results[0];
        rememberCity(location.name);

        await getWeather(
            location.latitude,
            location.longitude,
            location.name,
            location.country
        );

    } catch (error) {

        console.error(error);

        showError(
            "Unable to find the city. Please check your internet connection and try again."
        );
    }
}


/* =========================================
   WEATHER API
   ========================================= */

async function getWeather(
    latitude,
    longitude,
    name,
    country
) {

    showLoading();

    hideError();

    try {

        const url =
            `${WEATHER_API}?latitude=${latitude}&longitude=${longitude}` +
            `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,pressure_msl,visibility,wind_speed_10m` +
            `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset` +
            `&timezone=auto` +
            `&forecast_days=5`;

        const response =
            await fetch(url);

        if (!response.ok) {
            throw new Error(
                "Weather request failed."
            );
        }

        const data =
            await response.json();
        let airQualityData = null;
        try {
            const airQualityUrl =
                `${AIR_QUALITY_API}?latitude=${latitude}&longitude=${longitude}&current=us_aqi,pm2_5,pm10&timezone=auto`;
            const airQualityResponse = await fetch(airQualityUrl);
            airQualityData = airQualityResponse.ok
                ? await airQualityResponse.json()
                : null;
        } catch (airQualityError) {
            console.warn("Air quality data is unavailable.", airQualityError);
        }

        latestWeatherData = data;

        updateCurrentWeather(
            data,
            name,
            country
        );

        updateForecast(data);
        updateAirQuality(airQualityData);

        hideLoading();

        dashboard.classList.remove("hidden");

        emptyState.classList.add("hidden");

    } catch (error) {

        console.error(error);

        showError(
            "Unable to fetch weather data. Please try again."
        );
    }
}


/* =========================================
   UPDATE CURRENT WEATHER
   ========================================= */

function updateCurrentWeather(
    data,
    name,
    country
) {

    const current =
        data.current;

    const weatherInfo =
        getWeatherInfo(
            current.weather_code
        );


    /* Location */

    cityName.textContent =
        `${name}, ${country}`;


    /* Date */

    weatherDate.textContent =
        formatDate(
            current.time.split("T")[0]
        );


    /* Weather */

    weatherIcon.textContent =
        weatherInfo.icon;

    applyWeatherTheme(current.weather_code);

    weatherCondition.textContent =
        weatherInfo.condition;


    /* Temperature */

    renderTemperatureValues(current);


    /* Humidity */

    humidity.textContent =
        `${current.relative_humidity_2m}%`;


    /* Wind */

    windSpeed.textContent =
        `${Math.round(current.wind_speed_10m)} km/h`;


    /* Visibility */

    const visibilityKm =
        current.visibility / 1000;

    visibility.textContent =
        `${visibilityKm.toFixed(1)} km`;


    /* Pressure */

    pressure.textContent =
        `${Math.round(current.pressure_msl)} hPa`;


    /* Sunrise */

    sunrise.textContent =
        formatTime(
            data.daily.sunrise[0]
        );


    /* Sunset */

    sunset.textContent =
        formatTime(
            data.daily.sunset[0]
        );

    lastUpdated.textContent = new Date().toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit"
    });
    updateSunProgress(data.daily.sunrise[0], data.daily.sunset[0]);
}

function toDisplayTemperature(value) {
    return temperatureUnit === "fahrenheit"
        ? Math.round((value * 9) / 5 + 32)
        : Math.round(value);
}

function renderTemperatureValues(current) {
    temperature.textContent = toDisplayTemperature(current.temperature_2m);
    feelsLike.textContent = toDisplayTemperature(current.apparent_temperature);
    document.querySelector(".degree").textContent =
        temperatureUnit === "fahrenheit" ? "°F" : "°C";
    document.getElementById("feelsUnit").textContent =
        temperatureUnit === "fahrenheit" ? "°F" : "°C";
}

function updateAirQuality(data) {
    if (!data || !data.current || data.current.us_aqi === undefined) {
        airQuality.textContent = "Unavailable";
        return;
    }

    const aqi = Math.round(data.current.us_aqi);
    const label = aqi <= 50 ? "Good" : aqi <= 100 ? "Moderate" : "Unhealthy";
    airQuality.textContent = `${aqi} · ${label}`;
}

function updateSunProgress(sunriseTime, sunsetTime) {
    const start = new Date(sunriseTime).getTime();
    const end = new Date(sunsetTime).getTime();
    const now = Date.now();
    const percent = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
    sunProgress.style.width = `${percent}%`;
    daylightProgress.textContent = `${Math.round(percent)}%`;
}

function applyWeatherTheme(code) {
    const theme = code >= 95
        ? "storm"
        : code >= 51
            ? "rain"
            : code >= 45
                ? "cloudy"
                : code >= 1
                    ? "cloudy"
                    : "clear";

    document.body.dataset.weather = theme;
}


/* =========================================
   UPDATE 5-DAY FORECAST
   ========================================= */

function updateForecast(data) {

    forecastGrid.innerHTML = "";

    const daily =
        data.daily;


    for (
        let i = 0;
        i < daily.time.length;
        i++
    ) {

        const weatherInfo =
            getWeatherInfo(
                daily.weather_code[i]
            );


        const day =
            formatDay(
                daily.time[i]
            );


        const maxTemp = toDisplayTemperature(daily.temperature_2m_max[i]);
        const minTemp = toDisplayTemperature(daily.temperature_2m_min[i]);


        const card =
            document.createElement("article");

        card.className =
            "forecast-card";


        card.innerHTML = `
            <div class="forecast-day">
                ${i === 0 ? "TODAY" : day.toUpperCase()}
            </div>

            <div class="forecast-icon">
                ${weatherInfo.icon}
            </div>

            <div class="forecast-condition">
                ${weatherInfo.condition}
            </div>

            <div class="forecast-temp">
                ${maxTemp}°
                <span class="forecast-min">
                    ${minTemp}°
                </span>
            </div>
        `;


        forecastGrid.appendChild(card);
    }
}


/* =========================================
   SEARCH BUTTON
   ========================================= */

searchBtn.addEventListener(
    "click",
    () => {

        searchCity(
            cityInput.value
        );
    }
);


/* =========================================
   ENTER KEY SEARCH
   ========================================= */

cityInput.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Enter") {

            searchCity(
                cityInput.value
            );

        }
    }
);

cityInput.addEventListener("input", () => {
    clearSearch.classList.toggle("hidden", !cityInput.value);
});

clearSearch.addEventListener("click", () => {
    cityInput.value = "";
    clearSearch.classList.add("hidden");
    cityInput.focus();
});

function setTheme(theme) {
    const isLight = theme === "light";
    document.body.classList.toggle("light-theme", isLight);
    themeToggle.querySelector(".theme-icon").textContent = isLight ? "☀" : "☾";
    themeToggle.setAttribute("aria-label", isLight ? "Switch to dark theme" : "Switch to light theme");
    localStorage.setItem("skycast-theme", theme);
}

themeToggle.addEventListener("click", () => {
    setTheme(document.body.classList.contains("light-theme") ? "dark" : "light");
});

setTheme(localStorage.getItem("skycast-theme") || "dark");

unitToggle.addEventListener("click", () => {
    temperatureUnit = temperatureUnit === "celsius" ? "fahrenheit" : "celsius";
    localStorage.setItem("skycast-unit", temperatureUnit);
    unitToggle.textContent = temperatureUnit === "celsius" ? "°C" : "°F";
    unitToggle.setAttribute("aria-label", temperatureUnit === "celsius"
        ? "Switch to Fahrenheit"
        : "Switch to Celsius");
    if (latestWeatherData) {
        renderTemperatureValues(latestWeatherData.current);
        updateForecast(latestWeatherData);
    }
});

unitToggle.textContent = temperatureUnit === "celsius" ? "°C" : "°F";
renderRecentSearches();


/* =========================================
   CURRENT LOCATION
   ========================================= */

locationBtn.addEventListener(
    "click",
    () => {

        if (!navigator.geolocation) {

            showError(
                "Geolocation is not supported by your browser."
            );

            return;
        }


        showLoading();

        hideError();


        navigator.geolocation.getCurrentPosition(

            async (position) => {

                const latitude =
                    position.coords.latitude;

                const longitude =
                    position.coords.longitude;


                try {

                    /*
                     * Reverse geocoding is used here
                     * to display the user's city name.
                     */

                    const url =
                        `${GEOCODING_API}?latitude=${latitude}&longitude=${longitude}&count=1&language=en&format=json`;

                    const response =
                        await fetch(url);

                    const data =
                        await response.json();


                    let name =
                        "Your Location";

                    let country =
                        "";


                    if (
                        data.results &&
                        data.results.length > 0
                    ) {

                        name =
                            data.results[0].name;

                        country =
                            data.results[0].country;
                    }


                    await getWeather(
                        latitude,
                        longitude,
                        name,
                        country
                    );

                } catch (error) {

                    console.error(error);

                    showError(
                        "We found your location, but couldn't load the weather."
                    );
                }
            },


            (error) => {

                console.error(error);

                hideLoading();

                let message =
                    "Unable to access your location.";

                if (
                    error.code ===
                    error.PERMISSION_DENIED
                ) {

                    message =
                        "Location permission was denied. Please allow location access in your browser.";
                }

                else if (
                    error.code ===
                    error.POSITION_UNAVAILABLE
                ) {

                    message =
                        "Your current location is unavailable.";
                }

                else if (
                    error.code ===
                    error.TIMEOUT
                ) {

                    message =
                        "Location request timed out. Please try again.";
                }


                showError(message);
            },

            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000
            }
        );
    }
);


/* =========================================
   INITIAL STATE
   ========================================= */

dashboard.classList.add("hidden");

loadingState.classList.add("hidden");

errorMessage.classList.add("hidden");

emptyState.classList.remove("hidden");