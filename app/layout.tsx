import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "next-themes"
import { Toaster } from "react-hot-toast"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { CurrencyProvider } from "@/components/providers/CurrencyProvider"
import "./globals.css"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    template: "%s | Finds Engine",
    default: "Finds Engine — Discover & Buy Anything from China",
  },
  description:
    "Discover 150,000+ products from 380+ brands. Search by keyword. Compare prices across Kakobuy, CNFans, Fishgoo and more.",
  openGraph: {
    type: "website",
    siteName: "Finds Engine",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} min-h-screen bg-white font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <CurrencyProvider>
            <Header />
            <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
            <Footer />
          </CurrencyProvider>
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: "8px",
                fontSize: "14px",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
