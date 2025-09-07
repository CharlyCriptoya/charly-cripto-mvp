// server.js
import express from "express";
import fetch from "node-fetch";           // fetch para Node < 18
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Health check para Render
app.get("/health", (_req, res) => res.status(200).send("OK"));

// Proxy Binance: /api/binance-price/BTCUSDT  -> { symbol, price }
app.get("/api/binance-price/:symbol", async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const r = await fetch(
      `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`
    );
    if (!r.ok) throw new Error(`Binance error ${r.status}`);
    const data = await r.json();
    res.json({ symbol, price: data.price });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Fallback a index.html
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => console.log(`✅ Server on ${PORT}`));
