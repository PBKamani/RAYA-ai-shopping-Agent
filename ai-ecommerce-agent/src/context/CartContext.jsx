import { useState, useEffect, useMemo, useCallback } from 'react'
import { getProductById } from '../data/products'
import { CartContext } from './cartContextInstance'
import { useAuth } from '../hooks/useAuth'
import { API_BASE_URL, getAuthHeaders } from '../services/api'

const CART_STORAGE_KEY = 'raya_cart_v1'
const WISHLIST_STORAGE_KEY = 'raya_wishlist_v1'
const ORDERS_STORAGE_KEY = 'raya_orders_v1'

const FREE_SHIPPING_THRESHOLD = 150
const STANDARD_SHIPPING_FEE = 12

// Helper to normalize backend cart items into the shape used by CartDrawer
function formatBackendCartItems(backendItems = []) {
  return backendItems.map((item) => {
    const p = item.product || getProductById(item.product_id) || {}
    const safeProduct = {
      id: p.id || item.product_id,
      title: p.title || p.name || `Product #${item.product_id}`,
      name: p.title || p.name || `Product #${item.product_id}`,
      brand: p.brand || 'RAYA ATELIER',
      price: Number(p.price || 0),
      image: p.image || `/products/${item.product_id}.jpg`,
      colour: p.colour || 'Natural',
      sizes: p.sizes || ['S', 'M', 'L'],
    }
    const size = item.selected_size || item.size || 'M'
    const color = safeProduct.colour || 'Natural'

    return {
      cartItemId: String(item.id || `${item.product_id}-${size}-${color}`),
      backendItemId: item.id || null,
      id: item.id || null,
      product_id: item.product_id,
      product: safeProduct,
      size,
      color,
      quantity: Number(item.quantity || 1),
      item_subtotal: Number(item.item_subtotal || safeProduct.price * (item.quantity || 1)),
    }
  })
}

export function CartProvider({ children }) {
  const { user, token, isAuthenticated } = useAuth()
  const activeUserId = user?.id || 1

  // Cart state
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Wishlist state (array of product IDs)
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Orders state
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem(ORDERS_STORAGE_KEY)
      if (saved) return JSON.parse(saved)
      return []
    } catch {
      return []
    }
  })

  // Drawer & Modal UI states
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isWishlistOpen, setIsWishlistOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isOrderTrackerOpen, setIsOrderTrackerOpen] = useState(false)
  const [activeQuickView, setActiveQuickView] = useState(null)
  const [trackingOrderId, setTrackingOrderId] = useState('')

  // Promo code state
  const [appliedPromo, setAppliedPromo] = useState(null)

  // Toast notifications
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3200)
  }, [])

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
    } catch (e) {
      console.error('Failed to save cart:', e)
    }
  }, [cart])

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist))
    } catch (e) {
      console.error('Failed to save wishlist:', e)
    }
  }, [wishlist])

  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders))
    } catch (e) {
      console.error('Failed to save orders:', e)
    }
  }, [orders])

  // =========================================================================
  // POSTGRESQL CART SYNCHRONIZATION
  // =========================================================================

  // Fetch authoritative cart from backend PostgreSQL
  const fetchCart = useCallback(async (targetUserId) => {
    const uid = targetUserId || activeUserId
    if (!uid) return
    try {
      console.log(`[CART] Fetching authoritative cart for user ${uid} from PostgreSQL...`)
      const res = await fetch(`${API_BASE_URL}/cart/${uid}`, {
        headers: getAuthHeaders(token),
      })
      if (res.ok) {
        const data = await res.json()
        const formatted = formatBackendCartItems(data.items || [])
        setCart(formatted)
        console.log(`[CART] PostgreSQL cart loaded: ${formatted.length} item(s)`)
      }
    } catch (err) {
      console.warn('[CART] Could not sync cart with backend:', err.message)
    }
  }, [activeUserId, token])

  // Instant sync from AI Agent response payload without extra network request
  const setCartFromApi = useCallback((cartPayload) => {
    if (!cartPayload) return
    console.log('[CART] Synchronizing cart directly from AI Agent payload:', cartPayload)
    const items = cartPayload.items || []
    const formatted = formatBackendCartItems(items)
    setCart(formatted)
    addToast('Shopping bag synchronized with AI concierge', 'success')
  }, [addToast])

  // Explicit refresh helper
  const refreshCart = useCallback(() => {
    return fetchCart(activeUserId)
  }, [fetchCart, activeUserId])

  // On auth change: sync cart with PostgreSQL or clear on logout
  useEffect(() => {
    let ignore = false
    const syncUserCart = async () => {
      const uid = isAuthenticated && user?.id ? user.id : 1
      try {
        const res = await fetch(`${API_BASE_URL}/cart/${uid}`, {
          headers: getAuthHeaders(token),
        })
        if (res.ok) {
          const data = await res.json()
          if (!ignore) {
            setCart(formatBackendCartItems(data.items || []))
          }
        }
      } catch (err) {
        console.warn('[CART] Could not sync cart with backend:', err.message)
      }
    }

    if (!isAuthenticated && !user) {
      queueMicrotask(() => {
        if (!ignore) {
          setCart([])
          setWishlist([])
          setOrders([])
        }
      })
    } else {
      syncUserCart()
    }

    return () => {
      ignore = true
    }
  }, [isAuthenticated, user, token])

  // Add item to cart with backend PostgreSQL sync
  const addToCart = useCallback(
    async (product, size, color, quantity = 1) => {
      const selectedSize = size || (product.sizes && product.sizes[0]) || 'M'
      const selectedColor = color || product.colour || 'Natural'
      const productId = Number(product.id)

      // 1. Optimistic UI update
      const tempId = `temp-${productId}-${selectedSize}`
      setCart((prev) => {
        const existingIdx = prev.findIndex((item) => item.product.id === productId && item.size === selectedSize)
        if (existingIdx > -1) {
          const updated = [...prev]
          updated[existingIdx].quantity += quantity
          return updated
        }
        return [
          ...prev,
          {
            cartItemId: tempId,
            product_id: productId,
            product,
            size: selectedSize,
            color: selectedColor,
            quantity,
            item_subtotal: product.price * quantity,
          },
        ]
      })

      addToast(`Added "${product.title || product.name}" to your bag`, 'success')
      setIsCartOpen(true)

      // 2. Persist to PostgreSQL backend
      try {
        const res = await fetch(`${API_BASE_URL}/cart/${activeUserId}/items`, {
          method: 'POST',
          headers: getAuthHeaders(token),
          body: JSON.stringify({
            product_id: productId,
            quantity,
            selected_size: selectedSize,
          }),
        })
        if (res.ok) {
          const updatedCart = await res.json()
          setCart(formatBackendCartItems(updatedCart.items || []))
          console.log('[CART] Backend PostgreSQL cart updated successfully')
        }
      } catch (err) {
        console.warn('[CART] Backend sync failed, keeping local state:', err.message)
      }
    },
    [activeUserId, token, addToast]
  )

  // Remove item from cart with backend PostgreSQL sync
  const removeFromCart = useCallback(
    async (cartItemId) => {
      // Find item to get backend database ID
      const targetItem = cart.find((i) => i.cartItemId === cartItemId || String(i.id) === String(cartItemId))
      const backendId = targetItem?.backendItemId || targetItem?.id || (Number(cartItemId) ? Number(cartItemId) : null)

      // Optimistic update
      setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId && String(item.id) !== String(cartItemId)))
      addToast('Item removed from bag', 'info')

      // PostgreSQL sync
      if (backendId) {
        try {
          const res = await fetch(`${API_BASE_URL}/cart/${activeUserId}/items/${backendId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(token),
          })
          if (res.ok) {
            const updated = await res.json()
            setCart(formatBackendCartItems(updated.items || []))
          }
        } catch (err) {
          console.warn('[CART] Delete failed on backend:', err.message)
        }
      }
    },
    [cart, activeUserId, token, addToast]
  )

  // Update item quantity with backend PostgreSQL sync
  const updateQuantity = useCallback(
    async (cartItemId, newQty) => {
      if (newQty <= 0) {
        return removeFromCart(cartItemId)
      }

      const targetItem = cart.find((i) => i.cartItemId === cartItemId || String(i.id) === String(cartItemId))
      const backendId = targetItem?.backendItemId || targetItem?.id || (Number(cartItemId) ? Number(cartItemId) : null)

      // Optimistic update
      setCart((prev) =>
        prev.map((item) =>
          item.cartItemId === cartItemId || String(item.id) === String(cartItemId)
            ? { ...item, quantity: newQty, item_subtotal: item.product.price * newQty }
            : item
        )
      )

      // PostgreSQL sync
      if (backendId) {
        try {
          const res = await fetch(`${API_BASE_URL}/cart/${activeUserId}/items/${backendId}`, {
            method: 'PUT',
            headers: getAuthHeaders(token),
            body: JSON.stringify({ quantity: newQty }),
          })
          if (res.ok) {
            const updated = await res.json()
            setCart(formatBackendCartItems(updated.items || []))
          }
        } catch (err) {
          console.warn('[CART] Quantity update failed on backend:', err.message)
        }
      }
    },
    [cart, activeUserId, token, removeFromCart]
  )

  // Clear cart with backend PostgreSQL sync
  const clearCart = useCallback(async () => {
    setCart([])
    try {
      await fetch(`${API_BASE_URL}/cart/${activeUserId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
      })
    } catch (err) {
      console.warn('[CART] Clear cart failed on backend:', err.message)
    }
  }, [activeUserId, token])

  // Wishlist operations
  const toggleWishlist = useCallback(
    async (productId) => {
      const pId = Number(productId)
      const strId = String(pId)
      const exists = wishlist.includes(strId)

      if (exists) {
        setWishlist((prev) => prev.filter((id) => id !== strId))
        addToast('Removed from saved items', 'info')
        try {
          await fetch(`${API_BASE_URL}/wishlist/${activeUserId}/items/${pId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(token),
          })
        } catch (e) {
          console.warn(e)
        }
      } else {
        setWishlist((prev) => [...prev, strId])
        addToast('Saved to your wishlist', 'success')
        try {
          await fetch(`${API_BASE_URL}/wishlist/${activeUserId}/items`, {
            method: 'POST',
            headers: getAuthHeaders(token),
            body: JSON.stringify({ product_id: pId }),
          })
        } catch (e) {
          console.warn(e)
        }
      }
    },
    [wishlist, activeUserId, token, addToast]
  )

  const isInWishlist = useCallback(
    (productId) => wishlist.includes(String(productId)),
    [wishlist]
  )

  const moveToCart = useCallback(
    (productId) => {
      const product = getProductById(productId)
      if (product) {
        addToCart(product, product.sizes?.[0] || 'M', product.colour || 'Natural', 1)
        toggleWishlist(productId)
      }
    },
    [addToCart, toggleWishlist]
  )

  // Promo Code handling
  const applyPromoCode = useCallback(
    (code) => {
      const trimmed = code.trim().toUpperCase()
      if (trimmed === 'OFFWHITE15') {
        setAppliedPromo({ code: 'OFFWHITE15', discountPercent: 15, freeShip: false })
        addToast('Promo code OFFWHITE15 applied: 15% discount!', 'success')
        return { success: true, message: '15% discount applied.' }
      }
      if (trimmed === 'FREESHIP') {
        setAppliedPromo({ code: 'FREESHIP', discountPercent: 0, freeShip: true })
        addToast('Promo code FREESHIP applied: Free delivery!', 'success')
        return { success: true, message: 'Free shipping applied.' }
      }
      addToast('Invalid promo code. Try OFFWHITE15 or FREESHIP', 'error')
      return { success: false, message: 'Invalid promo code.' }
    },
    [addToast]
  )

  const removePromoCode = useCallback(() => {
    setAppliedPromo(null)
    addToast('Promo code removed', 'info')
  }, [addToast])

  // Computed Financial Totals
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0)
  }, [cart])

  const totalItemsCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0)
  }, [cart])

  const discountAmount = useMemo(() => {
    if (!appliedPromo || !appliedPromo.discountPercent) return 0
    return Math.round(subtotal * (appliedPromo.discountPercent / 100))
  }, [subtotal, appliedPromo])

  const shippingFee = useMemo(() => {
    if (subtotal === 0) return 0
    if (subtotal >= FREE_SHIPPING_THRESHOLD || appliedPromo?.freeShip) return 0
    return STANDARD_SHIPPING_FEE
  }, [subtotal, appliedPromo])

  const amountToFreeShipping = useMemo(() => {
    return Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  }, [subtotal])

  const freeShippingProgress = useMemo(() => {
    if (subtotal >= FREE_SHIPPING_THRESHOLD) return 100
    return Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100))
  }, [subtotal])

  const estimatedTax = useMemo(() => {
    return Math.round((subtotal - discountAmount) * 0.08)
  }, [subtotal, discountAmount])

  const grandTotal = useMemo(() => {
    return Math.max(0, subtotal - discountAmount + shippingFee + estimatedTax)
  }, [subtotal, discountAmount, shippingFee, estimatedTax])

  // Order Placement
  const createOrder = useCallback(
    ({ customerInfo, shippingMethod = 'Standard', paymentMethod = 'Credit Card' }) => {
      const daysToAdd = shippingMethod.includes('Overnight') ? 2 : shippingMethod.includes('Express') ? 4 : 6
      const deliveryDate = new Date()
      deliveryDate.setDate(deliveryDate.getDate() + daysToAdd)

      const formattedDelivery = deliveryDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })

      const newOrderId = `RAYA${Math.floor(1000 + Math.random() * 9000)}`

      const newOrder = {
        id: newOrderId,
        createdAt: new Date().toISOString(),
        status: 'Order Placed',
        customer: customerInfo,
        items: cart.map((item) => ({
          id: item.product.id,
          name: item.product.title || item.product.name,
          price: item.product.price,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          image: item.product.image,
        })),
        shippingMethod,
        shippingFee,
        discountAmount,
        subtotal,
        tax: estimatedTax,
        total: grandTotal,
        paymentMethod: `${paymentMethod} (Verified Demo)`,
        estimatedDelivery: formattedDelivery,
        timeline: [
          { step: 'Order Placed', completed: true, date: 'Just now' },
          { step: 'Confirmed', completed: false, date: 'In 24 hours' },
          { step: 'Processing', completed: false, date: '1–2 business days' },
          { step: 'Shipped', completed: false, date: 'Central Warehouse' },
          { step: 'Out for Delivery', completed: false, date: formattedDelivery },
          { step: 'Delivered', completed: false, date: formattedDelivery },
        ],
      }

      setOrders((prev) => [newOrder, ...prev])
      clearCart()
      setAppliedPromo(null)
      addToast(`Order #${newOrderId} confirmed!`, 'success')

      return newOrder
    },
    [cart, shippingFee, discountAmount, subtotal, estimatedTax, grandTotal, clearCart, addToast]
  )

  const value = {
    cart,
    wishlist,
    orders,
    isCartOpen,
    setIsCartOpen,
    isWishlistOpen,
    setIsWishlistOpen,
    isCheckoutOpen,
    setIsCheckoutOpen,
    isOrderTrackerOpen,
    setIsOrderTrackerOpen,
    activeQuickView,
    setActiveQuickView,
    trackingOrderId,
    setTrackingOrderId,
    toasts,
    addToast,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    fetchCart,
    refreshCart,
    setCartFromApi,
    toggleWishlist,
    isInWishlist,
    moveToCart,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
    subtotal,
    totalItemsCount,
    discountAmount,
    shippingFee,
    amountToFreeShipping,
    freeShippingProgress,
    estimatedTax,
    grandTotal,
    createOrder,
    FREE_SHIPPING_THRESHOLD,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
