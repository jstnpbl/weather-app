function displayCurrentWeather(data, units = 'metric') {
  document.getElementById('cityText').textContent = `${data.name}, ${data.sys.country}`;
  document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°${units === 'imperial' ? 'F' : 'C'}`;
  document.getElementById('description').textContent = data.weather[0].description;

  const iconClass = getWeatherIconClass(data.weather[0].icon);
  const weatherIconElem = document.getElementById('weatherIcon');
  weatherIconElem.className = `wi ${iconClass}`;
  weatherIconElem.alt = data.weather[0].description;
  weatherIconElem.src = ''; // Remove src if previously set

  // Humidity
  const humidity = data.main.humidity;
  document.getElementById('humidityBar').style.width = humidity + '%';
  document.getElementById('humidityValue').textContent = humidity + '%';

  // Wind (normalize to 0-100 for bar, show value)
  const wind = data.wind.speed;
  const windMax = units === 'imperial' ? 40 : 20; // 40 mph or 20 m/s as "max"
  const windPercent = Math.min(100, Math.round((wind / windMax) * 100));
  document.getElementById('windBar').style.width = windPercent + '%';
  document.getElementById('windValue').textContent = wind + (units === 'imperial' ? ' mph' : ' m/s');

  // Pressure (normalize to 950-1050 hPa)
  const pressure = data.main.pressure;
  const pressurePercent = Math.min(100, Math.round(((pressure - 950) / 100) * 100));
  document.getElementById('pressureBar').style.width = pressurePercent + '%';
  document.getElementById('pressureValue').textContent = pressure + ' hPa';

  // UV Index (if available)
  if (data.uvi !== undefined) {
    document.getElementById('uvIndex').textContent = `UV: ${data.uvi}`;
  } else {
    document.getElementById('uvIndex').textContent = '';
  }

  // Visibility (meters to km or miles)
  if (data.visibility !== undefined) {
    const vis = units === 'imperial'
      ? (data.visibility / 1609.34).toFixed(1) + ' mi'
      : (data.visibility / 1000).toFixed(1) + ' km';
    document.getElementById('visibility').textContent = `Visibility: ${vis}`;
  } else {
    document.getElementById('visibility').textContent = '';
  }

  // Sunrise/Sunset
  if (data.sys && data.sys.sunrise && data.sys.sunset) {
    const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById('sunrise').textContent = sunrise;
    document.getElementById('sunset').textContent = sunset;
  } else {
    document.getElementById('sunrise').textContent = '';
    document.getElementById('sunset').textContent = '';
  }

  document.getElementById('currentWeather').style.display = 'block';

  setWeatherBackground(data.weather[0].main);
}

export function displayForecast(forecastData, units = 'metric') {
  const forecastContainer = document.getElementById('forecastContainer');
  forecastContainer.innerHTML = '';

  // Group by day
  const days = {};
  forecastData.list.forEach(item => {
    const date = item.dt_txt.split(' ')[0];
    if (!days[date]) days[date] = [];
    days[date].push(item);
  });

  // Only show the next 5 days
  Object.keys(days).slice(0, 5).forEach(date => {
    const dayData = days[date];

    // Calculate min/max temps for the day
    const temps = dayData.map(item => item.main.temp);
    const minTemp = Math.min(...temps).toFixed(1);
    const maxTemp = Math.max(...temps).toFixed(1);

    // Use the icon and description from the midday forecast (or closest to 12:00)
    const midday = dayData.find(item => item.dt_txt.includes('12:00:00')) || dayData[Math.floor(dayData.length / 2)];
    const icon = midday.weather[0].icon;
    const description = midday.weather[0].description;

    // Average wind and humidity
    const avgWind = (
      dayData.reduce((sum, item) => sum + item.wind.speed, 0) / dayData.length
    ).toFixed(1);
    const avgHumidity = (
      dayData.reduce((sum, item) => sum + item.main.humidity, 0) / dayData.length
    ).toFixed(0);

    const dayDiv = document.createElement('div');
    dayDiv.className = 'forecast-day';
    const iconClass = getWeatherIconClass(icon);
    dayDiv.innerHTML = `
      <div class="forecast-date">${new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
      <span class="wi ${iconClass} forecast-icon" title="${description}"></span>
      <div class="forecast-temp">
        <span class="high">${maxTemp}°C</span> /
        <span class="low">${minTemp}°C</span>
      </div>
      <div class="forecast-desc">${description}</div>
      <div class="forecast-extra">
        <span title="Wind"><svg class="icon" viewBox="0 0 24 24"><path fill="#0078d7" d="M4 12h13a3 3 0 1 1 0 6H6"/><circle cx="19" cy="18" r="1.5" fill="#0078d7"/></svg> ${avgWind} ${units === 'imperial' ? 'mph' : 'm/s'}</span>
        <span title="Humidity"><svg class="icon" viewBox="0 0 24 24"><path fill="#2980b9" d="M12 2C10 7 5 12 5 16a7 7 0 0 0 14 0c0-4-5-9-7-14z"/><text x="12" y="19" text-anchor="middle" font-size="8" fill="#fff">${avgHumidity}%</text></svg></span>
      </div>
    `;
    forecastContainer.appendChild(dayDiv);
  });
}

export function displayHourly(forecastData, units = 'metric') {
  const hourlyContainer = document.getElementById('hourlyContainer');
  if (!hourlyContainer) return;
  hourlyContainer.innerHTML = '';

  // Get next 8 intervals (3-hour steps = 24 hours)
  forecastData.list.slice(0, 8).forEach(item => {
    const time = new Date(item.dt_txt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const icon = item.weather[0].icon;
    const temp = Math.round(item.main.temp);
    const wind = item.wind.speed;
    const pop = item.pop ? Math.round(item.pop * 100) : 0; // Probability of precipitation

    const hourDiv = document.createElement('div');
    hourDiv.className = 'hourly-item';
    hourDiv.innerHTML = `
      <div class="hourly-time">${time}</div>
      <img class="hourly-icon" src="https://openweathermap.org/img/wn/${icon}.png" alt="" />
      <div class="hourly-temp">${temp}°C</div>
      <div class="hourly-wind" title="Wind">
        <svg class="icon" viewBox="0 0 24 24"><path fill="#0078d7" d="M4 12h13a3 3 0 1 1 0 6H6"/><circle cx="19" cy="18" r="1.5" fill="#0078d7"/></svg>
        ${wind} ${units === 'imperial' ? 'mph' : 'm/s'}
      </div>
      <div class="hourly-pop" title="Precipitation">
        <svg class="icon" viewBox="0 0 24 24"><path fill="#2980b9" d="M12 2C10 7 5 12 5 16a7 7 0 0 0 14 0c0-4-5-9-7-14z"/></svg>
        ${pop}%
      </div>
    `;
    hourlyContainer.appendChild(hourDiv);
  });
}

let tempChartInstance = null;

export function displayTempChart(forecastData, units = 'metric') {
  const ctx = document.getElementById('tempChart').getContext('2d');
  const labels = forecastData.list.slice(0, 8).map(item =>
    new Date(item.dt_txt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );
  const temps = forecastData.list.slice(0, 8).map(item => item.main.temp);

  if (tempChartInstance) tempChartInstance.destroy();
  tempChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: `Temperature (${units === 'imperial' ? '°F' : '°C'})`,
        data: temps,
        borderColor: '#0078d7',
        backgroundColor: 'rgba(0,120,215,0.08)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#0078d7'
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: { grid: { color: '#eee' } }
      }
    }
  });
}

function showError(message) {
  const errorDiv = document.getElementById('error');
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
  setTimeout(() => (errorDiv.style.display = 'none'), 3000);
}

function clearUI() {
  document.getElementById('currentWeather').style.display = 'none';
  document.getElementById('forecastContainer').innerHTML = '';
}

function setWeatherBackground(condition) {
  const body = document.body;
  body.classList.remove('weather-sunny', 'weather-cloudy', 'weather-rain', 'weather-snow', 'weather-thunder');
  if (/clear/i.test(condition)) body.classList.add('weather-sunny');
  else if (/cloud/i.test(condition)) body.classList.add('weather-cloudy');
  else if (/rain|drizzle/i.test(condition)) body.classList.add('weather-rain');
  else if (/snow/i.test(condition)) body.classList.add('weather-snow');
  else if (/thunder/i.test(condition)) body.classList.add('weather-thunder');
}

function getWeatherIconClass(owmIcon) {
  // Basic mapping for day/night and main types
  const map = {
    '01d': 'wi-day-sunny',
    '01n': 'wi-night-clear',
    '02d': 'wi-day-cloudy',
    '02n': 'wi-night-alt-cloudy',
    '03d': 'wi-cloud',
    '03n': 'wi-cloud',
    '04d': 'wi-cloudy',
    '04n': 'wi-cloudy',
    '09d': 'wi-showers',
    '09n': 'wi-showers',
    '10d': 'wi-day-rain',
    '10n': 'wi-night-alt-rain',
    '11d': 'wi-thunderstorm',
    '11n': 'wi-thunderstorm',
    '13d': 'wi-snow',
    '13n': 'wi-snow',
    '50d': 'wi-fog',
    '50n': 'wi-fog'
  };
  return map[owmIcon] || 'wi-na';
}

export { displayCurrentWeather, showError, clearUI, getWeatherIconClass };