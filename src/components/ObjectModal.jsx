import { useEffect, useState, useCallback } from 'react'
import './ObjectModal.css'

const META_FIELDS = [
  { key: 'typeObjekt',      label: 'Type' },
  { key: 'lokasjon',        label: 'Lokasjon' },
  { key: 'anskaffetFra',    label: 'Anskaffet fra' },
  { key: 'opprinnelsesdato',label: 'Opprinnelsesdato' },
  { key: 'datoKjopt',       label: 'Dato kjøpt' },
  { key: 'eier',            label: 'Eier' },
]

export default function ObjectModal({ object, onClose }) {
  const [imgError, setImgError] = useState(false)

  const handleKey = useCallback(e => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [handleKey])

  const hasImg = object.hasImage && object.image && !imgError

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Lukk">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="modal-layout">
          <div className="modal-image-panel">
            {hasImg ? (
              <img
                className="modal-image"
                src={`./images/${object.image}`}
                alt={object.title}
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="modal-placeholder">
                <span className="modal-placeholder-icon">◇</span>
                <p>Ingen bilde tilgjengelig</p>
              </div>
            )}
          </div>

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
                  Åpne i Airtable
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
