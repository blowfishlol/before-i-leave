import 'dotenv/config';
import express from 'express';
import { getDepartures } from './departures.js';
import { getWeather } from './weather.js';
import { renderDisplay, closeBrowser } from './render.js';
import { PORT, TIMEZONE } from './config.js';

const app = express();
const API_KEY = process.env.OPEN_WEATHER_API_KEY;

if (!API_KEY) {
  console.error('Missing OPEN_WEATHER_API_KEY in .env');
  process.exit(1);
}

app.get('/image.png', async (req, res) => {
  try {
    const [departures, weather] = await Promise.all([
      getDepartures(),
      getWeather(API_KEY),
    ]);

    const now = new Date();
    const data = {
      currentTime: now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', timeZone: TIMEZONE }),
      currentDate: now.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', timeZone: TIMEZONE }),
      departures,
      weather,
    };

    const png = await renderDisplay(data);
    res.set('Content-Type', 'image/png');
    res.send(png);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}/image.png`);
});

for (const sig of ['SIGTERM', 'SIGINT']) {
  process.on(sig, async () => {
    await closeBrowser();
    process.exit(0);
  });
}
