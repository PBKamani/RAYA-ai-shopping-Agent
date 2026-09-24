import ProductCard from './ProductCard'

export default function ProductGrid({
  products,
  totalCount,
  onQuickView,
  hasMore,
  onLoadMore,
  isLoadingMore,
  onResetFilters,
}) {
  if (products.length === 0) {
    return (
      <div className="empty-catalog-state">
        <div className="empty-state-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </div>
        <h3 className="empty-state-title">No Wardrobe Items Found</h3>
        <p className="empty-state-desc">
          We couldn&apos;t find any pieces matching your specified refinements. Try clearing
          filters or searching for broader terms like &quot;outerwear&quot;, &quot;linen&quot;, or &quot;cashmere&quot;.
        </p>
        <button
          type="button"
          className="btn-atelier-primary empty-state-btn"
          onClick={onResetFilters}
        >
          Reset All Filters
        </button>
      </div>
    )
  }

  const progressPercent = Math.min(100, Math.round((products.length / totalCount) * 100))

  return (
    <section className="product-grid-section" id="catalog-grid-anchor">
      {/* Product Cards Grid */}
      <div className="catalog-cards-grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onQuickView={onQuickView}
          />
        ))}
      </div>

      {/* Pagination / Load More Footer */}
      <div className="catalog-pagination-footer">
        <div className="pagination-count-box">
          <span className="pagination-count-text">
            Displaying <strong>{products.length}</strong> of{' '}
            <strong>{totalCount}</strong> pieces
          </span>
          <div className="pagination-progress-track">
            <div
              className="pagination-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {hasMore && (
          <button
            type="button"
            className="load-more-btn"
            onClick={onLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? (
              <span className="btn-loading-spinner">Loading archive...</span>
            ) : (
              <span>Load More Pieces (+24)</span>
            )}
          </button>
        )}
      </div>
    </section>
  )
}
