
# NSFW Mastodon Bot

Ein Node.js-Skript, das regelmäßig Bilder von der API [n-sfw.com](https://n-sfw.com) herunterlädt und automatisch auf einer Mastodon-Instanz postet.

---

## Funktionen

- Abrufen und Posten von Bildern aus verschiedenen NSFW-Kategorien.
- Fortschrittsverwaltung: Keine doppelten oder bereits geposteten Bilder.
- Automatischer Cron-Job-Zeitplan (standardmäßig stündlich).
- Keine Speicherung leerer oder ungültiger Dateien.

---

## Installation

### Voraussetzungen

- Node.js Version 16 oder neuer
- Ein Mastodon/Misskey-Account mit API-Zugangstoken

### Schritte

1. Repository klonen:

   ```bash
   git clone https://github.com/MaximilianGT500/mastodon-image-bot.git
   cd mastodon-image-bot
   ```

2. Abhängigkeiten installieren:

   ```bash
   npm install
   ```

3. Konfiguration:

   In der Datei `index.js` deine Mastodon-Zugangsdaten eintragen:

   ```javascript
   const M = new Mastodon({
     access_token: "DEIN_ACCESS_TOKEN",
     api_url: "https://mastodon.example/api/v1/",
   });
   ```

4. Starten:

   ```bash
   node index.js
   ```

---

## Zeitplan anpassen

Der Zeitplan wird über die Bibliothek `node-cron` geregelt. Standardmäßig läuft das Skript jede Stunde:

```javascript
cron.schedule("0 * * * *", downloadFromAPIAndPostOnMastodon);
```

👉 Cron-Editor: [https://crontab.guru](https://crontab.guru)

---

## Struktur

- `index.js`: Hauptskript
- `progress.txt`: Fortschrittsdatei (automatisch erstellt)
- `downloads/`: Ordner für heruntergeladene temporäre Dateien

---

## Hinweise

- Nur gültige, nicht-leere Dateien werden gespeichert und gepostet.
- Kategorien können direkt in `apiEndpoints` angepasst werden.
- Nutzung auf eigenes Risiko – bitte lokale Gesetze und Plattformregeln beachten.

---

## Lizenz

MIT License
