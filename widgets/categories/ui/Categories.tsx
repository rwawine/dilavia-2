"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { getProductsByCategory } from "@/shared/api/api"
import styles from "./Categories.module.css"

interface Category {
  id: string
  name: string
  image: string
  url: string
  description: string
}

const defaultCategories: Category[] = [
  {
    id: "sofa",
    name: "Диваны",
    image: "/category-sofa.png",
    url: "/catalog?category=sofa",
    description: "Комфортные диваны для вашей гостиной"
  },
  {
    id: "bed",
    name: "Кровати",
    image: "/category-bed.png",
    url: "/catalog?category=bed",
    description: "Кровати для спокойного и здорового сна"
  },
  {
    id: "armchair",
    name: "Кресла",
    image: "/modern-armchair.png",
    url: "/catalog?category=armchair",
    description: "Стильные и удобные кресла"
  },
  {
    id: "kids",
    name: "Детская мебель",
    image: "/kids-furniture-bed.png",
    url: "/catalog?category=kids",
    description: "Безопасная и красивая мебель для детей"
  },
]

export default function Categories() {
  const [productCounts, setProductCounts] = useState<{ [key: string]: number }>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProductCounts() {
      try {
        const counts: { [key: string]: number } = {}
        
        // Получаем товары для каждой категории параллельно
        const categoryPromises = defaultCategories.map(category => 
          getProductsByCategory(category.id).then(products => {
            counts[category.id] = products.length
          })
        )
        
        await Promise.all(categoryPromises)
        setProductCounts(counts)
      } catch (error) {
        console.error('Error fetching product counts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProductCounts()
  }, [])

  return (
    <section className={styles.categories}>
      <div className="container">
        <div className={styles.header}>
          <h2 className={styles.title}>Категории мебели</h2>
          <p className={styles.subtitle}>Выберите категорию и найдите идеальную мебель для вашего дома</p>
        </div>
        <div className={styles.grid}>
          {defaultCategories.map((category) => (
            <Link href={category.url} key={category.id} className={styles.card}>
              <div className={styles.imageWrapper}>
                <Image
                  src={category.image}
                  alt={category.name}
                  width={400}
                  height={300}
                  className={styles.image}
                />
                <div className={styles.overlay}>
                  <span className={styles.itemCount}>
                    {loading ? (
                      <span className={styles.loading}>...</span>
                    ) : (
                      `${productCounts[category.id] || 0} товаров`
                    )}
                  </span>
                </div>
              </div>
              <div className={styles.content}>
                <h3 className={styles.categoryName}>{category.name}</h3>
                <p className={styles.description}>{category.description}</p>
                <span className={styles.link}>
                  Смотреть все
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      d="M5 12h14m-7-7l7 7-7 7" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
