import { useState, useMemo } from 'react'
import { getFilterOptions } from '../data/products'

export default function FilterToolbar({
  totalCount,
  selectedDepartment,
  onSelectDepartment,
  selectedCategory,
  onSelectCategory,
  selectedSubCategory,
  onSelectSubCategory,
  selectedArticleType,
  onSelectArticleType,
  selectedColor,
  onSelectColor,
  selectedSeason,
  onSelectSeason,
  selectedUsage,
  onSelectUsage,
  priceRange,
  onPriceRangeChange,
  selectedSize,
  onSelectSize,
  inStockOnly,
  onToggleInStockOnly,
  sortBy,
  onSortChange,
  onResetFilters,
  hasActiveFilters,
}) {
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)

  // Dynamically derived filter options directly from products.json - ZERO hardcoding
  const options = useMemo(() => getFilterOptions(), [])

  const departments = useMemo(() => {
    return ['All', ...options.genders.map((g) => g.name)]
  }, [options.genders])

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size']

  const sortOptions = [
    { value: 'recommended', label: 'Recommended' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'newest', label: 'Newest Arrivals' },
  ]

  return (
    <div className="filter-toolbar-section">
      <div className="filter-toolbar-container">
        {/* Top Control Bar */}
        <div className="toolbar-top-row">
          {/* Department Pills */}
          <div className="department-pills-group" role="group" aria-label="Department selection">
            {departments.map((dept) => (
              <button
                key={dept}
                type="button"
                className={`dept-pill-btn ${selectedDepartment === dept ? 'active' : ''}`}
                onClick={() => onSelectDepartment(dept)}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* Results count indicator */}
          <div className="toolbar-results-count">
            <span className="count-number">{totalCount.toLocaleString()}</span>
            <span className="count-label">pieces curated</span>
          </div>

          {/* Sort Dropdown & Refine Toggle */}
          <div className="toolbar-right-controls">
            <div className="sort-select-box">
              <label htmlFor="sort-dropdown" className="sort-label">
                Sort:
              </label>
              <select
                id="sort-dropdown"
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="sort-dropdown-input"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className={`filter-drawer-toggle-btn ${hasActiveFilters ? 'has-active' : ''}`}
              onClick={() => setIsFilterDrawerOpen((prev) => !prev)}
            >
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                <line x1="3" y1="6" x2="17" y2="6" />
                <line x1="6" y1="10" x2="14" y2="10" />
                <line x1="8" y1="14" x2="12" y2="14" />
              </svg>
              <span>{isFilterDrawerOpen ? 'Hide Filters' : 'Refine'}</span>
              {hasActiveFilters && <span className="active-filter-dot" />}
            </button>
          </div>
        </div>

        {/* Collapsible / Expandable Refinement Panel */}
        <div className={`filter-refinement-panel ${isFilterDrawerOpen ? 'is-open' : ''}`}>
          <div className="refinement-grid">
            {/* Sub-Category Filter */}
            <div className="refine-col">
              <h4 className="refine-title">Sub-Category</h4>
              <div className="price-presets-row">
                <button
                  type="button"
                  className={`filter-chip-btn ${!selectedSubCategory ? 'active' : ''}`}
                  onClick={() => onSelectSubCategory('')}
                >
                  All
                </button>
                {options.subCategories.slice(0, 8).map((sc) => {
                  const isMatch = selectedSubCategory.toLowerCase() === sc.name.toLowerCase()
                  return (
                    <button
                      key={sc.name}
                      type="button"
                      className={`filter-chip-btn ${isMatch ? 'active' : ''}`}
                      onClick={() => onSelectSubCategory(isMatch ? '' : sc.name)}
                    >
                      {sc.name}
                      <span className="filter-chip-count">({sc.count})</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Article Type Filter */}
            <div className="refine-col">
              <h4 className="refine-title">Article Type</h4>
              <div className="price-presets-row">
                <button
                  type="button"
                  className={`filter-chip-btn ${!selectedArticleType ? 'active' : ''}`}
                  onClick={() => onSelectArticleType('')}
                >
                  All
                </button>
                {options.articleTypes.slice(0, 8).map((art) => {
                  const isMatch = selectedArticleType.toLowerCase() === art.name.toLowerCase()
                  return (
                    <button
                      key={art.name}
                      type="button"
                      className={`filter-chip-btn ${isMatch ? 'active' : ''}`}
                      onClick={() => onSelectArticleType(isMatch ? '' : art.name)}
                    >
                      {art.name}
                      <span className="filter-chip-count">({art.count})</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Colour Palette */}
            <div className="refine-col">
              <h4 className="refine-title">Palette ({options.colours.length})</h4>
              <div className="color-swatches-row">
                {options.colours.map((c) => {
                  const isSelected = selectedColor.toLowerCase() === c.name.toLowerCase()
                  return (
                    <button
                      key={c.name}
                      type="button"
                      className={`color-swatch-circle ${isSelected ? 'active' : ''}`}
                      style={{ backgroundColor: c.hex }}
                      onClick={() => onSelectColor(isSelected ? '' : c.name)}
                      title={`${c.name} (${c.count})`}
                      aria-label={`Filter by ${c.name} (${c.count})`}
                    />
                  )
                })}
              </div>
            </div>

            {/* Price Range */}
            <div className="refine-col">
              <h4 className="refine-title">Price Range</h4>
              <div className="price-presets-row">
                {[
                  { label: 'All', min: 0, max: 1000 },
                  { label: 'Under $50', min: 0, max: 50 },
                  { label: '$50 - $100', min: 50, max: 100 },
                  { label: '$100 - $200', min: 100, max: 200 },
                  { label: '$200+', min: 200, max: 1000 },
                ].map((p) => {
                  const isMatch = priceRange.min === p.min && priceRange.max === p.max
                  return (
                    <button
                      key={p.label}
                      type="button"
                      className={`filter-chip-btn ${isMatch ? 'active' : ''}`}
                      onClick={() => onPriceRangeChange(p.min, p.max)}
                    >
                      {p.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Season & Usage */}
            <div className="refine-col">
              <h4 className="refine-title">Season & Usage</h4>
              <div className="price-presets-row">
                {options.seasons.map((s) => {
                  const isSelected = selectedSeason.toLowerCase() === s.name.toLowerCase()
                  return (
                    <button
                      key={s.name}
                      type="button"
                      className={`filter-chip-btn ${isSelected ? 'active' : ''}`}
                      onClick={() => onSelectSeason(isSelected ? '' : s.name)}
                    >
                      {s.name}
                    </button>
                  )
                })}
                {options.usages.slice(0, 4).map((u) => {
                  const isSelected = selectedUsage.toLowerCase() === u.name.toLowerCase()
                  return (
                    <button
                      key={u.name}
                      type="button"
                      className={`filter-chip-btn ${isSelected ? 'active' : ''}`}
                      onClick={() => onSelectUsage(isSelected ? '' : u.name)}
                    >
                      {u.name}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Size Filter */}
            <div className="refine-col">
              <h4 className="refine-title">Sizes</h4>
              <div className="size-chips-row">
                <button
                  type="button"
                  className={`size-chip-btn ${!selectedSize ? 'active' : ''}`}
                  onClick={() => onSelectSize('')}
                >
                  All
                </button>
                {sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`size-chip-btn ${selectedSize === s ? 'active' : ''}`}
                    onClick={() => onSelectSize(selectedSize === s ? '' : s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Availability & Clear */}
            <div className="refine-col refine-toggle-col">
              <h4 className="refine-title">Availability</h4>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => onToggleInStockOnly(e.target.checked)}
                  className="custom-checkbox"
                />
                <span>In-Stock Only</span>
              </label>

              {hasActiveFilters && (
                <button
                  type="button"
                  className="clear-all-filters-btn"
                  onClick={onResetFilters}
                >
                  Reset All Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Active Filters Pill Row */}
        {hasActiveFilters && (
          <div className="active-filters-summary-row">
            <span className="active-filters-label">Active Filters:</span>
            {selectedDepartment !== 'All' && (
              <span className="filter-pill-tag">
                Dept: {selectedDepartment}
                <button
                  type="button"
                  onClick={() => onSelectDepartment('All')}
                  aria-label="Remove department filter"
                >
                  ✕
                </button>
              </span>
            )}
            {selectedCategory !== 'All' && (
              <span className="filter-pill-tag">
                Category: {selectedCategory}
                <button
                  type="button"
                  onClick={() => onSelectCategory('All')}
                  aria-label="Remove category filter"
                >
                  ✕
                </button>
              </span>
            )}
            {selectedSubCategory && (
              <span className="filter-pill-tag">
                Sub: {selectedSubCategory}
                <button
                  type="button"
                  onClick={() => onSelectSubCategory('')}
                  aria-label="Remove sub-category filter"
                >
                  ✕
                </button>
              </span>
            )}
            {selectedArticleType && (
              <span className="filter-pill-tag">
                Type: {selectedArticleType}
                <button
                  type="button"
                  onClick={() => onSelectArticleType('')}
                  aria-label="Remove article type filter"
                >
                  ✕
                </button>
              </span>
            )}
            {selectedColor && (
              <span className="filter-pill-tag">
                Color: {selectedColor}
                <button
                  type="button"
                  onClick={() => onSelectColor('')}
                  aria-label="Remove color filter"
                >
                  ✕
                </button>
              </span>
            )}
            {selectedSeason && (
              <span className="filter-pill-tag">
                Season: {selectedSeason}
                <button
                  type="button"
                  onClick={() => onSelectSeason('')}
                  aria-label="Remove season filter"
                >
                  ✕
                </button>
              </span>
            )}
            {selectedUsage && (
              <span className="filter-pill-tag">
                Usage: {selectedUsage}
                <button
                  type="button"
                  onClick={() => onSelectUsage('')}
                  aria-label="Remove usage filter"
                >
                  ✕
                </button>
              </span>
            )}
            {selectedSize && (
              <span className="filter-pill-tag">
                Size: {selectedSize}
                <button
                  type="button"
                  onClick={() => onSelectSize('')}
                  aria-label="Remove size filter"
                >
                  ✕
                </button>
              </span>
            )}
            {(priceRange.min > 0 || priceRange.max < 1000) && (
              <span className="filter-pill-tag">
                ${priceRange.min} – ${priceRange.max}
                <button
                  type="button"
                  onClick={() => onPriceRangeChange(0, 1000)}
                  aria-label="Reset price filter"
                >
                  ✕
                </button>
              </span>
            )}
            {inStockOnly && (
              <span className="filter-pill-tag">
                In-Stock
                <button
                  type="button"
                  onClick={() => onToggleInStockOnly(false)}
                  aria-label="Remove in-stock filter"
                >
                  ✕
                </button>
              </span>
            )}

            <button
              type="button"
              className="clear-all-link"
              onClick={onResetFilters}
            >
              Clear All
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
