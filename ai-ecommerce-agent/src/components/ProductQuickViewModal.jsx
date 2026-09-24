import { useState, useEffect } from 'react'
import { useCart } from '../hooks/useCart'

export default function ProductQuickViewModal({ product, onClose }) {
  if (!product) return null
  return <QuickViewModalInner key={product.id} product={product} onClose={onClose} />
}

function QuickViewModalInner({ product, onClose }) {
  const { addToCart, toggleWishlist, isInWishlist } = useCart()

  const [selectedSize, setSelectedSize] = useState(() => product.sizes[0] || 'M')
  const [selectedColor, setSelectedColor] = useState(
    () => product.colors[0] || { name: 'Natural', hex: '#FAF9F6' }
  )
  const [quantity, setQuantity] = useState(1)
  const [isAdded, setIsAdded] = useState(false)

  // Close on ESC
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const isSaved = isInWishlist(product.id)

  const handleAdd = () => {
    setIsAdded(true)
    addToCart(product, selectedSize, selectedColor?.name, quantity)
    setTimeout(() => {
      setIsAdded(false)
    }, 600)
  }

  // AI Styling Suggestion generation (Prepared for LangChain / LangGraph backend integration)
  const getStylingAdvice = (p) => {
    const art = (p.articleType || '').toLowerCase()
    const sub = (p.subCategory || '').toLowerCase()
    const master = (p.masterCategory || '').toLowerCase()

    if (art.includes('tshirt') || art.includes('shirt')) {
      return `Pairs effortlessly with tailored trousers or relaxed raw denim in a minimalist monochrome palette. Ideal for tonal layering.`
    }
    if (art.includes('jacket') || art.includes('sweatshirt') || art.includes('fleece')) {
      return `Engineered for structured layering over an essential base tee. Delivers architectural warmth and an effortless drape.`
    }
    if (sub.includes('shoes') || master.includes('footwear')) {
      return `Grounds minimalist casual tailoring with an understated modern profile. Designed for all-day urban movement.`
    }
    if (sub.includes('bags') || master.includes('accessories') || art.includes('cap')) {
      return `Understated functional utility defined by pure lines. An essential archive accessory for daily elevated carry.`
    }
    if (sub.includes('bottomwear') || art.includes('pants') || art.includes('shorts')) {
      return `Crafted with relaxed ease through the seat and an understated ankle break. Pairs naturally with low-profile sneakers and heavy cotton tees.`
    }
    return `Crafted to integrate seamlessly into a modular minimalist wardrobe, elevating functional everyday simplicity.`
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="quick-view-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close product quick view"
        >
          ✕
        </button>

        <div className="quick-view-grid">
          {/* Left: Product Image Gallery */}
          <div className="modal-media-col">
            <div className="modal-image-chassis">
              <img
                src={product.image}
                alt={product.title || product.name}
                className="modal-main-image"
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src =
                    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750" viewBox="0 0 600 750" fill="%23F4F3EE"><rect width="600" height="750" fill="%23F4F3EE"/><text x="50%" y="48%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%238C877D" letter-spacing="1">RAYA ATELIER</text><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="13" fill="%23B0AAA0">ARCHIVED PIECE</text></svg>'
                }}
              />
            </div>

            <div className="modal-guarantee-badges">
              <div className="guarantee-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Authentic Textile Craft</span>
              </div>
              <div className="guarantee-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>Central Storehouse Stock</span>
              </div>
              <div className="guarantee-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                <span>30-Day Effortless Returns</span>
              </div>
            </div>
          </div>

          {/* Right: Product Details & Purchase Form */}
          <div className="modal-details-col">
            <div className="modal-header-section">
              <div className="modal-brand-badge">{product.brand}</div>
              <h2 className="modal-product-title">{product.title || product.name}</h2>
              <div className="modal-sku-row">
                <span className="modal-sku-tag">ID: {product.id}</span>
                <span className="modal-dot">•</span>
                <span className="modal-category-tag">{product.masterCategory}</span>
                {product.subCategory && (
                  <>
                    <span className="modal-dot">•</span>
                    <span className="modal-category-tag">{product.subCategory}</span>
                  </>
                )}
                {product.articleType && (
                  <>
                    <span className="modal-dot">•</span>
                    <span className="modal-category-tag">{product.articleType}</span>
                  </>
                )}
                <span className="modal-dot">•</span>
                <span className="modal-gender-tag">{product.gender}</span>
              </div>

              {/* Price & Rating */}
              <div className="modal-price-rating-row">
                <div className="modal-price-box">
                  <span className="modal-current-price">${product.price}</span>
                  {product.originalPrice && (
                    <span className="modal-original-price">
                      ${product.originalPrice}
                    </span>
                  )}
                  {product.originalPrice && (
                    <span className="modal-discount-pill">
                      Save ${product.originalPrice - product.price}
                    </span>
                  )}
                </div>

                <div className="modal-rating-badge">
                  <span className="rating-star">★</span>
                  <span className="rating-num">{product.rating}</span>
                  <span className="rating-reviews">({product.reviewsCount} reviews)</span>
                </div>
              </div>
            </div>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="modal-option-section">
                <div className="option-label-row">
                  <span className="option-label">Color:</span>
                  <span className="option-selected-val">{selectedColor?.name}</span>
                </div>
                <div className="color-options-row">
                  {product.colors.map((col) => (
                    <button
                      key={col.name}
                      type="button"
                      className={`modal-color-swatch ${
                        selectedColor?.name === col.name ? 'is-selected' : ''
                      }`}
                      style={{ backgroundColor: col.hex }}
                      onClick={() => setSelectedColor(col)}
                      title={col.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="modal-option-section">
                <div className="option-label-row">
                  <span className="option-label">Size:</span>
                  <span className="size-guide-link">Fit: Regular Scandinavian Cut</span>
                </div>
                <div className="size-options-row">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      className={`modal-size-btn ${selectedSize === sz ? 'is-selected' : ''}`}
                      onClick={() => setSelectedSize(sz)}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Stock */}
            <div className="modal-qty-stock-row">
              <div className="qty-picker">
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <span className="qty-value">{quantity}</span>
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantity((q) => Math.min(product.stockCount, q + 1))}
                  disabled={quantity >= product.stockCount}
                >
                  +
                </button>
              </div>

              <div className="stock-status-box">
                <span className="stock-indicator-dot" />
                <span className="stock-status-text">
                  In Stock ({product.stockCount} available)
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="modal-actions-row">
              <button
                type="button"
                className={`modal-add-bag-btn ${isAdded ? 'is-added' : ''}`}
                onClick={handleAdd}
              >
                {isAdded ? 'Added to Bag ✓' : `Add to Bag • $${product.price * quantity}`}
              </button>

              <button
                type="button"
                className={`modal-wishlist-toggle ${isSaved ? 'is-saved' : ''}`}
                onClick={() => toggleWishlist(product.id)}
                title={isSaved ? 'Saved in Wishlist' : 'Save to Wishlist'}
                aria-label="Wishlist toggle"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill={isSaved ? '#1A1917' : 'none'}
                  stroke="#1A1917"
                  strokeWidth="1.6"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            </div>

            {/* Fabric & Description Details */}
            <div className="modal-textile-specs">
              <h4 className="specs-title">Fabric & Construction</h4>
              <p className="specs-fabric-badge">{product.fabric}</p>
              <p className="specs-desc">{product.description}</p>
            </div>

            {/* AI STYLING SUGGESTION SECTION */}
            {/* Architected to directly receive LangChain/LangGraph agent recommendations */}
            <div className="ai-styling-card">
              <div className="ai-card-top">
                <span className="ai-sparkle">✦</span>
                <span className="ai-card-title">AI STYLING SUGGESTION</span>
                <span className="ai-agent-badge">RAYA NEURAL AGENT</span>
              </div>
              <p className="ai-styling-advice">{getStylingAdvice(product)}</p>
              <div className="ai-styling-meta">
                <span>Designed for clean layering</span>
                <span>•</span>
                <span>Neutral Palette Match</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
