import { WEATHER_LAT, WEATHER_LON, WEATHER_FORECAST_SLOTS, CACHE_TTL_MS, TIMEZONE } from './config.js';
import { createCache } from './cache.js';

const cache = createCache(CACHE_TTL_MS);
const BASE = 'https://api.openweathermap.org/data/2.5';

async function owmFetch(endpoint, apiKey, params) {
  const url = new URL(`${BASE}/${endpoint}`);
  url.searchParams.set('lat', WEATHER_LAT);
  url.searchParams.set('lon', WEATHER_LON);
  url.searchParams.set('appid', apiKey);
  url.searchParams.set('units', 'metric');
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`OWM API ${res.status}: ${await res.text()}`);
  return res.json();
}

function msToKmh(ms) {
  return Math.round(ms * 3.6);
}

function fmtTime(unixSec) {
  return new Date(unixSec * 1000).toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TIMEZONE,
  });
}

export async function getWeather(apiKey) {
  const cached = cache.get('weather');
  if (cached) return cached;

  const [current, forecast] = await Promise.all([
    owmFetch('weather', apiKey, {}),
    owmFetch('forecast', apiKey, { cnt: WEATHER_FORECAST_SLOTS }),
  ]);

  const result = {
    current: {
      temp: Math.round(current.main.temp),
      wind: msToKmh(current.wind.speed),
      icon: current.weather[0].icon,
    },
    forecast: forecast.list.slice(0, WEATHER_FORECAST_SLOTS).map(item => ({
      time: fmtTime(item.dt),
      temp: Math.round(item.main.temp),
      wind: msToKmh(item.wind.speed),
      icon: item.weather[0].icon,
    })),
  };

  cache.set('weather', result);
  return result;
}
