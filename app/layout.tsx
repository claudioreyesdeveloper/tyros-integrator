import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { MIDIProvider } from "@/lib/midi-context"
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Suppress ResizeObserver errors
              window.addEventListener('error', function(e) {
                if (e.message && e.message.includes('ResizeObserver')) {
                  e.stopImmediatePropagation();
                  e.preventDefault();
                  return false;
                }
              }, true);
            `,
          }}
        />
      </head>
      <body className={`font-sans antialiased ${GeistSans.variable} ${GeistMono.variable}`}>
        <MIDIProvider>{children}</MIDIProvider>
        <Analytics />
      </body>
    </html>
  )
}
