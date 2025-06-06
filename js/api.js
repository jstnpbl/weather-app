const API_KEY = 'efec5b7781985cdc253267d896327454'; // Replace with your API key
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export async function fetchCurrentWeather(query, units = 'metric', lang = 'en') {
  const url = `https://api.openweathermap.org/data/2.5/weather?${typeof query === 'string' && query.includes('lat=') ? query : 'q=' + query}&units=${units}&lang=${lang}&appid=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('City not found');
  return await res.json();
}

export async function fetchForecast(query, units = 'metric', lang = 'en') {
  const url = `https://api.openweathermap.org/data/2.5/forecast?${typeof query === 'string' && query.includes('lat=') ? query : 'q=' + query}&units=${units}&lang=${lang}&appid=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('City not found');
  return await res.json();
}