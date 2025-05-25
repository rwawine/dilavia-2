"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import type { FabricCollection } from "@/shared/api/types"
import styles from "./FabricCollectionCard.module.css"

interface FabricCollectionCardProps {
  categoryName: string
  collection: FabricCollection
  className?: string
}

export const FabricCollectionCard = ({ categoryName, collection, className = "" }: FabricCollectionCardProps) => {
  const [isHovered, setIsHovered] = useState(false)

  // Safely access collection properties with fallbacks
  const collectionNameRu = collection?.name_ru || "Коллекция"
  const collectionName = collection?.name || ""
  const collectionType = collection?.type || ""
  const collectionAvailability = collection?.availability || ""

  // Get the first variant image as the collection thumbnail
  const thumbnailImage =
    collection?.variants && collection.variants.length > 0
      ? collection.variants[0].image
      : `/placeholder.svg?height=300&width=300&query=${encodeURIComponent(collectionNameRu)}%20fabric`

  // Format availability text
  const formattedAvailability = collectionAvailability === "В наличии" 
    ? "В наличии" 
    : collectionAvailability

  return (
    <Link
      href={`/fabrics/${categoryName.toLowerCase()}/${encodeURIComponent(collectionName)}`}
      className={`${styles.card} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.imageContainer}>
        <Image
          src={thumbnailImage}
          alt={collectionNameRu}
          width={300}
          height={300}
          className={styles.image}
          priority={false}
        />
        <div className={`${styles.overlay} ${isHovered ? styles.visible : ""}`}>
          <span className={styles.viewDetails}>Посмотреть детали</span>
        </div>
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{collectionNameRu}</h3>
        {collectionType && <div className={styles.type}>{collectionType}</div>}
        {collectionAvailability && (
          <div className={styles.availability}>{formattedAvailability}</div>
        )}
      </div>
    </Link>
  )
}

export default FabricCollectionCard
