"use client"

import { useState } from "react"
import Link from "next/link"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination, Autoplay } from "swiper/modules"
import Button from "@/shared/ui/button/Button"
import styles from "./HeroSection.module.css"
import cn from 'classnames'

// Import Swiper styles
import "swiper/css"
import "swiper/css/pagination"

export const HeroSection = () => {
  const [isInitialized, setIsInitialized] = useState(false)
  
  const heroSlides = [
    {
      title: "NINJA PIZZA",
      subtitle: "ПЕПЕРОНІ В МЕНЮ",
      description: "Спробуйте нашу фірмову піцу з пепероні",
      image: "/images/banners/pizza-banner.jpg",
      buttonText: "Замовити",
      buttonLink: "/menu/pizza",
    },
    {
      title: "ВИБІР NINJA",
      subtitle: "ГРОМОВЕРЖЦІ",
      description: "Дивіться новий фільм від Marvel Studios вже у кіно",
      image: "/images/banners/thunderbolts-banner.jpg",
      buttonText: "Купити квитки",
      buttonLink: "/movies/thunderbolts",
    }
  ]

  return (
    <section className={styles.heroSection}>
      <Swiper
        modules={[Pagination, Autoplay]}
        slidesPerView={1}
        spaceBetween={20}
        speed={800}
        initialSlide={0}
        observeParents={true}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
          dynamicMainBullets: 3,
        }}
        onInit={() => setIsInitialized(true)}
        className={cn(styles.sliderContainer, {
          [styles.initialized]: isInitialized
        })}
      >
        {heroSlides.map((slide, index) => (
          <SwiperSlide key={index} className={styles.slideWrapper}>
            <div className={styles.slide}>
              <div 
                className={styles.slideBackground} 
                style={{ backgroundImage: `url(${slide.image})` }}
              />
              <div className={styles.overlay} />
              <div className={styles.content}>
                <div className={styles.titleWrapper}>
                  <h2 className={styles.subtitle}>{slide.subtitle}</h2>
                  <h1 className={styles.title}>{slide.title}</h1>
                </div>
                <p className={styles.description}>{slide.description}</p>
                <div className={styles.actions}>
                  <Link href={slide.buttonLink}>
                    <Button variant="primary" size="lg">
                      {slide.buttonText}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  )
}

export default HeroSection
