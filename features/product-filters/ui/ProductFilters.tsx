"use client"

import React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { X } from "lucide-react"
import { Button } from "@/shared/ui/button/Button"
import styles from "./ProductFilters.module.css"

interface FilterOption {
  id: string
  name: string
}

interface FilterGroup {
  id: string
  name: string
  options: FilterOption[]
}

interface ProductFiltersProps {
  categories: FilterOption[]
  colors: FilterOption[]
  priceRange: {
    min: number
    max: number
    current: {
      min: number
      max: number
    }
  }
  onClose?: () => void
  isDrawer?: boolean
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  colors,
  priceRange,
  onClose,
  isDrawer = false,
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [selectedCategories, setSelectedCategories] = React.useState<string[]>(
    searchParams.get("categories")?.split(",") || [],
  )

  const [selectedColors, setSelectedColors] = React.useState<string[]>(searchParams.get("colors")?.split(",") || [])

  const [priceMin, setPriceMin] = React.useState<number>(Number(searchParams.get("priceMin")) || priceRange.min)

  const [priceMax, setPriceMax] = React.useState<number>(Number(searchParams.get("priceMax")) || priceRange.max)

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId)
      } else {
        return [...prev, categoryId]
      }
    })
  }

  const handleColorChange = (colorId: string) => {
    setSelectedColors((prev) => {
      if (prev.includes(colorId)) {
        return prev.filter((id) => id !== colorId)
      } else {
        return [...prev, colorId]
      }
    })
  }

  const handlePriceMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value)
    setPriceMin(value > priceRange.max ? priceRange.max : value)
  }

  const handlePriceMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value)
    setPriceMax(value < priceMin ? priceMin : value)
  }

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString())

    if (selectedCategories.length > 0) {
      params.set("categories", selectedCategories.join(","))
    } else {
      params.delete("categories")
    }

    if (selectedColors.length > 0) {
      params.set("colors", selectedColors.join(","))
    } else {
      params.delete("colors")
    }

    if (priceMin !== priceRange.min) {
      params.set("priceMin", priceMin.toString())
    } else {
      params.delete("priceMin")
    }

    if (priceMax !== priceRange.max) {
      params.set("priceMax", priceMax.toString())
    } else {
      params.delete("priceMax")
    }

    router.push(`/catalog?${params.toString()}`)

    if (onClose) {
      onClose()
    }
  }

  const resetFilters = () => {
    setSelectedCategories([])
    setSelectedColors([])
    setPriceMin(priceRange.min)
    setPriceMax(priceRange.max)

    router.push("/catalog")

    if (onClose) {
      onClose()
    }
  }

  return (
    <div className={`${styles.filters} ${isDrawer ? styles.filtersDrawer : ""}`}>
      {isDrawer && (
        <div className={styles.drawerHeader}>
          <h3 className={styles.drawerTitle}>Фильтры</h3>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>
      )}

      <div className={styles.filterGroup}>
        <h3 className={styles.filterTitle}>Цена</h3>
        <div className={styles.priceInputs}>
          <input
            type="number"
            value={priceMin}
            onChange={handlePriceMinChange}
            min={priceRange.min}
            max={priceMax}
            className={styles.priceInput}
          />
          <span className={styles.priceDivider}>—</span>
          <input
            type="number"
            value={priceMax}
            onChange={handlePriceMaxChange}
            min={priceMin}
            max={priceRange.max}
            className={styles.priceInput}
          />
        </div>
        <div className={styles.priceSlider}>
          <input
            type="range"
            min={priceRange.min}
            max={priceRange.max}
            value={priceMin}
            onChange={handlePriceMinChange}
            className={styles.rangeSlider}
          />
          <input
            type="range"
            min={priceRange.min}
            max={priceRange.max}
            value={priceMax}
            onChange={handlePriceMaxChange}
            className={styles.rangeSlider}
          />
        </div>
      </div>

      <div className={styles.filterGroup}>
        <h3 className={styles.filterTitle}>Категории</h3>
        <div className={styles.checkboxGroup}>
          {categories.map((category) => (
            <label key={category.id} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={selectedCategories.includes(category.id)}
                onChange={() => handleCategoryChange(category.id)}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>{category.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={styles.filterGroup}>
        <h3 className={styles.filterTitle}>Цвет</h3>
        <div className={styles.colorOptions}>
          {colors.map((color) => (
            <button
              key={color.id}
              className={`${styles.colorOption} ${selectedColors.includes(color.id) ? styles.colorOptionSelected : ""}`}
              style={{ backgroundColor: color.id }}
              onClick={() => handleColorChange(color.id)}
              title={color.name}
            />
          ))}
        </div>
      </div>

      <div className={styles.filterActions}>
        <Button onClick={applyFilters} className={styles.applyButton}>
          Применить
        </Button>
        <button onClick={resetFilters} className={styles.resetButton}>
          Сбросить
        </button>
      </div>
    </div>
  )
}
