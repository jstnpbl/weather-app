import { fetchCurrentWeather, fetchForecast } from './api.js';
import { displayCurrentWeather, displayForecast, displayHourly, showError, clearUI, displayTempChart } from './dom.js';

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const searchBtn = document.getElementById('searchBtn');
  const cityInput = document.getElementById('cityInput');
  const geoBtn = document.getElementById('geoBtn');
  const latInput = document.getElementById('latInput');
  const lonInput = document.getElementById('lonInput');
  const coordsBtn = document.getElementById('coordsBtn');
  const favBtn = document.getElementById('favBtn');
  const cityText = document.getElementById('cityText');
  const themeToggle = document.getElementById('themeToggle');
  const langSelect = document.getElementById('langSelect');

  // State
  let hasSearched = false;
  let units = 'metric';
  let lang = 'en';
  let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  let recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');

  // --- Event Listeners ---

  // Search by city
  searchBtn.addEventListener('click', () => { hasSearched = true; handleSearch(); });
  cityInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') { hasSearched = true; handleSearch(); }
  });

  // Geolocation
  geoBtn.addEventListener('click', () => {
    if (!navigator.geolocation) return showError('Geolocation is not supported by your browser.');
    showLoading();
    navigator.geolocation.getCurrentPosition(
      pos => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
      () => { showError('Location access denied. Enter a city to search.'); hideLoading(); }
    );
  });

  // Search by coordinates
  coordsBtn?.addEventListener('click', () => {
    const lat = latInput.value.trim();
    const lon = lonInput.value.trim();
    if (!lat || !lon) return showError('Please enter both latitude and longitude.');
    fetchWeatherByCoords(lat, lon);
  });

  // Units toggle
  document.querySelectorAll('input[name="unit"]').forEach(radio => {
    radio.addEventListener('change', e => {
      units = e.target.value;
      if (hasSearched) handleSearch();
      else if (window.lastCoords) fetchWeatherByCoords(window.lastCoords.lat, window.lastCoords.lon);
    });
  });

  // Language selector
  langSelect?.addEventListener('change', e => {
    lang = e.target.value;
    if (hasSearched) handleSearch();
  });

  // Favorites button
  favBtn?.addEventListener('click', () => {
    const city = cityText.textContent;
    const idx = favorites.indexOf(city);
    if (idx === -1) favorites.push(city);
    else favorites.splice(idx, 1);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavBtn(city);
    renderFavoritesDropdown();
  });

  // Autocomplete for recent searches
  cityInput.addEventListener('input', showAutocomplete);
  document.addEventListener('click', e => {
    if (e.target.id !== 'cityInput') {
      document.getElementById('autocompleteList')?.style.setProperty('display', 'none');
    }
  });

  // Theme toggle
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
      themeToggle.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
    });
    // On load, set theme from localStorage
    if (localStorage.getItem('theme') === 'dark') {
      document.body.classList.add('dark');
      themeToggle.textContent = '☀️';
    }
  }

  // Register service worker for PWA
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js');
    });
  }

  // --- Functions ---

  function updateFavBtn(city) {
    if (!favBtn) return;
    if (favorites.includes(city)) {
      favBtn.classList.add('favorited');
      favBtn.textContent = '★';
      favBtn.title = 'Remove from favorites';
    } else {
      favBtn.classList.remove('favorited');
      favBtn.textContent = '☆';
      favBtn.title = 'Add to favorites';
    }
  }

  function renderFavoritesDropdown() {
    let dropdown = document.getElementById('favoritesDropdown');
    if (!dropdown) {
      dropdown = document.createElement('select');
      dropdown.id = 'favoritesDropdown';
      dropdown.style.margin = '0.5em auto 1em auto';
      dropdown.style.display = 'block';
      document.querySelector('.container').insertBefore(dropdown, document.querySelector('.search'));
      dropdown.addEventListener('change', e => {
        cityInput.value = e.target.value;
        handleSearch();
      });
    }
    dropdown.innerHTML = '<option value="">Favorites</option>' +
      favorites.map(city => `<option value="${city}">${city}</option>`).join('');
  }
  renderFavoritesDropdown();

  function addRecentSearch(city) {
    city = city.trim();
    if (!city) return;
    recentSearches = recentSearches.filter(c => c.toLowerCase() !== city.toLowerCase());
    recentSearches.unshift(city);
    if (recentSearches.length > 8) recentSearches.pop();
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
  }

  function showAutocomplete() {
    let list = document.getElementById('autocompleteList');
    if (!list) {
      list = document.createElement('ul');
      list.id = 'autocompleteList';
      list.className = 'autocomplete-list';
      cityInput.parentNode.appendChild(list);
    }
    const val = cityInput.value.trim().toLowerCase();
    list.innerHTML = '';
    if (!val) {
      list.style.display = 'none';
      return;
    }
    const matches = recentSearches.filter(c => c.toLowerCase().startsWith(val));
    if (matches.length === 0) {
      list.style.display = 'none';
      return;
    }
    matches.forEach(city => {
      const li = document.createElement('li');
      li.textContent = city;
      li.onclick = () => {
        cityInput.value = city;
        list.style.display = 'none';
        handleSearch();
      };
      list.appendChild(li);
    });
    list.style.display = 'block';
  }

  async function handleSearch() {
    const city = cityInput.value.trim();
    if (!city) return showError('Please enter a city name');
    clearUI();
    try {
      showLoading();
      const [currentWeather, forecast] = await Promise.all([
        fetchCurrentWeather(city, units, lang),
        fetchForecast(city, units, lang),
      ]);
      displayCurrentWeather(currentWeather, units);
      displayForecast(forecast, units);
      displayHourly(forecast, units);
      displayTempChart(forecast, units);
      addRecentSearch(city);
    } catch (error) {
      showError(error.message || 'Unable to fetch weather data');
    } finally {
      hideLoading();
    }
  }

  async function fetchWeatherByCoords(latitude, longitude) {
    window.lastCoords = { lat: latitude, lon: longitude };
    clearUI();
    try {
      showLoading();
      const query = `lat=${latitude}&lon=${longitude}`;
      const [currentWeather, forecast] = await Promise.all([
        fetchCurrentWeather(query, units, lang),
        fetchForecast(query, units, lang),
      ]);
      displayCurrentWeather(currentWeather, units);
      displayForecast(forecast, units);
      displayHourly(forecast, units);
      displayTempChart(forecast, units);
    } catch (error) {
      showError(error.message || 'Unable to fetch weather data');
    } finally {
      hideLoading();
    }
  }

  function showLoading() {
    const errorDiv = document.getElementById('error');
    if (errorDiv) errorDiv.textContent = 'Loading weather...';
    errorDiv.style.display = 'block';
  }
  function hideLoading() {
    const errorDiv = document.getElementById('error');
    if (errorDiv && errorDiv.textContent === 'Loading weather...') errorDiv.textContent = '';
    errorDiv.style.display = 'none';
  }

  // --- Initial Geolocation Fetch (if no search yet) ---
  if (navigator.geolocation) {
    showLoading();
    navigator.geolocation.getCurrentPosition(
      pos => {
        if (!hasSearched) fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
      },
      () => { showError('Location access denied. Enter a city to search.'); hideLoading(); }
    );
  }
});