import { useState } from 'react'
import './SearchFilter.css'

const SORT_OPTIONS = [
  { value: 'title', label: 'Tittel A–Å' },
  { value: 'datoKjopt', label: 'Nyeste først' },
  { value: 'type', label: 'Type' },
]

const FILTER_LABELS = {
  typeObjekt:   'Type objekt',
  lokasjon:     'Lokasjon',
  anskaffetFra: 'Anskaffet fra',
}

const FILTER_PLACEHOLDERS = {
  typeObjekt:   'Alle type objekter',
  lokasjon:     'Alle lokasjoner',
  anskaffetFra: 'Anskaffet fra',
}

export default function SearchFilter({
  search, onSearch,
  filters, onFilter,
  sort, onSort,
  options,
  total, shown,
}) {
  const [panelOpen, setPanelOpen] = useState(false)
  const activeFilters = Object.entries(filters).filter(([, v]) => v).length

  function handleFilter(key, value) {
    onFilter(prev => ({ ...prev, [key]: value }))
  }

  function clearAll() {
    onSearch('')
    onFilter({ typeObjekt: '', lokasjon: '', anskaffetFra: '' })
  }

  return (
    <section className="search-filter">
      <div className="sf-inner">
        <div className="sf-top">
          <div className="sf-search-wrap">
            <span className="sf-search-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </span>
            <input
              className="sf-search"
              type="text"
              placeholder="Søk etter tittel, type, lokasjon…"
              value={search}
              onChange={e => onSearch(e.target.value)}
            />
            {search && (
              <button className="sf-clear-input" onClick={() => onSearch('')} aria-label="Tøm søk">
                ×
              </button>
            )}
          </div>

          {/* Desktop: sort inline in top row */}
          <div className="sf-sort-wrap">
            <label className="sf-sort-label">Sorter</label>
            <select
              className="sf-select"
              value={sort}
              onChange={e => onSort(e.target.value)}
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Mobile: accordion toggle button */}
          <button
            className={`sf-toggle-btn${panelOpen ? ' sf-toggle-btn--open' : ''}`}
            onClick={() => setPanelOpen(v => !v)}
            aria-expanded={panelOpen}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="13" y1="18" x2="21" y2="18"/>
            </svg>
            <span>Filtrer og sorter</span>
            {activeFilters > 0 && (
              <span className="sf-toggle-badge">{activeFilters}</span>
            )}
            <svg
              className={`sf-toggle-chevron${panelOpen ? ' sf-toggle-chevron--open' : ''}`}
              width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
            >
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>
        </div>

        {/* Filter panel: always visible on desktop; collapsible on mobile */}
        <div className={`sf-panel${panelOpen ? ' sf-panel--open' : ''}`}>
          {/* Sort inside panel — mobile only */}
          <div className="sf-sort-in-panel">
            <select
              className="sf-select"
              value={sort}
              onChange={e => onSort(e.target.value)}
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="sf-filters">
            {Object.entries(FILTER_LABELS).map(([key]) => (
              <div key={key} className="sf-filter-item">
                <select
                  className="sf-select"
                  value={filters[key]}
                  onChange={e => handleFilter(key, e.target.value)}
                >
                  <option value="">{FILTER_PLACEHOLDERS[key]}</option>
                  {(options[key] || []).map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            ))}

            {(activeFilters > 0 || search) && (
              <button className="sf-clear-all" onClick={clearAll}>
                Nullstill filter
              </button>
            )}
          </div>
        </div>

        <div className="sf-count">
          <span className="sf-count-num">{shown}</span>
          <span className="sf-count-of"> av </span>
          <span className="sf-count-total">{total}</span>
          <span className="sf-count-label"> objekter</span>
        </div>
      </div>
    </section>
  )
}
