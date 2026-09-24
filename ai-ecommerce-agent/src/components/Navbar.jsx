import { useState } from 'react'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const scrollToSection = (id) => {
    setMobileMenuOpen(false)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        <a href="#" className="navbar-brand" aria-label="RAYA Home">
          <img
            src="/RAYA_icon_logo.png"
            alt="RAYA Icon"
            className="navbar-brand-icon"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
          <span className="navbar-brand-text">RAYA</span>
          <span className="navbar-brand-badge">AI AGENT</span>
        </a>

        <nav className={`navbar-nav ${mobileMenuOpen ? 'open' : ''}`}>
          <button
            type="button"
            className="nav-link"
            onClick={() => scrollToSection('scroll-animation-section')}
          >
            Experience
          </button>
          <button
            type="button"
            className="nav-link"
            onClick={() => scrollToSection('features-section')}
          >
            Capabilities
          </button>
          <button
            type="button"
            className="nav-link"
            onClick={() => scrollToSection('architecture-section')}
          >
            Intelligence
          </button>
          <button
            type="button"
            className="nav-link"
            onClick={() => scrollToSection('cta-section')}
          >
            Deploy
          </button>
        </nav>

        <div className="navbar-actions">
          <div className="agent-status-pill" title="Autonomous Agent Node Live">
            <span className="status-dot"></span>
            <span className="status-text">Agent Online</span>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={() => scrollToSection('scroll-animation-section')}
          >
            <span>Explore Demo</span>
            <svg
              className="btn-arrow"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M3.333 8h9.334M8.667 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className={`hamburger ${mobileMenuOpen ? 'active' : ''}`}></span>
          </button>
        </div>
      </div>
    </header>
  )
}
