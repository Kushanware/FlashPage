import React from "react"
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import './globals.css'
import { Toaster } from "@/components/ui/sonner"

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Literacy Stamina - Build Reading Skills Daily',
  description: 'Master reading comprehension and vocabulary with interactive swipeable cards powered by AI',
  generator: 'v0.app',
  keywords: ['literacy', 'reading', 'vocabulary', 'learning', 'education'],
}

export const viewport: Viewport = {
  themeColor: '#3b82f6',
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${_geist.className} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
