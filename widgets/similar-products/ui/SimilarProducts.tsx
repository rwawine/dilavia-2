import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { formatPrice } from "@/shared/utils/formatPrice"
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
          <div key={product.id} className={styles.productCard}>
            <Link href={`/products/${product.category}/${product.slug}`} className={styles.productLink}>
              <div className={styles.imageContainer}>
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[0] || "/placeholder.svg"}
                    alt={product.name}
                    width={250}
                    height={200}
                    className={styles.productImage}
                  />
                ) : (
                  <div className={styles.noImage}>Нет изображения</div>
                )}
              </div>
              <div className={styles.productInfo}>
                <h3 className={styles.productName}>{product.name}</h3>
                <div className={styles.productPrice}>
                  {formatPrice(product.price.current)}
                  {product.price.old && <span className={styles.oldPrice}>{formatPrice(product.price.old)}</span>}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SimilarProducts
