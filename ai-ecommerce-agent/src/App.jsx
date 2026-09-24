import { useState, useMemo, useCallback } from 'react'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { useCart } from './hooks/useCart'
import { queryProducts } from './data/products'

// Components
import StoreHeader from './components/StoreHeader'
import HeroBanner from './components/HeroBanner'
import FilterToolbar from './components/FilterToolbar'
import ProductGrid from './components/ProductGrid'
import ProductQuickViewModal from './components/ProductQuickViewModal'
import CartDrawer from './components/CartDrawer'
import WishlistDrawer from './components/WishlistDrawer'
import CheckoutModal from './components/CheckoutModal'
import OrderTracker from './components/OrderTracker'
import AuthModal from './components/AuthModal'
import AIStylistWidget from './components/AIStylistWidget'
import ToastNotifications from './components/ToastNotifications'
import StoreFooter from './components/StoreFooter'

import './App.css'

function StorefrontContent() {
  const {
    activeQuickView,
    setActiveQuickView,
    isOrderTrackerOpen,
    setIsOrderTrackerOpen,
    trackingOrderId,
    setTrackingOrderId,
  } = useCart()

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('All')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedSubCategory, setSelectedSubCategory] = useState('')
  const [selectedArticleType, setSelectedArticleType] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSeason, setSelectedSeason] = useState('')
  const [selectedUsage, setSelectedUsage] = useState('')
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 })
  const [selectedSize, setSelectedSize] = useState('')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [sortBy, setSortBy] = useState('recommended')
  const [page, setPage] = useState(1)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Query products with current filters
  const { items, total, hasMore } = useMemo(() => {
    return queryProducts({
      search: searchQuery,
      category: selectedCategory,
      gender: selectedDepartment,
      subCategory: selectedSubCategory,
      articleType: selectedArticleType,
      colour: selectedColor,
      season: selectedSeason,
      usage: selectedUsage,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      selectedSize,
      inStockOnly,
      sortBy,
      page: 1,
      limit: page * 24, // Progressive loading
    })
  }, [
    searchQuery,
    selectedCategory,
    selectedDepartment,
    selectedSubCategory,
    selectedArticleType,
    selectedColor,
    selectedSeason,
    selectedUsage,
    priceRange,
    selectedSize,
    inStockOnly,
    sortBy,
    page,
  ])

  // Reset page when filters change
  const handleFilterChange = useCallback((setter) => {
    return (val) => {
      setPage(1)
      setter(val)
    }
  }, [])

  const handleSelectDepartment = handleFilterChange(setSelectedDepartment)
  const handleSelectCategory = handleFilterChange(setSelectedCategory)
  const handleSelectSubCategory = handleFilterChange(setSelectedSubCategory)
  const handleSelectArticleType = handleFilterChange(setSelectedArticleType)
  const handleSelectColor = handleFilterChange(setSelectedColor)
  const handleSelectSeason = handleFilterChange(setSelectedSeason)
  const handleSelectUsage = handleFilterChange(setSelectedUsage)
  const handleSelectSize = handleFilterChange(setSelectedSize)
  const handleToggleInStockOnly = handleFilterChange(setInStockOnly)
  const handleSortChange = handleFilterChange(setSortBy)

  const handlePriceRangeChange = useCallback((min, max) => {
    setPage(1)
    setPriceRange({ min, max })
  }, [])

  const handleSearchChange = useCallback((val) => {
    setPage(1)
    setSearchQuery(val)
  }, [])

  const handleResetFilters = useCallback(() => {
    setPage(1)
    setSearchQuery('')
    setSelectedDepartment('All')
    setSelectedCategory('All')
    setSelectedSubCategory('')
    setSelectedArticleType('')
    setSelectedColor('')
    setSelectedSeason('')
    setSelectedUsage('')
    setPriceRange({ min: 0, max: 1000 })
    setSelectedSize('')
    setInStockOnly(false)
    setSortBy('recommended')
  }, [])

  const handleLoadMore = useCallback(() => {
    setIsLoadingMore(true)
    setTimeout(() => {
      setPage((p) => p + 1)
      setIsLoadingMore(false)
    }, 250)
  }, [])

  const scrollToCatalog = useCallback(() => {
    const el = document.getElementById('catalog-grid-anchor')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  const handleExploreCategory = useCallback(
    (cat) => {
      setSelectedCategory(cat)
      setPage(1)
      scrollToCatalog()
    },
    [scrollToCatalog]
  )

  const handleOpenTrackerWithId = useCallback(
    (id) => {
      setTrackingOrderId(id || '')
      setIsOrderTrackerOpen(true)
    },
    [setTrackingOrderId, setIsOrderTrackerOpen]
  )

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedDepartment !== 'All' ||
    selectedCategory !== 'All' ||
    selectedSubCategory !== '' ||
    selectedArticleType !== '' ||
    selectedColor !== '' ||
    selectedSeason !== '' ||
    selectedUsage !== '' ||
    priceRange.min > 0 ||
    priceRange.max < 1000 ||
    selectedSize !== '' ||
    inStockOnly

  return (
    <div className="storefront-app-shell">
      {/* Header */}
      <StoreHeader
        activeCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onOpenOrderTracker={() => handleOpenTrackerWithId('')}
      />

      <main>
        {/* Editorial Hero & Scroll Video Section */}
        <HeroBanner
          onExploreCategory={handleExploreCategory}
          onScrollToCatalog={scrollToCatalog}
        />

        {/* Filter & Sorting Controls */}
        <FilterToolbar
          totalCount={total}
          selectedDepartment={selectedDepartment}
          onSelectDepartment={handleSelectDepartment}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          selectedSubCategory={selectedSubCategory}
          onSelectSubCategory={handleSelectSubCategory}
          selectedArticleType={selectedArticleType}
          onSelectArticleType={handleSelectArticleType}
          selectedColor={selectedColor}
          onSelectColor={handleSelectColor}
          selectedSeason={selectedSeason}
          onSelectSeason={handleSelectSeason}
          selectedUsage={selectedUsage}
          onSelectUsage={handleSelectUsage}
          priceRange={priceRange}
          onPriceRangeChange={handlePriceRangeChange}
          selectedSize={selectedSize}
          onSelectSize={handleSelectSize}
          inStockOnly={inStockOnly}
          onToggleInStockOnly={handleToggleInStockOnly}
          sortBy={sortBy}
          onSortChange={handleSortChange}
          onResetFilters={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Product Catalog Grid */}
        <ProductGrid
          products={items}
          totalCount={total}
          onQuickView={setActiveQuickView}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          isLoadingMore={isLoadingMore}
          onResetFilters={handleResetFilters}
        />
      </main>

      {/* Modals & Drawers */}
      <ProductQuickViewModal
        product={activeQuickView}
        onClose={() => setActiveQuickView(null)}
      />

      <CartDrawer />
      <WishlistDrawer />

      <CheckoutModal
        onTrackOrder={(orderId) => handleOpenTrackerWithId(orderId)}
      />

      <OrderTracker
        isOpen={isOrderTrackerOpen}
        onClose={() => setIsOrderTrackerOpen(false)}
        initialOrderId={trackingOrderId}
      />

      <AuthModal />

      {/* AI Assistant Concierge */}
      <AIStylistWidget onSelectProduct={setActiveQuickView} />

      {/* Toasts */}
      <ToastNotifications />

      {/* Footer */}
      <StoreFooter
        onOpenOrderTracker={() => handleOpenTrackerWithId('')}
      />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <StorefrontContent />
      </CartProvider>
    </AuthProvider>
  )
}
