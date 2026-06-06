import { STATION_GLOBAL_ID, LEFT_LINE, RIGHT_LINE, DEPARTURES_SHOWN, CACHE_TTL_MS, TIMEZONE } from './config.js';
import { createCache } from './cache.js';

const cache = createCache(CACHE_TTL_MS);

async function fetchRaw() {
  const cached = cache.get('departures');
  if (cached) return cached;

  const url = `https://www.mvg.de/api/bgw-pt/v3/departures?globalId=${STATION_GLOBAL_ID}&limit=100&transportTypes=UBAHN,BUS`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:151.0) Gecko/20100101 Firefox/151.0',
      'Accept': 'application/json, text/plain, */*',
      'Referer': 'https://www.mvg.de/meinhalt/westpark',
    },
  });

  if (!res.ok) throw new Error(`MVG API ${res.status}`);

  const body = await res.json();
  // API returns either an array or { departures: [] }
  const list = Array.isArray(body) ? body : (body.departures ?? []);
  cache.set('departures', list);
  return list;
}

function filterAndGroupLine(list, line) {
  const now = Date.now();
  const filtered = list.filter(d => {
    const t = d.realtimeDepartureTime ?? d.plannedDepartureTime;
    return d.transportType === line.transportType && d.label === line.lineId && t > now;
  });

  const groups = new Map();
  for (const d of filtered) {
    const stop = d.stopPointGlobalId;
    if (!groups.has(stop)) groups.set(stop, { stopId: stop, label: d.destination, departures: [] });
    const group = groups.get(stop);
    if (group.departures.length < DEPARTURES_SHOWN) {
      const t = d.realtimeDepartureTime ?? d.plannedDepartureTime;
      group.departures.push({
        destination: d.destination ?? '',
        messages: (d.messages ?? [])
          .map(m => typeof m === 'string' ? m : (m.title ?? m.text ?? ''))
          .filter(Boolean),
        minutes: Math.max(0, Math.floor((t - now) / 60_000)),
        time: new Date(t).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', timeZone: TIMEZONE }),
        occupancy: d.occupancy ?? 'UNKNOWN',
      });
    }
  }

  const result = [...groups.values()];
  for (const group of result) {
    const freq = {};
    for (const d of group.departures) freq[d.destination] = (freq[d.destination] ?? 0) + 1;
    const norm = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0];
    for (const d of group.departures) d.outlier = d.destination !== norm;
  }
  return result;
}

export async function getDepartures() {
  const list = await fetchRaw();
  return {
    leftLabel: LEFT_LINE.displayLabel,
    leftIcon: LEFT_LINE.icon,
    left: filterAndGroupLine(list, LEFT_LINE),
    rightLabel: RIGHT_LINE.displayLabel,
    rightIcon: RIGHT_LINE.icon,
    right: filterAndGroupLine(list, RIGHT_LINE),
  };
}
