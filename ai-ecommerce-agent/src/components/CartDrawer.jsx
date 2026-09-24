import { useState } from 'react'
import { useCart } from '../hooks/useCart'

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    discountAmount,
    shippingFee,
    amountToFreeShipping,
    freeShippingProgress,
    grandTotal,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
    setIsCheckoutOpen,
  } = useCart()

  const [promoInput, setPromoInput] = useState('')
  const [promoError, setPromoError] = useState('')

  if (!isCartOpen) return null

  const handleApplyPromo = (e) => {
    e.preventDefault()
    setPromoError('')
    if (!promoInput.trim()) return
    const res = applyPromoCode(promoInput)
    if (res.success) {
      setPromoInput('')
    } else {
      setPromoError(res.message)
    }
  }

  const handleProceedToCheckout = () => {
    setIsCartOpen(false)
    setIsCheckoutOpen(true)
  }

  return (
    <div className="drawer-overlay" onClick={() => setIsCartOpen(false)}>
      <aside
        className="drawer-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Bag Drawer"
      >
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-header-title">
            <h3>SHOPPING BAG</h3>
            <span className="drawer-count">({cart.length} items)</span>
          </div>
          <button
            type="button"
            className="drawer-close-btn"
            onClick={() => setIsCartOpen(false)}
            aria-label="Close Shopping Bag"
          >
            ✕
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div className="free-shipping-meter-box">
          {amountToFreeShipping > 0 ? (
            <p className="free-shipping-text">
              Add <strong>${amountToFreeShipping}</strong> more to qualify for{' '}
              <strong>Free Worldwide Express Delivery</strong>.
            </p>
          ) : (
            <p className="free-shipping-text text-qualified">
              ✓ You have unlocked <strong>Free Worldwide Express Delivery</strong>.
            </p>
          )}
          <div className="shipping-progress-rail">
            <div
              className="shipping-progress-fill"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* Cart Items List */}
        <div className="drawer-body">
          {cart.length === 0 ? (
            <div className="empty-drawer-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <h4>Your bag is currently empty</h4>
              <p>Explore the Minimalist Archive to add timeless garments.</p>
              <button
                type="button"
                className="btn-atelier-primary"
                onClick={() => setIsCartOpen(false)}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {cart.map((item) => (
                <div key={item.cartItemId} className="cart-line-item">
                  <img
                    src={item.product.image}
                    alt={item.product.title || item.product.name}
                    className="cart-item-img"
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src =
                        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="120" viewBox="0 0 100 120" fill="%23F4F3EE"><rect width="100" height="120" fill="%23F4F3EE"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="10" fill="%238C877D">RAYA</text></svg>'
                    }}
                  />
                  <div className="cart-item-details">
                    <div className="cart-item-top">
                      <span className="cart-item-brand">{item.product.brand}</span>
                      <button
                        type="button"
                        className="cart-item-remove-btn"
                        onClick={() => removeFromCart(item.cartItemId)}
                        aria-label="Remove item"
                      >
                        ✕
                      </button>
                    </div>

                    <h4 className="cart-item-name">{item.product.title || item.product.name}</h4>

                    <div className="cart-item-variants">
                      <span>Size: {item.size}</span>
                      <span>•</span>
                      <span>Color: {item.color}</span>
                    </div>

                    <div className="cart-item-bottom">
                      {/* Quantity Controls */}
                      <div className="cart-qty-stepper">
                        <button
                          type="button"
                          className="stepper-btn"
                          onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="stepper-val">{item.quantity}</span>
                        <button
                          type="button"
                          className="stepper-btn"
                          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <div className="cart-item-price-box">
                        <span className="cart-price">
                          ${item.product.price * item.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer with Financial Breakdown & Promo */}
        {cart.length > 0 && (
          <div className="drawer-footer">
            {/* Promo Code Input */}
            <form onSubmit={handleApplyPromo} className="promo-input-row">
              <input
                type="text"
                placeholder="Promo code (OFFWHITE15 or FREESHIP)"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                className="promo-text-field"
              />
              <button type="submit" className="promo-apply-btn">
                Apply
              </button>
            </form>

            {promoError && <p className="promo-error-msg">{promoError}</p>}

            {appliedPromo && (
              <div className="applied-promo-pill">
                <span>Code <strong>{appliedPromo.code}</strong> active</span>
                <button
                  type="button"
                  className="remove-promo-btn"
                  onClick={removePromoCode}
                  aria-label="Remove promo code"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Price Calculations */}
            <div className="drawer-summary-rows">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>${subtotal}</span>
              </div>
              {discountAmount > 0 && (
                <div className="summary-row discount-row">
                  <span>Discount</span>
                  <span>−${discountAmount}</span>
                </div>
              )}
              <div className="summary-row">
                <span>Estimated Shipping</span>
                <span>{shippingFee === 0 ? 'COMPLIMENTARY' : `$${shippingFee}`}</span>
              </div>
              <div className="summary-row total-row">
                <span>Estimated Total</span>
                <span className="grand-total-val">${grandTotal}</span>
              </div>
            </div>

            <button
              type="button"
              className="drawer-checkout-btn"
              onClick={handleProceedToCheckout}
            >
              <span>Proceed to Checkout</span>
              <span className="btn-total-sum">• ${grandTotal}</span>
            </button>

            <p className="drawer-assurance-note">
              Simulated checkout • Free 30-day worldwide returns
            </p>
          </div>
        )}
      </aside>
    </div>
  )
}
