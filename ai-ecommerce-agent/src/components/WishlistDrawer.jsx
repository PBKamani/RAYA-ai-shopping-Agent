import { useCart } from '../hooks/useCart'
import { getProductById } from '../data/products'

export default function WishlistDrawer() {
  const {
    wishlist,
    isWishlistOpen,
    setIsWishlistOpen,
    toggleWishlist,
    moveToCart,
  } = useCart()

  if (!isWishlistOpen) return null

  const wishlistProducts = wishlist
    .map((id) => getProductById(id))
    .filter(Boolean)

  return (
    <div className="drawer-overlay" onClick={() => setIsWishlistOpen(false)}>
      <aside
        className="drawer-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Wishlist Drawer"
      >
        <div className="drawer-header">
          <div className="drawer-header-title">
            <h3>SAVED PIECES</h3>
            <span className="drawer-count">({wishlist.length} saved)</span>
          </div>
          <button
            type="button"
            className="drawer-close-btn"
            onClick={() => setIsWishlistOpen(false)}
            aria-label="Close Wishlist"
          >
            ✕
          </button>
        </div>

        <div className="drawer-body">
          {wishlistProducts.length === 0 ? (
            <div className="empty-drawer-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <h4>Your wishlist is empty</h4>
              <p>Save pieces you love while browsing to revisit them later.</p>
              <button
                type="button"
                className="btn-atelier-primary"
                onClick={() => setIsWishlistOpen(false)}
              >
                Browse Collection
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {wishlistProducts.map((product) => (
                <div key={product.id} className="cart-line-item">
                  <img
                    src={product.image}
                    alt={product.title || product.name}
                    className="cart-item-img"
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src =
                        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="120" viewBox="0 0 100 120" fill="%23F4F3EE"><rect width="100" height="120" fill="%23F4F3EE"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="10" fill="%238C877D">RAYA</text></svg>'
                    }}
                  />
                  <div className="cart-item-details">
                    <div className="cart-item-top">
                      <span className="cart-item-brand">{product.brand}</span>
                      <button
                        type="button"
                        className="cart-item-remove-btn"
                        onClick={() => toggleWishlist(product.id)}
                        aria-label="Remove from wishlist"
                      >
                        ✕
                      </button>
                    </div>

                    <h4 className="cart-item-name">{product.title || product.name}</h4>
                    <span className="cart-item-variants">
                      Category: {product.articleType || product.subCategory || product.category}
                    </span>

                    <div className="cart-item-bottom">
                      <span className="cart-price">${product.price}</span>
                      <button
                        type="button"
                        className="move-to-cart-btn"
                        onClick={() => moveToCart(product.id)}
                      >
                        Move to Bag
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {wishlistProducts.length > 0 && (
          <div className="drawer-footer">
            <p className="wishlist-note">
              Items saved in your wishlist remain stored on your browser.
            </p>
          </div>
        )}
      </aside>
    </div>
  )
}
