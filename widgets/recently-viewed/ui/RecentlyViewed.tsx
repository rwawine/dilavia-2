"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRecentlyViewed } from "@/entities/recently-viewed/model/recentlyViewedContext"
import styles from "./RecentlyViewed.module.css"

export const RecentlyViewed = () => {
  const { state: recentlyViewedState } = useRecentlyViewed()
  const [isClient, setIsClient] = useState(false)

  // Only render on client side to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient || recentlyViewedState.items.length === 0) {
    return null
  }

  return (
    <div className={styles.recentlyViewed}>
      <div className="container">
        <h2 className={styles.title}>Недавно просмотренные</h2>
        <div className={styles.grid}>
          {recentlyViewedState.items.map((item) => {
            const product = item.product
            const isBed = "bed" in product
            const category = isBed ? "bed" : "sofa"

            return (
              <Link key={item.id} href={`/products/${category}/${product.slug}`} className={styles.item}>
                <div className={styles.imageWrapper}>
                  <Image
                    src={product.images[0] || "/placeholder.svg"}
                    alt={product.name}
                    width={150}
                    height={150}
                    className={styles.image}
                  />
                </div>
                <div className={styles.info}>
                  <h3 className={styles.name}>{product.name}</h3>
                  <div className={styles.price}>
                    <span className={styles.currentPrice}>{product.price.current} руб.</span>
                    {product.price.old && <span className={styles.oldPrice}>{product.price.old} руб.</span>}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default RecentlyViewed
