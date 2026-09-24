import { getAllProducts } from '../data/products'
import { API_BASE_URL, getAuthHeaders } from './api'

/**
 * AI Service Layer for RAYA ATELIER Shopping Assistant
 * 
 * ARCHITECTURAL DESIGN:
 * React Frontend -> FastAPI Backend -> LangChain / LangGraph Agent -> PostgreSQL
 * 
 * Forwards queries to the FastAPI + LangGraph backend at API_BASE_URL/agent/chat.
 * If the backend is unavailable, gracefully falls back to local catalog parsing.
 */

const AI_BACKEND_URL = import.meta.env.VITE_AI_BACKEND_URL || API_BASE_URL

let currentConversationId = null

/**
 * Sends a user query to the AI Shopping Concierge
 * @param {string} userMessage - User's query
 * @param {Array} conversationHistory - Past messages
 * @param {Object} context - Context (user_id, token, active filters, cart items, etc.)
 * @returns {Promise<{reply: string, recommendedProducts: Array, intent: string, suggestedQuestions: Array, cart_updated: boolean, cart: Object}>}
 */
export async function sendChatMessage(userMessage, conversationHistory = [], context = {}) {
  const authToken = context.token || localStorage.getItem('raya_auth_token') || null

  // If a backend is configured (defaulting to http://localhost:8000/api), send request there:
  if (AI_BACKEND_URL) {
    try {
      // Handle both '/api' prefixed and root base URLs cleanly
      const chatEndpoint = AI_BACKEND_URL.endsWith('/api')
        ? `${AI_BACKEND_URL}/agent/chat`
        : `${AI_BACKEND_URL}/api/agent/chat`

      const response = await fetch(chatEndpoint, {
        method: 'POST',
        headers: getAuthHeaders(authToken),
        body: JSON.stringify({
          user_id: context.user_id || 1,
          conversation_id: currentConversationId,
          message: userMessage,
          history: conversationHistory,
          context: {
            cartCount: context.cartCount || 0,
            activeCategory: context.activeCategory || 'All',
            currentProductId: context.currentProductId || null,
          },
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.conversation_id) {
          currentConversationId = data.conversation_id
        }
        return {
          reply: data.message || data.reply,
          recommendedProducts: data.products || data.recommendedProducts || [],
          suggestedQuestions: data.suggestedQuestions || [
            'Show pieces on sale',
            'What is in my shopping bag?',
            'Recommend an outfit',
          ],
          cart_updated: Boolean(data.cart_updated),
          cart: data.cart || null,
          requires_clarification: Boolean(data.requires_clarification),
          ...data,
        }
      }
      console.warn('AI Backend returned non-200, falling back to local reasoning:', response.status)
    } catch (err) {
      console.warn('Could not connect to AI backend, running local fallback agent:', err.message)
    }
  }

  // Simulated AI response generator simulating LangChain / LangGraph agent execution:
  // Adds simulated 400ms network latency for realism
  await new Promise((resolve) => setTimeout(resolve, 380))

  return simulateLocalAgentReasoning(userMessage)
}

/**
 * Local simulation of LangGraph agent reasoning when standalone
 */
function simulateLocalAgentReasoning(query) {
  const q = query.toLowerCase()
  const all = getAllProducts()

  // Match: Under $X (e.g. "under $150", "under 100")
  const underPriceMatch = q.match(/under\s*\$?(\d+)/i)
  const maxPrice = underPriceMatch ? parseInt(underPriceMatch[1], 10) : null

  // Check intent categories & article types from dataset
  let categoryFilter = null
  if (q.includes('jacket') || q.includes('fleece') || q.includes('track jacket')) {
    categoryFilter = 'Jackets'
  } else if (q.includes('shoe') || q.includes('sneaker') || q.includes('boot') || q.includes('footwear')) {
    categoryFilter = 'Footwear'
  } else if (q.includes('shirt') || q.includes('tee') || q.includes('tshirt') || q.includes('top')) {
    categoryFilter = 'Topwear'
  } else if (q.includes('pant') || q.includes('short') || q.includes('track pant') || q.includes('bottom')) {
    categoryFilter = 'Bottomwear'
  } else if (q.includes('bag') || q.includes('backpack') || q.includes('accessory')) {
    categoryFilter = 'Bags'
  } else if (q.includes('apparel') || q.includes('clothing')) {
    categoryFilter = 'Apparel'
  }

  // Check color
  let colorFilter = null
  const colors = ['black', 'white', 'blue', 'grey', 'red', 'green', 'brown', 'navy', 'pink']
  for (const c of colors) {
    if (q.includes(c)) {
      colorFilter = c
      break
    }
  }

  // Filter matching products from authoritative catalog
  let matched = all.filter((p) => {
    if (categoryFilter) {
      const match =
        (p.masterCategory && p.masterCategory.toLowerCase() === categoryFilter.toLowerCase()) ||
        (p.subCategory && p.subCategory.toLowerCase() === categoryFilter.toLowerCase()) ||
        (p.articleType && p.articleType.toLowerCase() === categoryFilter.toLowerCase())
      if (!match) return false
    }
    if (maxPrice && p.price > maxPrice) return false
    if (colorFilter && !p.colour.toLowerCase().includes(colorFilter)) return false
    return true
  })

  // Fallback to general search if no exact match
  if (matched.length === 0) {
    matched = all.slice(0, 4)
  } else {
    matched = matched.slice(0, 4)
  }

  // Generate contextual response
  if (q.includes('wedding') || q.includes('event') || q.includes('outfit')) {
    return {
      reply:
        'For an event or elevated gathering, I recommend a tailored architectural silhouette in a muted monochrome palette. Here are pieces combining structured natural fibers with fluid drapery:',
      recommendedProducts: all.filter((p) => p.subCategory === 'Topwear' || p.masterCategory === 'Apparel').slice(0, 3),
      intent: 'outfit_recommendation',
      suggestedQuestions: [
        'Show me footwear that pairs with this',
        'Filter options under $100',
        'What fabrics are recommended for summer?',
      ],
    }
  }

  if (q.includes('compare')) {
    const compareList = matched.slice(0, 2)
    return {
      reply: `Comparing two signature selections: ${compareList.map((p) => p.title || p.name).join(' vs ')}. Both feature high-density natural fibers with tailored architectural draping.`,
      recommendedProducts: compareList,
      intent: 'compare_items',
      suggestedQuestions: ['Which has a heavier fabric weight?', 'Add first item to bag', 'Show sizing guide'],
    }
  }

  if (maxPrice) {
    return {
      reply: `I curated the following minimalist ${categoryFilter || 'fashion'} pieces priced strictly under $${maxPrice}:`,
      recommendedProducts: matched,
      intent: 'price_filtered_search',
      suggestedQuestions: ['Show in Charcoal or Black', 'Sort by highest rated', 'Check shipping timeframe'],
    }
  }

  if (categoryFilter) {
    return {
      reply: `Here are our most refined ${categoryFilter.toLowerCase()} pieces from the Autumn/Winter Minimalist Archive:`,
      recommendedProducts: matched,
      intent: 'category_search',
      suggestedQuestions: [`Show ${categoryFilter} on sale`, 'What sizes are in stock?', 'Pair with trousers'],
    }
  }

  return {
    reply:
      'I parsed your request across the RAYA ATELIER archive. Here are curated minimalist wardrobe pieces with tactile fabrics and timeless proportions:',
    recommendedProducts: matched,
    intent: 'general_recommendation',
    suggestedQuestions: [
      'Show me black jackets under $150',
      'I need an outfit for an outdoor wedding',
      'Find minimalist shirts',
      'Show products on sale',
    ],
  }
}
