import { useState } from 'react'

export default function StoreFooter({ onOpenOrderTracker }) {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
      setEmail('')
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="store-footer-root">
      {/* Newsletter Section */}
      <div className="footer-newsletter-band">
        <div className="newsletter-container">
          <div className="newsletter-text-col">
            <span className="newsletter-badge">ATELIER PRIVILEGE</span>
            <h3 className="newsletter-heading">Receive Curated Archive Drops</h3>
            <p className="newsletter-sub">
              Enjoy 10% off your inaugural order and private access to limited capsule releases.
            </p>
          </div>

          <div className="newsletter-form-col">
            {subscribed ? (
              <div className="newsletter-success-box">
                <span>✓ Thank you for subscribing. Use code <strong>WELCOME10</strong> for 10% off.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="newsletter-form">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="newsletter-input"
                />
                <button type="submit" className="newsletter-submit-btn">
                  Join Archive
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="footer-main-container">
        <div className="footer-columns-grid">
          {/* Brand Info */}
          <div className="footer-col brand-col">
            <h4 className="footer-brand-name">RAYA ATELIER</h4>
            <p className="footer-brand-bio">
              Founded on principles of Scandinavian architectural proportion and Japanese textile
              integrity. Every garment is crafted to endure beyond ephemeral trend cycles.
            </p>
            <div className="footer-warehouse-status">
              <span className="wh-indicator-dot" />
              <span>Central Warehouse Live: Standard Dispatch 3–4 Days</span>
            </div>
          </div>

          {/* Catalog Links */}
          <div className="footer-col">
            <h5 className="footer-title">Collections</h5>
            <ul className="footer-links">
              <li><a href="#catalog-grid-anchor">Outerwear Suite</a></li>
              <li><a href="#catalog-grid-anchor">Merino & Cashmere</a></li>
              <li><a href="#catalog-grid-anchor">Tailored Trousers</a></li>
              <li><a href="#catalog-grid-anchor">Minimalist Footwear</a></li>
              <li><a href="#catalog-grid-anchor">Leather Accessories</a></li>
            </ul>
          </div>

          {/* Client Concierge */}
          <div className="footer-col">
            <h5 className="footer-title">Customer Care</h5>
            <ul className="footer-links">
              <li>
                <button type="button" className="footer-link-btn" onClick={onOpenOrderTracker}>
                  Track Order Status
                </button>
              </li>
              <li>
                <button type="button" className="footer-link-btn" onClick={() => setSizeGuideOpen(true)}>
                  Sizing Guide
                </button>
              </li>
              <li><a href="#catalog-grid-anchor">Shipping & Dispatch</a></li>
              <li><a href="#catalog-grid-anchor">30-Day Returns</a></li>
              <li><a href="#catalog-grid-anchor">Sustainability Charter</a></li>
            </ul>
          </div>

          {/* Legal & Social */}
          <div className="footer-col">
            <h5 className="footer-title">Connect</h5>
            <ul className="footer-links">
              <li><a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a></li>
              <li><a href="https://pinterest.com" target="_blank" rel="noreferrer">Pinterest</a></li>
              <li><a href="mailto:concierge@rayaatelier.com">concierge@rayaatelier.com</a></li>
              <li><span className="footer-demo-tag">Portfolio E-Commerce Demo</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <p className="copyright-note">
            © {new Date().getFullYear()} RAYA ATELIER. Minimalist fashion e-commerce storefront. Simulated portfolio project.
          </p>

          <div className="payment-badges-row">
            <span className="payment-badge">Apple Pay</span>
            <span className="payment-badge">Visa</span>
            <span className="payment-badge">Mastercard</span>
            <span className="payment-badge">Amex</span>
            <span className="payment-badge">PayPal</span>
            <span className="payment-badge">Klarna</span>
          </div>

          <button
            type="button"
            className="footer-back-to-top"
            onClick={scrollToTop}
            aria-label="Scroll back to top"
          >
            <span>Top</span> ↑
          </button>
        </div>
      </div>

      {/* Sizing Guide Modal */}
      {sizeGuideOpen && (
        <div className="modal-backdrop" onClick={() => setSizeGuideOpen(false)} role="dialog">
          <div className="size-guide-modal" onClick={(e) => e.stopPropagation()}>
            <div className="size-guide-header">
              <h3>ATELIER SIZING GUIDE</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSizeGuideOpen(false)}
              >
                ✕
              </button>
            </div>
            <p className="size-guide-intro">
              Our garments are cut with relaxed Scandinavian proportions. We recommend selecting
              your true size for an intentional architectural drape, or sizing down for a closer fit.
            </p>
            <div className="size-guide-table-wrap">
              <table className="size-guide-table">
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Chest (in)</th>
                    <th>Waist (in)</th>
                    <th>Hips (in)</th>
                    <th>EU Size</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>XS</td>
                    <td>34 - 36</td>
                    <td>28 - 30</td>
                    <td>34 - 36</td>
                    <td>44</td>
                  </tr>
                  <tr>
                    <td>S</td>
                    <td>36 - 38</td>
                    <td>30 - 32</td>
                    <td>36 - 38</td>
                    <td>46</td>
                  </tr>
                  <tr>
                    <td>M</td>
                    <td>38 - 40</td>
                    <td>32 - 34</td>
                    <td>38 - 40</td>
                    <td>48</td>
                  </tr>
                  <tr>
                    <td>L</td>
                    <td>40 - 42</td>
                    <td>34 - 36</td>
                    <td>40 - 42</td>
                    <td>50</td>
                  </tr>
                  <tr>
                    <td>XL</td>
                    <td>42 - 44</td>
                    <td>36 - 38</td>
                    <td>42 - 44</td>
                    <td>52</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <button
              type="button"
              className="btn-atelier-primary"
              onClick={() => setSizeGuideOpen(false)}
            >
              Close Sizing Guide
            </button>
          </div>
        </div>
      )}
    </footer>
  )
}
