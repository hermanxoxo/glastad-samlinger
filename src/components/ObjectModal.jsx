import { useEffect, useState, useCallback } from 'react'
import './ObjectModal.css'

const META_FIELDS = [
  { key: 'typeObjekt',       label: 'Type' },
  { key: 'lokasjon',         label: 'Lokasjon' },
  { key: 'samling',          label: 'Samling' },
  { key: 'anskaffetFra',     label: 'Anskaffet fra' },
  { key: 'opprinnelsesdato', label: 'Opprinnelsesdato' },
  { key: 'datoKjopt',        label: 'Dato kjøpt' },
  { key: 'eier',             label: 'Eier' },
]

export default function ObjectModal({ object, onClose }) {
  // Build image list — use images[] array if available, fall back to image string
  const images = (object.images && object.images.length > 0)
    ? object.images
    : (object.image ? [object.image] : [])

  const [currentIdx, setCurrentIdx] = useState(0)
  const [imgError,   setImgError]   = useState(false)

  const goTo = useCallback((idx) => {
    setCurrentIdx(idx)
    setImgError(false)
  }, [])

  const prev = useCallback(() =>
    goTo((currentIdx - 1 + images.length) % images.length),
    [currentIdx, images.length, goTo]
  )
  const next = useCallback(() =>
    goTo((currentIdx + 1) % images.length),
    [currentIdx, images.length, goTo]
  )

  const handleKey = useCallback(e => {
    if (e.key === 'Escape')     onClose()
    if (e.key === 'ArrowLeft')  prev()
    if (e.key === 'ArrowRight') next()
  }, [onClose, prev, next])

  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    const scrollY = window.scrollY
    document.body.dataset.scrollY = String(scrollY)
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    return () => {
      document.removeEventListener('keydown', handleKey)
      const y = parseInt(document.body.dataset.scrollY || '0')
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      window.scrollTo(0, y)
    }
  }, [handleKey])

  const hasImg     = images.length > 0 && !imgError
  const multiImage = images.length > 1
  const currentSrc = hasImg ? `./${images[currentIdx]}` : null

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal" onClick={e => e.stopPropagation()}>
        {/* Top bar: zero-height on desktop (close btn floats), sticky header on mobile */}
        <div className="modal-top-bar">
          <button className="modal-close" onClick={onClose} aria-label="Lukk">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="modal-layout">
          {/* ── Image panel ──────────────────────────────────────────────── */}
          <div className="modal-image-panel">
            {hasImg ? (
              <img
                key={currentSrc}
                className="modal-image"
                src={currentSrc}
                alt={`${object.title}${multiImage ? ` (${currentIdx + 1}/${images.length})` : ''}`}
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="modal-placeholder">
                <svg className="modal-placeholder-icon" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="8" y="8" width="64" height="64" rx="1" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4"/>
                  <rect x="18" y="18" width="44" height="44" rx="1" stroke="currentColor" strokeWidth="0.75"/>
                  <line x1="8" y1="8" x2="18" y2="18" stroke="currentColor" strokeWidth="0.75"/>
                  <line x1="72" y1="8" x2="62" y2="18" stroke="currentColor" strokeWidth="0.75"/>
                  <line x1="8" y1="72" x2="18" y2="62" stroke="currentColor" strokeWidth="0.75"/>
                  <line x1="72" y1="72" x2="62" y2="62" stroke="currentColor" strokeWidth="0.75"/>
                  <rect x="37" y="37" width="6" height="6" transform="rotate(45 40 40)" fill="currentColor"/>
                </svg>
                <div className="modal-placeholder-ornament">
                  <span className="modal-placeholder-line"/>
                  <span className="modal-placeholder-diamond"/>
                  <span className="modal-placeholder-line"/>
                </div>
                <p>Bilde mangler</p>
              </div>
            )}

            {/* Carousel nav — only shown when multiple images exist */}
            {multiImage && hasImg && (
              <>
                <button className="carousel-btn carousel-prev" onClick={e => { e.stopPropagation(); prev() }} aria-label="Forrige bilde">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <button className="carousel-btn carousel-next" onClick={e => { e.stopPropagation(); next() }} aria-label="Neste bilde">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
                <div className="carousel-counter">
                  {currentIdx + 1} / {images.length}
                </div>
                <div className="carousel-dots">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      className={`carousel-dot${i === currentIdx ? ' active' : ''}`}
                      onClick={e => { e.stopPropagation(); goTo(i) }}
                      aria-label={`Bilde ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* ── Content panel ────────────────────────────────────────────── */}
          <div className="modal-content">
            <div className="modal-header">
              {object.typeObjekt && (
                <span className="modal-type">{object.typeObjekt}</span>
              )}
              <h2 className="modal-title">{object.title || 'Uten tittel'}</h2>
              <div className="modal-divider">
                <span className="divider-line" />
                <span className="divider-gem" />
                <span className="divider-line" />
              </div>
            </div>

            <div className="modal-meta-grid">
              {META_FIELDS.map(({ key, label }) =>
                object[key] ? (
                  <div key={key} className="modal-meta-row">
                    <span className="modal-meta-label">{label}</span>
                    <span className="modal-meta-value">{object[key]}</span>
                  </div>
                ) : null
              )}
            </div>

            {object.informasjon && (
              <div className="modal-info">
                <h3 className="modal-info-heading">Beskrivelse</h3>
                <p className="modal-info-text">{object.informasjon}</p>
              </div>
            )}

            {object.url && object.url.startsWith('http') && (
              <div className="modal-link-wrap">
                <a
                  className="modal-link"
                  href={object.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Mer informasjon
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" />
                  </svg>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
