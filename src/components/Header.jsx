import './Header.css'

export default function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-logo-wrap">
          <img
            src="./Gladstad-Logo.webp"
            alt="Glastad Samlinger"
            className="header-logo"
          />
        </div>
        <div className="header-ornament">
          <span className="ornament-line" />
          <span className="ornament-diamond" />
          <span className="ornament-line" />
        </div>
        <p className="header-title">Glastads kunst- og gjenstandssamlinger</p>
      </div>
    </header>
  )
}
