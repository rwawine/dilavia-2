import { getPopularProducts } from "@/shared/api/api"
import HeroSection from "@/widgets/hero-section/ui/HeroSection"
import PopularProducts from "@/widgets/popular-products/ui/PopularProducts"
import Categories from "@/widgets/categories/ui/Categories"
import PromoSection from "@/widgets/promo-section/ui/PromoSection"
import ReviewsSlider from "@/widgets/reviews/ui/ReviewsSlider"
import styles from './page.module.css'

export default async function HomePage() {
  const popularProducts = await getPopularProducts(12)

  return (
    <>
      <HeroSection />
      <PopularProducts products={popularProducts} />
      <section className={styles.benefits}>
        <div className={styles.benefits__grid}>
          {/* Benefit Item 1 */}
          <div className={styles.benefitItem}>
            <h3 className={styles.benefitItem__title}>Быстро реализуем проекты</h3>
            <p className={styles.benefitItem__description}>
              Изготовление до 35 рабочих дней с момента запуска заказа на
              производстве. Работаем по строгим стандартам качества на каждом
              этапе: от выбора материалов до установки мебели
            </p>
          </div>

          {/* Benefit Item 2 */}
          <div className={styles.benefitItem}>
            <h3 className={styles.benefitItem__title}>
              Даем гарантию на изделия 18 месяцев
            </h3>
            <p className={styles.benefitItem__description}>
              Наша мебель отличается высокой прочностью и долговечностью. Мы
              уверены в качестве своей продукции.
            </p>
          </div>

          <div className={styles.benefitItem}>
            <h3 className={styles.benefitItem__title}>Предлагаем лучшие материалы</h3>
            <p className={styles.benefitItem__description}>
              Для каждого проекта мы тщательно выбираем подходящий материал под
              ваш бюджет, функциональные задачи и ваши требования к конечному
              результату
            </p>
          </div>

          {/* Benefit Item 4 */}
          <div className={styles.benefitItem}>
            <h3 className={styles.benefitItem__title}>
              Изготавливаем мебель нестандартных размеров
            </h3>
            <p className={styles.benefitItem__description}>
              Многие магазины мебели предлагают стандартные решения, которые
              могут не соответствовать вашим потребностям. Мы создаем
              индивидуальную мебель с учетом вашего роста и особенностей
              планировки
            </p>
          </div>

          {/* Benefit Item 5 */}
          <div className={styles.benefitItem}>
            <h3 className={styles.benefitItem__title}>
              Работаем по договору и техническому заданию
            </h3>
            <p className={styles.benefitItem__description}>
              Строго придерживаемся условий договора и технического задания, что
              помогает нам организовать эффективную реализацию проекта и
              соответствовать вашим ожиданиям
            </p>
          </div>

          {/* Benefit Item 6 */}
          <div className={styles.benefitItem}>
            <h3 className={styles.benefitItem__title}>
              Приглашаем в шоурум для знакомства с образцами
            </h3>
            <p className={styles.benefitItem__description}>
              В нашем шоуруме при демонстрации тканей мы используем реальные
              образцы. Это позволяет увидеть цвет вживую, оценить материала и
              почувствовать фактуру будущего изделия на вашем диване.
            </p>
          </div>
        </div>
      </section>
      <PromoSection />
      <ReviewsSlider />
    </>
  )
}
