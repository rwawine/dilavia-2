// Существующие типы
export interface ProductPrice {
  current: number
  old?: number
  discount?: number
}

export interface ProductData {
  id: string
  name: string
  slug: string
  description: string
  price: ProductPrice
  images: string[]
  popularity: number
  inStock?: boolean
  colors?: string[]
  material?: string
  dimensions?: {
    width: number
    height: number
    depth: number
  }
  category: string
  availability?: string
  manufacturing?: string
}

export interface SofaData extends ProductData {
  seats?: number
  hasStorage?: boolean
  isSleeper?: boolean
  mechanism?: string
  sizes?: {
    sofa: Size[]
  }
  liftingMechanisms?: Mechanism[]
}

export interface BedData extends ProductData {
  size?: string
  mattressIncluded?: boolean
  hasStorage?: boolean
  frameType?: string
  bed?: Size[]
}

// Новый тип для детских кроватей
export interface KidsBedData extends ProductData {
  specs?: {
    "kids-tables"?: Array<{
      width: number
      length: number
      height?: number | null
      price: number
      lifting_mechanism?: Array<{
        available: boolean
        price: number
      }>
    }>
    materials?: Array<{
      name: string
      localizedTitles?: {
        ru: string
      }
      type?: string
      color?: string
    }>
    sleepingPlace?: {
      width: number | null
      length: number | null
    }
    features?: string[]
    style?: string
    color?: string | null
    max_load?: number | null
  }
  "subcategory-ru"?: string
  "category-ru"?: string
  seo?: {
    title: string
    meta_description: string
    keywords: string[]
  }
}

export interface Size {
  width: number
  length: number
  price: number
}

export interface SizeWithMechanism extends Size {
  lifting_mechanism: Mechanism[]
}

export interface Mechanism {
  type: string
  price: number
}

export interface Material {
  localizedTitles: {
    ru: string
  }
  type: string
}

export interface InstallmentPlan {
  bank: string
  installment: {
    duration_months: number
    interest: string
    additional_fees: string
  }
  credit: {
    duration_months: number
    interest: string
  }
}

// Новые типы для тканей
export interface FabricCategory {
  name: string
  name_ru: string
  description_ru?: string
  collections: FabricCollection[]
}

export interface FabricCollection {
  name: string
  name_ru: string
  type: string
  availability: string
  filterType: string
  description_ru?: string
  technicalSpecifications: {
    fabricType: string
    abrasionResistance: string
    density: string
    composition: string
    composition_ru: string
    width: string
    origin: string
    origin_ru: string
    collectionName?: string
    directionality?: string
    directionality_ru?: string
    applicationAreas_ru?: string[]
  }
  careInstructions_ru: string[]
  variants: FabricVariant[]
}

export interface FabricVariant {
  id: number
  color: {
    en: string
    ru: string
  }
  image: string
}

export interface FabricCartItem {
  id: string
  categoryName: string
  categoryNameRu: string
  collectionName: string
  collectionNameRu: string
  variant: FabricVariant
  quantity: number
}

export interface FabricFavoriteItem {
  id: string
  categoryName: string
  categoryNameRu: string
  collectionName: string
  collectionNameRu: string
  variant: FabricVariant
}
