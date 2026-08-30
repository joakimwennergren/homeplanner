const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// CORS proxy endpoint for calendar sync
app.get('/proxy', async (req, res) => {
  const url = req.query.url;
  
  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    console.log('[Proxy] Fetching:', url.substring(0, 50) + '...');
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'text/calendar',
      },
      timeout: 30000, // 30 second timeout
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch (${response.status}): ${response.statusText}`);
    }

    const data = await response.text();
    console.log('[Proxy] Successfully fetched calendar data');
    res.type('text/calendar').send(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Proxy] Error:', message);
    res.status(502).json({ error: message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✓ Proxy server running on http://localhost:${PORT}`);
  console.log(`  Endpoint: http://localhost:${PORT}/proxy?url=<calendar-url>`);
});
