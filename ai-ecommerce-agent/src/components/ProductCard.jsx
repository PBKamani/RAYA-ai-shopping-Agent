import { useState } from 'react'
import { useCart } from '../hooks/useCart'

export default function ProductCard({ product, onQuickView }) {
  const { addToCart, toggleWishlist, isInWishlist } = useCart()
  const isSaved = isInWishlist(product.id)

  const [selectedColorIndex, setSelectedColorIndex] = useState(0)
  const [isAdding, setIsAdding] = useState(false)

  const handleQuickAdd = (e) => {
    e.stopPropagation()
    setIsAdding(true)
    const colorName = product.colors[selectedColorIndex]?.name || 'Natural'
    const size = product.sizes[0] || 'M'
    addToCart(product, size, colorName, 1)
    setTimeout(() => setIsAdding(false), 500)
  }

  const handleWishlistClick = (e) => {
    e.stopPropagation()
    toggleWishlist(product.id)
  }

  return (
    <div
      className="product-card"
      onClick={() => onQuickView(product)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onQuickView(product)
        }
      }}
    >
      {/* Product Image Frame */}
      <div className="product-image-container">
        {/* Badges */}
        <div className="card-badge-row">
          {product.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className={`product-tag-pill ${tag === 'Sale' ? 'tag-sale' : ''} ${
                tag === 'Best Seller' ? 'tag-best' : ''
              }`}
            >
              {tag}
            </span>
          ))}
          {product.stockCount <= 4 && (
            <span className="product-tag-pill tag-urgency">
              Only {product.stockCount} left
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          className={`card-wishlist-btn ${isSaved ? 'is-saved' : ''}`}
          onClick={handleWishlistClick}
          aria-label={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
          title={isSaved ? 'Saved to Wishlist' : 'Save to Wishlist'}
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

        {/* The Catalog Image with Graceful SVG Fallback */}
        <img
          src={product.image}
          alt={product.title || product.name}
          className="product-main-img"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null
            e.currentTarget.src =
              'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500" fill="%23F4F3EE"><rect width="400" height="500" fill="%23F4F3EE"/><text x="50%" y="48%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%238C877D" letter-spacing="1">RAYA ATELIER</text><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="11" fill="%23B0AAA0">IMAGE ARCHIVED</text></svg>'
          }}
        />

        {/* Hover Quick Actions Deck */}
        <div className="card-hover-deck">
          <button
            type="button"
            className="quick-view-btn"
            onClick={(e) => {
              e.stopPropagation()
              onQuickView(product)
            }}
          >
            Quick View
          </button>
          <button
            type="button"
            className={`quick-add-btn ${isAdding ? 'is-adding' : ''}`}
            onClick={handleQuickAdd}
          >
            {isAdding ? 'Added ✓' : '+ Add to Bag'}
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="product-info-wrap">
        <div className="product-meta-top">
          <span className="product-brand-title">{product.brand}</span>
          <span className="product-category-name">{product.articleType || product.subCategory || product.category}</span>
        </div>

        <h3 className="product-card-name" title={product.title || product.name}>
          {product.title || product.name}
        </h3>

        {/* Price & Rating */}
        <div className="product-price-rating-row">
          <div className="product-pricing-box">
            <span className="current-price">${product.price}</span>
            {product.originalPrice && (
              <span className="original-price">${product.originalPrice}</span>
            )}
          </div>

          <div className="product-stars-box" title={`${product.rating} out of 5 stars`}>
            <span className="star-symbol">★</span>
            <span className="rating-value">{product.rating}</span>
            <span className="review-count">({product.reviewsCount})</span>
          </div>
        </div>

        {/* Color Palette Dots */}
        {product.colors && product.colors.length > 0 && (
          <div className="card-palette-dots">
            {product.colors.map((c, idx) => (
              <button
                key={c.name}
                type="button"
                className={`palette-dot-btn ${selectedColorIndex === idx ? 'active' : ''}`}
                style={{ backgroundColor: c.hex }}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedColorIndex(idx)
                }}
                title={c.name}
                aria-label={`Select color ${c.name}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
