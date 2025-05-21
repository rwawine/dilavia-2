"use client"

import { useEffect, useState, useRef } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Autoplay } from "swiper/modules"
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import Link from "next/link"
import styles from "./ReviewsSlider.module.css"

// Import Swiper styles
import "swiper/css"

interface Review {
  id: string
  username: string
  comment: string
  rating: number
  timestamp: any
}

const LINE_HEIGHT = 24 // line-height: 1.6 * font-size: 15px ≈ 24px
const MAX_LINES = 5
const MAX_HEIGHT = LINE_HEIGHT * MAX_LINES // 120px

export const ReviewsSlider = () => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [slidesPerView, setSlidesPerView] = useState(3)
  const [loading, setLoading] = useState(true)
  const [expandedReviews, setExpandedReviews] = useState<{ [key: string]: boolean }>({})
  const reviewRefs = useRef<{ [key: string]: HTMLParagraphElement | null }>({})
  const prevRef = useRef<HTMLDivElement>(null)
  const nextRef = useRef<HTMLDivElement>(null)

  // Получаем отзывы из Firebase
  useEffect(() => {
    const q = query(collection(db, 'feedbacks'), orderBy('timestamp', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviewsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[]
      setReviews(reviewsData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Проверяем высоту каждого отзыва после рендера
  useEffect(() => {
    const checkReviewsHeight = () => {
      reviews.forEach(review => {
        const element = reviewRefs.current[review.id]
        if (element) {
          const isOverflowing = element.scrollHeight > MAX_HEIGHT
          setExpandedReviews(prev => ({
            ...prev,
            [review.id]: isOverflowing
          }))
        }
      })
    }

    checkReviewsHeight()
    // Также проверяем после полной загрузки страницы
    window.addEventListener('load', checkReviewsHeight)

    return () => {
      window.removeEventListener('load', checkReviewsHeight)
    }
  }, [reviews])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1200) {
        setSlidesPerView(3)
      } else if (window.innerWidth >= 768) {
        setSlidesPerView(2)
      } else {
        setSlidesPerView(1)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  if (loading) {
    return (
      <section className={styles.reviewsSlider}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.title}>Отзывы наших клиентов</h2>
            <p className={styles.subtitle}>Загрузка отзывов...</p>
          </div>
        </div>
      </section>
    )
  }

  if (reviews.length === 0) {
    return (
      <section className={styles.reviewsSlider}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.title}>Отзывы наших клиентов</h2>
            <p className={styles.subtitle}>Пока нет отзывов</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.reviewsSlider}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2 className={styles.title}>Отзывы наших клиентов</h2>
          <p className={styles.subtitle}>Что говорят о нас покупатели</p>
        </div>

        <div className={styles.swiperContainer}>
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={20}
            slidesPerView={slidesPerView}
            navigation={{
              prevEl: prevRef.current,
              nextEl: nextRef.current,
            }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            loop={reviews.length > slidesPerView}
            className={styles.swiper}
            onBeforeInit={(swiper) => {
              // @ts-ignore
              swiper.params.navigation.prevEl = prevRef.current
              // @ts-ignore
              swiper.params.navigation.nextEl = nextRef.current
            }}
          >
            {reviews.map((review) => (
              <SwiperSlide key={review.id} className={styles.swiperSlide}>
                <div className={styles.reviewCard}>
                  <div className={styles.reviewHeader}>
                    <div className={styles.reviewInfo}>
                      <h3 className={styles.reviewName}>{review.username}</h3>
                      <div className={styles.rating}>
                        {Array.from({ length: 5 }).map((_, index) => (
                          <span 
                            key={index} 
                            className={`${styles.star} ${index < review.rating ? styles.filled : ""}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className={styles.reviewDate}>
                      {review.timestamp.toDate().toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                  <div className={styles.reviewContent}>
                    <p 
                      ref={(el) => {
                        reviewRefs.current[review.id] = el
                      }}
                      className={styles.reviewText}
                    >
                      {review.comment}
                    </p>
                    {expandedReviews[review.id] && (
                      <Link href="/reviews" className={styles.readMoreLink}>
                        <span className={styles.readMoreText}>Читать полностью</span>
                        <svg 
                          className={styles.readMoreIcon}
                          width="16" 
                          height="16" 
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
                      </Link>
                    )}
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          <div className={styles.customNavigation}>
            <div ref={prevRef} className={styles.navPrev}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M15 18L9 12L15 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div ref={nextRef} className={styles.navNext}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M9 6L15 12L9 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ReviewsSlider 