import productsRaw from './products.json' with { type: 'json' }

// Color map for luxury swatches
const COLOR_HEX_MAP = {
  Black: '#1A1917',
  White: '#F4F3EE',
  Blue: '#2563EB',
  Grey: '#6B7280',
  Red: '#DC2626',
  Green: '#16A34A',
  Brown: '#78350F',
  'Navy Blue': '#1E3A8A',
  Pink: '#EC4899',
  Yellow: '#EAB308',
  Purple: '#9333EA',
  Silver: '#9CA3AF',
  Orange: '#EA580C',
  Beige: '#D4B996',
  Maroon: '#831843',
  Khaki: '#C3B091',
  Teal: '#0D9488',
  Olive: '#556B2F',
  Bronze: '#CD7F32',
  Gold: '#D97706',
  Turquoise: '#06B6D4',
  Charcoal: '#374151',
  Peach: '#FFDAB9',
  Lavender: '#E6E6FA',
  Magenta: '#D946EF',
  Cream: '#FFFDD0',
  Tan: '#D2B48C',
  Rust: '#B7410E',
  Burgundy: '#800020',
  Multi: '#64748B',
}

function getColorHex(colorName) {
  if (!colorName) return '#FAF9F6'
  return COLOR_HEX_MAP[colorName] || '#8C877D'
}

function deriveFabric(product) {
  const art = (product.articleType || '').toLowerCase()
  const master = (product.masterCategory || '').toLowerCase()

  if (master === 'footwear') {
    return 'Artisan Calfskin Leather & Vulcanized Rubber'
  }
  if (art.includes('jacket') || art.includes('blazer') || art.includes('coat')) {
    return 'Recycled Italian Wool & Structured Twill'
  }
  if (art.includes('sweater') || art.includes('cardigan')) {
    return 'Grade-A Fine Merino Wool & Cashmere'
  }
  if (art.includes('shirt') || art.includes('tshirt') || art.includes('top')) {
    return '100% Organic Heavyweight Cotton (280 GSM)'
  }
  if (art.includes('trouser') || art.includes('pants') || art.includes('shorts')) {
    return 'Structured Japanese Selvedge & Tailored Chino Twill'
  }
  if (master === 'accessories') {
    return 'Full-Grain Tuscan Leather & Brushed Metal Hardware'
  }
  return 'Premium Long-Staple Natural Fiber'
}

// Normalize raw products into consistent application format
const normalizedProducts = productsRaw.map((p) => {
  const strId = String(p.id)
  const hex = getColorHex(p.colour)
  const colors = [
    { name: p.colour || 'Natural', hex },
    { name: 'Off-White', hex: '#FAF9F6' },
    { name: 'Charcoal', hex: '#2A2927' },
  ]

  return {
    ...p,
    id: strId,
    name: p.title,
    title: p.title,
    brand: p.brand || 'RAYA ATELIER',
    masterCategory: p.masterCategory,
    subCategory: p.subCategory,
    articleType: p.articleType,
    category: p.masterCategory,
    gender: p.gender,
    colour: p.colour || 'Natural',
    colors,
    season: p.season || 'All Season',
    year: p.year ? String(p.year) : '2026',
    usage: p.usage || 'Casual',
    price: Number(p.price) || 85,
    originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
    rating: Number(p.rating) || 4.5,
    reviewsCount: Number(p.reviewsCount) || 24,
    image: p.image || `/products/${strId}.jpg`,
    sizes: Array.isArray(p.sizes) && p.sizes.length > 0 ? p.sizes : ['S', 'M', 'L', 'XL'],
    stock: Number(p.stock) || 12,
    stockCount: Number(p.stock) || 12,
    inStock: p.inStock !== undefined ? Boolean(p.inStock) : true,
    tags: Array.isArray(p.tags) ? p.tags : [],
    description: p.description || `${p.title}. Crafted for refined minimalist silhouettes.`,
    fabric: deriveFabric(p),
    createdAt: new Date(2026, 0, 1 + (Math.abs(Number(strId) || 1) % 240)).toISOString(),
  }
})

// Fast lookup map by ID
const productsById = new Map()
normalizedProducts.forEach((p) => productsById.set(p.id, p))

/**
 * Returns all normalized products
 */
export function getAllProducts() {
  return normalizedProducts
}

/**
 * Fast product lookup by ID
 */
export function getProductById(id) {
  return productsById.get(String(id)) || null
}

/**
 * Dynamically computes category navigation tabs from products.json with exact live counts.
 * ZERO HARDCODED COUNTS.
 */
export function getCategoryNavTabs() {
  const counts = {
    All: normalizedProducts.length,
    Sale: 0,
  }

  // Count master categories dynamically
  const masterCats = new Set()
  const genders = new Set()

  normalizedProducts.forEach((p) => {
    if (p.masterCategory) {
      masterCats.add(p.masterCategory)
      counts[p.masterCategory] = (counts[p.masterCategory] || 0) + 1
    }
    if (p.gender) {
      genders.add(p.gender)
      counts[p.gender] = (counts[p.gender] || 0) + 1
    }
    if (p.originalPrice) {
      counts.Sale++
    }
  })

  // Order tabs logically: All, Master Categories, Top Genders (Women, Men), Sale
  const tabs = [
    { key: 'All', label: 'All', count: counts.All },
    ...Array.from(masterCats).map((cat) => ({
      key: cat,
      label: cat,
      count: counts[cat] || 0,
    })),
  ]

  if (counts.Women) {
    tabs.push({ key: 'Women', label: 'Women', count: counts.Women })
  }
  if (counts.Men) {
    tabs.push({ key: 'Men', label: 'Men', count: counts.Men })
  }

  tabs.push({ key: 'Sale', label: 'Sale', count: counts.Sale, isSale: true })

  return tabs
}

/**
 * Dynamically calculates counts for all categories and tags
 */
export function getCategoryCounts() {
  const counts = {
    All: normalizedProducts.length,
    Sale: 0,
  }

  normalizedProducts.forEach((p) => {
    if (p.masterCategory) {
      counts[p.masterCategory] = (counts[p.masterCategory] || 0) + 1
    }
    if (p.subCategory) {
      counts[p.subCategory] = (counts[p.subCategory] || 0) + 1
    }
    if (p.gender) {
      counts[p.gender] = (counts[p.gender] || 0) + 1
    }
    if (p.originalPrice) {
      counts.Sale++
    }
  })

  return counts
}

/**
 * Dynamically generates all filter options from the dataset with live counts.
 * ZERO HARDCODED VALUES.
 */
export function getFilterOptions() {
  const genderCounts = {}
  const subCategoryCounts = {}
  const articleTypeCounts = {}
  const colourCounts = {}
  const seasonCounts = {}
  const usageCounts = {}

  normalizedProducts.forEach((p) => {
    if (p.gender) genderCounts[p.gender] = (genderCounts[p.gender] || 0) + 1
    if (p.subCategory) subCategoryCounts[p.subCategory] = (subCategoryCounts[p.subCategory] || 0) + 1
    if (p.articleType) articleTypeCounts[p.articleType] = (articleTypeCounts[p.articleType] || 0) + 1
    if (p.colour) colourCounts[p.colour] = (colourCounts[p.colour] || 0) + 1
    if (p.season) seasonCounts[p.season] = (seasonCounts[p.season] || 0) + 1
    if (p.usage) usageCounts[p.usage] = (usageCounts[p.usage] || 0) + 1
  })

  const formatList = (countsObj, minCount = 1) =>
    Object.entries(countsObj)
      .filter(([, count]) => count >= minCount)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }))

  return {
    genders: formatList(genderCounts),
    subCategories: formatList(subCategoryCounts),
    articleTypes: formatList(articleTypeCounts, 5), // Keep top 5+ for clean UI
    colours: Object.entries(colourCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 14)
      .map(([name, count]) => ({
        name,
        count,
        hex: getColorHex(name),
      })),
    seasons: formatList(seasonCounts),
    usages: formatList(usageCounts),
  }
}

/**
 * Dynamic Multi-Token Search, Filter, Sort, and Paginate Engine
 */
export function queryProducts({
  search = '',
  category = 'All',
  gender = 'All',
  subCategory = '',
  articleType = '',
  colour = '',
  season = '',
  usage = '',
  minPrice = 0,
  maxPrice = 1000,
  selectedSize = '',
  inStockOnly = false,
  sortBy = 'recommended',
  page = 1,
  limit = 24,
}) {
  const searchTokens = search.trim()
    ? search.toLowerCase().trim().split(/\s+/).filter(Boolean)
    : []

  const filtered = normalizedProducts.filter((product) => {
    // 1. Multi-Token Search across all product metadata fields
    if (searchTokens.length > 0) {
      const searchTarget = `${product.title} ${product.brand} ${product.masterCategory} ${product.subCategory} ${product.articleType} ${product.gender} ${product.colour} ${product.usage} ${product.season} ${product.id} ${product.tags.join(' ')}`.toLowerCase()

      const matchesAllTokens = searchTokens.every((token) => searchTarget.includes(token))
      if (!matchesAllTokens) return false
    }

    // 2. Category / Navigation Tab Filter
    if (category === 'Sale') {
      if (!product.originalPrice) return false
    } else if (category === 'Women' || category === 'Men' || category === 'Unisex') {
      if (product.gender.toLowerCase() !== category.toLowerCase()) return false
    } else if (category && category !== 'All') {
      const catLower = category.toLowerCase()
      const matchesCategory =
        (product.masterCategory && product.masterCategory.toLowerCase() === catLower) ||
        (product.subCategory && product.subCategory.toLowerCase() === catLower) ||
        (product.articleType && product.articleType.toLowerCase() === catLower)
      if (!matchesCategory) return false
    }

    // 3. Gender / Department Filter
    if (gender && gender !== 'All') {
      if (product.gender.toLowerCase() !== gender.toLowerCase()) return false
    }

    // 4. Sub-Category Filter
    if (subCategory && subCategory !== 'All') {
      if (product.subCategory.toLowerCase() !== subCategory.toLowerCase()) return false
    }

    // 5. Article Type Filter
    if (articleType && articleType !== 'All') {
      if (product.articleType.toLowerCase() !== articleType.toLowerCase()) return false
    }

    // 6. Colour Filter
    if (colour && colour !== 'All') {
      if (product.colour.toLowerCase() !== colour.toLowerCase()) return false
    }

    // 7. Season Filter
    if (season && season !== 'All') {
      if (product.season.toLowerCase() !== season.toLowerCase()) return false
    }

    // 8. Usage Filter
    if (usage && usage !== 'All') {
      if (product.usage.toLowerCase() !== usage.toLowerCase()) return false
    }

    // 9. Price Range
    if (product.price < minPrice || product.price > maxPrice) return false

    // 10. Size Filter
    if (selectedSize) {
      if (!product.sizes.includes(selectedSize)) return false
    }

    // 11. In Stock Only
    if (inStockOnly && !product.inStock) return false

    return true
  })

  // Deterministic Sorting
  switch (sortBy) {
    case 'price-asc':
      filtered.sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      filtered.sort((a, b) => b.price - a.price)
      break
    case 'rating':
      filtered.sort((a, b) => b.rating - a.rating)
      break
    case 'newest':
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      break
    case 'recommended':
    default:
      filtered.sort((a, b) => {
        const scoreA = a.rating * 10 + (a.tags.includes('Best Seller') ? 15 : 0) + (a.originalPrice ? 8 : 0)
        const scoreB = b.rating * 10 + (b.tags.includes('Best Seller') ? 15 : 0) + (b.originalPrice ? 8 : 0)
        return scoreB - scoreA
      })
      break
  }

  // Pagination
  const total = filtered.length
  const totalPages = Math.ceil(total / limit)
  const offset = (page - 1) * limit
  const paginatedItems = filtered.slice(0, offset + limit)

  return {
    items: paginatedItems,
    total,
    page,
    limit,
    totalPages,
    hasMore: offset + limit < total,
  }
}

/**
 * Autocomplete search suggestions matching titles, brands, categories
 */
export function getSearchSuggestions(query, limit = 6) {
  if (!query || query.trim().length < 2) return []
  const q = query.toLowerCase().trim()
  const matches = []

  for (const p of normalizedProducts) {
    if (
      p.title.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.subCategory.toLowerCase().includes(q) ||
      p.articleType.toLowerCase().includes(q)
    ) {
      matches.push(p)
      if (matches.length >= limit) break
    }
  }
  return matches
}
