// Strom-Karte Schweiz – kleiner Server ohne Abhängigkeiten (Node >= 18).
// Liefert index.html aus und leitet die Energy-Charts-Daten (Fraunhofer ISE) weiter,
// weil deren API keine Browser-Anfragen von fremden Seiten erlaubt (CORS).
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const BASE = 'https://api.energy-charts.info';
const TTL = 5 * 60 * 1000;
const cache = new Map();

const day = (offset) => new Date(Date.now() + offset * 864e5).toISOString().slice(0, 10);
const ROUTES = {
  '/api/power': () => `${BASE}/public_power?country=ch&start=${day(-1)}&end=${day(1)}`,
  '/api/flows': () => `${BASE}/cbpf?country=ch&start=${day(-1)}&end=${day(1)}`,
  '/api/installed': () => `${BASE}/installed_power?country=ch&time_step=yearly`,
};

async function getJson(key, url) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.t < TTL) return hit.body;
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'strom-karte-home' } });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const body = await r.text();
    cache.set(key, { t: Date.now(), body });
    return body;
  } catch (e) {
    if (hit) return hit.body; // lieber veraltete Daten als gar keine
    throw e;
  }
}

http.createServer(async (req, res) => {
  const p = new URL(req.url, 'http://x').pathname;
  if (ROUTES[p]) {
    try {
      const body = await getJson(p, ROUTES[p]());
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      res.end(body);
    } catch (e) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: String(e.message || e) }));
    }
    return;
  }
  if (p === '/' || p === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    fs.createReadStream(path.join(__dirname, 'index.html')).pipe(res);
    return;
  }
  res.writeHead(404); res.end('Not found');
}).listen(PORT, () => console.log(`Strom-Karte läuft auf http://localhost:${PORT}`));
