"use client"

import React, { useState } from "react"
import { Heart, ShoppingCart, Check } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ProductData, SofaData, BedData, KidsBedData, Size, Material } from "@/shared/api/types"
import { Button } from "@/shared/ui/button/Button"
import { formatPrice } from "@/shared/utils/formatPrice"
import { useCart } from "@/entities/cart/model/cartContext"
import { useFavorites } from "@/entities/favorites/model/favoritesContext"
import { useRecentlyViewed } from "@/entities/recently-viewed/model/recentlyViewedContext"
import SimilarProducts from "@/widgets/similar-products/ui/SimilarProducts"
import styles from "./ProductDetail.module.css"

interface ProductDetailProps {
  product: SofaData | BedData | KidsBedData
  allProducts: ProductData[]
}

interface InstallmentPlan {
  bank: string
  installment: {
    duration_months: number
    interest: string
  }
}

interface CartItem {
  id: string
  product: ProductData
  quantity: number
  selectedSize?: Size
  withMechanism?: boolean
  totalPrice: number
}

interface FavoriteItem {
  id: string
  product: ProductData
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product, allProducts }) => {
  const router = useRouter()
  // State for product options
  const [activeTab, setActiveTab] = useState("description")
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
  const [selectedSize, setSelectedSize] = useState<number>(0)
  const [selectedMechanism, setSelectedMechanism] = useState("")
  const [withMechanism, setWithMechanism] = useState(false)

  // Refs
  const imageRef = React.useRef<HTMLDivElement>(null)
  const mainImageRef = React.useRef<HTMLImageElement>(null)

  // Context hooks
  const { state: cartState, dispatch: cartDispatch } = useCart()
  const { state: favoritesState, dispatch: favoritesDispatch } = useFavorites()
  const { state: recentlyViewedState, dispatch: recentlyViewedDispatch } = useRecentlyViewed()

  // Determine product type
  const isSofa = product.category === "sofa"
  const isBed = product.category === "bed"
  const isKidsBed = product.category === "kids"

  const productLoadedRef = React.useRef(false)

  // Generate a unique ID for this product configuration
  const getCartItemId = () => {
    return `${product.id}-${selectedSize}-${withMechanism}`
  }

  // Check if this exact configuration is in cart
  const isInCart = cartState.items.some((item: CartItem) =>
    item.product.id === product.id &&
    (!product.sizes?.length || item.selectedSize === selectedSize) &&
    (!product.liftingMechanisms?.length || item.withMechanism === withMechanism)
  )

  // Check if product is in favorites
  const isFavorite = favoritesState.items.some((item: FavoriteItem) => item.id === product.id)

  React.useEffect(() => {
    if (!productLoadedRef.current) {
      productLoadedRef.current = true
    }
  }, [product])

  // Handle image zoom
  const handleImageZoom = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed || !imageRef.current || !mainImageRef.current) return

    const { left, top, width, height } = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100

    setZoomPosition({ x, y })
  }

  // Toggle zoom
  const toggleZoom = () => {
    setIsZoomed(!isZoomed)
  }

  // Get sizes based on product type
  const getSizes = (): Size[] => {
    if (isBed && "bed" in product && product.bed && Array.isArray(product.bed)) {
      return product.bed.map((size: any) => ({
        width: size.width,
        length: size.length,
        price: size.price,
      }))
    } else if (
      isSofa &&
      "sizes" in product &&
      product.sizes &&
      "sofa" in product.sizes &&
      Array.isArray(product.sizes.sofa)
    ) {
      return product.sizes.sofa.map((size: any) => ({
        width: size.width,
        length: size.length,
        price: size.price,
      }))
    } else if (
      isKidsBed &&
      "specs" in product &&
      product.specs &&
      "kids-tables" in product.specs &&
      Array.isArray(product.specs["kids-tables"])
    ) {
      return product.specs["kids-tables"].map((size: any) => ({
        width: size.width,
        length: size.length,
        price: size.price,
      }))
    }
    return []
  }

  const sizes = getSizes()

  // Check if lifting mechanism is available for the selected size
  const hasLiftingMechanism = () => {
    if (
      isBed &&
      "bed" in product &&
      product.bed &&
      product.bed[selectedSize] &&
      product.bed[selectedSize].lifting_mechanism
    ) {
      return product.bed[selectedSize].lifting_mechanism.length > 1
    } else if (
      isKidsBed &&
      product.specs &&
      product.specs["kids-tables"] &&
      product.specs["kids-tables"][selectedSize] &&
      product.specs["kids-tables"][selectedSize].lifting_mechanism
    ) {
      return (
        product.specs["kids-tables"][selectedSize].lifting_mechanism.length > 1 &&
        product.specs["kids-tables"][selectedSize].lifting_mechanism[1].available
      )
    }
    return false
  }

  // Get price with selected options
  const getPrice = () => {
    if (!sizes || sizes.length === 0) {
      return product.price.current
    }

    if (typeof selectedSize !== 'number' || selectedSize < 0 || selectedSize >= sizes.length) {
      return product.price.current
    }

    let price = sizes[selectedSize].price

    // Add mechanism price for beds
    if (isBed && "bed" in product && withMechanism && hasLiftingMechanism()) {
      price += product.bed[selectedSize].lifting_mechanism[1].price
    }

    // Add mechanism price for kids beds
    if (
      isKidsBed &&
      withMechanism &&
      hasLiftingMechanism() &&
      product.specs &&
      product.specs["kids-tables"] &&
      product.specs["kids-tables"][selectedSize].lifting_mechanism
    ) {
      price += product.specs["kids-tables"][selectedSize].lifting_mechanism[1].price
    }

    return price
  }

  // Get materials based on product type
  const getMaterials = (): Material[] => {
    if (isKidsBed && "specs" in product && product.specs && "materials" in product.specs) {
      return product.specs.materials || []
    }
    return []
  }

  const materials = getMaterials()

  // Get features based on product type
  const getFeatures = (): string[] => {
    if (isKidsBed && "specs" in product && product.specs && "features" in product.specs) {
      return product.specs.features || []
    }
    return []
  }

  const features = getFeatures()

  // Get installment plans
  const getInstallmentPlans = () => {
    if ("installment_plans" in product && product.installment_plans) {
      return product.installment_plans
    } else if (isKidsBed && product.specs && product.specs.installment_plans) {
      return product.specs.installment_plans
    }
    return []
  }

  const installmentPlans = getInstallmentPlans()

  // Get product images
  const images = product.images && product.images.length > 0 ? product.images : ["/placeholder.svg"]

  // Get product availability
  const availability = product.availability || "Под заказ"

  // Get manufacturing time
  const manufacturing = product.manufacturing || "Уточняйте у менеджера"

  // Get product country
  const country =
    "country" in product
      ? product.country
      : isKidsBed && product.specs && product.specs.country
        ? product.specs.country
        : "Не указано"

  // Get product warranty
  const warranty =
    "warranty" in product
      ? product.warranty
      : isKidsBed && product.specs && product.specs.warranty
        ? product.specs.warranty
        : "Не указано"

  // Get commercial offer
  const commercialOffer =
    "commercial-offer" in product
      ? product["commercial-offer"]
      : isKidsBed && product.specs && product.specs["commercial-offer"]
        ? product.specs["commercial-offer"]
        : null

  // Get product style
  const style =
    "style" in product ? product.style : isKidsBed && product.specs && product.specs.style ? product.specs.style : null

  // Get max load
  const maxLoad =
    "max_load" in product
      ? product.max_load
      : isKidsBed && product.specs && product.specs.max_load
        ? product.specs.max_load
        : null

  // Get delivery info
  const delivery =
    "delivery" in product
      ? product.delivery
      : isKidsBed && product.specs && product.specs.delivery
        ? product.specs.delivery
        : null

  // Get promotion info
  const promotion =
    "promotion" in product
      ? product.promotion
      : isKidsBed && product.specs && product.specs.promotion
        ? product.specs.promotion
        : null

  // Handle adding to cart
  const handleAddToCart = () => {
    cartDispatch({
      type: "ADD_TO_CART",
      payload: {
        id: getCartItemId(),
        product,
        quantity: 1,
        selectedSize: selectedSize,
        withMechanism: withMechanism,
        totalPrice: getPrice()
      }
    })
  }

  // Handle toggling favorites
  const toggleFavorite = () => {
    if (isFavorite) {
      favoritesDispatch({ type: "REMOVE_FROM_FAVORITES", payload: product.id })
    } else {
      favoritesDispatch({ type: "ADD_TO_FAVORITES", payload: product })
    }
  }

  // Get mechanism price
  const getMechanismPrice = () => {
    if (isBed && "bed" in product && product.bed && product.bed[selectedSize]?.lifting_mechanism?.[1]) {
      return product.bed[selectedSize].lifting_mechanism[1].price
    } else if (
      isKidsBed &&
      product.specs &&
      product.specs["kids-tables"] &&
      product.specs["kids-tables"][selectedSize]?.lifting_mechanism?.[1]
    ) {
      return product.specs["kids-tables"][selectedSize].lifting_mechanism[1].price
    }
    return 0
  }

  // Get specific features for product type
  const getSpecificFeatures = () => {
    const specificFeatures = []

    if (isSofa && "seats" in product && product.seats) {
      specificFeatures.push({
        name: "Количество мест",
        value: product.seats,
      })
    }

    if (isSofa && "isSleeper" in product) {
      specificFeatures.push({
        name: "Раскладной",
        value: product.isSleeper ? "Да" : "Нет",
      })
    }

    if (isSofa && "mechanism" in product && product.mechanism) {
      specificFeatures.push({
        name: "Механизм трансформации",
        value: product.mechanism,
      })
    }

    if (isBed && "mattressIncluded" in product) {
      specificFeatures.push({
        name: "Матрас в комплекте",
        value: product.mattressIncluded ? "Да" : "Нет",
      })
    }

    if (("hasStorage" in product && product.hasStorage !== undefined) || (isKidsBed && product.specs?.hasStorage)) {
      specificFeatures.push({
        name: "Ящик для белья",
        value: product.hasStorage || (isKidsBed && product.specs?.hasStorage) ? "Да" : "Нет",
      })
    }

    if (isBed && "frameType" in product && product.frameType) {
      specificFeatures.push({
        name: "Тип каркаса",
        value: product.frameType,
      })
    }

    if (style) {
      specificFeatures.push({
        name: "Стиль",
        value: style,
      })
    }

    if (maxLoad) {
      specificFeatures.push({
        name: "Максимальная нагрузка",
        value: `${maxLoad} кг`,
      })
    }

    specificFeatures.push({
      name: "Страна производства",
      value: country,
    })

    specificFeatures.push({
      name: "Гарантия",
      value: warranty,
    })

    return specificFeatures
  }

  // Get dimensions based on product type
  const getDimensions = () => {
    if (isKidsBed && "specs" in product && product.specs && "sleepingPlace" in product.specs) {
      return product.specs.sleepingPlace
    }
    return null
  }

  const dimensions = getDimensions()

  // Добавляем товар в недавно просмотренные при загрузке компонента
  React.useEffect(() => {
    recentlyViewedDispatch({ type: "ADD_TO_RECENTLY_VIEWED", payload: product })
  }, [product, recentlyViewedDispatch])

  if (!product) {
    return <div className={styles.loading}>Загрузка...</div>
  }

  return (
    <div className={styles.container}>
      <div className={styles.productPage}>
        {/* Breadcrumbs */}
        <div className={styles.breadcrumbs}>
          <Link href="/" className={styles.breadcrumbLink}>
            Главная
          </Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <Link href="/catalog" className={styles.breadcrumbLink}>
            Каталог
          </Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <Link href={`/catalog?category=${product.category}`} className={styles.breadcrumbLink}>
            {product.category === "sofa"
              ? "Диваны"
              : product.category === "bed"
                ? "Кровати"
                : product.category === "kids"
                  ? "Детские кровати"
                  : "Товары"}
          </Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span className={styles.breadcrumbCurrent}>{product.name}</span>
        </div>

        <div className={styles.productContainer}>
          {/* Left Column - Gallery */}
          <div className={styles.productGallery}>
            <div
              className={`${styles.mainImageWrapper} ${isZoomed ? styles.zoomed : ""}`}
              ref={imageRef}
              onClick={toggleZoom}
              onMouseMove={handleImageZoom}
              onMouseLeave={() => setIsZoomed(false)}
            >
              <img
                ref={mainImageRef}
                src={images[activeImageIndex] || "/placeholder.svg"}
                alt={product.name}
                className={styles.mainImage}
                style={
                  isZoomed
                    ? {
                      transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      transform: "scale(2.5)",
                    }
                    : {}
                }
              />
              {!isZoomed && (
                <div className={styles.zoomIcon}>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="11" y1="8" x2="11" y2="14" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className={styles.thumbnails}>
                {images.map((image, index) => (
                  <div
                    key={index}
                    className={`${styles.thumbnail} ${activeImageIndex === index ? styles.active : ""}`}
                    onClick={() => setActiveImageIndex(index)}
                  >
                    <img src={image || "/placeholder.svg"} alt={`${product.name} - вид ${index + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Product Info */}
          <div className={styles.productInfo}>
            <h1 className={styles.productTitle}>{product.name}</h1>

            <div className={styles.productMeta}>
              <div className={styles.productCode}>
                <span className={styles.codeLabel}>Артикул:</span>
                <span className={styles.codeValue}>{product.id}</span>
              </div>
            </div>

            <div className={styles.availability}>
              <span
                className={`${styles.statusIndicator} ${availability === "В наличии" ? styles.inStock : styles.onOrder}`}
              ></span>
              <span className={styles.statusText}>
                {availability}
                {manufacturing && availability !== "В наличии" && ` (${manufacturing})`}
              </span>
            </div>

            <div className={styles.priceBlock}>
              <div className={styles.priceDisplay}>
                <span className={styles.currentPrice}>{formatPrice(getPrice())} ₽</span>
                {product.price.old && <span className={styles.oldPrice}>{formatPrice(product.price.old)} ₽</span>}
                {product.price.old && (
                  <span className={styles.discount}>
                    -{Math.round(((product.price.old - product.price.current) / product.price.old) * 100)}%
                  </span>
                )}
              </div>
            </div>

            {/* Options Section */}
            <div className={styles.optionsSection}>
              {/* Size Options */}
              {sizes.length > 0 && (
                <div className={styles.optionGroup}>
                  <h3 className={styles.optionTitle}>Размер:</h3>
                  <div className={styles.sizeOptions}>
                    {sizes.map((size, index) => (
                      <button
                        key={index}
                        className={`${styles.sizeOption} ${selectedSize === index ? styles.active : ""}`}
                        onClick={() => {
                          setSelectedSize(index)
                          setWithMechanism(false) // Reset mechanism when changing size
                        }}
                      >
                        <span className={styles.sizeText}>
                          {size.width}x{size.length} см
                        </span>
                        {size.price !== product.price.current && (
                          <span className={styles.sizePriceDiff}>
                            {size.price > product.price.current ? "+" : ""}
                            {formatPrice(size.price - product.price.current)} ₽
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Lifting Mechanism Option */}
              {hasLiftingMechanism() && (
                <div className={styles.optionGroup}>
                  <h3 className={styles.optionTitle}>Дополнительные опции:</h3>
                  <label className={styles.checkboxOption}>
                    <input
                      type="checkbox"
                      checked={withMechanism}
                      onChange={() => setWithMechanism(!withMechanism)}
                      className={styles.checkboxInput}
                    />
                    <span className={styles.customCheckbox}></span>
                    <span className={styles.checkboxLabel}>
                      Подъемный механизм
                      <span className={styles.optionPrice}>+{formatPrice(getMechanismPrice())} ₽</span>
                    </span>
                  </label>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className={styles.actions}>
              <Button
                onClick={isInCart ? () => window.location.href = '/cart' : handleAddToCart}
                className={styles.addToCartButton}
              >
                {isInCart ? (
                  <>
                    <Check size={20} />
                    В корзине
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} />
                    В корзину
                  </>
                )}
              </Button>
              <button
                className={`${styles.favoriteButton} ${isFavorite ? styles.favoriteActive : ''}`}
                onClick={toggleFavorite}
              >
                <Heart size={20} fill={isFavorite ? "#FF4D4D" : "none"} color={isFavorite ? "#FF4D4D" : "#333"} />
              </button>
            </div>

            {product.characteristics && (
              <div className={styles.characteristics}>
                <h3 className={styles.characteristicsTitle}>Характеристики</h3>
                <ul className={styles.characteristicsList}>
                  {Object.entries(product.characteristics).map(([key, value]) => (
                    <li key={key} className={styles.characteristicsItem}>
                      <span className={styles.characteristicsKey}>{key}:</span>
                      <span className={styles.characteristicsValue}>{value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Tabs */}
      <div className={styles.productTabs}>
        <div className={styles.tabsHeader}>
          <button
            className={`${styles.tabButton} ${activeTab === "description" ? styles.active : ""}`}
            onClick={() => setActiveTab("description")}
          >
            Описание
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === "specifications" ? styles.active : ""}`}
            onClick={() => setActiveTab("specifications")}
          >
            Характеристики
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === "delivery" ? styles.active : ""}`}
            onClick={() => setActiveTab("delivery")}
          >
            Доставка и оплата
          </button>
        </div>

        <div className={styles.tabContent}>
          {/* Description Tab */}
          {activeTab === "description" && (
            <div className={styles.descriptionTab}>
              <div className={styles.descriptionText}>
                <p>{product.description}</p>
              </div>

              {features && features.length > 0 && (
                <div className={styles.featuresSection}>
                  <h3 className={styles.sectionTitle}>Особенности</h3>
                  <ul className={styles.featuresList}>
                    {features.map((feature, index) => (
                      <li key={index} className={styles.featureItem}>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {commercialOffer && (
                <div className={styles.commercialOfferSection}>
                  <h3 className={styles.sectionTitle}>Коммерческое предложение</h3>
                  <div className={styles.commercialOfferContent}>{commercialOffer}</div>
                </div>
              )}
            </div>
          )}

          {/* Specifications Tab */}
          {activeTab === "specifications" && (
            <div className={styles.specificationsTab}>
              <div className={styles.specificationsGrid}>
                {/* Main Specifications */}
                <div className={styles.specificationGroup}>
                  <h3 className={styles.sectionTitle}>Основные характеристики</h3>
                  <table className={styles.specTable}>
                    <tbody>
                      {getSpecificFeatures().map((feature, index) => (
                        <tr key={index} className={styles.specRow}>
                          <td className={styles.specName}>{feature.name}</td>
                          <td className={styles.specValue}>{feature.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Dimensions */}
                {dimensions && (
                  <div className={styles.specificationGroup}>
                    <h3 className={styles.sectionTitle}>Габариты</h3>
                    <table className={styles.specTable}>
                      <tbody>
                        {dimensions.width && (
                          <tr className={styles.specRow}>
                            <td className={styles.specName}>Ширина</td>
                            <td className={styles.specValue}>{dimensions.width} см</td>
                          </tr>
                        )}
                        {dimensions.height && (
                          <tr className={styles.specRow}>
                            <td className={styles.specName}>Высота</td>
                            <td className={styles.specValue}>{dimensions.height} см</td>
                          </tr>
                        )}
                        {dimensions.depth && (
                          <tr className={styles.specRow}>
                            <td className={styles.specName}>Глубина</td>
                            <td className={styles.specValue}>{dimensions.depth} см</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Size Options */}
                {sizes.length > 0 && (
                  <div className={styles.specificationGroup}>
                    <h3 className={styles.sectionTitle}>Доступные размеры</h3>
                    <table className={styles.specTable}>
                      <thead>
                        <tr>
                          <th>Размер</th>
                          <th>Цена</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sizes.map((size, index) => (
                          <tr key={index} className={styles.specRow}>
                            <td className={styles.specName}>
                              {size.width}x{size.length} см
                            </td>
                            <td className={styles.specValue}>{formatPrice(size.price)} ₽</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Delivery Tab */}
          {activeTab === "delivery" && (
            <div className={styles.deliveryTab}>
              <div className={styles.deliveryGrid}>
                {/* Delivery Information */}
                <div className={styles.deliverySection}>
                  <h3 className={styles.sectionTitle}>Доставка</h3>
                  {delivery ? (
                    <div className={styles.deliveryInfo}>
                      <p className={styles.deliveryStatus}>
                        Доставка: <strong>{delivery.available ? "Доступна" : "Недоступна"}</strong>
                      </p>
                      {delivery.available && (
                        <>
                          {delivery.cost && (
                            <p className={styles.deliveryCost}>
                              <strong>Стоимость доставки:</strong> {delivery.cost}
                            </p>
                          )}
                          {delivery.time && (
                            <p className={styles.deliveryTime}>
                              <strong>Сроки доставки:</strong> {delivery.time}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  ) : (
                    <div className={styles.deliveryInfo}>
                      <p>
                        Доставка осуществляется по всей территории России. Стоимость доставки рассчитывается
                        индивидуально в зависимости от региона.
                      </p>
                      <p>Для уточнения деталей доставки, пожалуйста, свяжитесь с нашими менеджерами.</p>
                    </div>
                  )}

                  <div className={styles.deliveryNotes}>
                    <h4>Важная информация:</h4>
                    <ul>
                      <li>Доставка осуществляется до подъезда</li>
                      <li>Подъем на этаж оплачивается отдельно</li>
                      <li>Сборка мебели не входит в стоимость доставки</li>
                    </ul>
                  </div>
                </div>

                {/* Payment Information */}
                <div className={styles.paymentSection}>
                  <h3 className={styles.sectionTitle}>Оплата</h3>
                  <div className={styles.paymentMethods}>
                    <div className={styles.paymentMethod}>
                      <div className={styles.paymentIcon}>
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="2" y="4" width="20" height="16" rx="2" />
                          <line x1="2" y1="10" x2="22" y2="10" />
                        </svg>
                      </div>
                      <div className={styles.paymentInfo}>
                        <h4>Банковской картой</h4>
                        <p>Оплата картой при получении или онлайн на сайте</p>
                      </div>
                    </div>

                    <div className={styles.paymentMethod}>
                      <div className={styles.paymentIcon}>
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="2" y="6" width="20" height="12" rx="2" />
                          <circle cx="12" cy="12" r="2" />
                          <path d="M6 12h.01M18 12h.01" />
                        </svg>
                      </div>
                      <div className={styles.paymentInfo}>
                        <h4>Наличными</h4>
                        <p>Оплата наличными при получении</p>
                      </div>
                    </div>

                    {installmentPlans && installmentPlans.length > 0 && (
                      <div className={styles.paymentMethod}>
                        <div className={styles.paymentIcon}>
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                          </svg>
                        </div>
                        <div className={styles.paymentInfo}>
                          <h4>Рассрочка и кредит</h4>
                          <p>
                            Доступны различные варианты рассрочки и кредита от{" "}
                            {installmentPlans.map((plan) => plan.bank).join(", ")}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {installmentPlans && installmentPlans.length > 0 && (
                    <div className={styles.installmentPlans}>
                      <h4>Варианты рассрочки:</h4>
                      <div className={styles.installmentTable}>
                        <table>
                          <thead>
                            <tr>
                              <th>Банк</th>
                              <th>Срок</th>
                              <th>Процент</th>
                            </tr>
                          </thead>
                          <tbody>
                            {installmentPlans.map((plan, index) => (
                              <tr key={index}>
                                <td>{plan.bank}</td>
                                <td>{plan.installment.duration_months} мес.</td>
                                <td>{plan.installment.interest}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Similar Products Section */}
      <SimilarProducts
        currentProductId={product.id}
        category={product.category}
        products={allProducts}
        limit={4}
      />
    </div>
  )
}

export default ProductDetail
