import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { MIDIProvider } from "@/lib/midi-context"
import { LayoutProvider } from "@/lib/layout-context"
import { Suspense } from "react"
import "./globals.css"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "SmartBridge",
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
      <body className={`font-sans ${geistSans.variable} ${geistMono.variable} antialiased`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Helper function to check if error is ResizeObserver related
                function isResizeObserverError(message) {
                  if (!message) return false;
                  const msg = String(message).toLowerCase();
                  return msg.includes('resizeobserver loop') || 
                         msg.includes('resize observer loop');
                }

                // Suppress ResizeObserver errors in error handler
                window.addEventListener('error', function(e) {
                  if (isResizeObserverError(e.message)) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    return false;
                  }
                }, true);

                // Suppress in console
                const originalConsoleError = console.error;
                console.error = function(...args) {
                  if (args[0] && isResizeObserverError(args[0])) {
                    return;
                  }
                  originalConsoleError.apply(console, args);
                };
              })();
            `,
          }}
        />
        <Suspense
          fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>}
        >
          <LayoutProvider>
            <MIDIProvider>{children}</MIDIProvider>
          </LayoutProvider>
        </Suspense>
      </body>
    </html>
  )
}
