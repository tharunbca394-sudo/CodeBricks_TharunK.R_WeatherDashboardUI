// This file manages local storage operations, allowing users to save their favorite locations and preferences for future sessions.

const STORAGE_KEY_FAVORITES = 'weatherAppFavorites';
const STORAGE_KEY_UNITS = 'weatherAppUnits';

// Save favorite locations to local storage
export function saveFavoriteLocation(location) {
    const favorites = getFavoriteLocations();
    if (!favorites.includes(location)) {
        favorites.push(location);
        localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(favorites));
    }
}

// Get favorite locations from local storage
export function getFavoriteLocations() {
    const favorites = localStorage.getItem(STORAGE_KEY_FAVORITES);
    return favorites ? JSON.parse(favorites) : [];
}

// Remove a favorite location from local storage
export function removeFavoriteLocation(location) {
    const favorites = getFavoriteLocations().filter(fav => fav !== location);
    localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(favorites));
}

// Save temperature unit preference to local storage
export function saveTemperatureUnit(unit) {
    localStorage.setItem(STORAGE_KEY_UNITS, unit);
}

// Get temperature unit preference from local storage
export function getTemperatureUnit() {
    return localStorage.getItem(STORAGE_KEY_UNITS) || 'C'; // Default to Celsius
}