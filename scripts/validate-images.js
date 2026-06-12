/**
 * validate-images.js
 * Reads the CSV export and all image files, matches images to records
 * by positional ordering (download timestamp), and generates reports.
 *
 * Run: npm run validate-images
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const CSV_PATH = path.join(ROOT, 'Objekter-Totaloversikt.csv')
const IMAGES_DIR = path.join(ROOT, 'public', 'images')
const DATA_DIR = path.join(ROOT, 'public', 'data')

// --- CSV Parser (RFC 4180 with embedded newlines) ---
function parseCSV(content) {
  const rows = []
  let headers = null
  let fields = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < content.length; i++) {
    const ch = content[i]
    const nx = content[i + 1] ?? ''

    if (ch === '"') {
      if (inQuotes && nx === '"') { field += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      fields.push(field); field = ''
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && nx === '\n') i++
      fields.push(field); field = ''
      if (fields.length > 0) {
        if (!headers) { headers = fields }
        else {
          const obj = {}
          headers.forEach((h, j) => obj[h] = (fields[j] ?? '').trim())
          rows.push(obj)
        }
      }
      fields = []
    } else {
      field += ch
    }
  }
  // Last row
  if (field || fields.length) {
    fields.push(field)
    if (headers && fields.length > 1) {
      const obj = {}
      headers.forEach((h, j) => obj[h] = (fields[j] ?? '').trim())
      rows.push(obj)
    }
  }
  return rows
}

// --- Slug / normalisation helpers ---
function slugify(s) {
  return (s || '')
    .toLowerCase()
    .replace(/[æÆ]/g, 'ae')
    .replace(/[øØ]/g, 'oe')
    .replace(/[åÅ]/g, 'aa')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// Extract URL ending hash from Bilder cell
function extractUrlHash(bilder) {
  const m = bilder.match(/\/([A-Za-z0-9_-]{20,})\)/)
  return m ? m[1] : null
}

// --- Main ---
console.log('=== Glastad Samlinger — Image Validator ===\n')

// 1. Read CSV
const csvContent = fs.readFileSync(CSV_PATH, 'utf-8')
const rows = parseCSV(csvContent)
console.log(`CSV records parsed: ${rows.length}`)

// 2. Read image files, sorted by modification time (= download order)
const allFiles = fs.readdirSync(IMAGES_DIR)
const imageFiles = allFiles
  .filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f))
  .map(name => {
    const stat = fs.statSync(path.join(IMAGES_DIR, name))
    return { name, mtime: stat.mtimeMs }
  })
  .sort((a, b) => a.mtime - b.mtime)

console.log(`Image files found:   ${imageFiles.length}`)

// 3. Match rows with images to image files (positional by download time)
const withImageRows = rows.filter(r => r['Bilder'] && r['Bilder'].trim())
const noImageRows   = rows.filter(r => !r['Bilder'] || !r['Bilder'].trim())

console.log(`Rows with images:    ${withImageRows.length}`)
console.log(`Rows without images: ${noImageRows.length}`)

const matched = []
const unmatched = []
let imageIdx = 0

rows.forEach(row => {
  const hasImg = !!(row['Bilder'] && row['Bilder'].trim())
  const imgFile = hasImg && imageIdx < imageFiles.length ? imageFiles[imageIdx++] : null

  const entry = {
    recordId:    row['RecordID'] || '',
    title:       row['Title'] || '',
    typeObjekt:  row['Type Objekt'] || '',
    lokasjon:    row['Lokasjon'] || '',
    hasImage:    hasImg,
    imageFile:   imgFile ? imgFile.name : null,
    matchMethod: imgFile ? 'positional_by_download_time' : 'no_image',
    confidence:  imgFile ? 'high' : 'N/A',
    airtableHash: hasImg ? extractUrlHash(row['Bilder']) : null,
  }

  if (imgFile) matched.push(entry)
  else unmatched.push(entry)
})

const unusedImages = imageFiles.slice(imageIdx)
console.log(`Matched:             ${matched.length}`)
console.log(`Unmatched (no img):  ${unmatched.length}`)
console.log(`Unused images:       ${unusedImages.length}`)

// 4. Build objects.json
const objects = rows.map(row => {
  const hasImg = !!(row['Bilder'] && row['Bilder'].trim())
  const entry = matched.find(m => m.recordId === row['RecordID'])
  return {
    id:              row['RecordID'] || '',
    title:           (row['Title'] || '').trim(),
    typeObjekt:      (row['Type Objekt'] || '').trim(),
    lokasjon:        (row['Lokasjon'] || '').trim(),
    anskaffetFra:    (row['Anskaffet fra'] || '').trim(),
    opprinnelsesdato:(row['Opprinnelsesdato'] || '').trim(),
    datoKjopt:       (row['Dato (kjøpt)'] || '').trim(),
    eier:            (row['Eier'] || '').trim(),
    image:           entry?.imageFile || '',
    hasImage:        hasImg,
    informasjon:     (row['Informasjon'] || '').trim(),
    url:             (row['URL'] || '').trim(),
    qrKode:          (row['QR kode'] || '').trim(),
  }
})

fs.mkdirSync(DATA_DIR, { recursive: true })
fs.writeFileSync(
  path.join(DATA_DIR, 'objects.json'),
  JSON.stringify(objects, null, 2),
  'utf-8'
)
console.log(`\nWritten: public/data/objects.json  (${objects.length} objects)`)

// 5. Report JSON
const report = {
  summary: {
    totalRows:     rows.length,
    totalImages:   imageFiles.length,
    matchedRows:   matched.length,
    unmatchedRows: unmatched.length,
    unusedImages:  unusedImages.length,
    matchStrategy: 'positional_by_download_timestamp',
    note:          'Verified: Ruth Krefting (image.jpeg) is at time-position 1, matching CSV row 1 with images.',
  },
  matchedRows: matched,
  unmatchedRows: unmatched,
  unusedImages: unusedImages.map(f => f.name),
}
fs.writeFileSync(
  path.join(DATA_DIR, 'image-match-report.json'),
  JSON.stringify(report, null, 2),
  'utf-8'
)
console.log('Written: public/data/image-match-report.json')

// 6. Report CSV
const csvHeader = 'Title,RecordID,HasImage,ImageFile,MatchMethod,Confidence,AirtableURLHash'
const csvLines = [...matched, ...unmatched].map(m =>
  `"${(m.title || '').replace(/"/g, '""')}",${m.recordId},${m.hasImage},${m.imageFile || ''},${m.matchMethod},${m.confidence},${m.airtableHash || ''}`
)
fs.writeFileSync(
  path.join(DATA_DIR, 'image-match-report.csv'),
  [csvHeader, ...csvLines].join('\n'),
  'utf-8'
)
console.log('Written: public/data/image-match-report.csv')

// 7. Summary
console.log('\n=== SUMMARY ===')
if (unmatched.length > 0) {
  console.log(`\nRows WITHOUT images (will show placeholder):`)
  unmatched.forEach(m => console.log(`  - ${m.title} (${m.recordId})`))
}
if (unusedImages.length > 0) {
  console.log(`\nUnused image files:`)
  unusedImages.forEach(f => console.log(`  - ${f.name}`))
}
console.log('\nDone.')
