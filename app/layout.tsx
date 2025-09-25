import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Source_Sans_3 } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"

/* Added custom fonts from design brief */
const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-playfair",
})

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-source-sans",
})

export const metadata: Metadata = {
  title: "ClipCraft AI - Transform Videos into Viral Shorts",
  description:
    "AI-powered video editing tool that automatically creates TikTok and YouTube shorts from your uploaded videos with custom prompts, music, and voice-overs.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${playfairDisplay.variable} ${sourceSans.variable} antialiased`}>
        <Suspense fallback={null}>
          {children}
          <Analytics />
        </Suspense>
      </body>
    </html>
  )
}
