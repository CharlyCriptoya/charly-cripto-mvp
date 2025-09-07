import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Salud
app.get("/health", (_req, res) => res.status(200).send("OK"));

/**
 * Dólar (todos los tipos). Usamos dolarapi (sin clave).
 * Devuelve un array de objetos con {nombre, compra, venta, ...}
 */
app.get("/api/dolar", async (_req, res) => {
  try {
    const r = await fetch("https://dolarapi.com/v1/dolares");
    if (!r.ok) throw new Error("FX " + r.status);
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

/**
 * Precio 24h Binance (para USDT, máx/mín del día)
 * Ej: /api/binance-price/BTCUSDT -> { symbol, price, high, low }
 */
app.get("/api/binance-price/:symbol", async (req, res) => {
  try {
    const sym = req.params.symbol.toUpperCase();
    const r = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${sym}`);
    if (!r.ok) throw new Error("BN 24h " + r.status);
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

/**
 * Velas para gráfico (candles)
 * /api/binance-klines/BTCUSDT/1m|5m|15m|30m|1h|1d -> [{time,open,high,low,close}]
 */
app.get("/api/binance-klines/:symbol/:interval", async (req, res) => {
  try {
    const sym = req.params.symbol.toUpperCase();
    const interval = req.params.interval;
    const url = `https://api.binance.com/api/v3/klines?symbol=${sym}&interval=${interval}&limit=500`;
    const r = await fetch(url);
    if (!r.ok) throw new Error("BN klines " + r.status);
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

// Estáticos y fallback
app.use(express.static(path.join(__dirname, "public")));
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => console.log(`✅ Server on ${PORT}`));
