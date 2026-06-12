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
            <span className="card-placeholder-icon">◇</span>
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
