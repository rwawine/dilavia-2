"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Heart, ShoppingCart, Check } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ProductData, SofaData, BedData, KidsBedData, Size, Material } from "@/shared/api/types"
import { Button } from "@/shared/ui/button/Button"
import { formatPrice } from "@/shared/utils/formatPrice"
import { useCart } from "@/entities/cart/model/cartContext"
import { useFavorites } from "@/entities/favorites/model/favoritesContext"
import SimilarProducts from "@/widgets/similar-products/ui/SimilarProducts"
import styles from "./ProductDetail.module.css"
import type { CartItem } from "@/entities/cart/model/types"

interface ProductDetailProps {
  product: SofaData | BedData | KidsBedData
  allProducts: ProductData[]
}

interface InstallmentPlan {
  bank: string
  installment: {
    duration_months: number
    interest: string
    additional_fees?: string
  }
  credit?: {
    duration_months: number
    interest: string
  }
}

interface FavoriteItem {
  id: string
  product: ProductData
}

interface ProductSize {
  width: number
  length: number
  height?: number | null
  price: number
  lifting_mechanism?: {
    available: boolean
    price: number
  }[]
}

interface SofaSizes {
  sofa: ProductSize[]
  materials?: Material[]
  features?: string[]
  installment_plans?: InstallmentPlan[]
  country?: string
  warranty?: string
  "commercial-offer"?: string
  style?: string
  color?: string
  delivery?: {
    available: boolean
    cost: string
    time: string
  }
}

interface BedSizes {
  bed: ProductSize[]
}

interface ProductWithCategory extends ProductData {
  "category-ru"?: string
  subcategory?: string
  "subcategory-ru"?: string
  bed?: ProductSize[]
  "kids-tables"?: ProductSize[]
  materials?: Material[]
  features?: string[]
  style?: string
  color?: string
  country?: string
  warranty?: string
  "commercial-offer"?: string
  delivery?: {
    available: boolean
    cost: string
    time: string
  }
  installment_plans?: InstallmentPlan[]
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product, allProducts }) => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("specifications")
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
  const [selectedSize, setSelectedSize] = useState<number>(0)
  const [withMechanism, setWithMechanism] = useState(false)
  const [totalPrice, setTotalPrice] = useState(product.price.current)

  const imageRef = React.useRef<HTMLDivElement>(null)
  const mainImageRef = React.useRef<HTMLImageElement>(null)

  const { state: cartState, dispatch: cartDispatch } = useCart()
  const { state: favoritesState, dispatch: favoritesDispatch } = useFavorites()

  const getSizes = (): ProductSize[] => {
    if (isSofa && "sizes" in product && product.sizes?.sofa) {
      return product.sizes.sofa
    }
    if (isBed && "bed" in product && product.bed) {
      return product.bed
    }
    if (isKidsBed && "kids-tables" in product) {
      const kidsTables = (product as ProductWithCategory)["kids-tables"]
      if (kidsTables && Array.isArray(kidsTables)) {
        return kidsTables
      }
    }
    return []
  }

  const isSofa = product.category === "sofa"
  const isBed = product.category === "bed"
  const isKidsBed = product.category === "kids-tables"

  console.log('Product category:', {
    category: product.category,
    isSofa,
    isBed,
    isKidsBed,
    sizes: getSizes()
  })

  const sizes = getSizes()

  const getLiftingMechanism = useCallback(() => {
    const isBed = product.category === "bed"
    const isKidsBed = product.category === "kids-tables"

    if (isBed && "bed" in product && Array.isArray((product as BedData).bed)) {
      return (product as any).bed[selectedSize]?.lifting_mechanism
    } else if (isKidsBed && "kids-tables" in product) {
      return (product as any)["kids-tables"][selectedSize]?.lifting_mechanism
    }
    return null
  }, [product, selectedSize])

  const liftingMechanism = getLiftingMechanism()

  const getCartItemId = () => {
    if (!sizes || sizes.length === 0 || typeof selectedSize !== 'number' || selectedSize < 0 || selectedSize >= sizes.length) {
      return product.id
    }
    const size = sizes[selectedSize]
    const mechanismSuffix = withMechanism ? '-with-mechanism' : '-no-mechanism'
    return `${product.id}-${size.width}x${size.length}${mechanismSuffix}`
  }

  const isInCart = cartState.items.some((item) => {
    if (!sizes || sizes.length === 0 || typeof selectedSize !== 'number' || selectedSize < 0 || selectedSize >= sizes.length) {
      return item.product.id === product.id
    }
    const size = sizes[selectedSize]
    const itemId = getCartItemId()
    return item.id === itemId
  })

  const isFavorite = favoritesState.items.some((item: FavoriteItem) => item.id === product.id)

  const handleImageZoom = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed || !imageRef.current || !mainImageRef.current) return

    const { left, top, width, height } = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100

    setZoomPosition({ x, y })
  }

  const toggleZoom = () => {
    setIsZoomed(!isZoomed)
  }

  const getPrice = useCallback(() => {
    let totalPrice = 0

    if (product.category === "bed" && "bed" in product && Array.isArray((product as BedData).bed)) {
      totalPrice = (product as any).bed[selectedSize]?.price || 0
      if (withMechanism && (product as any).bed[selectedSize]?.lifting_mechanism?.[1]?.price) {
        totalPrice += (product as any).bed[selectedSize].lifting_mechanism[1].price
      }
    } else if (product.category === "kids-tables" && "kids-tables" in product) {
      totalPrice = (product as any)["kids-tables"][selectedSize]?.price || 0
      if (withMechanism && (product as any)["kids-tables"][selectedSize]?.lifting_mechanism?.[1]?.price) {
        totalPrice += (product as any)["kids-tables"][selectedSize].lifting_mechanism[1].price
      }
    } else {
      totalPrice = product.price.current
    }

    return totalPrice
  }, [product, selectedSize, withMechanism])

  // Обновляем цену при изменении размера или механизма
  useEffect(() => {
    const newPrice = getPrice()
    setTotalPrice(newPrice)
  }, [selectedSize, withMechanism, isKidsBed, isBed])

  const getMaterials = () => {
    if (isSofa && "sizes" in product && (product.sizes as SofaSizes).materials) {
      return (product.sizes as SofaSizes).materials
    }
    if ((isBed || isKidsBed) && "materials" in product) {
      return (product as ProductWithCategory).materials || []
    }
    return []
  }

  const materials = getMaterials()

  const getFeatures = () => {
    if (isSofa && "sizes" in product && (product.sizes as SofaSizes).features) {
      return (product.sizes as SofaSizes).features
    }
    if ((isBed || isKidsBed) && "features" in product) {
      return (product as ProductWithCategory).features || []
    }
    return []
  }

  const features = getFeatures()

  const getInstallmentPlans = () => {
    if (isSofa && "sizes" in product && (product.sizes as SofaSizes).installment_plans) {
      return (product.sizes as SofaSizes).installment_plans
    }
    if ((isBed || isKidsBed) && "installment_plans" in product) {
      return (product as ProductWithCategory).installment_plans || []
    }
    return []
  }

  const installmentPlans = getInstallmentPlans()

  const images = product.images && product.images.length > 0 ? product.images : ["/placeholder.svg"]
  const availability = product.availability || "Под заказ"
  const manufacturing = product.manufacturing || "Уточняйте у менеджера"
  const country = isSofa && "sizes" in product ? (product.sizes as SofaSizes).country : (product as ProductWithCategory).country || "Не указано"
  const warranty = isSofa && "sizes" in product ? (product.sizes as SofaSizes).warranty : (product as ProductWithCategory).warranty || "Не указано"
  const commercialOffer = isSofa && "sizes" in product ? (product.sizes as SofaSizes)["commercial-offer"] : (product as ProductWithCategory)["commercial-offer"] || null
  const style = isSofa && "sizes" in product ? (product.sizes as SofaSizes).style : (product as ProductWithCategory).style || null
  const delivery = isSofa && "sizes" in product ? (product.sizes as SofaSizes).delivery : (product as ProductWithCategory).delivery || null

  const handleAddToCart = () => {
    if (!sizes || sizes.length === 0 || typeof selectedSize !== 'number' || selectedSize < 0 || selectedSize >= sizes.length) {
      cartDispatch({
        type: "ADD_TO_CART",
        payload: {
          id: product.id,
          product,
          quantity: 1,
          selectedSize: null,
          withMechanism: false,
          totalPrice: product.price.current
        }
      })
      return
    }
    const size = sizes[selectedSize]
    const itemId = getCartItemId()
    cartDispatch({
      type: "ADD_TO_CART",
      payload: {
        id: itemId,
        product,
        quantity: 1,
        selectedSize: {
          width: size.width,
          length: size.length,
          price: size.price
        },
        withMechanism,
        totalPrice: getPrice()
      }
    })
  }

  const toggleFavorite = () => {
    if (isFavorite) {
      favoritesDispatch({ type: "REMOVE_FROM_FAVORITES", payload: product.id })
    } else {
      favoritesDispatch({ type: "ADD_TO_FAVORITES", payload: { id: product.id, product } })
    }
  }

  const getSpecificFeatures = () => {
    const specificFeatures = []

    if (isSofa && "sizes" in product) {
      const sofaSizes = product.sizes as SofaSizes
      if (sofaSizes.features) {
        specificFeatures.push(...sofaSizes.features.map(feature => ({
          name: feature.split(":")[0],
          value: feature.split(":")[1]?.trim() || "Да"
        })))
      }

      if (sofaSizes.style) {
        specificFeatures.push({
          name: "Стиль",
          value: sofaSizes.style
        })
      }

      if (sofaSizes.color) {
        specificFeatures.push({
          name: "Цвет",
          value: sofaSizes.color
        })
      }
    }

    specificFeatures.push({
      name: "Страна производства",
      value: country
    })

    specificFeatures.push({
      name: "Гарантия",
      value: warranty
    })

    return specificFeatures
  }

  const getCategoryLink = () => {
    const category = product.category
    const subcategory = (product as ProductWithCategory).subcategory
    const subcategoryRu = (product as ProductWithCategory)["subcategory-ru"]

    if (!category) return "/catalog"

    let link = `/catalog?category=${category}`

    // For sofas, add sofaTypes parameter with all available types and selected type
    if (category === "sofa") {
      // Get all available sofa types from allProducts
      const allSofaTypes = allProducts
        .filter(p => p.category === "sofa" && "subcategory-ru" in p)
        .map(p => (p as ProductWithCategory)["subcategory-ru"])
        .filter((value, index, self) => value && self.indexOf(value) === index)
        .join(",")

      if (allSofaTypes) {
        // Add all available types to show in filters
        link += `&sofaTypes=${encodeURIComponent(allSofaTypes)}`

        // Add selected type to filter
        if (subcategoryRu) {
          link += `&selectedSofaType=${encodeURIComponent(subcategoryRu)}`
        }
      }
    }
    // For other categories, add subcategory if exists
    else if (subcategory) {
      link += `&subcategory=${subcategory}`
    }

    return link
  }

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
          <Link href={getCategoryLink()} className={styles.breadcrumbLink}>
            {(product as ProductWithCategory)["category-ru"] || "Товары"}
          </Link>
          {(product as ProductWithCategory)["subcategory-ru"] && (
            <>
              <span className={styles.breadcrumbSeparator}>/</span>
              <Link href={getCategoryLink()} className={styles.breadcrumbLink}>
                {(product as ProductWithCategory)["subcategory-ru"]}
              </Link>
            </>
          )}
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
                <span className={styles.currentPrice}>{formatPrice(totalPrice)} ₽</span>
                {product.price.old && <span className={styles.oldPrice}>{formatPrice(product.price.old)} ₽</span>}
                {product.price.old && (
                  <span className={styles.discount}>
                    -{Math.round(((product.price.old - totalPrice) / product.price.old) * 100)}%
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
                          if (isSofa) {
                            setWithMechanism(false)
                          }
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

              {/* Lifting Mechanism Options */}
              {liftingMechanism && liftingMechanism.length > 1 && liftingMechanism[1]?.available && (
                <div className={styles.optionGroup}>
                  <h3 className={styles.optionTitle}>Подъемный механизм:</h3>
                  <div className={styles.mechanismOptions}>
                    <label className={styles.mechanismCheckbox}>
                      <input
                        type="checkbox"
                        checked={withMechanism}
                        onChange={() => {
                          setWithMechanism(!withMechanism)
                          const newPrice = getPrice()
                          setTotalPrice(newPrice)
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className={styles.mechanismText}>
                        С подъемным механизмом
                      </span>
                      {liftingMechanism[1]?.price > 0 && (
                        <span className={styles.mechanismPriceDiff}>
                          +{formatPrice(liftingMechanism[1].price)} ₽
                        </span>
                      )}
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className={styles.actionButtons}>
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
          </div>
        </div>
      </div>

      {/* Product Tabs */}
      <div className={styles.productTabs}>
        <div className={styles.tabsHeader}>
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

                {/* Materials */}
                {materials && materials.length > 0 && (
                  <div className={styles.specificationGroup}>
                    <h3 className={styles.sectionTitle}>Материалы</h3>
                    <table className={styles.specTable}>
                      <tbody>
                        {materials.map((material, index) => (
                          <tr key={index} className={styles.specRow}>
                            <td className={styles.specName}>{material.localizedTitles.ru}</td>
                            <td className={styles.specValue}>{material.type}</td>
                          </tr>
                        ))}
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
