"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import Button from "@/shared/ui/button/Button"
import { useFabricCart } from "@/entities/fabric-cart/model/fabricCartContext"
import { useFabricFavorites } from "@/entities/fabric-favorites/model/fabricFavoritesContext"
import styles from "./FabricCard.module.css"
import type { FabricVariant } from "@/shared/api/types"

interface FabricCardProps {
  categoryName: string
  categoryNameRu: string
  collectionName: string
  collectionNameRu: string
  variant: FabricVariant
  availability: string
  className?: string
}

export const FabricCard = ({
  categoryName,
  categoryNameRu,
  collectionName,
  collectionNameRu,
  variant,
  availability,
  className = "",
}: FabricCardProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const { state: cartState, dispatch: cartDispatch } = useFabricCart()
  const { state: favoritesState, dispatch: favoritesDispatch } = useFabricFavorites()

  // Генерируем уникальный ID для этого варианта ткани
  const variantId = `${categoryName}-${collectionName}-${variant.id}`

  // Проверяем, есть ли этот вариант в корзине
  const isInCart = cartState.items.some((item) => item.id === variantId)

  // Проверяем, есть ли этот вариант в избранном
  const isInFavorites = favoritesState.items.some((item) => item.id === variantId)

  const handleAddToCart = () => {
    if (isInCart) return

    cartDispatch({
      type: "ADD_TO_CART",
      payload: {
        id: variantId,
        categoryName,
        categoryNameRu,
        collectionName,
        collectionNameRu,
        variant,
        quantity: 1,
      },
    })
  }

  const handleToggleFavorite = () => {
    if (isInFavorites) {
      favoritesDispatch({
        type: "REMOVE_FROM_FAVORITES",
        payload: variantId,
      })
    } else {
      favoritesDispatch({
        type: "ADD_TO_FAVORITES",
        payload: {
          id: variantId,
          categoryName,
          categoryNameRu,
          collectionName,
          collectionNameRu,
          variant,
        },
      })
    }
  }

  return (
    <div
      className={`${styles.card} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.imageContainer}>
        <Image
          src={variant.image || "/placeholder.svg?height=300&width=300&query=fabric"}
          alt={variant.color.ru}
          width={300}
          height={300}
          className={styles.image}
        />
        {availability === "В наличии" && <div className={styles.inStockBadge}>В наличии</div>}
        <div className={styles.productOptions}>
          <button
            className={`${styles.favoriteButton} ${isInFavorites ? styles.favorited : ""}`}
            onClick={handleToggleFavorite}
            aria-label={isInFavorites ? "Удалить из избранного" : "Добавить в избранное"}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill={isInFavorites ? "currentColor" : "none"}
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
      <div className={styles.content}>
        <Link 
          href={`/fabrics/${categoryName}/${collectionName}`}
          className={styles.title}
        >
          {categoryNameRu} {variant.color.ru}
        </Link>
        <div className={styles.collection}>{collectionNameRu}</div>
        <div className={styles.actions}>
          <Button
            variant={isInCart ? "secondary" : "primary"}
            size="sm"
            className={`${styles.addToCartButton} ${isInCart ? styles.inCart : ""}`}
            onClick={handleAddToCart}
          >
            {isInCart ? "В корзине" : "В корзину"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default FabricCard
