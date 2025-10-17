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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Aggressive ResizeObserver error suppression
                function isResizeObserverError(message) {
                  if (!message) return false;
                  const msg = String(message).toLowerCase();
                  return msg.includes('resizeobserver') || 
                         msg.includes('resize observer') ||
                         msg.includes('loop limit exceeded') ||
                         msg.includes('loop completed') ||
                         msg.includes('undelivered notifications');
                }

                // Suppress at the earliest possible point
                const noop = () => true;
                
                // Override window.onerror immediately
                window.onerror = function(message) {
                  if (isResizeObserverError(message)) return true;
                  return false;
                };

                // Capture phase error listener (runs before bubble phase)
                window.addEventListener('error', function(e) {
                  if (isResizeObserverError(e.message || e.error?.message)) {
                    e.stopImmediatePropagation();
                    e.stopPropagation();
                    e.preventDefault();
                  }
                }, { capture: true, passive: false });

                // Unhandled rejections
                window.addEventListener('unhandledrejection', function(e) {
                  if (isResizeObserverError(e.reason?.message || e.reason)) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                  }
                }, { capture: true });

                // Console suppression
                const originalError = console.error;
                const originalWarn = console.warn;
                
                console.error = function(...args) {
                  if (args.some(arg => isResizeObserverError(String(arg)))) return;
                  originalError.apply(console, args);
                };

                console.warn = function(...args) {
                  if (args.some(arg => isResizeObserverError(String(arg)))) return;
                  originalWarn.apply(console, args);
                };

                // Wrap ResizeObserver constructor
                if (typeof ResizeObserver !== 'undefined') {
                  const OriginalResizeObserver = ResizeObserver;
                  window.ResizeObserver = class extends OriginalResizeObserver {
                    constructor(callback) {
                      super((entries, observer) => {
                        window.requestAnimationFrame(() => {
                          try {
                            callback(entries, observer);
                          } catch (e) {
                            if (!isResizeObserverError(e.message)) {
                              console.error('ResizeObserver error:', e);
                            }
                          }
                        });
                      });
                    }
                  };
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`font-sans ${geistSans.variable} ${geistMono.variable} antialiased`}>
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
