export default function FeatureGrid() {
  const features = [
    {
      badge: 'VISION & AI',
      title: 'Multimodal Neural Search',
      description:
        'Upload images, paste inspiration links, or chat conversationally. RAYA decomposes fashion items by silhouette, pattern, and color tone.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <path d="M11 8v6M8 11h6" />
        </svg>
      ),
      tag: 'Real-time Vector Search',
    },
    {
      badge: 'INTELLIGENCE',
      title: 'Autonomous Negotiation',
      description:
        'The agent automatically checks dynamic discount codes, bundle promos, and merchant rewards, locking in optimal pricing before checkout.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      tag: 'Automated Savings',
    },
    {
      badge: 'STYLING',
      title: 'Personalized Wardrobe Curation',
      description:
        'Context-aware styling adapts to calendar events, regional weather, and personal aesthetic preferences to construct cohesive daily looks.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
        </svg>
      ),
      tag: 'Dynamic Outfits',
    },
    {
      badge: 'SECURITY',
      title: 'Tokenized Frictionless Checkout',
      description:
        'Zero form-filling. Secure biometric authorization and tokenized merchant gateways settle purchases inside the conversational interface.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
      tag: 'One-Tap Execution',
    },
    {
      badge: 'SPEED',
      title: 'Sub-100ms Catalog Indexing',
      description:
        'Live sync with Shopify, WooCommerce, and custom headless store APIs keeps availability, inventory count, and variant sizing strictly accurate.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      ),
      tag: 'Live Inventory',
    },
    {
      badge: 'MEMORY',
      title: 'Self-Evolving Taste Graph',
      description:
        'Long-term contextual memory preserves sizing nuance, favorite materials, and style progressions without requiring repetitive configuration.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
          <line x1="6" y1="1" x2="6" y2="4" />
          <line x1="10" y1="1" x2="10" y2="4" />
          <line x1="14" y1="1" x2="14" y2="4" />
        </svg>
      ),
      tag: 'Taste Memory',
    },
  ]

  return (
    <section id="features-section" className="features-grid-section">
      <div className="section-header-block">
        <div className="section-pill">
          <span className="sparkle-icon">✦</span>
          <span>AUTONOMOUS ARCHITECTURE</span>
        </div>
        <h2 className="section-headline">
          Engineered for <span className="text-gradient">Intelligent Commerce</span>
        </h2>
        <p className="section-subheadline">
          Beyond traditional search bars. RAYA transforms passive shopping catalogs into
          a proactive conversational intelligence that acts on your behalf.
        </p>
      </div>

      <div className="bento-grid-wrapper">
        {features.map((feat, idx) => (
          <div key={idx} className="bento-card glass-panel">
            <div className="bento-card-glow" aria-hidden="true" />
            <div className="bento-top">
              <div className="bento-icon-box">{feat.icon}</div>
              <span className="bento-badge">{feat.badge}</span>
            </div>
            <h3 className="bento-title">{feat.title}</h3>
            <p className="bento-desc">{feat.description}</p>
            <div className="bento-footer">
              <span className="bento-tag">{feat.tag}</span>
              <span className="bento-arrow">→</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
