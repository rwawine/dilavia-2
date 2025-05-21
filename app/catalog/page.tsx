"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import ProductCard from "@/entities/product/ui/ProductCard"
import Button from "@/shared/ui/button/Button"
import Input from "@/shared/ui/input/Input"
import { getProductsByFilters, getPriceRange, getSortedProducts, getAvailableFilters } from "@/shared/api/api"
import type { ProductData } from "@/shared/api/types"
import styles from "./page.module.css"

export default function CatalogPage() {
  const searchParams = useSearchParams()

  // Get initial filter values from URL
  const initialCategory = searchParams.get("category") ? searchParams.get("category")!.split(",") : ["all"]
  const initialMinPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined
  const initialMaxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined
  const initialColors = searchParams.get("colors") ? searchParams.get("colors")!.split(",") : []
  const initialSortBy = searchParams.get("sort") || "popularity"

  // State for products and filters
  const [products, setProducts] = useState<ProductData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategories, setActiveCategories] = useState<string[]>(initialCategory)
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 10000 })
  const [minPrice, setMinPrice] = useState<number | undefined>(initialMinPrice)
  const [maxPrice, setMaxPrice] = useState<number | undefined>(initialMaxPrice)
  const [activeColors, setActiveColors] = useState<string[]>(initialColors)
  const [sortBy, setSortBy] = useState(initialSortBy)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  // Available filter options
  const [availableColors, setAvailableColors] = useState<string[]>([])
  const [availableCategories, setAvailableCategories] = useState<{ id: string; name: string }[]>([
    { id: "all", name: "Все" },
    { id: "sofa", name: "Диваны" },
    { id: "bed", name: "Кровати" },
    { id: "armchair", name: "Кресла" },
    { id: "kids", name: "Детские кровати" },
  ])

  // Pending filter states
  const [pendingCategories, setPendingCategories] = useState<string[]>(initialCategory)
  const [pendingMinPrice, setPendingMinPrice] = useState<number | undefined>(initialMinPrice)
  const [pendingMaxPrice, setPendingMaxPrice] = useState<number | undefined>(initialMaxPrice)
  const [pendingColors, setPendingColors] = useState<string[]>(initialColors)
  const [filtersChanged, setFiltersChanged] = useState(false)
  const [filteredCount, setFilteredCount] = useState<number | null>(null)

  const filterDrawerRef = useRef<HTMLDivElement>(null)
  const filterOverlayRef = useRef<HTMLDivElement>(null)

  // Load available filter options
  useEffect(() => {
    async function loadFilterOptions() {
      try {
        const filterOptions = await getAvailableFilters()
        setAvailableColors(filterOptions.colors)
        console.log("Loaded filter options:", filterOptions)
      } catch (error) {
        console.error("Failed to load filter options:", error)
      }
    }

    loadFilterOptions()
  }, [])

  // Load products and filter options
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        // Get price range
        const range = await getPriceRange().catch((error) => {
          console.error("Failed to get price range:", error)
          return { min: 0, max: 10000 } // Fallback values
        })

        setPriceRange(range)

        // Set default price range if not specified in URL
        if (minPrice === undefined) setMinPrice(range.min)
        if (maxPrice === undefined) setMaxPrice(range.max)

        // Set pending values if not already set
        if (pendingMinPrice === undefined) setPendingMinPrice(range.min)
        if (pendingMaxPrice === undefined) setPendingMaxPrice(range.max)

        // Prepare category filter
        const categoryFilter = activeCategories.includes("all") ? "all" : activeCategories.join(",")

        // Load products with filters
        let filteredProducts = await getProductsByFilters({
          category: categoryFilter,
          minPrice: minPrice || range.min,
          maxPrice: maxPrice || range.max,
          colors: activeColors.length > 0 ? activeColors : undefined,
        }).catch((error) => {
          console.error("Failed to get filtered products:", error)
          return [] // Return empty array on error
        })

        // Sort products
        filteredProducts = await getSortedProducts(filteredProducts, sortBy)

        setProducts(filteredProducts)
      } catch (error) {
        console.error("Error loading catalog data:", error)
        setProducts([]) // Set empty products array on error
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [activeCategories, minPrice, maxPrice, activeColors, sortBy])

  // Update URL with filters without navigating away
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    // Update or remove category parameter
    if (!activeCategories.includes("all")) {
      params.set("category", activeCategories.join(","))
    } else {
      params.delete("category")
    }

    // Update or remove price parameters
    if (minPrice !== undefined && minPrice !== priceRange.min) {
      params.set("minPrice", minPrice.toString())
    } else {
      params.delete("minPrice")
    }

    if (maxPrice !== undefined && maxPrice !== priceRange.max) {
      params.set("maxPrice", maxPrice.toString())
    } else {
      params.delete("maxPrice")
    }

    // Update or remove color parameter
    if (activeColors.length > 0) {
      params.set("colors", activeColors.join(","))
    } else {
      params.delete("colors")
    }

    // Update or remove sort parameter
    if (sortBy !== "popularity") {
      params.set("sort", sortBy)
    } else {
      params.delete("sort")
    }

    // Update URL without refreshing the page using history API
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname
    window.history.replaceState({}, "", newUrl)
  }, [activeCategories, minPrice, maxPrice, activeColors, priceRange, sortBy])

  // Close drawer when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isFiltersOpen &&
        filterDrawerRef.current &&
        filterOverlayRef.current &&
        event.target === filterOverlayRef.current
      ) {
        setIsFiltersOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isFiltersOpen])

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isFiltersOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [isFiltersOpen])

  // Check filtered count when pending filters change
  useEffect(() => {
    if (filtersChanged) {
      checkFilteredCount()
    } else {
      setFilteredCount(null)
    }
  }, [pendingCategories, pendingMinPrice, pendingMaxPrice, pendingColors, filtersChanged])

  // Check filtered count
  const checkFilteredCount = async () => {
    try {
      const categoryFilter = pendingCategories.includes("all") ? "all" : pendingCategories.join(",")

      const filteredProducts = await getProductsByFilters({
        category: categoryFilter,
        minPrice: pendingMinPrice,
        maxPrice: pendingMaxPrice,
        colors: pendingColors.length > 0 ? pendingColors : undefined,
      })

      setFilteredCount(filteredProducts.length)
    } catch (error) {
      console.error("Error checking filtered count:", error)
      setFilteredCount(null)
    }
  }

  // Handle category change
  const handleCategoryChange = (category: string) => {
    let newCategories: string[]

    if (category === "all") {
      // If "all" is selected, clear other selections
      newCategories = ["all"]
    } else {
      // If a specific category is selected
      if (pendingCategories.includes(category)) {
        // If already selected, remove it
        newCategories = pendingCategories.filter((c) => c !== category)
        // If no categories left, select "all"
        if (newCategories.length === 0 || (newCategories.length === 1 && newCategories[0] === "all")) {
          newCategories = ["all"]
        } else {
          // Remove "all" if it's in the selection
          newCategories = newCategories.filter((c) => c !== "all")
        }
      } else {
        // If not selected, add it and remove "all"
        newCategories = [...pendingCategories.filter((c) => c !== "all"), category]
      }
    }

    setPendingCategories(newCategories)
    setFiltersChanged(true)
  }

  // Handle color change
  const handleColorChange = (color: string, checked: boolean) => {
    if (checked) {
      setPendingColors([...pendingColors, color])
    } else {
      setPendingColors(pendingColors.filter((c) => c !== color))
    }
    setFiltersChanged(true)
  }

  // Handle price changes
  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? Number(e.target.value) : undefined
    setPendingMinPrice(value)
    setFiltersChanged(true)
  }

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? Number(e.target.value) : undefined
    setPendingMaxPrice(value)
    setFiltersChanged(true)
  }

  // Apply filters
  const applyFilters = () => {
    setActiveCategories(pendingCategories)
    setMinPrice(pendingMinPrice)
    setMaxPrice(pendingMaxPrice)
    setActiveColors(pendingColors)
    setFiltersChanged(false)
    setIsFiltersOpen(false)
  }

  // Handle sort change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value)
  }

  // Reset filters
  const handleResetFilters = () => {
    setPendingCategories(["all"])
    setPendingMinPrice(priceRange.min)
    setPendingMaxPrice(priceRange.max)
    setPendingColors([])
    setFiltersChanged(true)
  }

  // Toggle filters drawer
  const toggleFilters = () => {
    setIsFiltersOpen(!isFiltersOpen)

    // Sync pending state with current state when opening
    if (!isFiltersOpen) {
      setPendingCategories(activeCategories)
      setPendingMinPrice(minPrice)
      setPendingMaxPrice(maxPrice)
      setPendingColors(activeColors)
      setFiltersChanged(false)
    }
  }

  return (
    <div className="container">
      <div className={styles.catalogHeader}>
        <h1 className={styles.title}>Каталог мебели</h1>
        <div className={styles.headerActions}>
          <button className={styles.filterToggle} onClick={toggleFilters}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M3 6H21M10 12H21M17 18H21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Фильтры
          </button>
          <div className={styles.sortContainer}>
            <label htmlFor="sort-select" className={styles.sortLabel}>
              Сортировать:
            </label>
            <select id="sort-select" className={styles.sortSelect} value={sortBy} onChange={handleSortChange}>
              <option value="popularity">По популярности</option>
              <option value="price-asc">По возрастанию цены</option>
              <option value="price-desc">По убыванию цены</option>
              <option value="name-asc">По названию (А-Я)</option>
              <option value="name-desc">По названию (Я-А)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filter Drawer Overlay */}
      <div
        ref={filterOverlayRef}
        className={`${styles.filterOverlay} ${isFiltersOpen ? styles.active : ""}`}
        onClick={() => setIsFiltersOpen(false)}
      ></div>

      {/* Filter Drawer */}
      <div ref={filterDrawerRef} className={`${styles.filterDrawer} ${isFiltersOpen ? styles.active : ""}`}>
        <div className={styles.filterDrawerHeader}>
          <h2 className={styles.filterDrawerTitle}>Фильтры</h2>
          <button
            className={styles.closeFilterButton}
            onClick={() => setIsFiltersOpen(false)}
            aria-label="Закрыть фильтры"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className={styles.filterDrawerContent}>
          {/* Categories Filter */}
          <div className={styles.filterSection}>
            <h3 className={styles.filterTitle}>Категории</h3>
            <div className={styles.categoryButtons}>
              {availableCategories.map((category) => (
                <button
                  key={category.id}
                  className={`${styles.categoryButton} ${pendingCategories.includes(category.id) ? styles.active : ""}`}
                  onClick={() => handleCategoryChange(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div className={styles.filterSection}>
            <h3 className={styles.filterTitle}>Цена</h3>
            <div className={styles.priceInputs}>
              <Input
                type="number"
                placeholder="От"
                className={styles.priceInput}
                value={pendingMinPrice?.toString() || ""}
                onChange={handleMinPriceChange}
                min={priceRange.min}
                max={pendingMaxPrice || priceRange.max}
              />
              <span className={styles.priceDivider}>-</span>
              <Input
                type="number"
                placeholder="До"
                className={styles.priceInput}
                value={pendingMaxPrice?.toString() || ""}
                onChange={handleMaxPriceChange}
                min={pendingMinPrice || priceRange.min}
                max={priceRange.max}
              />
            </div>
          </div>

          {/* Colors Filter */}
          {availableColors.length > 0 && (
            <div className={styles.filterSection}>
              <h3 className={styles.filterTitle}>Цвет</h3>
              <div className={styles.colorOptions}>
                {availableColors.map((color) => (
                  <label key={color} className={styles.colorOption}>
                    <input
                      type="checkbox"
                      checked={pendingColors.includes(color)}
                      onChange={(e) => handleColorChange(color, e.target.checked)}
                      className={styles.colorCheckbox}
                    />
                    <span className={styles.colorSwatch} style={{ backgroundColor: color.toLowerCase() }}></span>
                    <span className={styles.colorName}>{color}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Filter Actions */}
          <div className={styles.filterActions}>
            <Button variant="outline" size="sm" onClick={handleResetFilters} className={styles.resetButton}>
              Сбросить фильтры
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={applyFilters}
              className={styles.applyButton}
              disabled={!filtersChanged}
            >
              Применить {filteredCount !== null ? `(${filteredCount})` : ""}
            </Button>
          </div>
        </div>
      </div>

      <div className={styles.catalogLayout}>
        <div className={styles.productsSection}>
          <div className={styles.resultsInfo}>
            {!loading && <span className={styles.resultsCount}>Найдено товаров: {products.length}</span>}
          </div>

          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Загрузка товаров...</p>
            </div>
          ) : products.length > 0 ? (
            <div className={styles.productGrid}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} showOptions={true} />
              ))}
            </div>
          ) : (
            <div className={styles.noProducts}>
              <p>По вашему запросу ничего не найдено.</p>
              <p>Попробуйте изменить параметры фильтрации.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
