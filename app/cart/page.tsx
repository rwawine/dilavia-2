"use client"

import type React from "react"

import { useEffect, useState, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Button from "@/shared/ui/button/Button"
import Input from "@/shared/ui/input/Input"
import { useCart } from "@/entities/cart/model/cartContext"
import { useFabricCart } from "@/entities/fabric-cart/model/fabricCartContext"
import styles from "./page.module.css"

// Mock promo codes for demonstration
const PROMO_CODES = {
  МЕБЕЛЬ15: { discount: 0.15, description: "Скидка 15% на весь заказ" },
  ДИВАН10: { discount: 0.1, description: "Скидка 10% на весь заказ" },
  ДОСТАВКА: { discount: 0, freeShipping: true, description: "Бесплатная доставка" },
}

// Delivery methods
const DELIVERY_METHODS = [
  { id: "courier", name: "Курьерская доставка", price: 300 },
  { id: "pickup", name: "Самовывоз", price: 0 },
  { id: "express", name: "Экспресс-доставка (1-2 дня)", price: 500 },
]

// Payment methods
const PAYMENT_METHODS = [
  { id: "cash", name: "Наличными при получении" },
  { id: "card", name: "Банковской картой" },
  { id: "online", name: "Онлайн на сайте" },
  { id: "installment", name: "Рассрочка" },
  { id: "credit", name: "Кредит" },
]

// Social media options
const SOCIAL_MEDIA = [
  { id: "telegram", name: "Telegram" },
  { id: "viber", name: "Viber" },
  { id: "whatsapp", name: "WhatsApp" },
  { id: "vk", name: "ВКонтакте" },
]

export default function CartPage() {
  const router = useRouter()
  const { state: furnitureCartState, dispatch: furnitureCartDispatch } = useCart()
  const { state: fabricCartState, dispatch: fabricCartDispatch } = useFabricCart()
  const [isClient, setIsClient] = useState(false)
  const [promoCode, setPromoCode] = useState("")
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null)
  const [promoError, setPromoError] = useState<string | null>(null)
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null)
  const [shippingCost, setShippingCost] = useState(300) // Default shipping cost
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [showCheckoutForm, setShowCheckoutForm] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Form data
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    deliveryMethod: "courier",
    address: "",
    city: "",
    socialMedia: "telegram",
    socialMediaUsername: "",
    paymentMethod: "card",
  })

  // Функция для отображения полноразмерного изображения ткани
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  // Безопасное получение данных из контекстов
  const furnitureItems = furnitureCartState?.items || []
  const fabricItems = fabricCartState?.items || []

  // Общая корзина (мебель + ткани)
  const cartIsEmpty = furnitureItems.length === 0 && fabricItems.length === 0

  // Общая сумма корзины (только мебель, ткани бесплатны)
  const totalCartPrice = furnitureCartState?.totalPrice || 0
  const totalCartItems = (furnitureCartState?.totalItems || 0) + (fabricCartState?.totalItems || 0)

  // Fix hydration issues
  useEffect(() => {
    setIsClient(true)
  }, [])

  const furnitureCartIsEmpty = furnitureItems.length === 0
  const fabricCartIsEmpty = fabricItems.length === 0

  const handleRemoveFurnitureItem = useCallback(
    (id: string) => {
      if (furnitureCartDispatch) {
        furnitureCartDispatch({ type: "REMOVE_FROM_CART", payload: id })
      }
    },
    [furnitureCartDispatch],
  )

  const handleUpdateFurnitureQuantity = useCallback(
    (id: string, quantity: number) => {
      if (furnitureCartDispatch) {
        furnitureCartDispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } })
      }
    },
    [furnitureCartDispatch],
  )

  const handleRemoveFabricItem = useCallback(
    (id: string) => {
      if (fabricCartDispatch) {
        fabricCartDispatch({ type: "REMOVE_FROM_CART", payload: id })
      }
    },
    [fabricCartDispatch],
  )

  const handleUpdateFabricQuantity = useCallback(
    (id: string, quantity: number) => {
      if (fabricCartDispatch) {
        fabricCartDispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } })
      }
    },
    [fabricCartDispatch],
  )

  const handleClearCart = useCallback(() => {
    if ((furnitureItems.length > 0 || fabricItems.length > 0) && furnitureCartDispatch && fabricCartDispatch) {
      furnitureCartDispatch({ type: "CLEAR_CART" })
      fabricCartDispatch({ type: "CLEAR_CART" })
    }
    setAppliedPromo(null)
    setShippingCost(300)
  }, [furnitureCartDispatch, fabricCartDispatch, furnitureItems.length, fabricItems.length])

  const handleApplyPromoCode = useCallback(() => {
    // Reset messages
    setPromoError(null)
    setPromoSuccess(null)

    if (!promoCode.trim()) {
      setPromoError("Введите промокод")
      return
    }

    const normalizedCode = promoCode.trim().toUpperCase()

    if (normalizedCode in PROMO_CODES) {
      setAppliedPromo(normalizedCode)
      setPromoCode("")
      setPromoSuccess(`Промокод ${normalizedCode} успешно применен!`)

      // Apply free shipping if applicable
      if (PROMO_CODES[normalizedCode as keyof typeof PROMO_CODES].freeShipping) {
        setShippingCost(0)
      }
    } else {
      setPromoError("Недействительный промокод")
    }
  }, [promoCode])

  const handleRemovePromoCode = useCallback(() => {
    setAppliedPromo(null)
    setShippingCost(300) // Reset shipping cost
    setPromoSuccess(null)
  }, [])

  const handleProceedToCheckout = useCallback(() => {
    setShowCheckoutForm(true)
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target
      setFormData((prev) => ({ ...prev, [name]: value }))

      // Clear error for this field if it exists
      if (formErrors[name]) {
        setFormErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors[name]
          return newErrors
        })
      }

      // Update shipping cost when delivery method changes
      if (name === "deliveryMethod") {
        const selectedMethod = DELIVERY_METHODS.find((method) => method.id === value)
        if (selectedMethod && !appliedPromo) {
          setShippingCost(selectedMethod.price)
        }
      }
    },
    [appliedPromo, formErrors],
  )

  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      errors.fullName = "Пожалуйста, введите ФИО"
    }

    if (!formData.phone.trim()) {
      errors.phone = "Пожалуйста, введите номер телефона"
    } else if (!/^\+?[0-9]{10,15}$/.test(formData.phone.replace(/\s+/g, ""))) {
      errors.phone = "Пожалуйста, введите корректный номер телефона"
    }

    if (formData.deliveryMethod !== "pickup" && !formData.address.trim()) {
      errors.address = "Пожалуйста, введите адрес доставки"
    }

    if (formData.deliveryMethod !== "pickup" && !formData.city.trim()) {
      errors.city = "Пожалуйста, введите город"
    }

    if (!formData.socialMediaUsername.trim()) {
      errors.socialMediaUsername = "Пожалуйста, введите имя пользователя"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }, [formData])

  const handleSubmitOrder = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()

      if (!validateForm()) {
        return
      }

      // Show success message
      setOrderSuccess(true)

      // Clear cart after 2 seconds and redirect to success page
      setTimeout(() => {
        if (furnitureCartDispatch && fabricCartDispatch) {
          furnitureCartDispatch({ type: "CLEAR_CART" })
          fabricCartDispatch({ type: "CLEAR_CART" })
        }
        router.push("/success")
      }, 2000)
    },
    [validateForm, furnitureCartDispatch, fabricCartDispatch, router],
  )

  // Calculate discount amount
  const getDiscountAmount = useCallback(() => {
    if (!appliedPromo) return 0

    const promoInfo = PROMO_CODES[appliedPromo as keyof typeof PROMO_CODES]
    if (promoInfo.discount) {
      return Math.round(totalCartPrice * promoInfo.discount)
    }
    return 0
  }, [appliedPromo, totalCartPrice])

  // Calculate final total
  const getFinalTotal = useCallback(() => {
    const discount = getDiscountAmount()
    return (
      totalCartPrice -
      discount +
      (appliedPromo && PROMO_CODES[appliedPromo as keyof typeof PROMO_CODES].freeShipping ? 0 : shippingCost)
    )
  }, [appliedPromo, totalCartPrice, shippingCost, getDiscountAmount])

  const handleOpenImage = (imageUrl: string) => {
    setSelectedImage(imageUrl)
  }

  const handleCloseImage = () => {
    setSelectedImage(null)
  }

  if (!isClient) {
    return null
  }

  if (orderSuccess) {
    return (
      <div className="container">
        <div className={styles.orderSuccess}>
          <div className={styles.successIcon}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999"
                stroke="#2ecc71"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M22 4L12 14.01L9 11.01"
                stroke="#2ecc71"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className={styles.successTitle}>Заказ успешно оформлен!</h2>
          <p className={styles.successMessage}>Перенаправление на страницу подтверждения...</p>
          <div className={styles.loader}></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <h1 className={styles.title}>Корзина</h1>

      {/* Модальное окно для просмотра изображения */}
      {selectedImage && (
        <div className={styles.imageModal} onClick={handleCloseImage}>
          <div className={styles.imageModalContent}>
            <button className={styles.closeModalButton} onClick={handleCloseImage}>
              ×
            </button>
            <Image
              src={selectedImage || "/placeholder.svg"}
              alt="Увеличенное изображение ткани"
              width={800}
              height={800}
              className={styles.modalImage}
            />
          </div>
        </div>
      )}

      {cartIsEmpty ? (
        <div className={styles.emptyCart}>
          <div className={styles.emptyCartIcon}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className={styles.emptyCartTitle}>Ваша корзина пуста</h2>
          <p className={styles.emptyCartText}>Добавьте товары в корзину, чтобы оформить заказ</p>
          <Link href="/catalog">
            <Button size="lg">Перейти в каталог</Button>
          </Link>
        </div>
      ) : showCheckoutForm ? (
        <div className={styles.checkoutContainer}>
          <div className={styles.checkoutForm}>
            <h2 className={styles.checkoutTitle}>Оформление заказа</h2>
            <form onSubmit={handleSubmitOrder}>
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Контактная информация</h3>
                <div className={styles.formGroup}>
                  <Input
                    label="ФИО"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    error={formErrors.fullName}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <Input
                    label="Номер телефона"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    error={formErrors.phone}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.selectLabel}>Социальная сеть для связи</label>
                  <div className={styles.socialMediaInputs}>
                    <select
                      name="socialMedia"
                      value={formData.socialMedia}
                      onChange={handleInputChange}
                      className={styles.select}
                    >
                      {SOCIAL_MEDIA.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                    <Input
                      placeholder={`Имя пользователя в ${
                        SOCIAL_MEDIA.find((sm) => sm.id === formData.socialMedia)?.name
                      }`}
                      name="socialMediaUsername"
                      value={formData.socialMediaUsername}
                      onChange={handleInputChange}
                      error={formErrors.socialMediaUsername}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Способ доставки</h3>
                <div className={styles.deliveryOptions}>
                  {DELIVERY_METHODS.map((method) => (
                    <label key={method.id} className={styles.radioLabel}>
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value={method.id}
                        checked={formData.deliveryMethod === method.id}
                        onChange={handleInputChange}
                      />
                      <div className={styles.radioContent}>
                        <div className={styles.radioTitle}>{method.name}</div>
                        <div className={styles.radioPrice}>
                          {method.price === 0 ? "Бесплатно" : `${method.price} руб.`}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {formData.deliveryMethod !== "pickup" && (
                <div className={styles.formSection}>
                  <h3 className={styles.sectionTitle}>Адрес доставки</h3>
                  <div className={styles.formGroup}>
                    <Input
                      label="Город"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      error={formErrors.city}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <Input
                      label="Адрес"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      error={formErrors.address}
                      required
                    />
                  </div>
                </div>
              )}

              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Способ оплаты</h3>
                <div className={styles.paymentOptions}>
                  {PAYMENT_METHODS.map((method) => (
                    <label key={method.id} className={styles.radioLabel}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={formData.paymentMethod === method.id}
                        onChange={handleInputChange}
                      />
                      <div className={styles.radioContent}>
                        <div className={styles.radioTitle}>{method.name}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.formActions}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCheckoutForm(false)}
                  className={styles.backButton}
                >
                  Назад к корзине
                </Button>
                <Button type="submit" variant="primary" className={styles.submitButton}>
                  Оформить заказ
                </Button>
              </div>
            </form>
          </div>

          <div className={styles.orderSummary}>
            <h3 className={styles.summaryTitle}>Ваш заказ</h3>
            <div className={styles.summaryItems}>
              {furnitureItems.length > 0 && (
                <>
                  <div className={styles.summaryCategory}>Мебель:</div>
                  {furnitureItems.map((item) => (
                    <div key={item.id} className={styles.summaryItem}>
                      <div className={styles.summaryItemInfo}>
                        <span className={styles.summaryItemName}>{item.product.name}</span>
                        <span className={styles.summaryItemQuantity}>x{item.quantity}</span>
                      </div>
                      <span className={styles.summaryItemPrice}>{item.totalPrice} руб.</span>
                    </div>
                  ))}
                </>
              )}

              {fabricItems.length > 0 && (
                <>
                  <div className={styles.summaryCategory}>Ткани (дополнительно):</div>
                  {fabricItems.map((item) => (
                    <div key={item.id} className={styles.summaryItem}>
                      <div className={styles.summaryItemInfo}>
                        <span className={styles.summaryItemName}>
                          {item.collectionNameRu} - {item.variant.color.ru}
                        </span>
                        <span className={styles.summaryItemQuantity}>x{item.quantity}</span>
                      </div>
                      <span className={styles.summaryItemPrice}>Бесплатно</span>
                    </div>
                  ))}
                </>
              )}
            </div>
            <div className={styles.summaryTotals}>
              <div className={styles.summaryRow}>
                <span>Товары ({totalCartItems}):</span>
                <span>{totalCartPrice} руб.</span>
              </div>

              {appliedPromo && getDiscountAmount() > 0 && (
                <div className={`${styles.summaryRow} ${styles.discountRow}`}>
                  <span>Скидка по промокоду:</span>
                  <span>-{getDiscountAmount()} руб.</span>
                </div>
              )}

              <div className={styles.summaryRow}>
                <span>Доставка:</span>
                <span>
                  {appliedPromo && PROMO_CODES[appliedPromo as keyof typeof PROMO_CODES].freeShipping ? (
                    <span className={styles.freeShipping}>Бесплатно</span>
                  ) : (
                    `${shippingCost} руб.`
                  )}
                </span>
              </div>

              <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                <span>К оплате:</span>
                <span>{getFinalTotal()} руб.</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.cartContent}>
          <div className={styles.cartItems}>
            <div className={styles.cartHeader}>
              <h2 className={styles.cartSectionTitle}>Товары в корзине</h2>
              <button
                className={styles.clearCartButton}
                onClick={() => {
                  if (furnitureCartDispatch && fabricCartDispatch) {
                    furnitureCartDispatch({ type: "CLEAR_CART" })
                    fabricCartDispatch({ type: "CLEAR_CART" })
                  }
                  setAppliedPromo(null)
                  setShippingCost(300)
                }}
              >
                Очистить корзину
              </button>
            </div>

            {cartIsEmpty ? (
              <div className={styles.emptyTabCart}>
                <p>Ваша корзина пуста.</p>
                <Link href="/catalog">
                  <Button variant="outline" size="sm">
                    Перейти в каталог
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                {/* Отображение мебели в корзине */}
                {furnitureItems.length > 0 && (
                  <>
                    <div className={styles.cartCategoryTitle}>Мебель</div>
                    {furnitureItems.map((item) => {
                      const isBed = "bed" in item.product
                      const category = isBed ? "bed" : "sofa"
                      const productUrl = `/products/${category}/${item.product.slug}`

                      // Get size info
                      const sizeInfo = isBed
                        ? item.product.bed[item.selectedSize || 0]
                        : "sizes" in item.product
                          ? item.product.sizes.sofa[item.selectedSize || 0]
                          : null

                      const sizeText = sizeInfo ? `${sizeInfo.width}x${sizeInfo.length} см` : ""

                      // Get mechanism info for beds
                      const mechanismText =
                        isBed && item.withMechanism && item.selectedSize !== null
                          ? `, с подъемным механизмом (+${item.product.bed[item.selectedSize].lifting_mechanism[1].price} руб.)`
                          : ""

                      return (
                        <div key={item.id} className={styles.cartItem}>
                          <div className={styles.itemImage}>
                            <Link href={productUrl}>
                              <Image
                                src={item.product.images[0] || "/placeholder.svg"}
                                alt={item.product.name}
                                width={120}
                                height={120}
                                className={styles.image}
                              />
                            </Link>
                          </div>
                          <div className={styles.itemInfo}>
                            <Link href={productUrl} className={styles.itemName}>
                              {item.product.name}
                            </Link>
                            <div className={styles.itemOptions}>
                              {sizeText}
                              {mechanismText}
                            </div>
                          </div>
                          <div className={styles.itemQuantity}>
                            <button
                              className={styles.quantityButton}
                              onClick={() => handleUpdateFurnitureQuantity(item.id, Math.max(1, item.quantity - 1))}
                            >
                              -
                            </button>
                            <span className={styles.quantity}>{item.quantity}</span>
                            <button
                              className={styles.quantityButton}
                              onClick={() => handleUpdateFurnitureQuantity(item.id, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                          <div className={styles.itemPrice}>
                            <span className={styles.price}>{item.totalPrice} руб.</span>
                          </div>
                          <button
                            className={styles.removeButton}
                            onClick={() => handleRemoveFurnitureItem(item.id)}
                            aria-label="Удалить товар"
                          >
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M18 6L6 18"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M6 6L18 18"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        </div>
                      )
                    })}
                  </>
                )}

                {/* Отображение тканей в корзине */}
                {fabricItems.length > 0 && (
                  <>
                    <div className={styles.cartCategoryTitle}>Ткани (дополнительно)</div>
                    {fabricItems.map((item) => {
                      // Create URL for fabric detail page
                      const fabricUrl = `/fabrics/${item.categoryName}/${item.collectionName}`

                      return (
                        <div key={item.id} className={styles.cartItem}>
                          <div className={styles.itemImage} onClick={() => handleOpenImage(item.variant.image)}>
                            <Image
                              src={item.variant.image || "/placeholder.svg"}
                              alt={item.variant.color.ru}
                              width={120}
                              height={120}
                              className={styles.image}
                            />
                          </div>
                          <div className={styles.itemInfo}>
                            <Link href={fabricUrl} className={styles.itemName}>
                              {item.collectionNameRu} - {item.variant.color.ru}
                            </Link>
                            <div className={styles.itemOptions}>Категория: {item.categoryNameRu}</div>
                          </div>
                          <div className={styles.itemQuantity}>
                            <button
                              className={styles.quantityButton}
                              onClick={() => handleUpdateFabricQuantity(item.id, Math.max(1, item.quantity - 1))}
                            >
                              -
                            </button>
                            <span className={styles.quantity}>{item.quantity}</span>
                            <button
                              className={styles.quantityButton}
                              onClick={() => handleUpdateFabricQuantity(item.id, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                          <div className={styles.itemPrice}>
                            <span className={styles.freeItem}>Бесплатно</span>
                          </div>
                          <button
                            className={styles.removeButton}
                            onClick={() => handleRemoveFabricItem(item.id)}
                            aria-label="Удалить товар"
                          >
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M18 6L6 18"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M6 6L18 18"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        </div>
                      )
                    })}
                  </>
                )}
              </>
            )}
          </div>

          <div className={styles.cartSummary}>
            <div className={styles.summaryHeader}>
              <h2 className={styles.summaryTitle}>Итого</h2>
            </div>

            <div className={styles.promoCodeSection}>
              <h3 className={styles.promoTitle}>Промокод</h3>
              {!appliedPromo ? (
                <>
                  <div className={styles.promoCodeInput}>
                    <Input
                      placeholder="Введите промокод"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      error={promoError || undefined}
                    />
                    <Button variant="outline" onClick={handleApplyPromoCode} className={styles.applyPromoButton}>
                      Применить
                    </Button>
                  </div>
                  {promoSuccess && <div className={styles.promoSuccess}>{promoSuccess}</div>}
                </>
              ) : (
                <div className={styles.appliedPromo}>
                  <div className={styles.appliedPromoInfo}>
                    <span className={styles.appliedPromoCode}>{appliedPromo}</span>
                    <span className={styles.appliedPromoDescription}>
                      {PROMO_CODES[appliedPromo as keyof typeof PROMO_CODES].description}
                    </span>
                  </div>
                  <button
                    className={styles.removePromoButton}
                    onClick={handleRemovePromoCode}
                    aria-label="Удалить промокод"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M18 6L6 18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M6 6L18 18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            <div className={styles.summaryContent}>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Товары ({totalCartItems}):</span>
                <span className={styles.summaryValue}>{totalCartPrice} руб.</span>
              </div>

              {appliedPromo && getDiscountAmount() > 0 && (
                <div className={`${styles.summaryRow} ${styles.discountRow}`}>
                  <span className={styles.summaryLabel}>Скидка по промокоду:</span>
                  <span className={styles.summaryValue}>-{getDiscountAmount()} руб.</span>
                </div>
              )}

              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Доставка:</span>
                <span className={styles.summaryValue}>
                  {appliedPromo && PROMO_CODES[appliedPromo as keyof typeof PROMO_CODES].freeShipping ? (
                    <span className={styles.freeShipping}>Бесплатно</span>
                  ) : (
                    `${shippingCost} руб.`
                  )}
                </span>
              </div>

              <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                <span className={styles.summaryLabel}>К оплате:</span>
                <span className={styles.summaryValue}>{getFinalTotal()} руб.</span>
              </div>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                className={styles.checkoutButton}
                onClick={handleProceedToCheckout}
                disabled={cartIsEmpty}
              >
                Перейти к оформлению
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
