import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter, Poppins } from "next/font/google"
import { AppProvider } from "@/contexts/app-context"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
})

export const metadata: Metadata = {
  title: "AutoDoc - Your AI Medical Drug Assistant",
  description: "AI-powered medical drug recommendation chatbot",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} font-sans`}>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  )
}



import './globals.css'