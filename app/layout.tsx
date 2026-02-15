import React from "react"
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Fredoka } from 'next/font/google'

import './globals.css'
import { Toaster } from "@/components/ui/sonner"

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })
const _fredoka = Fredoka({ subsets: ['latin'], variable: '--font-fredoka' })

export const metadata: Metadata = {
  title: 'Flashpages - Turn Boring Text into Viral Shorts',
  description: 'Turn Boring Text into Viral Shorts for Your Brain.',
  generator: 'v0.app',
  keywords: ['flashpages', 'literacy', 'reading', 'vocabulary', 'learning', 'education', 'shorts'],
  icons: {
    icon: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
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
      <body className={`${_geist.className} ${_fredoka.variable} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
