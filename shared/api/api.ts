import type { Category, Fabric, FabricCategory, FabricCollection } from "./types"
import type { ProductData, KidsBedData } from "./types"
import axios from "axios"

const API_BASE_URL = "https://66d77b122c6b09c7.mokky.dev"

// Helper function to log detailed fetch errors
async function fetchWithErrorHandling<T>(url: string, errorMessage: string): Promise<T> {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })


    if (!response.ok) {
      const errorText = await response.text()
      console.error(`API Error (${response.status}): ${errorText}`)
      throw new Error(`${errorMessage} (Status: ${response.status})`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error(`${errorMessage}:`, error)
    throw error
  }
}

export async function getSofas(): Promise<ProductData[]> {
  try {
    const data = await fetchWithErrorHandling<ProductData[]>(`${API_BASE_URL}/sofa`, "Failed to fetch sofas")

    // Check if the data is an array
    if (!Array.isArray(data)) {
      console.error("Unexpected data format for sofas:", data)
      return []
    }

    return data
  } catch (error) {
    console.error("Error in getSofas:", error)
    return []
  }
}

export async function getSofaBySlug(slug: string): Promise<ProductData | null> {
  try {
    const sofas = await getSofas()
    return sofas.find((sofa) => sofa.slug === slug) || null
  } catch (error) {
    console.error("Error fetching sofa by slug:", error)
    return null
  }
}

export async function getBeds(): Promise<ProductData[]> {
  try {
    const data = await fetchWithErrorHandling<ProductData[]>(`${API_BASE_URL}/bed`, "Failed to fetch beds")

    // Check if the data is an array
    if (!Array.isArray(data)) {
      console.error("Unexpected data format for beds:", data)
      return []
    }

    return data
  } catch (error) {
    console.error("Error in getBeds:", error)
    return []
  }
}

export async function getBedBySlug(slug: string): Promise<ProductData | null> {
  try {
    const beds = await getBeds()
    return beds.find((bed) => bed.slug === slug) || null
  } catch (error) {
    console.error("Error fetching bed by slug:", error)
    return null
  }
}

export async function getKidsBeds(): Promise<KidsBedData[]> {
  try {
    // Fetch kids beds data
    const rawData = await fetchWithErrorHandling<any[]>(`${API_BASE_URL}/kids`, "Failed to fetch kids beds")

    // Check if the data is an array
    if (!Array.isArray(rawData) || rawData.length === 0 || !Array.isArray(rawData[0])) {
      console.error("Unexpected data format for kids beds:", rawData)
      return []
    }

    // The data structure is an array containing another array with alternating product/specs objects
    const kidsBedsArray = rawData[0]
    const processedKidsBeds: KidsBedData[] = []

    // Process the data to extract product information
    for (let i = 0; i < kidsBedsArray.length; i += 2) {
      if (i + 1 < kidsBedsArray.length) {
        const productInfo = kidsBedsArray[i]
        const productSpecs = kidsBedsArray[i + 1]

        // Create a normalized product object
        const kidsBed: KidsBedData = {
          ...productInfo,
          specs: productSpecs,
          // Ensure the product has the required fields for our app
          category: "kids",
          popularity: productInfo.popularity || 4,
        }

        processedKidsBeds.push(kidsBed)
      }
    }

    return processedKidsBeds
  } catch (error) {
    console.error("Error in getKidsBeds:", error)
    return []
  }
}

export async function getKidsBedBySlug(slug: string): Promise<KidsBedData | null> {
  try {
    const kidsBeds = await getKidsBeds()
    return kidsBeds.find((bed) => bed.slug === slug) || null
  } catch (error) {
    return null
  }
}

export async function getArmchairs(): Promise<ProductData[]> {
  try {
    const data = await fetchWithErrorHandling<ProductData[]>(`${API_BASE_URL}/armchair`, "Failed to fetch armchairs")

    // Check if the data is an array
    if (!Array.isArray(data)) {
      console.error("Unexpected data format for armchairs:", data)
      return []
    }

    return data
  } catch (error) {
    console.error("Error in getArmchairs:", error)
    return []
  }
}

export async function getArmchairBySlug(slug: string): Promise<ProductData | null> {
  try {
    const armchairs = await getArmchairs()
    return armchairs.find((armchair) => armchair.slug === slug) || null
  } catch (error) {
    console.error("Error fetching armchair by slug:", error)
    return null
  }
}

// Функция для получения всех товаров
// export async function getAllProducts(): Promise<Product[]> {
//   // Имитация задержки API
//   await new Promise((resolve) => setTimeout(resolve, 500))

//   return [
//     {
//       id: "1",
//       slug: "modern-sofa",
//       name: "Современный диван",
//       description: "Элегантный современный диван с мягкой обивкой и стильным дизайном.",
//       price: 45000,
//       image: "/sofa-promo.png",
//       category: "sofas",
//       categoryName: "Диваны",
//       colors: ["#6E8B3D", "#8B4513", "#708090"],
//       sizes: ["2-местный", "3-местный", "4-местный"],
//       characteristics: {
//         "Материал каркаса": "Дерево",
//         Наполнитель: "Пенополиуретан",
//         Обивка: "Велюр",
//         Ножки: "Металл",
//       },
//     },
//     {
//       id: "2",
//       slug: "classic-bed",
//       name: "Классическая кровать",
//       description: "Комфортная классическая кровать с мягким изголовьем и прочным основанием.",
//       price: 35000,
//       image: "/bed-collection.png",
//       category: "beds",
//       categoryName: "Кровати",
//       colors: ["#F5F5DC", "#8B4513", "#A0522D"],
//       sizes: ["140x200", "160x200", "180x200"],
//       liftingMechanisms: ["Без механизма", "С подъемным механизмом"],
//       characteristics: {
//         "Материал каркаса": "Массив дерева",
//         Изголовье: "Мягкое, обивка ткань",
//         Основание: "Ортопедическое",
//         Высота: "110 см",
//       },
//     },
//     {
//       id: "3",
//       slug: "modern-armchair",
//       name: "Современное кресло",
//       description: "Стильное и удобное кресло для вашей гостиной или кабинета.",
//       price: 18000,
//       image: "/modern-armchair.png",
//       category: "armchairs",
//       categoryName: "Кресла",
//       colors: ["#6E8B3D", "#8B4513", "#708090"],
//       characteristics: {
//         "Материал каркаса": "Дерево",
//         Наполнитель: "Пенополиуретан",
//         Обивка: "Велюр",
//         Ножки: "Дерево",
//       },
//     },
//     {
//       id: "4",
//       slug: "kids-bed",
//       name: "Детская кровать",
//       description: "Безопасная и комфортная кровать для детей с ярким дизайном.",
//       price: 22000,
//       image: "/kids-furniture-bed.png",
//       category: "kids",
//       categoryName: "Детская мебель",
//       colors: ["#ADD8E6", "#FFB6C1", "#98FB98"],
//       sizes: ["80x160", "90x180"],
//       characteristics: {
//         Материал: "Экологичный МДФ",
//         Основание: "Ортопедическое",
//         Бортики: "Съемные",
//         Возраст: "От 3 лет",
//       },
//     },
//     {
//       id: "5",
//       slug: "corner-sofa",
//       name: "Угловой диван",
//       description: "Просторный угловой диван для всей семьи с функцией трансформации.",
//       price: 65000,
//       image: "/sofa-promo.png",
//       category: "sofas",
//       categoryName: "Диваны",
//       colors: ["#6E8B3D", "#8B4513", "#708090"],
//       sizes: ["Правый угол", "Левый угол"],
//       characteristics: {
//         "Материал каркаса": "Дерево",
//         Наполнитель: "Пенополиуретан",
//         Обивка: "Рогожка",
//         "Механизм трансформации": "Дельфин",
//       },
//     },
//     {
//       id: "6",
//       slug: "double-bed",
//       name: "Двуспальная кровать",
//       description: "Элегантная двуспальная кровать с высоким изголовьем и вместительными ящиками для хранения.",
//       price: 42000,
//       image: "/bed-collection.png",
//       category: "beds",
//       categoryName: "Кровати",
//       colors: ["#F5F5DC", "#8B4513", "#A0522D"],
//       sizes: ["160x200", "180x200", "200x200"],
//       liftingMechanisms: ["Без механизма", "С подъемным механизмом"],
//       characteristics: {
//         "Материал каркаса": "Массив дерева",
//         Изголовье: "Высокое, обивка экокожа",
//         Основание: "Ортопедическое",
//         "Ящики для хранения": "4 шт",
//       },
//     },
//     {
//       id: "7",
//       slug: "recliner-armchair",
//       name: "Кресло-реклайнер",
//       description: "Комфортное кресло с функцией реклайнера для максимального расслабления.",
//       price: 25000,
//       image: "/modern-armchair.png",
//       category: "armchairs",
//       categoryName: "Кресла",
//       colors: ["#6E8B3D", "#8B4513", "#708090"],
//       characteristics: {
//         "Материал каркаса": "Металл и дерево",
//         Наполнитель: "Пенополиуретан высокой плотности",
//         Обивка: "Микрофибра",
//         Механизм: "Реклайнер",
//       },
//     },
//     {
//       id: "8",
//       slug: "kids-bunk-bed",
//       name: "Двухъярусная детская кровать",
//       description: "Функциональная двухъярусная кровать для детской комнаты с лестницей и защитными бортиками.",
//       price: 35000,
//       image: "/kids-furniture-bed.png",
//       category: "kids",
//       categoryName: "Детская мебель",
//       colors: ["#ADD8E6", "#FFB6C1", "#98FB98"],
//       characteristics: {
//         Материал: "Массив сосны",
//         Основание: "Ортопедическое",
//         "Максимальная нагрузка": "До 80 кг на спальное место",
//         Возраст: "От 6 лет",
//       },
//     },
//   ]
// }

// Функция для получения товара по слагу и категории
// export async function getProductBySlug(category: string, slug: string): Promise<Product | null> {
//   const products = await getAllProducts()
//   return products.find((product) => product.category === category && product.slug === slug) || null
// }

// Функция для получения товаров по категории
// export async function getProductsByCategory(category: string): Promise<Product[]> {
//   const products = await getAllProducts()
//   return products.filter((product) => product.category === category)
// }

export async function getPopularProducts(limit = 8): Promise<ProductData[]> {
  try {
    // Fetch all product types
    const [sofas, beds, armchairs, kidsBeds] = await Promise.all([getSofas(), getBeds(), getArmchairs(), getKidsBeds()])

    const allProducts = [...sofas, ...beds, ...armchairs, ...kidsBeds]

    // Filter products with popularity > 4.5 and sort by popularity
    const popularProducts = allProducts
      .filter((product) => product.popularity > 4.5)
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit)

    return popularProducts
  } catch (error) {
    return []
  }
}

export async function getProductsByCategory(category: string): Promise<ProductData[]> {
  try {

    if (category === "sofa") {
      return await getSofas()
    } else if (category === "bed") {
      return await getBeds()
    } else if (category === "armchair") {
      return await getArmchairs()
    } else if (category === "kids") {
      return await getKidsBeds()
    } else if (category === "all") {
      // Fetch all product types
      try {
        const [sofas, beds, armchairs, kidsBeds] = await Promise.all([
          getSofas(),
          getBeds(),
          getArmchairs(),
          getKidsBeds(),
        ])

        return [...sofas, ...beds, ...armchairs, ...kidsBeds]
      } catch (error) {
        const [sofas, beds] = await Promise.all([getSofas(), getBeds()])
        return [...sofas, ...beds]
      }
    } else {
      // Handle multiple categories
      const categories = category.split(",")
      const productPromises = categories.map((cat) => {
        if (cat === "sofa") return getSofas()
        if (cat === "bed") return getBeds()
        if (cat === "armchair") return getArmchairs()
        if (cat === "kids") return getKidsBeds()
        return []
      })

      const productsArrays = await Promise.all(productPromises)
      return productsArrays.flat()
    }
  } catch (error) {
    console.error(`Error fetching products by category ${category}:`, error)
    return []
  }
}

export async function getProductsByPriceRange(
  minPrice: number,
  maxPrice: number,
  category = "all",
): Promise<ProductData[]> {
  try {
    const products = await getProductsByCategory(category)
    return products.filter((product) => product.price.current >= minPrice && product.price.current <= maxPrice)
  } catch (error) {
    console.error("Error filtering products by price range:", error)
    return []
  }
}

export async function getProductsByFilters(filters: {
  category?: string
  minPrice?: number
  maxPrice?: number
  colors?: string[]
}): Promise<ProductData[]> {
  try {
    const { category = "all", minPrice, maxPrice, colors } = filters
    let products = await getProductsByCategory(category)

    // Filter out products with invalid price structure
    products = products.filter((product) => product && product.price && typeof product.price.current === "number")

    // Filter by price range
    if (minPrice !== undefined && maxPrice !== undefined) {
      products = products.filter((product) => product.price.current >= minPrice && product.price.current <= maxPrice)
    }

    // Filter by colors
    if (colors && colors.length > 0) {
      products = products.filter((product) => {
        // Check in product.colors array
        if (product.colors && Array.isArray(product.colors)) {
          return product.colors.some((color) => colors.includes(color))
        }

        // For kids beds, check in materials array for color
        if (product.category === "kids" && product.specs && product.specs.materials) {
          return product.specs.materials.some((material) => material.color && colors.includes(material.color))
        }

        // For products with color property
        if (product.color) {
          return colors.includes(product.color)
        }

        return false
      })
    }

    return products
  } catch (error) {
    console.error("Error filtering products:", error)
    return []
  }
}

// Функция для получения всех категорий
export async function getCategories(): Promise<Category[]> {
  // Имитация задержки API
  await new Promise((resolve) => setTimeout(resolve, 300))

  return [
    {
      id: "sofas",
      name: "Диваны",
      image: "/category-sofa.png",
      description: "Комфортные диваны для вашего дома",
    },
    {
      id: "beds",
      name: "Кровати",
      image: "/category-bed.png",
      description: "Качественные кровати для здорового сна",
    },
    {
      id: "armchairs",
      name: "Кресла",
      image: "/modern-armchair.png",
      description: "Стильные и удобные кресла",
    },
    {
      id: "kids",
      name: "Детская мебель",
      image: "/kids-furniture-bed.png",
      description: "Безопасная и яркая мебель для детей",
    },
  ]
}

// Функция для получения диапазона цен
// export async function getPriceRange(category?: string): Promise<{ min: number; max: number }> {
//   const products = await getAllProducts()

//   // Фильтруем товары по категории, если она указана
//   const filteredProducts = category ? products.filter((product) => product.category === category) : products

//   // Проверяем, что есть товары для анализа
//   if (!filteredProducts || filteredProducts.length === 0) {
//     return { min: 0, max: 100000 }
//   }

//   // Находим минимальную и максимальную цену
//   const prices = filteredProducts.map((product) => product.price)
//   const min = Math.min(...prices)
//   const max = Math.max(...prices)

//   return { min, max }
// }

export async function getPriceRange(): Promise<{ min: number; max: number }> {
  try {
    // Fetch all product types
    const [sofas, beds, armchairs, kidsBeds] = await Promise.all([getSofas(), getBeds(), getArmchairs(), getKidsBeds()])

    const allProducts = [...sofas, ...beds, ...armchairs, ...kidsBeds]

    // Filter out products with invalid price structure
    const validProducts = allProducts.filter(
      (product) => product && product.price && typeof product.price.current === "number",
    )


    if (validProducts.length === 0) {
      console.warn("No valid products found for price range calculation")
      return { min: 0, max: 10000 } // Default fallback
    }

    const prices = validProducts.map((product) => product.price.current)
    const min = Math.min(...prices)
    const max = Math.max(...prices)

    return { min, max }
  } catch (error) {
    console.error("Error fetching price range:", error)
    return { min: 0, max: 10000 } // Default fallback
  }
}

// Функция для получения доступных цветов
// export async function getAvailableColors(category?: string): Promise<{ id: string; name: string }[]> {
//   const products = await getAllProducts()

//   // Фильтруем товары по категории, если она указана
//   const filteredProducts = category ? products.filter((product) => product.category === category) : products

//   // Собираем уникальные цвета
//   const colorMap: Record<string, string> = {
//     "#6E8B3D": "Зеленый",
//     "#8B4513": "Коричневый",
//     "#708090": "Серый",
//     "#F5F5DC": "Бежевый",
//     "#A0522D": "Терракотовый",
//     "#ADD8E6": "Голубой",
//     "#FFB6C1": "Розовый",
//     "#98FB98": "Светло-зеленый",
//   }

//   const uniqueColors = new Set<string>()

//   filteredProducts.forEach((product) => {
//     if (product.colors) {
//       product.colors.forEach((color) => uniqueColors.add(color))
//     }
//   })

//   return Array.from(uniqueColors).map((color) => ({
//     id: color,
//     name: colorMap[color] || color,
//   }))
// }

// Функции для работы с тканями
export async function getFabricCategories(): Promise<FabricCategory[]> {
  // Имитация задержки API
  await new Promise((resolve) => setTimeout(resolve, 300))

  return [
    {
      id: "velvet",
      name: "Велюр",
      image: "/assorted-fabrics.png",
      description: "Мягкий и приятный на ощупь материал",
    },
    {
      id: "linen",
      name: "Лен",
      image: "/assorted-fabrics.png",
      description: "Натуральный и экологичный материал",
    },
    {
      id: "chenille",
      name: "Шенилл",
      image: "/assorted-fabrics.png",
      description: "Прочный и долговечный материал",
    },
    {
      id: "jacquard",
      name: "Жаккард",
      image: "/assorted-fabrics.png",
      description: "Роскошный материал с узорами",
    },
  ]
}

export async function getFabricCollections(categoryId: string): Promise<FabricCollection[]> {
  // Имитация задержки API
  await new Promise((resolve) => setTimeout(resolve, 300))

  const collections: Record<string, FabricCollection[]> = {
    velvet: [
      {
        id: "luxury-velvet",
        name: "Люкс Велюр",
        image: "/assorted-fabrics.png",
        description: "Коллекция премиальных велюровых тканей",
      },
      {
        id: "soft-velvet",
        name: "Софт Велюр",
        image: "/assorted-fabrics.png",
        description: "Мягкие велюровые ткани для комфортной мебели",
      },
    ],
    linen: [
      {
        id: "natural-linen",
        name: "Натуральный Лен",
        image: "/assorted-fabrics.png",
        description: "Коллекция натуральных льняных тканей",
      },
      {
        id: "mixed-linen",
        name: "Смесовый Лен",
        image: "/assorted-fabrics.png",
        description: "Льняные ткани с добавлением других волокон",
      },
    ],
    chenille: [
      {
        id: "classic-chenille",
        name: "Классический Шенилл",
        image: "/assorted-fabrics.png",
        description: "Традиционные шенилловые ткани",
      },
      {
        id: "modern-chenille",
        name: "Современный Шенилл",
        image: "/assorted-fabrics.png",
        description: "Шенилловые ткани в современном стиле",
      },
    ],
    jacquard: [
      {
        id: "floral-jacquard",
        name: "Цветочный Жаккард",
        image: "/assorted-fabrics.png",
        description: "Жаккардовые ткани с цветочными узорами",
      },
      {
        id: "geometric-jacquard",
        name: "Геометрический Жаккард",
        image: "/assorted-fabrics.png",
        description: "Жаккардовые ткани с геометрическими узорами",
      },
    ],
  }

  return collections[categoryId] || []
}

export async function getFabrics(categoryId: string, collectionId: string): Promise<Fabric[]> {
  // Имитация задержки API
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Генерируем случайные ткани для каждой коллекции
  const fabrics: Fabric[] = []
  const colors = ["#6E8B3D", "#8B4513", "#708090", "#F5F5DC", "#A0522D", "#ADD8E6", "#FFB6C1", "#98FB98"]
  const patterns = ["solid", "striped", "floral", "geometric"]

  for (let i = 1; i <= 12; i++) {
    const colorIndex = i % colors.length
    const patternIndex = i % patterns.length

    fabrics.push({
      id: `${categoryId}-${collectionId}-${i}`,
      name: `Ткань ${i}`,
      image: "/assorted-fabrics.png",
      price: 1000 + i * 200,
      color: colors[colorIndex],
      pattern: patterns[patternIndex],
      characteristics: {
        Состав: "Полиэстер 100%",
        Плотность: "280 г/м²",
        Ширина: "140 см",
        Износостойкость: "25000 циклов",
      },
    })
  }

  return fabrics
}

export async function getFabricById(fabricId: string): Promise<Fabric | null> {
  // Разбираем ID на составляющие
  const [categoryId, collectionId, fabricIndex] = fabricId.split("-")

  // Получаем все ткани из коллекции
  const fabrics = await getFabrics(categoryId, collectionId)

  // Находим нужную ткань
  return fabrics.find((fabric) => fabric.id === fabricId) || null
}

export async function getFabricPriceRange(): Promise<{ min: number; max: number }> {
  // В реальном приложении здесь был бы запрос к API
  return { min: 1000, max: 5000 }
}

export async function getFabricColors(): Promise<{ id: string; name: string }[]> {
  // В реальном приложении здесь был бы запрос к API
  return [
    { id: "#6E8B3D", name: "Зеленый" },
    { id: "#8B4513", name: "Коричневый" },
    { id: "#708090", name: "Серый" },
    { id: "#F5F5DC", name: "Бежевый" },
    { id: "#A0522D", name: "Терракотовый" },
    { id: "#ADD8E6", name: "Голубой" },
    { id: "#FFB6C1", name: "Розовый" },
    { id: "#98FB98", name: "Светло-зеленый" },
  ]
}

export async function getFabricPatterns(): Promise<{ id: string; name: string }[]> {
  // В реальном приложении здесь был бы запрос к API
  return [
    { id: "solid", name: "Однотонный" },
    { id: "striped", name: "Полосатый" },
    { id: "floral", name: "Цветочный" },
    { id: "geometric", name: "Геометрический" },
  ]
}

// Add a new function to sort products
export async function getSortedProducts(products: ProductData[], sortBy: string): Promise<ProductData[]> {
  const sortedProducts = [...products]

  switch (sortBy) {
    case "price-asc":
      return sortedProducts.sort((a, b) => a.price.current - b.price.current)
    case "price-desc":
      return sortedProducts.sort((a, b) => b.price.current - a.price.current)
    case "name-asc":
      return sortedProducts.sort((a, b) => a.name.localeCompare(b.name))
    case "name-desc":
      return sortedProducts.sort((a, b) => b.name.localeCompare(a.name))
    case "popularity":
      return sortedProducts.sort((a, b) => b.popularity - a.popularity)
    default:
      return sortedProducts
  }
}

// New function to get available filter options from products
export async function getAvailableFilters(): Promise<{
  colors: string[]
}> {
  try {
    // Fetch all products
    const allProducts = await getProductsByCategory("all")

    // Extract unique colors
    const allColors = new Set<string>()
    allProducts.forEach((product) => {
      // Standard color array
      if (product.colors && Array.isArray(product.colors)) {
        product.colors.forEach((color) => {
          if (color) allColors.add(color)
        })
      }

      // Kids beds colors in materials
      if (product.category === "kids" && product.specs && product.specs.materials) {
        product.specs.materials.forEach((material) => {
          if (material.color) allColors.add(material.color)
        })
      }

      // Direct color property
      if (product.color) {
        allColors.add(product.color)
      }
    })

    return {
      colors: Array.from(allColors),
    }
  } catch (error) {
    console.error("Error getting available filters:", error)
    return {
      colors: [],
    }
  }
}

export async function getProductCountsByCategory(): Promise<{ [key: string]: number }> {
  try {
    const response = await axios.get(`${API_BASE_URL}/products/counts`)
    return response.data
  } catch (error) {
    console.error('Error fetching product counts:', error)
    // Возвращаем пустой объект в случае ошибки
    return {}
  }
}
