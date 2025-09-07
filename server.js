// server.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Health check
app.get('/health', (_req, res) => res.status(200).send('OK'));

// === Proxy simple a Binance ===
// Ej: /api/binance-price/BTCUSDT  -> { symbol:"BTCUSDT", price:"..." }
app.get('/api/binance-price/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const r = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
    if (!r.ok) throw new Error(`Binance error: ${r.status}`);
    const data = await r.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Fallback
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
