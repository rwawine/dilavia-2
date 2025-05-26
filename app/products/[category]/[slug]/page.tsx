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

interface ProductPageProps {
  params: {
    category: string
    slug: string
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
