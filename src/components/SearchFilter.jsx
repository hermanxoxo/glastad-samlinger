import './SearchFilter.css'

const SORT_OPTIONS = [
  { value: 'title', label: 'Tittel A–Å' },
  { value: 'datoKjopt', label: 'Nyeste først' },
  { value: 'type', label: 'Type' },
]

const FILTER_LABELS = {
  typeObjekt: 'Type objekt',
  lokasjon: 'Lokasjon',
  anskaffetFra: 'Anskaffet fra',
  eier: 'Eier',
}

const FILTER_PLACEHOLDERS = {
  typeObjekt: 'Alle type objekter',
  lokasjon: 'Alle lokasjoner',
  anskaffetFra: 'Anskaffet fra',
  eier: 'Alle eiere',
}

export default function SearchFilter({
  search, onSearch,
  filters, onFilter,
  sort, onSort,
  options,
  total, shown,
}) {
  const activeFilters = Object.entries(filters).filter(([, v]) => v).length

  function handleFilter(key, value) {
    onFilter(prev => ({ ...prev, [key]: value }))
  }

  function clearAll() {
    onSearch('')
    onFilter({ typeObjekt: '', lokasjon: '', anskaffetFra: '', eier: '' })
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
        </div>

        <div className="sf-filters">
          {Object.entries(FILTER_LABELS).map(([key, label]) => (
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
