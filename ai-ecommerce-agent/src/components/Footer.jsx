export default function Footer() {
  const currentYear = new Date().getFullYear()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="footer-wrap">
      <div className="footer-container">
        <div className="footer-top-row">
          <div className="footer-brand-col">
            <div className="footer-brand-header">
              <img
                src="/RAYA_icon_logo.png"
                alt="RAYA Logo"
                className="footer-logo-img"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
              <span className="footer-brand-title">RAYA</span>
            </div>
            <p className="footer-brand-desc">
              Next-generation autonomous AI shopping agent. Bridging neural computer vision,
              semantic understanding, and frictionless conversational commerce.
            </p>
            <div className="system-health-pill">
              <span className="health-dot" />
              <span>All Systems Operational (99.98% uptime)</span>
            </div>
          </div>

          <div className="footer-links-grid">
            <div className="footer-col">
              <h4 className="footer-col-title">Agent Platform</h4>
              <ul className="footer-link-list">
                <li><a href="#scroll-animation-section">Scroll Engine</a></li>
                <li><a href="#features-section">Vision & Discovery</a></li>
                <li><a href="#features-section">Autonomous Checkout</a></li>
                <li><a href="#features-section">Dynamic Styling</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4 className="footer-col-title">Developers</h4>
              <ul className="footer-link-list">
                <li><a href="https://github.com" target="_blank" rel="noreferrer">SDK & APIs</a></li>
                <li><a href="https://vite.dev" target="_blank" rel="noreferrer">Documentation</a></li>
                <li><a href="#architecture-section">Model Architecture</a></li>
                <li><a href="#features-section">Security & Compliance</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4 className="footer-col-title">Connect</h4>
              <ul className="footer-link-list">
                <li><a href="https://x.com" target="_blank" rel="noreferrer">X / Twitter</a></li>
                <li><a href="https://discord.com" target="_blank" rel="noreferrer">Discord Community</a></li>
                <li><a href="https://github.com" target="_blank" rel="noreferrer">GitHub Repo</a></li>
                <li><a href="mailto:contact@raya.ai">Support & Inquiries</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom-row">
          <p className="copyright-text">
            © {currentYear} RAYA AI Technologies. Engineered for next-generation digital commerce.
          </p>
          <button
            type="button"
            className="back-to-top-btn"
            onClick={scrollToTop}
            aria-label="Back to top"
          >
            <span>Back to top</span>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 12.667V3.333M3.333 8L8 3.333 12.667 8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  )
}
