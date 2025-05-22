"use client"

import { useEffect, useState, useRef } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, Autoplay } from "swiper/modules"
import ProductCard from "@/entities/product/ui/ProductCard"
import styles from "./PopularProducts.module.css"

// Import Swiper styles
import "swiper/css"
import "swiper/css/pagination"
import "swiper/css/navigation"

export const PopularProducts = ({ products }: { products: any[] }) => {
  const [slidesPerView, setSlidesPerView] = useState(4)
  const swiperRef = useRef<any>(null)

  // Update slides per view based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1200) {
        setSlidesPerView(4)
      } else if (window.innerWidth >= 768) {
        setSlidesPerView(3)
      } else if (window.innerWidth >= 576) {
        setSlidesPerView(2)
      } else {
        setSlidesPerView(1)
      }
    }

    handleResize() // Set initial value
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  if (products.length === 0) {
    return (
      <section className={styles.popularProducts}>
        <div className="container">
          <h2 className={styles.title}>Популярные товары</h2>
          <div className={styles.noProducts}>
            <p>В данный момент нет популярных товаров.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.popularProducts}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2 className={styles.title}>Популярные товары</h2>
        </div>

        <div className={styles.swiperContainer}>
          <Swiper
            ref={swiperRef}
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={20}
            slidesPerView={slidesPerView}
            navigation={true}
            pagination={{
              clickable: true,
            }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            loop={products.length > slidesPerView}
            className={styles.swiper}
          >
            {products.map((product) => (
              <SwiperSlide key={product.id} className={styles.swiperSlide}>
                <div className={styles.productWrapper}>
                  <ProductCard product={product} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          <div className={styles.customNavigation}>
            <button 
              className={styles.navPrev}
              onClick={() => swiperRef.current?.swiper.slidePrev()}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M15 18L9 12L15 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button 
              className={styles.navNext}
              onClick={() => swiperRef.current?.swiper.slideNext()}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M9 6L15 12L9 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PopularProducts
