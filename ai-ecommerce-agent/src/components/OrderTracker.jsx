import { useState } from 'react'
import { useCart } from '../hooks/useCart'

export default function OrderTracker({ isOpen, onClose, initialOrderId }) {
  const { orders } = useCart()

  const [inputOrderId, setInputOrderId] = useState(() => initialOrderId || orders[0]?.id || '')
  const [selectedId, setSelectedId] = useState(() => initialOrderId || orders[0]?.id || '')
  const [searchError, setSearchError] = useState('')

  if (!isOpen) return null

  const cleanId = (selectedId || initialOrderId || orders[0]?.id || '').trim().toUpperCase().replace('#', '')
  const activeOrder = orders.find((o) => o.id.toUpperCase() === cleanId) || null

  const handleSearch = (e) => {
    e.preventDefault()
    setSearchError('')
    const target = inputOrderId.trim().toUpperCase().replace('#', '')
    const found = orders.find((o) => o.id.toUpperCase() === target)
    if (found) {
      setSelectedId(target)
    } else {
      setSelectedId('')
      setSearchError(`Order #${target} not found. Try demo order #RAYA1025.`)
    }
  }

  const deliveryStages = [
    { title: 'Order Placed', desc: 'Received by central store' },
    { title: 'Confirmed', desc: 'Verified (1 day)' },
    { title: 'Processing', desc: 'Inspection & packing (3–4 days)' },
    { title: 'Shipped', desc: 'Dispatched from central depot' },
    { title: 'Out for Delivery', desc: 'Local courier in transit' },
    { title: 'Delivered', desc: 'Arrived at your door (1–2 days)' },
  ]

  // Map status string to index
  const getStageIndex = (status) => {
    const s = (status || '').toLowerCase()
    if (s.includes('placed')) return 0
    if (s.includes('confirmed')) return 1
    if (s.includes('process')) return 2
    if (s.includes('ship')) return 3
    if (s.includes('out')) return 4
    if (s.includes('deliver')) return 5
    return 1
  }

  const currentStageIdx = activeOrder ? getStageIndex(activeOrder.status) : 1

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="order-tracker-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="tracker-header">
          <div>
            <span className="tracker-badge">CENTRAL WAREHOUSE DISPATCH</span>
            <h3 className="tracker-title">Order Status Assistant</h3>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close Order Tracker"
          >
            ✕
          </button>
        </div>

        {/* Search Order Form */}
        <form onSubmit={handleSearch} className="tracker-search-form">
          <input
            type="text"
            placeholder="Enter Demo Order ID (e.g. RAYA1025)"
            value={inputOrderId}
            onChange={(e) => setInputOrderId(e.target.value)}
            className="tracker-input"
          />
          <button type="submit" className="tracker-search-btn">
            Track Order
          </button>
        </form>

        {searchError && <p className="tracker-error-text">{searchError}</p>}

        {/* Order Details Body */}
        {activeOrder ? (
          <div className="tracker-order-content">
            {/* Top Summary Card */}
            <div className="tracker-summary-card">
              <div className="tracker-summary-left">
                <span className="tracker-order-num">Order #{activeOrder.id}</span>
                <span className="tracker-date">
                  Placed on {new Date(activeOrder.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="tracker-summary-right">
                <span className="tracker-status-pill">{activeOrder.status}</span>
                <span className="tracker-delivery-date">
                  Estimated: <strong>{activeOrder.estimatedDelivery}</strong>
                </span>
              </div>
            </div>

            {/* Warehouse Dispatch Model Explanation */}
            <div className="warehouse-dispatch-callout">
              <div className="callout-icon">ℹ</div>
              <div className="callout-body">
                <strong>Small Business Central Dispatch Architecture:</strong>
                <span>
                  All pieces are authenticated and packaged at our single flagship warehouse.
                  Standard cycle: Confirmation (1d) → Processing (3–4d) → Final Transit (1–2d).
                </span>
              </div>
            </div>

            {/* Visual Delivery Progress Timeline */}
            <div className="delivery-timeline-box">
              <h4 className="timeline-heading">Delivery Progress</h4>
              <div className="timeline-stages-track">
                {deliveryStages.map((stage, idx) => {
                  const isDone = idx <= currentStageIdx
                  const isCurrent = idx === currentStageIdx
                  return (
                    <div
                      key={stage.title}
                      className={`timeline-stage-node ${isDone ? 'is-done' : ''} ${
                        isCurrent ? 'is-current' : ''
                      }`}
                    >
                      <div className="node-marker">
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <div className="node-info">
                        <span className="node-title">{stage.title}</span>
                        <span className="node-desc">{stage.desc}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Products inside this order */}
            <div className="tracker-items-section">
              <h4 className="tracker-items-title">Items in Shipment ({activeOrder.items?.length || 0})</h4>
              <div className="tracker-items-list">
                {activeOrder.items?.map((item, idx) => (
                  <div key={idx} className="tracker-item-row">
                    <img src={item.image} alt={item.name} className="tracker-item-thumb" />
                    <div className="tracker-item-info">
                      <span className="tracker-item-name">{item.name}</span>
                      <span className="tracker-item-spec">
                        Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                      </span>
                    </div>
                    <span className="tracker-item-price">${item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Details */}
            {activeOrder.customer && (
              <div className="tracker-customer-box">
                <span className="customer-box-title">Shipping To:</span>
                <p>
                  <strong>{activeOrder.customer.name}</strong> • {activeOrder.customer.address}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="tracker-empty-help">
            <p>Enter your demo Order ID above to inspect live simulated tracking.</p>
            {orders.length > 0 && (
              <div className="recent-orders-suggestions">
                <span>Recent orders on this browser:</span>
                <div className="recent-orders-chips">
                  {orders.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      className="recent-order-chip"
                      onClick={() => {
                        setInputOrderId(o.id)
                        setSelectedId(o.id)
                        setSearchError('')
                      }}
                    >
                      #{o.id} ({o.status})
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
