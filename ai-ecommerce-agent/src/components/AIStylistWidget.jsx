import { useState, useRef, useEffect } from 'react'
import { sendChatMessage } from '../services/aiService'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../hooks/useAuth'

export default function AIStylistWidget({ onSelectProduct }) {
  const { totalItemsCount, setActiveQuickView, addToCart, setCartFromApi, refreshCart } = useCart()
  const { user, token } = useAuth()

  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      sender: 'agent',
      text: 'Greetings. I am RAYA Concierge, your personal minimalist fashion intelligence. How may I assist your wardrobe curation today?',
      recommendedProducts: [],
      suggestedQuestions: [
        'Show me black jackets under $150',
        'I need an outfit for an outdoor wedding',
        'Find minimalist shirts',
        'Show products under $100',
      ],
    },
  ])
  const [inputVal, setInputVal] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  const handleSend = async (userText) => {
    const text = (userText || inputVal).trim()
    if (!text) return

    // Add user message
    const newMessages = [...messages, { sender: 'user', text }]
    setMessages(newMessages)
    setInputVal('')
    setIsLoading(true)

    try {
      const response = await sendChatMessage(text, newMessages, {
        cartCount: totalItemsCount,
        user_id: user?.id || 1,
        token: token,
      })

      // Synchronize cart state if the AI agent modified the bag or queried it
      if (response.cart_updated) {
        if (response.cart) {
          setCartFromApi(response.cart)
        } else {
          refreshCart()
        }
      } else if (response.cart && response.cart.items) {
        setCartFromApi(response.cart)
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: response.reply,
          recommendedProducts: response.recommendedProducts || [],
          suggestedQuestions: response.suggestedQuestions || [],
        },
      ])
    } catch (err) {
      console.error('AI chat error:', err)
      setMessages((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: 'Apologies, I encountered an issue parsing the archive. Please try again or rephrase your inquiry.',
          recommendedProducts: [],
          suggestedQuestions: ['Show products on sale', 'Explore Outerwear'],
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="ai-stylist-root">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          className="ai-stylist-trigger-btn"
          onClick={() => setIsOpen(true)}
          aria-label="Open RAYA AI Shopping Concierge"
        >
          <span className="ai-spark-icon">✦</span>
          <span className="ai-trigger-label">RAYA Concierge</span>
          <span className="ai-status-indicator" />
        </button>
      )}

      {/* Concierge Window */}
      {isOpen && (
        <div className="ai-concierge-window" role="dialog" aria-modal="false">
          {/* Header */}
          <div className="ai-window-header">
            <div className="ai-header-left">
              <div className="ai-avatar-badge">✦</div>
              <div>
                <h4 className="ai-header-title">RAYA Concierge</h4>
                <span className="ai-header-sub">Autonomous Fashion Agent</span>
              </div>
            </div>
            <button
              type="button"
              className="ai-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close Concierge"
            >
              ✕
            </button>
          </div>

          {/* Conversation Body */}
          <div className="ai-messages-scroll-area">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`ai-message-row ${m.sender === 'user' ? 'is-user' : 'is-agent'}`}
              >
                <div className="ai-message-bubble">
                  <p className="ai-bubble-text">{m.text}</p>

                  {/* Recommended Products Carousel */}
                  {m.recommendedProducts && m.recommendedProducts.length > 0 && (
                    <div className="ai-recommended-products-grid">
                      {m.recommendedProducts.map((p) => (
                        <div key={p.id} className="ai-product-mini-card">
                          <img
                            src={p.image}
                            alt={p.title || p.name}
                            className="ai-mini-thumb"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.onerror = null
                              e.currentTarget.src =
                                'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60" fill="%23F4F3EE"><rect width="60" height="60" fill="%23F4F3EE"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="9" fill="%238C877D">RAYA</text></svg>'
                            }}
                            onClick={() => {
                              setActiveQuickView(p)
                              if (onSelectProduct) onSelectProduct(p)
                            }}
                          />
                          <div className="ai-mini-details">
                            <span className="ai-mini-title" title={p.title || p.name}>
                              {p.title || p.name}
                            </span>
                            <div className="ai-mini-bottom">
                              <span className="ai-mini-price">${p.price}</span>
                              <button
                                type="button"
                                className="ai-mini-add-btn"
                                onClick={() =>
                                  addToCart(
                                    p,
                                    p.sizes?.[0] || 'M',
                                    p.colors?.[0]?.name || p.colour || 'Natural',
                                    1
                                  )
                                }
                              >
                                + Bag
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Suggested Question Chips */}
                  {m.suggestedQuestions && m.suggestedQuestions.length > 0 && (
                    <div className="ai-suggested-chips-row">
                      {m.suggestedQuestions.map((q, qIdx) => (
                        <button
                          key={qIdx}
                          type="button"
                          className="ai-chip-btn"
                          onClick={() => handleSend(q)}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="ai-message-row is-agent">
                <div className="ai-message-bubble ai-typing-indicator">
                  <span className="dot-pulse" />
                  <span className="dot-pulse" />
                  <span className="dot-pulse" />
                  <span className="typing-text">Parsing catalog intelligence...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="ai-chat-input-bar"
          >
            <input
              type="text"
              placeholder="Ask for wardrobe styling, price limits, or outfits..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="ai-input-field"
            />
            <button
              type="submit"
              className="ai-send-btn"
              disabled={!inputVal.trim() || isLoading}
              aria-label="Send query"
            >
              ↑
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
