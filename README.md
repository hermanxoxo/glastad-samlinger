# Glastad Samlinger

Statisk React/Vite-nettside for Glastads samlinger. Viser objekter fra Airtable med bilder, søk, filtrering, sortering og detaljvisning (modal). Publisert på GitHub Pages via GitHub Actions.

**URL:** https://hermanxoxo.github.io/glastad-samlinger/

---

## Teknisk stack

| Komponent | Teknologi |
|---|---|
| Frontend | React 18 + Vite 5 |
| Hosting | GitHub Pages |
| CI/CD | GitHub Actions |
| Datakilde | Airtable REST API (kun under bygg) |
| Fonter | Google Fonts – Cormorant Garamond + Lato |

---

## Dataflyt

```
Airtable
   ↓  (GitHub Actions kjører sync-airtable.js ved push til main)
public/data/items.json  +  public/images/airtable/
   ↓  (Vite bygger React-appen)
dist/
   ↓  (GitHub Actions deployer til GitHub Pages)
https://hermanxoxo.github.io/glastad-samlinger/
```

**Viktig:**
- Siden gjør **ingen** API-kall fra nettleseren — all data er bakt inn under bygg.
- Airtable-token eksponeres **aldri** i frontend-bunndelen.
- Airtable brukes utelukkende **read-only** via `GET`-kall i GitHub Actions.

---

## GitHub Secrets

Følgende secrets må være satt i repoets **Settings → Secrets → Actions**:

| Secret | Beskrivelse |
|---|---|
| `AIRTABLE_TOKEN` | Personal Access Token fra Airtable |
| `AIRTABLE_BASE_ID` | ID til Airtable-basen (starter med `app`) |
| `AIRTABLE_TABLE_ID` | ID til tabellen (starter med `tbl`) |
| `AIRTABLE_VIEW_NAME` | Navn på visningen som skal synkroniseres |

> **Ikke commit token eller andre hemmeligheter til repoet.**

---

## Kommandoer lokalt

```bash
npm install          # Installer avhengigheter

npm run sync         # Hent data fra Airtable og lagre items.json + bilder
                     # Krever at AIRTABLE_TOKEN m.fl. er satt som miljøvariabler
                     # Hopper over uten feil hvis token mangler

npm run build        # Bygg produksjonsversjon til dist/

npm run dev          # Start lokal utviklingsserver (http://localhost:5173)
                     # Uten sync vises ingen objekter (items.json er tom)
```

---

## Deploy

- Deploy skjer **automatisk** ved push til `main`-branchen.
- Workflow kan også **kjøres manuelt** fra GitHub Actions-fanen i repoet.
- GitHub Pages publiserer ferdig bygg direkte fra Actions-artefakt.
- Airtable-data oppdateres ved hver workflow-kjøring (også satt til kjøre én gang i timen via cron).

---

## Mappestruktur

```
.
├── .github/
│   └── workflows/
│       └── deploy.yml          ← GitHub Actions: sync → build → deploy
├── public/
│   ├── data/
│   │   └── items.json          ← Genereres av sync-airtable.js (tom i git)
│   ├── images/
│   │   └── airtable/           ← Bilder lastet ned under bygg (gitignorert)
│   ├── Gladstad-Logo.webp
│   ├── favicon.ico
│   ├── favicon-32x32.png
│   └── apple-touch-icon.png
├── scripts/
│   └── sync-airtable.js        ← Henter data fra Airtable, lagrer items.json + bilder
├── src/
│   ├── components/
│   │   ├── Header.jsx / .css
│   │   ├── SearchFilter.jsx / .css
│   │   ├── ObjectGrid.jsx / .css
│   │   ├── ObjectCard.jsx / .css
│   │   └── ObjectModal.jsx / .css
│   ├── App.jsx / .css
│   ├── index.css
│   └── main.jsx
├── index.html
├── vite.config.js
└── package.json
```

---

## Viktige merknader

- `public/data/items.json` er tom i git og **genereres av sync** ved hvert bygg. Ikke rediger den manuelt.
- `public/images/airtable/` er gitignorert og fylles under bygg av GitHub Actions.
- Endringer i Airtable blir synlige på siden **etter neste workflow-kjøring** (automatisk hver time, eller utløst manuelt).
- Ikke slett `scripts/sync-airtable.js`, Airtable-oppsett i GitHub Secrets eller `.github/workflows/deploy.yml` uten å forstå konsekvensen — disse er kritiske for dataflyten.
- Gamle CSV-importfiler (`objects.json`, `validate-images.js`, bildefiler med kryptiske navn) er fjernet. All data kommer nå fra Airtable.
