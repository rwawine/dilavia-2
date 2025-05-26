"use client"

import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useMemo, useCallback } from "react"
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
  const [isHovered, setIsHovered] = useState(false)

  // Memoize sizes calculation
  const sizes = useMemo(() => {
    const isSofa = product.category === "sofa"
    const isBed = product.category === "bed"
    const isKidsBed = product.category === "kids-tables"

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
  }, [product])

  const hasSizes = sizes.length > 1

  // Memoize lifting mechanism check
  const hasLiftingMechanism = useCallback(() => {
    const isBed = product.category === "bed"
    const isKidsBed = product.category === "kids-tables"

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
  }, [product, selectedSize])

  // Memoize cart item ID
  const cartItemId = useMemo(() => {
    const size = sizes[selectedSize]
    const mechanismSuffix = hasLiftingMechanism() ? `-${withMechanism ? 'with-mechanism' : 'no-mechanism'}` : ''
    return `${product.id}-${size?.width}x${size?.length}${mechanismSuffix}`
  }, [product.id, sizes, selectedSize, withMechanism, hasLiftingMechanism])

  // Memoize price calculation
  const price = useMemo(() => {
    if (!sizes || sizes.length === 0) {
      return product.price.current
    }

    let totalPrice = sizes[selectedSize].price

    if (
      product.category === "bed" &&
      "bed" in product &&
      withMechanism &&
      hasLiftingMechanism() &&
      Array.isArray((product as any).bed[selectedSize].lifting_mechanism) &&
      (product as any).bed[selectedSize].lifting_mechanism[1]
    ) {
      totalPrice += (product as any).bed[selectedSize].lifting_mechanism[1].price
    }

    if (
      product.category === "kids-tables" &&
      withMechanism &&
      hasLiftingMechanism() &&
      "kids-tables" in product &&
      Array.isArray((product as any)["kids-tables"][selectedSize].lifting_mechanism) &&
      (product as any)["kids-tables"][selectedSize].lifting_mechanism[1]
    ) {
      totalPrice += (product as any)["kids-tables"][selectedSize].lifting_mechanism[1].price
    }

    return totalPrice
  }, [product, sizes, selectedSize, withMechanism, hasLiftingMechanism])

  // Memoize favorite state
  const isInFavorites = useMemo(
    () => favoritesState.items.some((item) => item.id === product.id.toString()),
    [favoritesState.items, product.id]
  )
  const [isFavorited, setIsFavorited] = useState(isInFavorites)

  // Memoize cart state
  const isInCart = useMemo(
    () => cartState.items.some((item) => item.id === cartItemId),
    [cartState.items, cartItemId]
  )

  // Memoize product URL
  const productUrl = useMemo(() => {
    const category = product.category || "sofa"
    return `/products/${category}/${product.slug}`
  }, [product.category, product.slug])

  // Memoize main image
  const mainImage = useMemo(() => {
    if (product.images && product.images.length > 0) {
      if (isHovered && product.images.length > 1) {
        return product.images[1]
      }
      return product.images[0]
    }
    return "/assorted-living-room-furniture.png"
  }, [product.images, isHovered])

  // Update favorite state when context changes
  useEffect(() => {
    setIsFavorited(isInFavorites)
  }, [isInFavorites])

  const handleAddToCart = useCallback(() => {
    if (isInCart) {
      router.push("/cart")
      return
    }

    cartDispatch({
      type: "ADD_TO_CART",
      payload: {
        id: cartItemId,
        product,
        quantity: 1,
        selectedSize: sizes[selectedSize] ?? null,
        withMechanism,
        totalPrice: price,
      },
    })
  }, [isInCart, router, cartDispatch, cartItemId, product, sizes, selectedSize, withMechanism, price])

  const handleToggleFavorite = useCallback(() => {
    if (isFavorited) {
      favoritesDispatch({
        type: "REMOVE_FROM_FAVORITES",
        payload: product.id.toString(),
      })
    } else {
      favoritesDispatch({
        type: "ADD_TO_FAVORITES",
        payload: {
          id: product.id.toString(),
          product,
        },
      })
    }
  }, [isFavorited, favoritesDispatch, product])

  const toggleSizeSelector = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (hasSizes) {
      setShowSizeSelector((prev) => !prev)
    }
  }, [hasSizes])

  return (
    <div
      className={`${styles.productCard} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.imageContainer}>
        <Link href={productUrl} className={styles.imageLink}>
          <Image
            src={mainImage}
            alt={product.name}
            className={styles.productImage}
            width={300}
            height={300}
            loading="lazy"
            quality={75}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>
        {product.price.old && (
          <div className={styles.discountBadge}>
            -{Math.round(((product.price.old - product.price.current) / product.price.old) * 100)}%
          </div>
        )}
        {product.availability === "В наличии" && (
          <div className={styles.inStockBadge}>В наличии</div>
        )}
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
        <Link href={productUrl} className={styles.productLink}>
          <h3 className={styles.productName}>{product.name}</h3>
        </Link>
        <div className={styles.priceContainer}>
          <span className={styles.price}>{formatPrice(price)} ₽</span>
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

        <button
          className={`${styles.addToCartButton} ${isInCart ? styles.inCart : ""}`}
          onClick={handleAddToCart}
        >
          {isInCart ? "В корзине" : "В корзину"}
        </button>
      </div>
    </div>
  )
}
