// ═══════════════════════════════════════════════════════
// CUSTOMIZE — edit these constants to change behavior
// ═══════════════════════════════════════════════════════

// MVG station ID for Westpark
export const STATION_GLOBAL_ID = 'de:09162:1340';
export const STATION_NAME = 'Westpark';

// Left column: U6
export const LEFT_LINE = {
  displayLabel: 'U6',
  transportType: 'UBAHN',
  lineId: 'U6',
  icon: 'train-subway',
};

// Right column: Bus 63
export const RIGHT_LINE = {
  displayLabel: 'Bus 63',
  transportType: 'BUS',
  lineId: '63',
  icon: 'bus-simple',
};

// Departures shown per column
export const DEPARTURES_SHOWN = 3;

// Coordinates for Westpark, Munich (used by One Call API)
export const WEATHER_LAT = 48.1085;
export const WEATHER_LON = 11.5214;

// Number of 3-hour forecast slots to show (4 = next 12 hours)
export const WEATHER_FORECAST_SLOTS = 6;

// Cache TTL in milliseconds
export const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Output image dimensions — must match Inkplate resolution
export const IMAGE_WIDTH = 1280;
export const IMAGE_HEIGHT = 720;

// Server port
export const PORT = process.env.PORT ?? 3000;

// Timezone for time formatting
export const TIMEZONE = 'Europe/Berlin';
