// Holt die Rohdaten von Energy-Charts und schreibt sie als JSON in das Zielverzeichnis.
// Aufruf: node fetch-data.mjs <zielordner>
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const out = process.argv[2] || 'data';
const BASE = 'https://api.energy-charts.info';
const day = (o) => new Date(Date.now() + o * 864e5).toISOString().slice(0, 10);
const files = {
  power: `${BASE}/public_power?country=ch&start=${day(-1)}&end=${day(1)}`,
  flows: `${BASE}/cbpf?country=ch&start=${day(-1)}&end=${day(1)}`,
  installed: `${BASE}/installed_power?country=ch&time_step=yearly`,
};

await mkdir(out, { recursive: true });
for (const [name, url] of Object.entries(files)) {
  let lastErr;
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'strom-karte-pages' } });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const text = await r.text();
      JSON.parse(text); // nur gültiges JSON veröffentlichen
      await writeFile(path.join(out, name + '.json'), text);
      console.log('ok', name, text.length, 'Bytes');
      lastErr = null;
      break;
    } catch (e) { lastErr = e; await new Promise(r => setTimeout(r, 2000 * (i + 1))); }
  }
  if (lastErr) { console.error('Fehler bei', name, lastErr.message); process.exit(1); }
}
