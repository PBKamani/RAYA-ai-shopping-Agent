import { useState } from 'react'
import { useCart } from '../hooks/useCart'

export default function CheckoutModal({ onTrackOrder }) {
  const {
    cart,
    isCheckoutOpen,
    setIsCheckoutOpen,
    subtotal,
    discountAmount,
    shippingFee,
    grandTotal,
    createOrder,
  } = useCart()

  const [step, setStep] = useState(1) // 1: Shipping, 2: Delivery, 3: Payment, 4: Review, 5: Confirmation
  const [createdOrder, setCreatedOrder] = useState(null)

  // Form states
  const [shippingInfo, setShippingInfo] = useState({
    fullName: 'Elena Rostova',
    email: 'elena.rostova@example.com',
    phone: '+1 (555) 382-9104',
    address: '742 Evergreen Terrace, Apt 4B',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'United States',
  })

  const [deliveryMethod, setDeliveryMethod] = useState('Standard')
  const [paymentMethod, setPaymentMethod] = useState('Apple Pay')

  if (!isCheckoutOpen) return null

  const handleNext = (e) => {
    e?.preventDefault()
    setStep((s) => s + 1)
  }

  const handleBack = () => {
    setStep((s) => Math.max(1, s - 1))
  }

  const handlePlaceOrder = () => {
    const order = createOrder({
      customerInfo: shippingInfo,
      shippingMethod: deliveryMethod,
      paymentMethod,
    })
    setCreatedOrder(order)
    setStep(5)
  }

  const handleClose = () => {
    setIsCheckoutOpen(false)
    setStep(1)
    setCreatedOrder(null)
  }

  const handleTrackNewOrder = () => {
    if (createdOrder) {
      handleClose()
      onTrackOrder(createdOrder.id)
    }
  }

  return (
    <div className="modal-backdrop" onClick={handleClose} role="dialog" aria-modal="true">
      <div
        className="checkout-modal-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="checkout-modal-header">
          <div className="checkout-header-branding">
            <span className="checkout-logo-text">RAYA ATELIER</span>
            <span className="checkout-mode-pill">DEMO / SIMULATED CHECKOUT</span>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={handleClose}
            aria-label="Close checkout"
          >
            ✕
          </button>
        </div>

        {/* Multi-step progress bar (Steps 1 to 4) */}
        {step < 5 && (
          <div className="checkout-steps-tracker">
            {[
              { num: 1, label: 'Shipping' },
              { num: 2, label: 'Delivery' },
              { num: 3, label: 'Payment' },
              { num: 4, label: 'Review' },
            ].map((st) => (
              <div
                key={st.num}
                className={`step-track-item ${step === st.num ? 'is-current' : ''} ${
                  step > st.num ? 'is-completed' : ''
                }`}
              >
                <div className="step-circle">{step > st.num ? '✓' : st.num}</div>
                <span className="step-label">{st.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* STEP 1: Shipping Information */}
        {step === 1 && (
          <form onSubmit={handleNext} className="checkout-step-body">
            <h3 className="checkout-step-title">1. Shipping Address & Contact</h3>
            <p className="checkout-step-desc">
              Enter your shipping destination. (Demo data prefilled for convenience).
            </p>

            <div className="form-grid">
              <div className="form-group full-width">
                <label>Full Name</label>
                <input
                  type="text"
                  required
                  value={shippingInfo.fullName}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                />
              </div>

              <div className="form-group half-width">
                <label>Email Address</label>
                <input
                  type="email"
                  required
                  value={shippingInfo.email}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                />
              </div>

              <div className="form-group half-width">
                <label>Phone Number</label>
                <input
                  type="tel"
                  required
                  value={shippingInfo.phone}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                />
              </div>

              <div className="form-group full-width">
                <label>Street Address</label>
                <input
                  type="text"
                  required
                  value={shippingInfo.address}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                />
              </div>

              <div className="form-group third-width">
                <label>City</label>
                <input
                  type="text"
                  required
                  value={shippingInfo.city}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                />
              </div>

              <div className="form-group third-width">
                <label>State / Region</label>
                <input
                  type="text"
                  required
                  value={shippingInfo.state}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                />
              </div>

              <div className="form-group third-width">
                <label>Postal Code</label>
                <input
                  type="text"
                  required
                  value={shippingInfo.postalCode}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, postalCode: e.target.value })}
                />
              </div>
            </div>

            <div className="checkout-actions-row">
              <span className="demo-notice-text">
                ℹ Demo Mode: No real personal information required.
              </span>
              <button type="submit" className="btn-atelier-primary">
                Continue to Delivery →
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Delivery Method */}
        {step === 2 && (
          <div className="checkout-step-body">
            <h3 className="checkout-step-title">2. Select Delivery Speed</h3>
            <p className="checkout-step-desc">
              Dispatched directly from our Central Atelier Warehouse.
            </p>

            <div className="delivery-options-list">
              {[
                {
                  id: 'Standard',
                  title: 'Standard Ground Delivery',
                  timing: '3–5 business days',
                  fee: shippingFee === 0 ? 'FREE' : `$${shippingFee}`,
                  desc: 'Carbon-neutral ground transit from central depot.',
                },
                {
                  id: 'Express',
                  title: 'Express Courier Air',
                  timing: '1–2 business days',
                  fee: '$18',
                  desc: 'Priority expedited handling and dispatch.',
                },
                {
                  id: 'Overnight',
                  title: 'White-Glove Same Day / Overnight',
                  timing: 'Next morning delivery',
                  fee: '$28',
                  desc: 'Dedicated courier direct to your door.',
                },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`delivery-option-card ${
                    deliveryMethod === opt.id ? 'is-selected' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value={opt.id}
                    checked={deliveryMethod === opt.id}
                    onChange={() => setDeliveryMethod(opt.id)}
                  />
                  <div className="delivery-card-info">
                    <div className="delivery-card-header">
                      <span className="delivery-opt-name">{opt.title}</span>
                      <span className="delivery-opt-fee">{opt.fee}</span>
                    </div>
                    <span className="delivery-opt-timing">{opt.timing}</span>
                    <span className="delivery-opt-desc">{opt.desc}</span>
                  </div>
                </label>
              ))}
            </div>

            <div className="checkout-actions-row">
              <button
                type="button"
                className="btn-atelier-secondary"
                onClick={handleBack}
              >
                ← Back
              </button>
              <button
                type="button"
                className="btn-atelier-primary"
                onClick={handleNext}
              >
                Continue to Payment →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Payment Method */}
        {step === 3 && (
          <div className="checkout-step-body">
            <h3 className="checkout-step-title">3. Simulated Payment Method</h3>
            <div className="demo-warning-banner">
              <strong>DEMO SIMULATION NOTICE:</strong> This is a frontend demo. Do not enter real credit card numbers. No charges will be processed.
            </div>

            <div className="payment-options-grid">
              {['Apple Pay', 'Credit / Debit Card', 'PayPal'].map((method) => (
                <label
                  key={method}
                  className={`payment-option-card ${
                    paymentMethod === method ? 'is-selected' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={() => setPaymentMethod(method)}
                  />
                  <span className="payment-method-name">{method}</span>
                </label>
              ))}
            </div>

            {paymentMethod === 'Credit / Debit Card' && (
              <div className="simulated-card-box">
                <div className="form-group">
                  <label>Simulated Card Number</label>
                  <input
                    type="text"
                    defaultValue="•••• •••• •••• 4242"
                    disabled
                    className="disabled-card-input"
                  />
                </div>
                <div className="form-grid">
                  <div className="form-group half-width">
                    <label>Expires</label>
                    <input type="text" defaultValue="12/28" disabled />
                  </div>
                  <div className="form-group half-width">
                    <label>CVV</label>
                    <input type="text" defaultValue="•••" disabled />
                  </div>
                </div>
              </div>
            )}

            <div className="checkout-actions-row">
              <button
                type="button"
                className="btn-atelier-secondary"
                onClick={handleBack}
              >
                ← Back
              </button>
              <button
                type="button"
                className="btn-atelier-primary"
                onClick={handleNext}
              >
                Review Order →
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Review Order */}
        {step === 4 && (
          <div className="checkout-step-body">
            <h3 className="checkout-step-title">4. Review & Confirm Order</h3>

            <div className="review-sections-grid">
              <div className="review-box">
                <h4>Shipping Address</h4>
                <p>{shippingInfo.fullName}</p>
                <p>{shippingInfo.address}</p>
                <p>
                  {shippingInfo.city}, {shippingInfo.state} {shippingInfo.postalCode}
                </p>
                <p>{shippingInfo.email}</p>
              </div>

              <div className="review-box">
                <h4>Delivery & Payment</h4>
                <p>
                  <strong>Speed:</strong> {deliveryMethod}
                </p>
                <p>
                  <strong>Payment:</strong> {paymentMethod} (Simulated)
                </p>
                <p className="warehouse-note">Dispatched from: Central Storehouse</p>
              </div>
            </div>

            {/* Itemized summary */}
            <div className="review-items-list">
              <h4>Order Items ({cart.length})</h4>
              {cart.map((item) => (
                <div key={item.cartItemId} className="review-item-row">
                  <img src={item.product.image} alt={item.product.name} />
                  <div className="review-item-info">
                    <span className="review-item-title">{item.product.name}</span>
                    <span className="review-item-meta">
                      Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                    </span>
                  </div>
                  <span className="review-item-price">
                    ${item.product.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Final totals */}
            <div className="review-totals-box">
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
                <span>Shipping</span>
                <span>{shippingFee === 0 ? 'FREE' : `$${shippingFee}`}</span>
              </div>
              <div className="summary-row total-row">
                <span>Grand Total</span>
                <span className="grand-total-val">${grandTotal}</span>
              </div>
            </div>

            <div className="checkout-actions-row">
              <button
                type="button"
                className="btn-atelier-secondary"
                onClick={handleBack}
              >
                ← Back
              </button>
              <button
                type="button"
                className="btn-atelier-primary btn-place-order"
                onClick={handlePlaceOrder}
              >
                Place Demo Order (${grandTotal})
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Order Confirmation Screen */}
        {step === 5 && createdOrder && (
          <div className="checkout-confirmation-body">
            <div className="confirmation-badge-icon">✓</div>
            <h3 className="confirmation-headline">Thank You for Your Order</h3>
            <p className="confirmation-subline">
              Your simulated order has been registered and sent to our central warehouse.
            </p>

            <div className="confirmation-card">
              <div className="confirm-top-row">
                <div>
                  <span className="confirm-label">DEMO ORDER ID</span>
                  <span className="confirm-order-id">#{createdOrder.id}</span>
                </div>
                <div>
                  <span className="confirm-label">ESTIMATED DELIVERY</span>
                  <span className="confirm-val">{createdOrder.estimatedDelivery}</span>
                </div>
              </div>

              <div className="confirm-timeline-preview">
                <span className="timeline-title">Warehouse Dispatch Progress:</span>
                <div className="timeline-steps-mini">
                  {createdOrder.timeline.map((t, idx) => (
                    <div
                      key={idx}
                      className={`mini-step ${t.completed ? 'completed' : ''}`}
                    >
                      <span className="mini-step-dot" />
                      <span className="mini-step-text">{t.step}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="confirm-details-row">
                <span>Total Amount Paid (Simulated):</span>
                <strong>${createdOrder.total}</strong>
              </div>
            </div>

            <div className="confirmation-actions-row">
              <button
                type="button"
                className="btn-atelier-primary"
                onClick={handleTrackNewOrder}
              >
                Track This Order Live
              </button>
              <button
                type="button"
                className="btn-atelier-secondary"
                onClick={handleClose}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
