// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: services/browser-automation/src/index.js
// LAYER: root
// 
//         _   _  _____    _    ____   __   __
//        | | | || ____|  / \  |  _ \ \ \ / /
//        | |_| ||  _|   / _ \ | | | | \ V / 
//        |  _  || |___ / ___ \| |_| |  | |  
//        |_| |_||_____/_/   \_\____/   |_|  
// 
//    Sacred Geometry :: Organic Systems :: Breathing Interfaces
// HEADY_BRAND:END

const express = require('express');
const cors = require('cors');
const { chromium } = require('playwright');

const app = express();
app.use(cors());
app.use(express.json());

let browser = null;
let context = null;

async function ensureBrowser() {
  if (!browser) {
    browser = await chromium.launch({
      headless: false,
      args: ['--remote-debugging-address=0.0.0.0', '--remote-debugging-port=9222']
    });
    context = await browser.newContext();
  }
  return { browser, context };
}

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await ensureBrowser();
    const version = await browser.version();
    res.json({ status: 'healthy', browser: 'chromium', version });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', error: error.message });
  }
});

// Navigate to URL
app.post('/navigate', async (req, res) => {
  try {
    const { url } = req.body;
    const { context } = await ensureBrowser();
    const page = await context.newPage();
    await page.goto(url);
    const title = await page.title();
    res.json({ success: true, title, url });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get page content
app.post('/content', async (req, res) => {
  try {
    const { url } = req.body;
    const { context } = await ensureBrowser();
    const page = await context.newPage();
    await page.goto(url);
    const content = await page.content();
    await page.close();
    res.json({ success: true, content });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Screenshot endpoint
app.post('/screenshot', async (req, res) => {
  try {
    const { url, fullPage = true } = req.body;
    const { context } = await ensureBrowser();
    const page = await context.newPage();
    await page.goto(url);
    const screenshot = await page.screenshot({ fullPage, encoding: 'base64' });
    await page.close();
    res.json({ success: true, screenshot: `data:image/png;base64,${screenshot}` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// CDP proxy endpoint
app.get('/json', async (req, res) => {
  try {
    const { browser } = await ensureBrowser();
    const cdpEndpoint = 'http://localhost:9222/json';
    const response = await fetch(cdpEndpoint);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 9222;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🔧 Browser Automation Service running on port ${PORT}`);
  ensureBrowser().then(() => {
    console.log('✅ Chromium browser initialized');
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  if (browser) await browser.close();
  process.exit(0);
});
