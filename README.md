# Glastad Samlinger — Digital Samlingskatalog

En lokal POC-nettside for Glastad Samlinger. Viser objekter fra en Airtable CSV-eksport som en elegant digital samlingskatalog.

## Forutsetninger

- [Node.js](https://nodejs.org/) v18 eller nyere
- npm (følger med Node.js)

## Kom i gang

### 1. Installer avhengigheter

```bash
npm install
```

### 2. Kjør lokalt

```bash
npm run dev
```

Åpne nettleseren på `http://localhost:5173`

### 3. Valider bildematch

```bash
npm run validate-images
```

Scriptet analyserer CSV-filen og bildemappen, genererer en matchingrapport under `public/data/`, og oppdaterer `objects.json`.

### 4. Bygg for produksjon

```bash
npm run build
```

Bygget havner i `dist/`-mappen og er klar for GitHub Pages eller annen statisk hosting.

---

## Mappestruktur

```
.
├── public/
│   ├── images/              ← alle bilder (101 stk)
│   ├── data/
│   │   ├── objects.json         ← pre-prosessert datastruktur
│   │   ├── image-match-report.json
│   │   └── image-match-report.csv
│   └── Gladstad-Logo.webp
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
├── scripts/
│   └── validate-images.js   ← bildevalideringsscript
├── Objekter-Totaloversikt.csv
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Bildematch

Bildene ble matchet mot CSV-rader ved hjelp av **posisjonell matching etter nedlastingstidspunkt**:

- Alle 101 bildefiler er navngitt med kryptiske base64url-strenger (Airtable-internt hash)
- Filene ble lastet ned sekvensielt (ca. 8 sekunder mellom hvert bilde)
- CSV-radene med bilder ble matchet posisjonelt mot bildene sortert etter modifikasjonstid
- **Verifisert**: `GXJ2JLhwuMvi7tNhSzuFdhCvW3lrlBTK82Qe7TTbpD8.jpg` (eneste JPG-fil) matcher Ruth Krefting-raden (eneste rad med `image.jpeg`)

### Matchingrapport

| Kategori                | Antall |
|-------------------------|--------|
| Totalt antall rader     | 104–105 |
| Rader MED bilde         | 100–101 |
| Rader UTEN bilde        | 4       |
| Ubrukte bildefiler      | 0       |

Rader uten bilde vises med plassholder i nettleseren:
- Innrammet bilde (rec4IaETMNl28ihZL)
- Speil (recHGOAw56djQ9C6X)
- Vintage bilde (recgw7UlzLmZw0nwM)
- Nattbord (rectE3CDhBVzY8mAi)

## GitHub Pages

For å publisere på GitHub Pages:

1. Lag et nytt GitHub-repository
2. Sett riktig `base`-verdi i `vite.config.js`:
   ```js
   base: '/REPO-NAVN/'
   ```
3. Kjør `npm run build`
4. Push `dist/`-innholdet til `gh-pages`-branchen

## Teknologi

- React 18
- Vite 5
- Cormorant Garamond + Lato (Google Fonts)
- Ingen backend, ingen API, ingen tokens
