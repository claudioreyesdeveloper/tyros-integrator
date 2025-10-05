import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { MIDIProvider } from "@/lib/midi-context"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Tyros5 Integrator",
  description: "Professional MIDI Controller for Yamaha Tyros5",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <Suspense fallback={null}>
          <MIDIProvider>{children}</MIDIProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
