import { useState } from 'react'
import './ObjectCard.css'

export default function ObjectCard({ object, onClick }) {
  const [imgError, setImgError] = useState(false)
  const hasImg = object.hasImage && object.image && !imgError

  return (
    <article className="card" onClick={onClick} role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}>
      <div className="card-image-wrap">
        {hasImg ? (
          <img
            className="card-image"
            src={`./${object.image}`}
            alt={object.title}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="card-placeholder">
            <div className="card-placeholder-inner">
              <svg className="card-placeholder-icon" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="8" y="8" width="48" height="48" rx="1" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3"/>
                <rect x="16" y="16" width="32" height="32" rx="1" stroke="currentColor" strokeWidth="0.75"/>
                <line x1="8" y1="8" x2="16" y2="16" stroke="currentColor" strokeWidth="0.75"/>
                <line x1="56" y1="8" x2="48" y2="16" stroke="currentColor" strokeWidth="0.75"/>
                <line x1="8" y1="56" x2="16" y2="48" stroke="currentColor" strokeWidth="0.75"/>
                <line x1="56" y1="56" x2="48" y2="48" stroke="currentColor" strokeWidth="0.75"/>
                <rect x="30" y="30" width="4" height="4" transform="rotate(45 32 32)" fill="currentColor"/>
              </svg>
              <span className="card-placeholder-label">Bilde mangler</span>
            </div>
          </div>
        )}
        <div className="card-image-overlay" />
        {object.typeObjekt && (
          <span className="card-type-badge">{object.typeObjekt}</span>
        )}
      </div>

      <div className="card-body">
        <h2 className="card-title">{object.title || 'Uten tittel'}</h2>
        <div className="card-meta">
          {object.lokasjon && (
            <span className="card-meta-item">
              <span className="card-meta-label">Lokasjon</span>
              <span className="card-meta-value">{object.lokasjon}</span>
            </span>
          )}
          {object.samling && (
            <span className="card-meta-item">
              <span className="card-meta-label">Samling</span>
              <span className="card-meta-value">{object.samling}</span>
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
