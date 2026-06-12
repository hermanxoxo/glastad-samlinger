import ObjectCard from './ObjectCard'
import './ObjectGrid.css'

export default function ObjectGrid({ objects, onSelect }) {
  if (objects.length === 0) {
    return (
      <div className="grid-empty">
        <div className="grid-empty-icon">◇</div>
        <p className="grid-empty-title">Ingen objekter funnet</p>
        <p className="grid-empty-sub">Prøv å endre søk eller filter</p>
      </div>
    )
  }

  return (
    <section className="grid-section">
      <div className="grid-container">
        {objects.map((obj, i) => (
          <ObjectCard
            key={obj.id || i}
            object={obj}
            onClick={() => onSelect(obj)}
          />
        ))}
      </div>
    </section>
  )
}
