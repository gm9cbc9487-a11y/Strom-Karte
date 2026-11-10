# Strom Schweiz live – interaktive Karte

Zeigt Produktion (nach Typ), Verbrauch, Import/Export mit den Nachbarländern und die grössten Kraftwerke auf einer Karte.

```bash
node server.js        # Node >= 18, keine Abhängigkeiten
# dann http://localhost:8080 öffnen (läuft z. B. auch auf einem Raspberry Pi / Wanddisplay)
```

- Daten: [Energy-Charts](https://energy-charts.info) (Swissgrid/ENTSO-E), kostenlos, kein Schlüssel. Der Server cached 5 Minuten.
- Daten sind nicht in Echtzeit auf die Sekunde, sondern stündlich/15-min mit einigen Stunden Verzug.
- Kraftwerkswerte sind geschätzt (Typ-Produktion ÷ installierte Leistung). Echte Einzelwerte bräuchten einen kostenlosen ENTSO-E-API-Schlüssel.
- Kraftwerkliste: `PLANTS` in `index.html` – einfach erweiterbar.
