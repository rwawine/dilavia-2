import type React from "react"
import ProductCard from "@/entities/product/ui/ProductCard"
import styles from "./SimilarProducts.module.css"
import type { ProductData } from "@/shared/api/types"

interface SimilarProductsProps {
  currentProductId: string
  category: string
  products: ProductData[]
  limit?: number
}

const SimilarProducts: React.FC<SimilarProductsProps> = ({ currentProductId, category, products, limit = 4 }) => {
  // Filter out the current product and limit the number of similar products
  const similarProducts = products
    .filter((product) => product.id !== currentProductId && product.category === category)
    .slice(0, limit)

  if (similarProducts.length === 0) {
    return null
  }

  return (
    <div className={styles.similarProducts}>
      <h2 className={styles.title}>Похожие товары</h2>
      <div className={styles.productGrid}>
        {similarProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}

export default SimilarProducts
