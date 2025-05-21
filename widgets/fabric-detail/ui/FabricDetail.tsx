"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, ShoppingCart, ZoomIn, Check, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFabricCart } from "@/entities/fabric-cart/model/fabricCartContext"
import { useFabricFavorites } from "@/entities/fabric-favorites/model/fabricFavoritesContext"
import type { FabricCategory, FabricCollection, FabricVariant } from "@/shared/api/types"
import FabricCollectionCard from "@/entities/fabric/ui/FabricCollectionCard"
import styles from "./FabricDetail.module.css"

interface FabricDetailProps {
  category: FabricCategory
  collection: FabricCollection
  similarCollections: FabricCollection[]
  categoryId: string
}

export default function FabricDetail({ category, collection, similarCollections, categoryId }: FabricDetailProps) {
  const { state: cartState, dispatch: cartDispatch } = useFabricCart()
  const { state: favoritesState, dispatch: favoritesDispatch } = useFabricFavorites()

  // State for selected variant
  const [selectedVariant, setSelectedVariant] = useState<FabricVariant | null>(
    collection.variants && collection.variants.length > 0 ? collection.variants[0] : null,
  )

  // State for zoom functionality
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 })
  const [zoomLevel, setZoomLevel] = useState(2.5)
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const [showSuccessMessage, setShowSuccessMessage] = useState<string | null>(null)

  // State for showing all color variants
  const [showAllVariants, setShowAllVariants] = useState(false)
  const MAX_VISIBLE_VARIANTS = 12

  // Get visible variants based on showAllVariants state
  const visibleVariants =
    collection.variants && collection.variants.length > 0
      ? showAllVariants || collection.variants.length <= MAX_VISIBLE_VARIANTS
        ? collection.variants
        : collection.variants.slice(0, MAX_VISIBLE_VARIANTS)
      : []

  // Calculate how many variants are hidden
  const hiddenVariantsCount = collection.variants ? Math.max(0, collection.variants.length - MAX_VISIBLE_VARIANTS) : 0

  // Generate a unique ID for the current variant
  const getVariantId = (variant: FabricVariant) => `${categoryId}-${collection.name}-${variant.id}`

  // Check if variant is in cart/favorites
  const isVariantInCart = selectedVariant
    ? cartState.items.some((item) => item.id === getVariantId(selectedVariant))
    : false

  const isVariantInFavorites = selectedVariant
    ? favoritesState.items.some((item) => item.id === getVariantId(selectedVariant))
    : false

  // Handle mouse move for zoom effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed || !imageContainerRef.current) return

    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect()
    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100

    setZoomPosition({ x, y })
  }

  // Handle mouse leave for zoom container
  const handleMouseLeave = () => {
    if (isZoomed) {
      setIsZoomed(false)
    }
  }

  // Toggle zoom state
  const toggleZoom = () => {
    setIsZoomed(!isZoomed)
  }

  // Handle adding to cart
  const handleAddToCart = () => {
    if (!selectedVariant) return

    if (!isVariantInCart) {
      cartDispatch({
        type: "ADD_TO_CART",
        payload: {
          id: getVariantId(selectedVariant),
          categoryName: categoryId,
          categoryNameRu: category.name_ru,
          collectionName: collection.name,
          collectionNameRu: collection.name_ru,
          variant: selectedVariant,
          quantity: 1,
        },
      })

      // Show success message
      setShowSuccessMessage("Ткань добавлена в корзину")
      setTimeout(() => setShowSuccessMessage(null), 3000)
    } else {
      // Redirect to cart page when already in cart
      window.location.href = "/cart"
    }
  }

  // Handle toggling favorites
  const handleToggleFavorite = () => {
    if (!selectedVariant) return

    if (!isVariantInFavorites) {
      favoritesDispatch({
        type: "ADD_TO_FAVORITES",
        payload: {
          id: getVariantId(selectedVariant),
          categoryName: categoryId,
          categoryNameRu: category.name_ru,
          collectionName: collection.name,
          collectionNameRu: collection.name_ru,
          variant: selectedVariant,
        },
      })

      // Show success message
      setShowSuccessMessage("Ткань добавлена в избранное")
      setTimeout(() => setShowSuccessMessage(null), 3000)
    } else {
      favoritesDispatch({
        type: "REMOVE_FROM_FAVORITES",
        payload: getVariantId(selectedVariant),
      })
    }
  }

  // Get placeholder image if no variant is selected
  const selectedImage =
    selectedVariant?.image || `/placeholder.svg?height=600&width=600&query=${collection.name_ru}%20fabric`

  // Clear success message when changing variants
  useEffect(() => {
    setShowSuccessMessage(null)
  }, [selectedVariant])

  return (
    <div className={styles.container}>
      {/* Back button */}
      <Link href={`/fabrics/${categoryId}`} className={styles.backButton}>
        <ArrowLeft size={16} />
        <span>Назад к коллекциям</span>
      </Link>

      <div className={styles.fabricDetailGrid}>
        {/* Left column - Images */}
        <div className={styles.imageSection}>
          <div
            ref={imageContainerRef}
            className={`${styles.mainImageContainer} ${isZoomed ? styles.zoomed : ""}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={toggleZoom}
            style={
              isZoomed
                ? ({
                    "--zoom-x": `${zoomPosition.x}%`,
                    "--zoom-y": `${zoomPosition.y}%`,
                    "--zoom-level": zoomLevel,
                  } as React.CSSProperties)
                : undefined
            }
          >
            <Image
              src={selectedImage || "/placeholder.svg"}
              alt={selectedVariant?.color.ru || collection.name_ru}
              width={800}
              height={800}
              className={styles.mainImage}
              priority
            />

            <button className={styles.zoomButton} onClick={toggleZoom} aria-label="Увеличить изображение">
              <ZoomIn size={20} />
            </button>
          </div>

          {/* Color variants */}
          {collection.variants && collection.variants.length > 0 && (
            <div className={styles.colorVariantsSection}>
              <div className={styles.colorSectionHeader}>
                <h3 className={styles.colorSectionTitle}>
                  Доступные цвета <span className={styles.colorCount}>({collection.variants.length})</span>
                </h3>
                {hiddenVariantsCount > 0 && (
                  <button className={styles.showMoreButton} onClick={() => setShowAllVariants(!showAllVariants)}>
                    {showAllVariants ? "Свернуть" : "Показать все"}
                  </button>
                )}
              </div>

              <div className={styles.colorVariantsGrid}>
                {visibleVariants.map((variant) => (
                  <button
                    key={variant.id}
                    className={`${styles.colorVariantButton} ${
                      selectedVariant?.id === variant.id ? styles.selectedVariant : ""
                    }`}
                    onClick={() => setSelectedVariant(variant)}
                    aria-label={`Выбрать цвет: ${variant.color.ru}`}
                  >
                    <div className={styles.colorVariantImageWrapper}>
                      <Image
                        src={variant.image || `/placeholder.svg?height=80&width=80&query=${variant.color.ru}%20fabric`}
                        alt={variant.color.ru}
                        width={80}
                        height={80}
                        className={styles.colorVariantImage}
                      />
                      {selectedVariant?.id === variant.id && (
                        <div className={styles.selectedCheck}>
                          <Check size={16} />
                        </div>
                      )}
                    </div>
                    <div className={styles.colorVariantInfo}>
                      <span className={styles.colorVariantName}>{variant.color.ru}</span>
                      <div
                        className={styles.colorSwatch}
                        style={{ backgroundColor: variant.color.hex || "#ccc" }}
                      ></div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column - Details */}
        <div className={styles.detailsSection}>
          <div className={styles.fabricHeader}>
            <h1 className={styles.fabricTitle}>{collection.name_ru}</h1>

            <div className={styles.fabricMeta}>
              <div className={styles.fabricCategory}>
                <span className={styles.categoryLabel}>Категория:</span>
                <Link href={`/fabrics/${categoryId}`} className={styles.categoryValue}>
                  {category.name_ru}
                </Link>
              </div>

              <div className={styles.fabricBadges}>
                {collection.type && (
                  <Badge variant="outline" className={styles.typeBadge}>
                    {collection.type}
                  </Badge>
                )}
                {collection.availability && (
                  <Badge variant="secondary" className={styles.availabilityBadge}>
                    <span className={styles.availabilityDot}></span>
                    {collection.availability}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {selectedVariant && (
            <div className={styles.selectedVariantInfo}>
              <div className={styles.selectedColorInfo}>
                <div
                  className={styles.selectedColorSwatch}
                  style={{ backgroundColor: selectedVariant.color.hex || "#ccc" }}
                ></div>
                <div className={styles.selectedColorDetails}>
                  <h3 className={styles.selectedColorTitle}>Выбранный цвет</h3>
                  <span className={styles.selectedColorName}>{selectedVariant.color.ru}</span>
                </div>
              </div>
              <div className={styles.stockInfo}>
                <span className={styles.inStockDot}></span>
                <span className={styles.inStockText}>В наличии</span>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className={styles.actionButtons}>
            <Button
              onClick={handleAddToCart}
              className={`${styles.cartButton} ${isVariantInCart ? styles.inCartButton : ""}`}
              disabled={!selectedVariant}
              size="lg"
            >
              <ShoppingCart size={20} />
              <span>{isVariantInCart ? "В корзине" : "Добавить в корзину"}</span>
            </Button>

            <Button
              onClick={handleToggleFavorite}
              variant="outline"
              className={`${styles.favoriteButton} ${isVariantInFavorites ? styles.inFavoritesButton : ""}`}
              disabled={!selectedVariant}
              size="lg"
              aria-label={isVariantInFavorites ? "Удалить из избранного" : "Добавить в избранное"}
            >
              <Heart
                size={20}
                className={isVariantInFavorites ? styles.filledHeart : ""}
                fill={isVariantInFavorites ? "currentColor" : "none"}
              />
              <span>{isVariantInFavorites ? "В избранном" : "В избранное"}</span>
            </Button>
          </div>

          {/* Success message */}
          {showSuccessMessage && (
            <div className={styles.successMessage}>
              <Check size={16} className={styles.successIcon} />
              <span>{showSuccessMessage}</span>
            </div>
          )}

          {/* Fabric information tabs */}
          <Tabs defaultValue="description" className={styles.infoTabs}>
            <TabsList className={styles.tabsList}>
              <TabsTrigger value="description">Описание</TabsTrigger>
              <TabsTrigger value="specifications">Характеристики</TabsTrigger>
              <TabsTrigger value="care">Уход</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className={styles.tabContent}>
              {collection.description_ru ? (
                <p className={styles.descriptionText}>{collection.description_ru}</p>
              ) : (
                <p className={styles.descriptionText}>
                  {collection.name_ru} - это высококачественная ткань из категории {category.name_ru}. Идеально подходит
                  для обивки мебели и создания уютного интерьера. Благодаря своей прочности и эстетичному внешнему виду,
                  эта ткань станет отличным выбором для вашей мебели.
                </p>
              )}

              {collection.technicalSpecifications?.applicationAreas_ru && (
                <div className={styles.applicationAreas}>
                  <h4 className={styles.applicationAreasTitle}>Области применения:</h4>
                  <ul className={styles.applicationAreasList}>
                    {collection.technicalSpecifications.applicationAreas_ru.map((area, index) => (
                      <li key={index} className={styles.applicationArea}>
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </TabsContent>

            <TabsContent value="specifications" className={styles.tabContent}>
              {collection.technicalSpecifications ? (
                <div className={styles.specificationsTable}>
                  {Object.entries(collection.technicalSpecifications).map(([key, value]) => {
                    // Skip application areas as they're arrays and null values
                    if (key === "applicationAreas_ru" || !value) return null

                    // Format the key for display
                    let displayKey = key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/_ru$/, "")
                      .replace(/^./, (str) => str.toUpperCase())

                    // Map technical specification keys to Russian
                    const keyMapping: Record<string, string> = {
                      "Fabric Type": "Тип ткани",
                      "Abrasion Resistance": "Устойчивость к истиранию",
                      Density: "Плотность",
                      Composition: "Состав",
                      Width: "Ширина",
                      Origin: "Страна производства",
                      "Collection Name": "Название коллекции",
                      Directionality: "Направленность рисунка",
                    }

                    displayKey = keyMapping[displayKey] || displayKey

                    return (
                      <div key={key} className={styles.specificationRow}>
                        <div className={styles.specificationKey}>{displayKey}</div>
                        <div className={styles.specificationValue}>{value}</div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className={styles.noSpecifications}>Технические характеристики не указаны.</p>
              )}
            </TabsContent>

            <TabsContent value="care" className={styles.tabContent}>
              {collection.careInstructions_ru && collection.careInstructions_ru.length > 0 ? (
                <ul className={styles.careInstructionsList}>
                  {collection.careInstructions_ru.map((instruction, index) => (
                    <li key={index} className={styles.careInstruction}>
                      {instruction}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className={styles.careInstructionsDefault}>
                  <ul className={styles.careInstructionsList}>
                    <li>Сухая чистка</li>
                    <li>Не использовать отбеливатель</li>
                    <li>Не гладить</li>
                    <li>Избегать попадания прямых солнечных лучей</li>
                    <li>Пятна удалять сразу после появления</li>
                  </ul>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className={styles.requestSampleSection}>
            <Button variant="outline" className={styles.requestSampleButton}>
              Заказать образец ткани
            </Button>
            <p className={styles.requestSampleInfo}>
              Закажите бесплатный образец ткани, чтобы оценить качество материала перед покупкой
            </p>
          </div>
        </div>
      </div>

      {/* Similar fabrics section */}
      {similarCollections.length > 0 && (
        <div className={styles.similarFabricsSection}>
          <h2 className={styles.similarFabricsTitle}>Похожие ткани</h2>
          <div className={styles.similarFabricsGrid}>
            {similarCollections.map((similarCollection) => (
              <FabricCollectionCard
                key={similarCollection.name}
                categoryName={categoryId}
                collection={similarCollection}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
