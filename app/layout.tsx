import type React from "react"
import type { Metadata } from "next/types"
import { Inter } from "next/font/google"
import Header from "@/widgets/header/ui/Header"
import Footer from "@/widgets/footer/ui/Footer"
import { CartProvider } from "@/entities/cart/model/cartContext"
import { FavoritesProvider } from "@/entities/favorites/model/favoritesContext"
import { RecentlyViewedProvider } from "@/entities/recently-viewed/model/recentlyViewedContext"
import { FabricCartProvider } from "@/entities/fabric-cart/model/fabricCartContext"
import { FabricFavoritesProvider } from "@/entities/fabric-favorites/model/fabricFavoritesContext"
import "./globals.css"

const inter = Inter({ subsets: ["latin", "cyrillic"] })

export const metadata: Metadata = {
  title: "Dilavia - Мебель и ткани",
  description: "Магазин качественной мебели и тканей для вашего дома",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <CartProvider>
          <FavoritesProvider>
            <RecentlyViewedProvider>
              <FabricCartProvider>
                <FabricFavoritesProvider>
                  <div className="wrapper">
                    <Header />
                    <main className="main">{children}</main>
                    <Footer />
                  </div>
                </FabricFavoritesProvider>
              </FabricCartProvider>
            </RecentlyViewedProvider>
          </FavoritesProvider>
        </CartProvider>
      </body>
    </html>
  )
}
