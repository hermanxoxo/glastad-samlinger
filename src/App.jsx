import { useState, useMemo } from 'react'
import Header from './components/Header'
import SearchFilter from './components/SearchFilter'
import ObjectGrid from './components/ObjectGrid'
import ObjectModal from './components/ObjectModal'
import itemsData from '../public/data/items.json'
import './App.css'

/** Parse a date value from Airtable — handles ISO dates and Norwegian text */
function parseDateValue(s) {
  if (!s) return 0
  // ISO date or datetime (e.g. "2020-11-01" or "2020-11-01T00:00:00.000Z")
  const iso = new Date(s)
  if (!isNaN(iso.getTime()) && s.includes('-')) return iso.getTime()
  // "Month Year" text — supports both Norwegian and English month names
  const MONTHS = {
    januar:1, februar:2, mars:3, april:4, mai:5, juni:6,
    juli:7, august:8, september:9, oktober:10, november:11, desember:12,
    january:1, february:2, march:3, may:5, june:6,
    july:7, october:10, december:12,
  }
  const parts = s.toLowerCase().trim().split(/\s+/)
  if (parts.length >= 2) {
    const month = MONTHS[parts[0]] || 0
    const year  = parseInt(parts[1]) || 0
    if (year > 1000) return year * 10000 + month * 100
  }
  // Just a year number
  const year = parseInt(s)
  if (!isNaN(year) && year > 1000) return year * 10000
  return 0
}

export default function App() {
  const [objects]         = useState(itemsData)
  const loading           = false
  const [search, setSearch]           = useState('')
  const [filters, setFilters]         = useState({
    typeObjekt: '',
    lokasjon:   '',
    anskaffetFra: '',
  })
  const [sort, setSort]               = useState('title')
  const [selectedObject, setSelectedObject] = useState(null)

  const filterOptions = useMemo(() => {
    const unique = key =>
      [...new Set(objects.map(o => o[key]).filter(Boolean).map(v => v.trim()))].sort()
    return {
      typeObjekt:   unique('typeObjekt'),
      lokasjon:     unique('lokasjon'),
      anskaffetFra: unique('anskaffetFra'),
    }
  }, [objects])

  const filtered = useMemo(() => {
    let result = objects

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(o =>
        (o.title        || '').toLowerCase().includes(q) ||
        (o.typeObjekt   || '').toLowerCase().includes(q) ||
        (o.lokasjon     || '').toLowerCase().includes(q) ||
        (o.informasjon  || '').toLowerCase().includes(q) ||
        (o.anskaffetFra || '').toLowerCase().includes(q) ||
        (o.eier         || '').toLowerCase().includes(q) ||
        (o.samling      || '').toLowerCase().includes(q)
      )
    }

    Object.entries(filters).forEach(([key, val]) => {
      if (val) result = result.filter(o => (o[key] || '').trim() === val)
    })

    result = [...result].sort((a, b) => {
      if (sort === 'title') return (a.title || '').localeCompare(b.title || '', 'no')
      if (sort === 'type')  return (a.typeObjekt || '').localeCompare(b.typeObjekt || '', 'no')
      if (sort === 'datoKjopt') return parseDateValue(b.datoKjopt) - parseDateValue(a.datoKjopt)
      return 0
    })

    return result
  }, [objects, search, filters, sort])

  return (
    <div className="app">
      <Header />
      <main className="main">
        <SearchFilter
          search={search}
          onSearch={setSearch}
          filters={filters}
          onFilter={setFilters}
          sort={sort}
          onSort={setSort}
          options={filterOptions}
          total={objects.length}
          shown={filtered.length}
        />
        {loading ? (
          <div className="loading">
            <div className="loading-spinner" />
            <p>Laster samlingen…</p>
          </div>
        ) : (
          <ObjectGrid objects={filtered} onSelect={setSelectedObject} />
        )}
      </main>
      {selectedObject && (
        <ObjectModal
          object={selectedObject}
          onClose={() => setSelectedObject(null)}
        />
      )}
    </div>
  )
}
