const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const state = { city: "Chennai", unit: "celsius", weather: null };
const elements = {
  form: document.getElementById("searchForm"),
  input: document.getElementById("cityInput"),
  dashboard: document.getElementById("dashboard"),
  status: document.getElementById("status"),
  unitToggle: document.getElementById("unitToggle"),
  locationButton: document.getElementById("locationButton"),
  locationName: document.getElementById("locationName"),
  updatedAt: document.getElementById("updatedAt"),
  currentIcon: document.getElementById("currentIcon"),
  currentTemp: document.getElementById("currentTemp"),
  currentCondition: document.getElementById("currentCondition"),
  feelsLike: document.getElementById("feelsLike"),
  humidity: document.getElementById("humidity"),
  windSpeed: document.getElementById("windSpeed"),
  highTemp: document.getElementById("highTemp"),
  lowTemp: document.getElementById("lowTemp"),
  rangeMarker: document.getElementById("rangeMarker"),
  comfortNote: document.getElementById("comfortNote"),
  forecastDate: document.getElementById("forecastDate"),
  hourlyList: document.getElementById("hourlyList"),
  dailyList: document.getElementById("dailyList"),
};
const weatherTypes = {
  0: ["Clear sky", "☼"],
  1: ["Mainly clear", "◔"],
  2: ["Partly cloudy", "◑"],
  3: ["Overcast", "☁"],
  45: ["Foggy", "≋"],
  48: ["Rime fog", "≋"],
  51: ["Light drizzle", "⌁"],
  53: ["Drizzle", "⌁"],
  55: ["Heavy drizzle", "⌁"],
  61: ["Light rain", "☂"],
  63: ["Rain", "☂"],
  65: ["Heavy rain", "☂"],
  71: ["Light snow", "❄"],
  73: ["Snow", "❄"],
  75: ["Heavy snow", "❄"],
  80: ["Rain showers", "☂"],
  81: ["Rain showers", "☂"],
  82: ["Heavy showers", "☂"],
  95: ["Thunderstorm", "ϟ"],
  96: ["Stormy", "ϟ"],
  99: ["Stormy", "ϟ"],
};
function getWeatherType(code) {
  return weatherTypes[code] || ["Mixed conditions", "◌"];
}
function convertTemperature(value) {
  return state.unit === "celsius" ? value : (value * 9) / 5 + 32;
}
function formatTemp(value, suffix = "°") {
  return `${Math.round(convertTemperature(value))}${suffix}`;
}
function formatDay(date, options) {
  return new Intl.DateTimeFormat("en-US", options).format(
    new Date(`${date}T12:00:00`),
  );
}
function setStatus(message = "", isError = false) {
  elements.status.textContent = message;
  elements.status.style.color = isError ? "#c85d49" : "";
}
async function findCity(city) {
  const response = await fetch(
    `${GEOCODING_URL}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`,
  );
  if (!response.ok) throw new Error("Could not search for that city.");
  const result = await response.json();
  if (!result.results?.length) throw new Error(`We couldn't find “${city}”.`);
  return result.results[0];
}
async function fetchWeather(latitude, longitude) {
  const params = new URLSearchParams({
    latitude,
    longitude,
    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
    hourly: "temperature_2m,weather_code",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,sunrise,sunset",
    timezone: "auto",
    forecast_days: "7",
  });
  const response = await fetch(`${FORECAST_URL}?${params}`);
  if (!response.ok)
    throw new Error("Live weather data is unavailable right now.");
  return response.json();
}
async function loadCity(city) {
  elements.dashboard.setAttribute("aria-busy", "true");
  setStatus(`Checking the sky above ${city}...`);
  try {
    const place = await findCity(city);
    const weather = await fetchWeather(place.latitude, place.longitude);
    state.city = place.name;
    state.weather = { place, ...weather };
    renderWeather();
    setStatus("");
  } catch (error) {
    setStatus(error.message, true);
  } finally {
    elements.dashboard.setAttribute("aria-busy", "false");
  }
}
function renderWeather() {
  const { place, current, daily, hourly } = state.weather;
  const [condition, icon] = getWeatherType(current.weather_code);
  const unit = state.unit === "celsius" ? "C" : "F";
  elements.locationName.textContent = `${place.name}, ${place.country_code}`;
  elements.updatedAt.textContent = `Updated ${new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date())}`;
  elements.currentIcon.textContent = icon;
  elements.currentTemp.innerHTML = `${Math.round(convertTemperature(current.temperature_2m))}<sup>°${unit}</sup>`;
  elements.currentCondition.textContent = condition;
  elements.feelsLike.textContent = formatTemp(current.apparent_temperature);
  elements.humidity.textContent = `${current.relative_humidity_2m}%`;
  elements.windSpeed.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
  elements.highTemp.textContent = formatTemp(daily.temperature_2m_max[0]);
  elements.lowTemp.textContent = formatTemp(daily.temperature_2m_min[0]);
  elements.forecastDate.textContent = formatDay(daily.time[0], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const range = daily.temperature_2m_max[0] - daily.temperature_2m_min[0] || 1;
  const position = Math.min(
    92,
    Math.max(
      8,
      ((current.temperature_2m - daily.temperature_2m_min[0]) / range) * 100,
    ),
  );
  elements.rangeMarker.style.left = `${position}%`;
  elements.comfortNote.textContent =
    current.temperature_2m > 30
      ? "A warm one. Keep water close and find some shade."
      : current.temperature_2m < 16
        ? "A crisp day ahead. A light layer will feel good."
        : "Comfortable conditions for getting out and about.";
  renderHourly(hourly);
  renderDaily(daily);
  renderPlanner(daily);
}
function renderHourly(hourly) {
  const start = hourly.time.findIndex((time) => new Date(time) >= new Date());
  const first = Math.max(start, 0);
  elements.hourlyList.innerHTML = hourly.time
    .slice(first, first + 8)
    .map((time, index) => {
      const point = first + index;
      const [condition, icon] = getWeatherType(hourly.weather_code[point]);
      const label =
        index === 0
          ? "Now"
          : new Intl.DateTimeFormat("en-US", { hour: "numeric" }).format(
              new Date(time),
            );
      return `<div class="hour-item"><time>${label}</time><span class="small-icon" aria-label="${condition}">${icon}</span><strong>${formatTemp(hourly.temperature_2m[point])}</strong></div>`;
    })
    .join("");
}
function renderDaily(daily) {
  elements.dailyList.innerHTML = daily.time
    .map((date, index) => {
      const [condition, icon] = getWeatherType(daily.weather_code[index]);
      const label =
        index === 0 ? "Today" : formatDay(date, { weekday: "short" });
      return `<div class="day-item"><time>${label}</time><span class="day-icon" aria-label="${condition}">${icon}</span><div class="day-temperatures"><b>${formatTemp(daily.temperature_2m_max[index])}</b><span>${formatTemp(daily.temperature_2m_min[index])}</span></div><small>${condition}</small></div>`;
    })
    .join("");
}
function renderPlanner(daily) {
  const rainPlanner = document.getElementById("rainPlanner");
  const sunPlanner = document.getElementById("sunPlanner");
  const dates = daily.time.map((date, index) => ({
    date,
    index,
    rainChance: daily.precipitation_probability_max[index] || 0,
    rainAmount: daily.precipitation_sum[index] || 0,
    code: daily.weather_code[index],
    high: daily.temperature_2m_max[index],
  }));
  const rainyDays = dates.filter(
    (day) => day.rainChance >= 35 || day.rainAmount >= 1,
  );
  const sunnyDays = dates.filter(
    (day) => [0, 1, 2].includes(day.code) || day.high >= 30,
  );
  const plannerDate = (day) =>
    formatDay(day.date, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  const plannerItem = (day, type) => {
    const detail =
      type === "rain"
        ? `${day.rainChance}% chance · ${day.rainAmount.toFixed(1)} mm`
        : `${formatTemp(day.high)} daytime high`;
    return `<div class="planner-item"><time>${plannerDate(day)}</time><span>${detail}</span></div>`;
  };
  rainPlanner.innerHTML = rainyDays.length
    ? rainyDays.map((day) => plannerItem(day, "rain")).join("")
    : '<p class="empty-planner">No notable rain in the next 7 days.</p>';
  sunPlanner.innerHTML = sunnyDays.length
    ? sunnyDays.map((day) => plannerItem(day, "sun")).join("")
    : '<p class="empty-planner">No strong sun signal in the next 7 days.</p>';
  document.getElementById("forecastWindow").textContent =
    `${plannerDate(dates[0])} – ${plannerDate(dates.at(-1))}`;
}
elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  const city = elements.input.value.trim();
  if (city) {
    loadCity(city);
    elements.input.value = "";
  }
});
elements.unitToggle.addEventListener("click", () => {
  state.unit = state.unit === "celsius" ? "fahrenheit" : "celsius";
  elements.unitToggle.textContent = state.unit === "celsius" ? "°C" : "°F";
  if (state.weather) renderWeather();
});
elements.locationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    setStatus("Location is not available in this browser.", true);
    return;
  }
  setStatus("Finding your location...");
  navigator.geolocation.getCurrentPosition(
    async ({ coords }) => {
      try {
        const weather = await fetchWeather(coords.latitude, coords.longitude);
        const place = { name: "Your location", country_code: "" };
        state.weather = { place, ...weather };
        state.city = place.name;
        renderWeather();
        setStatus("");
      } catch (error) {
        setStatus(error.message, true);
      }
    },
    () =>
      setStatus(
        "Location permission was not granted. Search for a city instead.",
        true,
      ),
  );
});
loadCity(state.city);
