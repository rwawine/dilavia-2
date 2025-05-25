import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Header from "@/widgets/header/ui/Header"
import Footer from "@/widgets/footer/ui/Footer"
import { CartProvider } from "@/entities/cart/model/cartContext"
import { FavoritesProvider } from "@/entities/favorites/model/favoritesContext"
import { FabricCartProvider } from "@/entities/fabric-cart/model/fabricCartContext"
import { FabricFavoritesProvider } from "@/entities/fabric-favorites/model/fabricFavoritesContext"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const inter = Inter({ subsets: ["latin", "cyrillic"] })

export const metadata: Metadata = {
  title: "Dilavia - Мебельный магазин",
  description: "Купить мебель в Москве с доставкой",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" className="light" style={{ colorScheme: "light" }}>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <CartProvider>
            <FavoritesProvider>
              <FabricCartProvider>
                <FabricFavoritesProvider>
                  <div className="wrapper">
                    <Header />
                    <main className="main">{children}</main>
                    <Footer />
                  </div>
                </FabricFavoritesProvider>
              </FabricCartProvider>
            </FavoritesProvider>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
