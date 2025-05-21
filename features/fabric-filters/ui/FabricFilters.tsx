"use client"

import React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { X } from "lucide-react"
import { Button } from "@/shared/ui/button/Button"
import { useFilterTypes } from "../model/useFilterTypes"
import styles from "./FabricFilters.module.css"

interface FilterOption {
  id: string
  name: string
}

interface FabricFiltersProps {
  colors: FilterOption[]
  patterns: FilterOption[]
  fabrics: any[] // Добавляем проп для данных тканей
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

export const FabricFilters: React.FC<FabricFiltersProps> = ({
  colors,
  patterns,
  fabrics,
  priceRange,
  onClose,
  isDrawer = false,
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const filterTypes = useFilterTypes(fabrics) // Используем хук для получения типов фильтров

  const [selectedColors, setSelectedColors] = React.useState<string[]>(searchParams.get("colors")?.split(",") || [])

  const [selectedPatterns, setSelectedPatterns] = React.useState<string[]>(
    searchParams.get("patterns")?.split(",") || [],
  )

  const [selectedFilterTypes, setSelectedFilterTypes] = React.useState<string[]>(
    searchParams.get("filterTypes")?.split(",") || [],
  )

  const [priceMin, setPriceMin] = React.useState<number>(Number(searchParams.get("priceMin")) || priceRange.min)

  const [priceMax, setPriceMax] = React.useState<number>(Number(searchParams.get("priceMax")) || priceRange.max)

  const handleColorChange = (colorId: string) => {
    setSelectedColors((prev) => {
      if (prev.includes(colorId)) {
        return prev.filter((id) => id !== colorId)
      } else {
        return [...prev, colorId]
      }
    })
  }

  const handlePatternChange = (patternId: string) => {
    setSelectedPatterns((prev) => {
      if (prev.includes(patternId)) {
        return prev.filter((id) => id !== patternId)
      } else {
        return [...prev, patternId]
      }
    })
  }

  const handleFilterTypeChange = (filterTypeId: string) => {
    setSelectedFilterTypes((prev) => {
      if (prev.includes(filterTypeId)) {
        return prev.filter((id) => id !== filterTypeId)
      } else {
        return [...prev, filterTypeId]
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

    if (selectedColors.length > 0) {
      params.set("colors", selectedColors.join(","))
    } else {
      params.delete("colors")
    }

    if (selectedPatterns.length > 0) {
      params.set("patterns", selectedPatterns.join(","))
    } else {
      params.delete("patterns")
    }

    if (selectedFilterTypes.length > 0) {
      params.set("filterTypes", selectedFilterTypes.join(","))
    } else {
      params.delete("filterTypes")
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

    // Сохраняем текущий путь и добавляем параметры
    const pathname = window.location.pathname
    router.push(`${pathname}?${params.toString()}`)

    if (onClose) {
      onClose()
    }
  }

  const resetFilters = () => {
    setSelectedColors([])
    setSelectedPatterns([])
    setSelectedFilterTypes([])
    setPriceMin(priceRange.min)
    setPriceMax(priceRange.max)

    // Сохраняем текущий путь без параметров
    const pathname = window.location.pathname
    router.push(pathname)

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

      <div className={styles.filterGroup}>
        <h3 className={styles.filterTitle}>Узор</h3>
        <div className={styles.checkboxGroup}>
          {patterns.map((pattern) => (
            <label key={pattern.id} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={selectedPatterns.includes(pattern.id)}
                onChange={() => handlePatternChange(pattern.id)}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>{pattern.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={styles.filterGroup}>
        <h3 className={styles.filterTitle}>Тип ткани</h3>
        <div className={styles.checkboxGroup}>
          {filterTypes.map((filterType) => (
            <label key={filterType.id} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={selectedFilterTypes.includes(filterType.id)}
                onChange={() => handleFilterTypeChange(filterType.id)}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>{filterType.name}</span>
            </label>
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
