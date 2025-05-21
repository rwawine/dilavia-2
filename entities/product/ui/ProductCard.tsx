"use client"

import type React from "react"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/entities/cart/model/cartContext"
import { useFavorites } from "@/entities/favorites/model/favoritesContext"
import { formatPrice } from "@/shared/utils/formatPrice"
import type { ProductData, BedData, SofaData, KidsBedData, Size } from "@/shared/api/types"
import styles from "./ProductCard.module.css"

interface ProductCardProps {
  product: ProductData
  showOptions?: boolean
  className?: string
}

export default function ProductCard({ product, showOptions = false, className = "" }: ProductCardProps) {
  const router = useRouter()
  const { state: cartState, dispatch: cartDispatch } = useCart()
  const { state: favoritesState, dispatch: favoritesDispatch } = useFavorites()

  // State for product options
  const [selectedSize, setSelectedSize] = useState(0)
  const [withMechanism, setWithMechanism] = useState(false)
  const [showSizeSelector, setShowSizeSelector] = useState(false)

  // Check if product is in favorites
  const isInFavorites = favoritesState.items.some((item) => item.id === product.id)
  const [isFavorited, setIsFavorited] = useState(isInFavorites)

  // Generate a unique ID for this product configuration
  const getCartItemId = () => {
    return `${product.id}-${selectedSize}-${withMechanism}`
  }

  // Check if product is in cart
  const isInCart = cartState.items.some((item) => item.id === getCartItemId())

  // Update favorite state when context changes
  useEffect(() => {
    setIsFavorited(favoritesState.items.some((item) => item.id === product.id))
  }, [favoritesState, product.id])

  // Get sizes based on product type
  const getSizes = () => {
    const isSofa = product.category === "sofa"
    const isBed = product.category === "bed"
    const isKidsBed = product.category === "kids"

    if (isBed && "bed" in product && Array.isArray((product as BedData).bed)) {
      return ((product as BedData).bed as Size[]).map((size) => ({
        width: size.width,
        length: size.length,
        price: size.price,
      }))
    } else if (
      isSofa &&
      "sizes" in product &&
      (product as SofaData).sizes &&
      Array.isArray((product as SofaData).sizes!.sofa)
    ) {
      return ((product as SofaData).sizes!.sofa as Size[]).map((size) => ({
        width: size.width,
        length: size.length,
        price: size.price,
      }))
    } else if (
      isKidsBed &&
      "specs" in product &&
      (product as KidsBedData).specs &&
      Array.isArray((product as KidsBedData).specs!["kids-tables"])
    ) {
      return ((product as KidsBedData).specs!["kids-tables"] as any[]).map((size) => ({
        width: size.width,
        length: size.length,
        price: size.price,
      }))
    }
    return []
  }

  const sizes = getSizes()
  const hasSizes = sizes.length > 1

  // Check if lifting mechanism is available for the selected size
  const hasLiftingMechanism = () => {
    const isBed = product.category === "bed"
    const isKidsBed = product.category === "kids"

    if (
      isBed &&
      "bed" in product &&
      Array.isArray((product as BedData).bed) &&
      (product as BedData).bed![selectedSize] &&
      Array.isArray((product as any).bed[selectedSize].lifting_mechanism)
    ) {
      return (product as any).bed[selectedSize].lifting_mechanism.length > 1
    } else if (
      isKidsBed &&
      "specs" in product &&
      (product as KidsBedData).specs &&
      Array.isArray((product as KidsBedData).specs!["kids-tables"]) &&
      (product as KidsBedData).specs!["kids-tables"]![selectedSize] &&
      Array.isArray((product as any).specs["kids-tables"][selectedSize].lifting_mechanism)
    ) {
      return (
        (product as any).specs["kids-tables"][selectedSize].lifting_mechanism.length > 1 &&
        (product as any).specs["kids-tables"][selectedSize].lifting_mechanism[1].available
      )
    }
    return false
  }

  // Get price with selected options
  const getPrice = () => {
    if (!sizes || sizes.length === 0) {
      return product.price.current
    }

    let price = sizes[selectedSize].price

    // Add mechanism price for beds
    if (
      product.category === "bed" &&
      "bed" in product &&
      withMechanism &&
      hasLiftingMechanism() &&
      Array.isArray((product as any).bed[selectedSize].lifting_mechanism) &&
      (product as any).bed[selectedSize].lifting_mechanism[1]
    ) {
      price += (product as any).bed[selectedSize].lifting_mechanism[1].price
    }

    // Add mechanism price for kids beds
    if (
      product.category === "kids" &&
      withMechanism &&
      hasLiftingMechanism() &&
      "specs" in product &&
      (product as KidsBedData).specs &&
      Array.isArray((product as KidsBedData).specs!["kids-tables"]) &&
      (product as KidsBedData).specs!["kids-tables"]![selectedSize] &&
      Array.isArray((product as any).specs["kids-tables"][selectedSize].lifting_mechanism)
    ) {
      price += (product as any).specs["kids-tables"][selectedSize].lifting_mechanism[1].price
    }

    return price
  }

  const handleAddToCart = () => {
    if (isInCart) {
      // Navigate to cart if already in cart
      router.push("/cart")
      return
    }

    cartDispatch({
      type: "ADD_TO_CART",
      payload: {
        id: getCartItemId(),
        product,
        quantity: 1,
        selectedSize: sizes[selectedSize] ?? null,
        withMechanism,
        totalPrice: getPrice(),
      },
    })
  }

  const handleToggleFavorite = () => {
    if (isFavorited) {
      favoritesDispatch({
        type: "REMOVE_FROM_FAVORITES",
        payload: product.id,
      })
    } else {
      favoritesDispatch({
        type: "ADD_TO_FAVORITES",
        payload: {
          id: product.id,
          product,
        },
      })
    }
  }

  const handleProductClick = () => {
    // No need to add to recently viewed anymore
  }

  // Toggle size selector
  const toggleSizeSelector = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (hasSizes) {
      setShowSizeSelector(!showSizeSelector)
    }
  }

  // Determine the product URL based on category
  const getProductUrl = () => {
    const category = product.category || "sofa"
    return `/products/${category}/${product.slug}`
  }

  // Get the main image or a placeholder
  const getMainImage = (hovered: boolean = false) => {
    if (product.images && product.images.length > 0) {
      if (hovered && product.images.length > 1) {
        return product.images[1]
      }
      return product.images[0]
    }
    return "/assorted-living-room-furniture.png"
  }

  // State for hover
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={`${styles.productCard} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.imageContainer}>
        <Link href={getProductUrl()} onClick={handleProductClick} className={styles.imageLink}>
          <img
            src={getMainImage(isHovered) || "/placeholder.svg"}
            alt={product.name}
            className={styles.productImage}
            width={300}
            height={300}
          />
        </Link>
        {product.price.old && (
          <div className={styles.discountBadge}>
            -{Math.round(((product.price.old - product.price.current) / product.price.old) * 100)}%
          </div>
        )}
        {product.availability === "В наличии" && <div className={styles.inStockBadge}>В наличии</div>}
        <div className={styles.productOptions}>
          <button
            className={`${styles.favoriteButton} ${isFavorited ? styles.favorited : ""}`}
            onClick={handleToggleFavorite}
            aria-label={isFavorited ? "Удалить из избранного" : "Добавить в избранное"}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill={isFavorited ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        </div>
      </div>
      <div className={styles.productInfo}>
        <Link href={getProductUrl()} onClick={handleProductClick} className={styles.productLink}>
          <h3 className={styles.productName}>{product.name}</h3>
        </Link>
        <div className={styles.priceContainer}>
          <span className={styles.price}>{formatPrice(getPrice())} ₽</span>
          {product.price.old && <span className={styles.oldPrice}>{formatPrice(product.price.old)} ₽</span>}
        </div>

        {/* Size selector */}
        {hasSizes && (
          <div className={styles.sizeSelector}>
            <button className={styles.sizeToggle} onClick={toggleSizeSelector}>
              Размер: {sizes[selectedSize].width}x{sizes[selectedSize].length} см
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={showSizeSelector ? styles.arrowUp : styles.arrowDown}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            {showSizeSelector && (
              <div className={styles.sizeOptions}>
                {sizes.map((size, index) => (
                  <button
                    key={index}
                    className={`${styles.sizeOption} ${selectedSize === index ? styles.active : ""}`}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setSelectedSize(index)
                      setShowSizeSelector(false)
                    }}
                  >
                    {size.width}x{size.length} см
                    {size.price !== product.price.current && (
                      <span className={styles.sizePriceDiff}>
                        {size.price > product.price.current ? "+" : ""}
                        {formatPrice(size.price - product.price.current)} ₽
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Lifting mechanism option */}
        {hasLiftingMechanism() && (
          <label className={styles.mechanismOption}>
            <input
              type="checkbox"
              checked={withMechanism}
              onChange={() => setWithMechanism(!withMechanism)}
              className={styles.mechanismCheckbox}
            />
            <span className={styles.mechanismLabel}>Подъемный механизм</span>
          </label>
        )}

        <button className={`${styles.addToCartButton} ${isInCart ? styles.inCart : ""}`} onClick={handleAddToCart}>
          {isInCart ? "В корзине" : "В корзину"}
        </button>
      </div>
    </div>
  )
}
