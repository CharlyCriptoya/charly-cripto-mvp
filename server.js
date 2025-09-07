// server.js
import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

// Health check
app.get("/health", (_req, res) => res.status(200).send("OK"));

// Cotización dólar (oficial y blue desde dolarapi)
app.get("/api/dolar", async (_req, res) => {
  try {
    const r = await fetch("https://dolarapi.com/v1/dolares");
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// Proxy Binance: precio simple
app.get("/api/binance-price/:symbol", async (req, res) => {
  try {
    const sym = req.params.symbol.toUpperCase();
    const r = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${sym}`);
    const d = await r.json();
    res.json({
      symbol: sym,
      price: d.lastPrice,
      high: d.highPrice,
      low: d.lowPrice
    });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// Klines para gráfico
app.get("/api/binance-klines/:symbol/:interval", async (req, res) => {
  try {
    const { symbol, interval } = req.params;
    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol.toUpperCase()}&interval=${interval}&limit=500`;
    const r = await fetch(url);
    const raw = await r.json();
    const candles = raw.map(c => ({
      time: Math.floor(c[0] / 1000),
      open: +c[1],
      high: +c[2],
      low:  +c[3],
      close:+c[4]
    }));
    res.json(candles);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// Servir frontend
app.use(express.static(path.join(__dirname, "public")));
app.get("*", (_req, res) =>
  res.sendFile(path.join(__dirname, "public", "index.html"))
);

app.listen(PORT, () => console.log(`✅ Server on ${PORT}`));
