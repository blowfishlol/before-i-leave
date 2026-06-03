import { chromium } from 'playwright';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { IMAGE_WIDTH, IMAGE_HEIGHT } from './config.js';

// The HTML template is designed at this resolution.
// If IMAGE_WIDTH/HEIGHT differ, content is scaled via CSS zoom.
const DESIGN_WIDTH = 1280;
const DESIGN_HEIGHT = 720;

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_PATH = join(__dirname, '..', 'template', 'display.html');

let browser = null;

async function getBrowser() {
  if (!browser || !browser.isConnected()) {
    browser = await chromium.launch();
  }
  return browser;
}

export async function renderDisplay(data) {
  const zoom = Math.min(IMAGE_WIDTH / DESIGN_WIDTH, IMAGE_HEIGHT / DESIGN_HEIGHT);
  const html = readFileSync(TEMPLATE_PATH, 'utf-8')
    .replace('<!-- DATA_INJECT -->', `<script>window.DATA = ${JSON.stringify(data)};</script>`)
    .replace('<body>', `<body style="zoom:${zoom}">`);

  const b = await getBrowser();
  const page = await b.newPage();
  try {
    await page.setViewportSize({ width: IMAGE_WIDTH, height: IMAGE_HEIGHT });
    await page.setContent(html, { waitUntil: 'networkidle' });
    return await page.screenshot({ type: 'png' });
  } finally {
    await page.close();
  }
}

export async function closeBrowser() {
  if (browser) {
    await browser.close();
    browser = null;
  }
}
