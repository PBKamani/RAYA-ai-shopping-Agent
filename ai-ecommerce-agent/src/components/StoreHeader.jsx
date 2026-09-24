import { useState, useEffect, useRef, useMemo } from 'react'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../hooks/useAuth'
import { getSearchSuggestions, getCategoryNavTabs } from '../data/products'

export default function StoreHeader({
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onOpenOrderTracker,
}) {
  const {
    totalItemsCount,
    subtotal,
    wishlist,
    setIsCartOpen,
    setIsWishlistOpen,
    setActiveQuickView,
    addToast,
  } = useCart()

  const { user, isAuthenticated, logout, openLogin } = useAuth()

  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const searchContainerRef = useRef(null)
  const searchInputRef = useRef(null)

  // Dynamically computed navigation tabs with zero hardcoded numbers
  const navTabs = useMemo(() => getCategoryNavTabs(), [])

  // Live autocomplete suggestions
  const suggestions = useMemo(() => {
    if (searchQuery.trim().length >= 2) {
      return getSearchSuggestions(searchQuery, 6)
    }
    return []
  }, [searchQuery])

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setIsSearchFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    function handleKeyDown(e) {
      if (
        e.key === '/' &&
        document.activeElement !== searchInputRef.current &&
        !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)
      ) {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const copyPromoCode = () => {
    navigator.clipboard?.writeText('OFFWHITE15')
    addToast('Promo code OFFWHITE15 copied to clipboard!', 'success')
  }

  return (
    <header className="store-header">
      {/* Top Announcement Bar */}
      <div className="announcement-bar">
        <div className="announcement-content">
          <span className="announcement-badge">COMPLIMENTARY DELIVERY</span>
          <span className="announcement-text">
            Free Worldwide Express Shipping on orders over $150
          </span>
          <button
            type="button"
            className="promo-chip-btn"
            onClick={copyPromoCode}
            title="Click to copy promo code"
          >
            Use Code: <strong>OFFWHITE15</strong>
            <span className="copy-icon-text">Copy</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="main-nav-container">
        <div className="main-nav-inner">
          {/* Brand Logo */}
          <div className="brand-wrap">
            <a href="#" className="brand-logo" aria-label="RAYA ATELIER Home">
              <span className="brand-logo-main">RAYA</span>
              <span className="brand-logo-sub">ATELIER</span>
            </a>
          </div>

          {/* Live Search Bar */}
          <div className="search-wrap" ref={searchContainerRef}>
            <div className="search-input-box">
              <svg
                className="search-icon"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                aria-hidden="true"
              >
                <circle cx="9" cy="9" r="6" />
                <line x1="13.5" y1="13.5" x2="18" y2="18" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search minimalist wardrobe, outerwear, linen, cashmere... (Press '/' to search)"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                className="search-input"
                aria-label="Search clothing and accessories"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => {
                    onSearchChange('')
                  }}
                  aria-label="Clear search query"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Live Autocomplete Dropdown */}
            {isSearchFocused && suggestions.length > 0 && (
              <div className="search-suggestions-dropdown" role="listbox">
                <div className="suggestions-header">
                  <span>Suggested Items ({suggestions.length})</span>
                </div>
                {suggestions.map((item) => (
                  <div
                    key={item.id}
                    className="suggestion-row"
                    onClick={() => {
                      setActiveQuickView(item)
                      setIsSearchFocused(false)
                    }}
                    role="option"
                    tabIndex={0}
                  >
                    <img
                      src={item.image}
                      alt={item.title || item.name}
                      className="suggestion-thumb"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null
                        e.currentTarget.src =
                          'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60" fill="%23F4F3EE"><rect width="60" height="60" fill="%23F4F3EE"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="9" fill="%238C877D">RAYA</text></svg>'
                      }}
                    />
                    <div className="suggestion-meta">
                      <span className="suggestion-name">{item.title || item.name}</span>
                      <div className="suggestion-sub">
                        <span className="suggestion-cat">{item.articleType || item.masterCategory}</span>
                        <span className="suggestion-price">${item.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Icons */}
          <div className="nav-actions">
            {/* Client Authentication */}
            {isAuthenticated ? (
              <button
                type="button"
                className="action-link-btn"
                onClick={logout}
                title={`Signed in as ${user?.name || user?.email}. Click to sign out.`}
                aria-label="Account and sign out"
              >
                <svg
                  className="action-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span className="action-label">
                  {user?.name?.split(' ')[0] || 'Client'} (Logout)
                </span>
              </button>
            ) : (
              <button
                type="button"
                className="action-link-btn"
                onClick={openLogin}
                title="Sign In to your client account"
                aria-label="Sign in"
              >
                <svg
                  className="action-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span className="action-label">Sign In</span>
              </button>
            )}

            {/* Order Tracking */}
            <button
              type="button"
              className="action-link-btn"
              onClick={onOpenOrderTracker}
              title="Track Order Status"
            >
              <svg
                className="action-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <rect x="1" y="3" width="15" height="13" rx="1" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
              <span className="action-label">Track Order</span>
            </button>

            {/* Wishlist */}
            <button
              type="button"
              className="action-link-btn"
              onClick={() => setIsWishlistOpen(true)}
              title="View Saved Items"
              aria-label={`Wishlist with ${wishlist.length} items`}
            >
              <div className="icon-with-badge">
                <svg
                  className="action-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {wishlist.length > 0 && (
                  <span className="nav-count-badge">{wishlist.length}</span>
                )}
              </div>
              <span className="action-label">Wishlist</span>
            </button>

            {/* Shopping Bag */}
            <button
              type="button"
              className="action-link-btn bag-action-btn"
              onClick={() => setIsCartOpen(true)}
              title="View Shopping Bag"
              aria-label={`Shopping Bag with ${totalItemsCount} items, total $${subtotal}`}
            >
              <div className="icon-with-badge">
                <svg
                  className="action-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                {totalItemsCount > 0 && (
                  <span className="nav-count-badge">{totalItemsCount}</span>
                )}
              </div>
              <span className="action-label bag-total-text">
                Bag ({totalItemsCount}) {subtotal > 0 && `• $${subtotal}`}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Navigation Bar */}
      <nav className="category-nav" aria-label="Fashion department navigation">
        <div className="category-nav-inner">
          {navTabs.map((tab) => {
            const isActive = activeCategory === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                className={`category-tab-btn ${isActive ? 'active' : ''} ${
                  tab.isSale ? 'sale-tab' : ''
                }`}
                onClick={() => onSelectCategory(tab.key)}
              >
                <span className="category-tab-title">{tab.label}</span>
                <span className="category-tab-count">
                  ({tab.count.toLocaleString()})
                </span>
                {tab.isSale && <span className="sale-dot" />}
              </button>
            )
          })}
        </div>
      </nav>
    </header>
  )
}
