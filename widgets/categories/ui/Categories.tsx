import Link from "next/link"
import Image from "next/image"
import styles from "./Categories.module.css"

interface Category {
  id: string
  name: string
  image: string
  url: string
}

export default function Categories() {
  const categories: Category[] = [
    {
      id: "sofa",
      name: "Диваны",
      image: "/category-sofa.png",
      url: "/catalog?category=sofa",
    },
    {
      id: "bed",
      name: "Кровати",
      image: "/category-bed.png",
      url: "/catalog?category=bed",
    },
    {
      id: "armchair",
      name: "Кресла",
      image: "/modern-armchair.png",
      url: "/catalog?category=armchair",
    },
    {
      id: "kids",
      name: "Детская мебель",
      image: "/kids-furniture-bed.png",
      url: "/catalog?category=kids",
    },
  ]

  return (
    <section className={styles.categories}>
      <div className={styles.container}>
        <h2 className={styles.title}>Категории</h2>
        <div className={styles.grid}>
          {categories.map((category) => (
            <Link href={category.url} key={category.id} className={styles.card}>
              <div className={styles.imageWrapper}>
                <Image
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  width={300}
                  height={300}
                  className={styles.image}
                />
              </div>
              <h3 className={styles.categoryName}>{category.name}</h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
