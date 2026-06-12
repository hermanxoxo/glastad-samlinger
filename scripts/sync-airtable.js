/**
 * scripts/sync-airtable.js
 *
 * Read-only Airtable sync for Glastad Samlinger.
 * Fetches records and downloads images from Airtable.
 *
 * SECURITY: This script only uses GET requests.
 * It NEVER writes back to Airtable (no POST, PATCH, PUT, DELETE).
 */

import fs from 'fs'
import path from 'path'
import { Readable } from 'stream'
import { pipeline } from 'stream/promises'
import { createWriteStream } from 'fs'

// ── Config ────────────────────────────────────────────────────────────────────

const TOKEN    = process.env.AIRTABLE_TOKEN
const BASE_ID  = process.env.AIRTABLE_BASE_ID  || 'appNXluusQb9f6LRB'
const TABLE_ID = process.env.AIRTABLE_TABLE_ID || 'tblCGyvbRWfQ8wLpy'
const VIEW     = process.env.AIRTABLE_VIEW_NAME || 'Totaloversikt'

if (!TOKEN) {
  console.warn('WARNING: AIRTABLE_TOKEN is not set — skipping sync.')
  console.warn('Set it before running: $env:AIRTABLE_TOKEN="patXXXX"; npm run sync')
  console.warn('Existing items.json will be used as-is.')
  process.exit(0)
}

const IMAGES_DIR  = path.resolve('public/images/airtable')
const DATA_DIR    = path.resolve('public/data')
const OUTPUT_FILE = path.join(DATA_DIR, 'items.json')

// Fields to request — QR kode and Kjøpssum are intentionally excluded
const FIELDS = [
  'Title',
  'Type Objekt',
  'Lokasjon',
  'Anskaffet fra',
  'Opprinnelsesdato',
  'Dato (kjøpt)',
  'Eier',
  'Bilder',
  'Informasjon',
  'Samling',
  'URL',
]

// ── Helpers ───────────────────────────────────────────────────────────────────

/** GET request to Airtable API — no write methods used */
async function airtableGet(url) {
  const res = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${TOKEN}` },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Airtable API ${res.status}: ${body}`)
  }
  return res.json()
}

/** Derive file extension from filename or MIME type */
function getExt(filename, mimeType) {
  const fromName = filename?.match(/\.(\w{2,5})$/)
  if (fromName) return fromName[1].toLowerCase()
  if (mimeType?.includes('jpeg') || mimeType?.includes('jpg')) return 'jpg'
  if (mimeType?.includes('png'))  return 'png'
  if (mimeType?.includes('webp')) return 'webp'
  if (mimeType?.includes('gif'))  return 'gif'
  return 'jpg'
}

/** Stream-download an image from a URL to a local file path */
async function downloadImage(url, dest) {
  const res = await fetch(url, { method: 'GET' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const nodeStream = Readable.fromWeb(res.body)
  await pipeline(nodeStream, createWriteStream(dest))
}

/**
 * Safely extract a plain string from an Airtable field value.
 * Handles: string, number, array of strings, array of linked-record objects.
 */
function toString(val) {
  if (val == null) return ''
  if (typeof val === 'string') return val.trim()
  if (typeof val === 'number') return String(val)
  if (Array.isArray(val)) {
    return val
      .map(v => (typeof v === 'string' ? v : v?.name || v?.value || ''))
      .filter(Boolean)
      .join(', ')
  }
  return ''
}

// ── Fetch all records (with pagination) ──────────────────────────────────────

async function fetchAllRecords() {
  const records = []
  let offset = null

  do {
    const params = new URLSearchParams({ view: VIEW, pageSize: '100' })
    for (const f of FIELDS) params.append('fields[]', f)
    if (offset) params.set('offset', offset)

    const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}?${params}`
    const data = await airtableGet(url)

    records.push(...data.records)
    offset = data.offset || null
    console.log(`  ${records.length} records fetched…`)
  } while (offset)

  return records
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('╔══════════════════════════════════════════╗')
  console.log('║   Glastad Samlinger — Airtable Sync      ║')
  console.log('╚══════════════════════════════════════════╝')
  console.log(`Base:  ${BASE_ID}`)
  console.log(`Table: ${TABLE_ID}`)
  console.log(`View:  ${VIEW}`)
  console.log('')

  fs.mkdirSync(IMAGES_DIR, { recursive: true })
  fs.mkdirSync(DATA_DIR,   { recursive: true })

  console.log('Fetching records from Airtable…')
  const records = await fetchAllRecords()
  console.log(`→ ${records.length} records found\n`)

  const stats = {
    records:          records.length,
    imagesFound:      0,
    imagesDownloaded: 0,
    imagesSkipped:    0,
    imageErrors:      [],
    noImage:          [],
    missingTitle:     [],
  }

  const items = []

  for (const rec of records) {
    const f = rec.fields
    const title = toString(f['Title'])
    if (!title) stats.missingTitle.push(rec.id)

    // ── Images ────────────────────────────────────────────────────────────
    const attachments = Array.isArray(f['Bilder']) ? f['Bilder'] : []
    stats.imagesFound += attachments.length

    const images = []
    for (let idx = 0; idx < attachments.length; idx++) {
      const att   = attachments[idx]
      const ext   = getExt(att.filename, att.type)
      const fname = `${rec.id}_${idx}.${ext}`
      const dest  = path.join(IMAGES_DIR, fname)
      const rel   = `images/airtable/${fname}`

      if (fs.existsSync(dest)) {
        stats.imagesSkipped++
        images.push(rel)
        continue
      }

      try {
        await downloadImage(att.url, dest)
        stats.imagesDownloaded++
        images.push(rel)
        process.stdout.write(`  ↓ ${fname}\n`)
      } catch (err) {
        stats.imageErrors.push({ id: rec.id, title, error: err.message })
        console.error(`  ✗ ${rec.id}_${idx}: ${err.message}`)
      }
    }

    if (images.length === 0) stats.noImage.push({ id: rec.id, title })

    items.push({
      id:              rec.id,
      title,
      typeObjekt:      toString(f['Type Objekt']),
      lokasjon:        toString(f['Lokasjon']),
      anskaffetFra:    toString(f['Anskaffet fra']),
      opprinnelsesdato:toString(f['Opprinnelsesdato']),
      datoKjopt:       toString(f['Dato (kjøpt)']),
      eier:            toString(f['Eier']),
      samling:         toString(f['Samling']),
      informasjon:     toString(f['Informasjon']),
      url:             toString(f['URL']),
      images,
      image:           images[0] || '',
      hasImage:        images.length > 0,
    })
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(items, null, 2), 'utf8')

  // ── Report ────────────────────────────────────────────────────────────────
  console.log('\n╔══════════════════════════════════════════╗')
  console.log('║   Sync Report                            ║')
  console.log('╚══════════════════════════════════════════╝')
  console.log(`Records fetched:       ${stats.records}`)
  console.log(`Images found:          ${stats.imagesFound}`)
  console.log(`Images downloaded:     ${stats.imagesDownloaded}`)
  console.log(`Images skipped:        ${stats.imagesSkipped}  (already exists locally)`)
  console.log(`Image errors:          ${stats.imageErrors.length}`)
  console.log(`Records without image: ${stats.noImage.length}`)
  console.log(`Records missing title: ${stats.missingTitle.length}`)

  if (stats.noImage.length > 0) {
    console.log('\nRecords without image:')
    stats.noImage.forEach(r => console.log(`  · ${r.title || '(no title)'} [${r.id}]`))
  }

  if (stats.imageErrors.length > 0) {
    console.log('\nImage errors:')
    stats.imageErrors.forEach(e => console.log(`  · ${e.title} [${e.id}]: ${e.error}`))
  }

  if (stats.missingTitle.length > 0) {
    console.log('\nRecords missing title:')
    stats.missingTitle.forEach(id => console.log(`  · ${id}`))
  }

  console.log(`\nOutput: ${OUTPUT_FILE}`)
  console.log('Done.')
}

main().catch(err => {
  console.error('\nFATAL ERROR:', err.message)
  process.exit(1)
})
