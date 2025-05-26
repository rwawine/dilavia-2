import { notFound } from "next/navigation"
import ProductDetail from "@/widgets/product-detail/ui/ProductDetail"
import SimilarProducts from "@/widgets/similar-products/ui/SimilarProducts"
import {
  getSofaBySlug,
  getBedBySlug,
  getArmchairBySlug,
  getKidsBedBySlug,
  getProductsByCategory,
} from "@/shared/api/api"
import { Metadata } from 'next'

interface ProductPageProps {
  params: {
    category: string
    slug: string
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { category, slug } = params

  let product = null

  if (category === "sofa") {
    product = await getSofaBySlug(slug)
  } else if (category === "bed") {
    product = await getBedBySlug(slug)
  } else if (category === "armchair") {
    product = await getArmchairBySlug(slug)
  } else if (category === "kids-tables") {
    product = await getKidsBedBySlug(slug)
  }

  if (!product) {
    return {
      title: 'Товар не найден',
      description: 'Запрашиваемый товар не существует или был удален.',
    }
  }

  return {
    title: `Купить ${product.name} в Минске`,
    description: `Купить ${product.name} по выгодной цене в Минске. Подробное описание, характеристики, фото и отзывы. Доставка по всей РБ.`,
    keywords: `${product.name}, купить ${product.name}, ${category}, мебель Минск, интернет-магазин мебели`,
    metadataBase: new URL('https://dilavia.by'),
    openGraph: {
      title: `Купить ${product.name} в Минске`,
      description: `Купить ${product.name} по выгодной цене. Доставка по РБ.`,
      images: product.images && product.images.length > 0 ? [product.images[0]] : [],
      type: 'website',
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { category, slug } = params

  // Get the product based on category
  let product = null

  if (category === "sofa") {
    product = await getSofaBySlug(slug)
  } else if (category === "bed") {
    product = await getBedBySlug(slug)
  } else if (category === "armchair") {
    product = await getArmchairBySlug(slug)
  } else if (category === "kids-tables") {
    product = await getKidsBedBySlug(slug)
  }

  // If product not found, return 404
  if (!product) {
    notFound()
  }

  // Get similar products for recommendations
  const allCategoryProducts = await getProductsByCategory(category)

  return (
    <div className="container">
      <ProductDetail product={product} allProducts={allCategoryProducts} />
    </div>
  )
}
