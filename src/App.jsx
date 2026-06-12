import { useState, useMemo } from 'react'
import Header from './components/Header'
import SearchFilter from './components/SearchFilter'
import ObjectGrid from './components/ObjectGrid'
import ObjectModal from './components/ObjectModal'
import objectsData from '../public/data/objects.json'
import './App.css'

export default function App() {
  const [objects] = useState(objectsData)
  const loading = false
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({
    typeObjekt: '',
    lokasjon: '',
    anskaffetFra: '',
    eier: '',
  })
  const [sort, setSort] = useState('title')
  const [selectedObject, setSelectedObject] = useState(null)

  const filterOptions = useMemo(() => {
    const unique = key => [...new Set(objects.map(o => o[key]).filter(Boolean).map(v => v.trim()))].sort()
    return {
      typeObjekt: unique('typeObjekt'),
      lokasjon: unique('lokasjon'),
      anskaffetFra: unique('anskaffetFra'),
      eier: unique('eier'),
    }
  }, [objects])

  const filtered = useMemo(() => {
    let result = objects

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(o =>
        (o.title || '').toLowerCase().includes(q) ||
        (o.typeObjekt || '').toLowerCase().includes(q) ||
        (o.lokasjon || '').toLowerCase().includes(q) ||
        (o.informasjon || '').toLowerCase().includes(q) ||
        (o.anskaffetFra || '').toLowerCase().includes(q)
      )
    }

    Object.entries(filters).forEach(([key, val]) => {
      if (val) result = result.filter(o => (o[key] || '').trim() === val)
    })

    result = [...result].sort((a, b) => {
      if (sort === 'title') return (a.title || '').localeCompare(b.title || '', 'no')
      if (sort === 'type') return (a.typeObjekt || '').localeCompare(b.typeObjekt || '', 'no')
      if (sort === 'datoKjopt') {
        const monthMap = { Januar:1,Februar:2,Mars:3,April:4,Mai:5,Juni:6,
          Juli:7,August:8,September:9,Oktober:10,November:11,Desember:12 }
        const parse = s => {
          if (!s) return 0
          const parts = s.split(' ')
          const month = monthMap[parts[0]] || 0
          const year = parseInt(parts[1] || parts[0]) || 0
          return year * 100 + month
        }
        return parse(b.datoKjopt) - parse(a.datoKjopt)
      }
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
