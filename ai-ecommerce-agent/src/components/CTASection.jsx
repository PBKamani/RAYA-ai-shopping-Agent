export default function CTASection() {
  return (
    <section id="cta-section" className="cta-wrapper-section">
      <div className="cta-inner-card glass-panel">
        <div className="cta-glow-radial" aria-hidden="true" />
        
        <div className="cta-content">
          <div className="cta-badge">
            <span className="badge-spark">✦</span>
            <span>ENTERPRISE AGENTIC COMMERCE</span>
          </div>

          <h2 className="cta-heading">
            Deploy Autonomous Intelligence to Your Store
          </h2>

          <p className="cta-description">
            Integrate RAYA into your Shopify, headless storefront, or mobile app in under 15 minutes.
            Transform passive visitors into delighted repeat buyers with zero human overhead.
          </p>

          {/* Interactive Agent Chat Preview Card */}
          <div className="agent-dialogue-mockup glass-panel">
            <div className="dialogue-header">
              <div className="agent-avatar-wrap">
                <span className="agent-avatar-dot" />
                <span className="agent-name">RAYA Concierge</span>
              </div>
              <span className="latency-pill">18ms response</span>
            </div>

            <div className="dialogue-body">
              <div className="message-bubble user-bubble">
                <p>
                  "Find an oversized minimalist trench coat in charcoal wool, size M, under $250."
                </p>
              </div>
              <div className="message-bubble agent-bubble">
                <p>
                  "Matched 3 pieces from our sustainable archive. Ranked by thermal weight and wool purity.
                  Applied code <strong>VIPSTYLE</strong> (-15%). Ready to checkout with your saved Apple Pay."
                </p>
                <div className="bubble-action-row">
                  <span className="bubble-price">$212.50</span>
                  <span className="bubble-btn">1-Tap Confirm</span>
                </div>
              </div>
            </div>
          </div>

          <div className="cta-actions-group">
            <button
              type="button"
              className="btn-primary btn-large"
              onClick={() => {
                const scrollSec = document.getElementById('scroll-animation-section')
                if (scrollSec) scrollSec.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              <span>Explore Interactive Demo</span>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3.333 8h9.334M8.667 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <a
              href="mailto:contact@raya.ai"
              className="btn-secondary btn-large"
            >
              Request API Access
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
