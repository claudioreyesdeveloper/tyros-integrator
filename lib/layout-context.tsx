"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type LayoutMode = "auto" | "desktop" | "ipad"

interface LayoutContextType {
  layoutMode: LayoutMode
  setLayoutMode: (mode: LayoutMode) => void
  effectiveMode: "desktop" | "ipad"
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined)

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("auto")
  const [effectiveMode, setEffectiveMode] = useState<"desktop" | "ipad">("desktop")

  useEffect(() => {
    const updateEffectiveMode = () => {
      if (layoutMode === "auto") {
        // Auto-detect based on screen size (iPad range: 768-1024px)
        const isIPadSize = window.innerWidth >= 768 && window.innerWidth <= 1024
        setEffectiveMode(isIPadSize ? "ipad" : "desktop")
      } else {
        setEffectiveMode(layoutMode)
      }
    }

    updateEffectiveMode()
    window.addEventListener("resize", updateEffectiveMode)
    return () => window.removeEventListener("resize", updateEffectiveMode)
  }, [layoutMode])

  useEffect(() => {
    document.body.setAttribute("data-layout-mode", effectiveMode)
    console.log("[v0] Layout mode changed to:", effectiveMode)
  }, [effectiveMode])

  return (
    <LayoutContext.Provider value={{ layoutMode, setLayoutMode, effectiveMode }}>{children}</LayoutContext.Provider>
  )
}

export function useLayout() {
  const context = useContext(LayoutContext)
  if (context === undefined) {
    throw new Error("useLayout must be used within a LayoutProvider")
  }
  return context
}
