import './Header.css'

export default function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo-brand">
          <img
            src="./Gladstad-Logo.png"
            alt="Glastad Samlinger"
            className="logo-mark"
          />
          <div className="logo-divider">
            <span className="ornament-line" />
            <span className="ornament-diamond" />
            <span className="ornament-line" />
          </div>
          <p className="logo-text">Glastads samlinger</p>
        </div>
      </div>
    </header>
  )
}
