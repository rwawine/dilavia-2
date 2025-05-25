"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import ProductCard from "@/entities/product/ui/ProductCard"
import Button from "@/shared/ui/button/Button"
import Input from "@/shared/ui/input/Input"
import { getProductsByFilters, getPriceRange, getSortedProducts, getAvailableFilters } from "@/shared/api/api"
import type { ProductData } from "@/shared/api/types"
import styles from "./page.module.css"

const PAGE_SIZE = 16

export default function CatalogPage() {
  const searchParams = useSearchParams()

  // Get initial filter values from URL
  const initialCategory = searchParams.get("category") ? searchParams.get("category")!.split(",") : ["all"]
  const initialMinPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined
  const initialMaxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined
  const initialColors = searchParams.get("colors") ? searchParams.get("colors")!.split(",") : []
  const initialSortBy = searchParams.get("sort") || "popularity"
  const initialSofaTypes = searchParams.get("sofaTypes") ? searchParams.get("sofaTypes")!.split(",") : []
  const initialSelectedSofaType = searchParams.get("selectedSofaType")

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

  // Add new state for dynamic filters
  const [dynamicFilters, setDynamicFilters] = useState<{
    subcategories?: string[];
  }>({
    subcategories: initialSelectedSofaType ? [initialSelectedSofaType] : initialSofaTypes
  });

  // Add new state for pending dynamic filters
  const [pendingDynamicFilters, setPendingDynamicFilters] = useState<{
    subcategories?: string[];
  }>({
    subcategories: initialSelectedSofaType ? [initialSelectedSofaType] : initialSofaTypes
  });

  // Add new state for available dynamic filter options
  const [availableDynamicFilters, setAvailableDynamicFilters] = useState<{
    subcategories?: string[];
  }>({
    subcategories: []
  });

  const filterDrawerRef = useRef<HTMLDivElement>(null)
  const filterOverlayRef = useRef<HTMLDivElement>(null)

  // --- Infinite scroll state ---
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const loaderRef = useRef<HTMLDivElement | null>(null)

  // Effect to handle URL parameter changes
  useEffect(() => {
    const category = searchParams.get("category")
    if (category) {
      const newCategories = category.split(",")
      setActiveCategories(newCategories)
      setPendingCategories(newCategories)
    } else {
      setActiveCategories(["all"])
      setPendingCategories(["all"])
    }
  }, [searchParams])

  // Load products based on active filters
  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      // Prepare category filter
      const categoryFilter = activeCategories.includes("all") ? "all" : activeCategories.join(",")

      // Load products with filters
      let filteredProducts = await getProductsByFilters({
        category: categoryFilter,
        minPrice: minPrice || priceRange.min,
        maxPrice: maxPrice || priceRange.max,
        colors: activeColors.length > 0 ? activeColors : undefined,
      }).catch((error) => {
        console.error("Failed to get filtered products:", error)
        return [] // Return empty array on error
      })

      // Apply sofa subcategory filters only to sofas
      if (activeCategories.includes('sofa') && dynamicFilters.subcategories?.length) {
        filteredProducts = filteredProducts.filter(product => {
          // If it's a sofa, apply subcategory filter
          if (product.category === 'sofa') {
            return 'subcategory-ru' in product && 
              dynamicFilters.subcategories?.includes((product as any)['subcategory-ru']);
          }
          // For other categories, keep the product
          return true;
        });
      }

      // Sort products
      filteredProducts = await getSortedProducts(filteredProducts, sortBy)

      // Update available filters after getting products
      const newAvailableFilters = analyzeProductsForFilters(filteredProducts);
      setAvailableDynamicFilters(newAvailableFilters);

      // Keep the current selection if it's still valid
      if (dynamicFilters.subcategories?.length) {
        const validSelections = dynamicFilters.subcategories.filter(selection => 
          newAvailableFilters.subcategories?.includes(selection)
        );
        if (validSelections.length > 0) {
          setDynamicFilters(prev => ({
            ...prev,
            subcategories: validSelections
          }));
        }
      }

      setProducts(filteredProducts)
    } catch (error) {
      console.error("Error loading catalog data:", error)
      setProducts([]) // Set empty products array on error
    } finally {
      setLoading(false)
    }
  }, [activeCategories, minPrice, maxPrice, activeColors, sortBy, dynamicFilters.subcategories, priceRange.min, priceRange.max]);

  // Initial load of price range
  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      try {
        const range = await getPriceRange().catch((error) => {
          console.error("Failed to get price range:", error)
          return { min: 0, max: 10000 }
        })

        if (!isMounted) return;

        setPriceRange(range)

        // Set default price range if not specified in URL
        if (minPrice === undefined) setMinPrice(range.min)
        if (maxPrice === undefined) setMaxPrice(range.max)

        // Set pending values if not already set
        if (pendingMinPrice === undefined) setPendingMinPrice(range.min)
        if (pendingMaxPrice === undefined) setPendingMaxPrice(range.max)
      } catch (error) {
        console.error("Error loading price range:", error)
      }
    }

    loadInitialData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Load products when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadProducts();
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [
    activeCategories.join(','),
    minPrice,
    maxPrice,
    activeColors.join(','),
    sortBy,
    dynamicFilters.subcategories?.join(',')
  ]);

  // Load available filter options
  useEffect(() => {
    let isMounted = true;

    async function loadFilterOptions() {
      try {
        const filterOptions = await getAvailableFilters()
        if (isMounted) {
          setAvailableColors(filterOptions.colors)
        }
      } catch (error) {
        console.error("Failed to load filter options:", error)
      }
    }

    loadFilterOptions();
    return () => {
      isMounted = false;
    };
  }, []);

  // Function to analyze products and extract unique filter values
  const analyzeProductsForFilters = (products: ProductData[]) => {
    const filters = {
      subcategories: new Set<string>(),
    };

    // Only analyze sofa products for subcategories
    products.forEach(product => {
      if (product.category === 'sofa' && 'subcategory-ru' in product) {
        filters.subcategories.add((product as any)['subcategory-ru']);
      }
    });

    return {
      subcategories: Array.from(filters.subcategories),
    };
  };

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

    // Always keep all available sofa types in the URL
    if (availableDynamicFilters.subcategories?.length) {
      params.set("sofaTypes", availableDynamicFilters.subcategories.join(","))
    } else {
      params.delete("sofaTypes")
    }

    // Update or remove selected sofa type parameter
    if (dynamicFilters.subcategories?.length === 1) {
      params.set("selectedSofaType", dynamicFilters.subcategories[0])
    } else {
      params.delete("selectedSofaType")
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
  }, [activeCategories, minPrice, maxPrice, activeColors, priceRange, sortBy, dynamicFilters, availableDynamicFilters])

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
        // Reset pending filters to active filters when closing without applying
        setPendingCategories(activeCategories)
        setPendingMinPrice(minPrice)
        setPendingMaxPrice(maxPrice)
        setPendingColors(activeColors)
        setPendingDynamicFilters(dynamicFilters)
        setFiltersChanged(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isFiltersOpen, activeCategories, minPrice, maxPrice, activeColors, dynamicFilters])

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
  }, [pendingCategories, pendingMinPrice, pendingMaxPrice, pendingColors, pendingDynamicFilters, filtersChanged])

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

      // Apply sofa subcategory filters only to sofas
      let finalProducts = filteredProducts;
      if (pendingCategories.includes('sofa') && pendingDynamicFilters.subcategories?.length) {
        finalProducts = filteredProducts.filter(product => {
          // If it's a sofa, apply subcategory filter
          if (product.category === 'sofa') {
            return 'subcategory-ru' in product && 
              pendingDynamicFilters.subcategories?.includes((product as any)['subcategory-ru']);
          }
          // For other categories, keep the product
          return true;
        });
      }

      setFilteredCount(finalProducts.length)
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
      // Clear sofa type filters when selecting "all"
      setPendingDynamicFilters({})
    } else {
      // If a specific category is selected
      if (pendingCategories.includes(category)) {
        // If already selected, remove it
        newCategories = pendingCategories.filter((c) => c !== category)
        // If no categories left, select "all"
        if (newCategories.length === 0 || (newCategories.length === 1 && newCategories[0] === "all")) {
          newCategories = ["all"]
          // Clear sofa type filters when selecting "all"
          setPendingDynamicFilters({})
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

  // Handle dynamic filter change
  const handleDynamicFilterChange = (filterType: string, value: string, checked: boolean) => {
    setPendingDynamicFilters(prev => {
      const currentValues = prev[filterType as keyof typeof prev] || [];
      const newValues = checked 
        ? [...currentValues, value]
        : currentValues.filter(v => v !== value);
      
      return {
        ...prev,
        [filterType]: newValues
      };
    });
    setFiltersChanged(true);
  };

  // Apply filters
  const applyFilters = () => {
    setActiveCategories([...pendingCategories])
    setMinPrice(pendingMinPrice)
    setMaxPrice(pendingMaxPrice)
    setActiveColors([...pendingColors])
    setDynamicFilters({...pendingDynamicFilters})
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
    setPendingDynamicFilters(dynamicFilters)
    setFiltersChanged(true)
  }

  // Toggle filters drawer
  const toggleFilters = () => {
    setIsFiltersOpen(!isFiltersOpen)
  }

  // Сброс visibleCount при смене фильтров/сортировки
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [activeCategories, minPrice, maxPrice, activeColors, sortBy, dynamicFilters])

  // Intersection Observer для подгрузки
  useEffect(() => {
    if (!loaderRef.current) return
    if (products.length <= visibleCount) return
    let observer: IntersectionObserver | null = null
    observer = new window.IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setIsFetchingMore(true)
        setTimeout(() => {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, products.length))
          setIsFetchingMore(false)
        }, 400) // имитация задержки
      }
    }, { threshold: 1 })
    observer.observe(loaderRef.current)
    return () => {
      if (observer && loaderRef.current) observer.unobserve(loaderRef.current)
    }
  }, [products.length, visibleCount])

  // Always keep all sofa types for filters
  useEffect(() => {
    async function loadAllSofaTypes() {
      if (!activeCategories.includes('sofa')) return;
      try {
        // Получаем все товары-диваны
        const allSofas = await getProductsByFilters({ category: 'sofa' });
        // Собираем все уникальные типы диванов
        const allTypes = Array.from(new Set(
          allSofas
            .filter(p => 'subcategory-ru' in p)
            .map(p => (p as any)['subcategory-ru'])
            .filter(Boolean)
        ));
        setAvailableDynamicFilters(prev => ({ ...prev, subcategories: allTypes }));
      } catch (e) {
        // fallback: не меняем фильтры
      }
    }
    loadAllSofaTypes();
  }, [activeCategories]);

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
            onClick={() => {
              setIsFiltersOpen(false)
              // Reset pending filters to active filters when closing without applying
              setPendingCategories(activeCategories)
              setPendingMinPrice(minPrice)
              setPendingMaxPrice(maxPrice)
              setPendingColors(activeColors)
              setPendingDynamicFilters(dynamicFilters)
              setFiltersChanged(false)
            }}
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

          {/* Dynamic Filters */}
          {Object.entries(availableDynamicFilters).map(([filterType, values]) => {
            // Skip if no values or if it's sofa filters and sofa category is not selected
            if (values.length === 0) return null;
            if (filterType === 'subcategories' && !pendingCategories.includes('sofa')) return null;
            
            return (
              <div key={filterType} className={styles.filterSection}>
                <h3 className={styles.filterTitle}>
                  {filterType === 'subcategories' ? 'Тип дивана' : filterType}
                </h3>
                <div className={styles.dynamicFilterOptions}>
                  {values.map(value => (
                    <label key={value} className={styles.dynamicFilterOption}>
                      <input
                        type="checkbox"
                        checked={pendingDynamicFilters[filterType as keyof typeof pendingDynamicFilters]?.includes(value)}
                        onChange={(e) => handleDynamicFilterChange(filterType, value, e.target.checked)}
                        className={styles.dynamicFilterCheckbox}
                      />
                      <span className={styles.dynamicFilterName}>{value}</span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Filter Actions */}
          <div className={styles.filterActions}>
            <Button
              variant="primary"
              size="md"
              onClick={applyFilters}
              className={styles.applyButton}
              disabled={!filtersChanged}
            >
              Применить {filteredCount !== null ? `(${filteredCount})` : ""}
            </Button>
            <Button variant="outline" size="md" onClick={handleResetFilters} className={styles.resetButton}>
              Сбросить фильтры
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
            <>
              <div className={styles.productGrid}>
                {products.slice(0, visibleCount).map((product) => (
                  <ProductCard key={product.id} product={product} showOptions={true} />
                ))}
              </div>
              {/* Лоадер и ref для подгрузки */}
              {visibleCount < products.length && (
                <div ref={loaderRef} style={{ minHeight: 40, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {isFetchingMore && <div className={styles.spinner} />}
                </div>
              )}
            </>
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
