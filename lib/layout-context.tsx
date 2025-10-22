"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useRef } from "react"

type LayoutMode = "auto" | "desktop" | "ipad"
type EffectiveMode = "desktop" | "ipad"
type MixerViewMode = "vertical" | "horizontal"
type VoiceNavMode = "category" | "flat" // category = 3-level, flat = 2-level

interface LayoutContextType {
  mode: LayoutMode
  effectiveMode: EffectiveMode
  setMode: (mode: LayoutMode) => void
  mixerViewMode: MixerViewMode
  setMixerViewMode: (mode: MixerViewMode) => void
  voiceNavMode: VoiceNavMode
  setVoiceNavMode: (mode: VoiceNavMode) => void
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined)

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<LayoutMode>("auto")
  const [effectiveMode, setEffectiveMode] = useState<EffectiveMode>("desktop")
  const [mixerViewMode, setMixerViewMode] = useState<MixerViewMode>("vertical")
  const [voiceNavMode, setVoiceNavMode] = useState<VoiceNavMode>("category")
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const updateEffectiveMode = () => {
      if (mode === "auto") {
        // Auto mode: detect based on screen size
        const isTablet = window.matchMedia("(min-width: 768px) and (max-width: 1024px)").matches
        setEffectiveMode(isTablet ? "ipad" : "desktop")
      } else {
        // Manual mode: use selected mode
        setEffectiveMode(mode as EffectiveMode)
      }
    }

    updateEffectiveMode()

    if (mode === "auto") {
      const mediaQuery = window.matchMedia("(min-width: 768px) and (max-width: 1024px)")
      mediaQuery.addEventListener("change", updateEffectiveMode)
      return () => mediaQuery.removeEventListener("change", updateEffectiveMode)
    }
  }, [mode])

  useEffect(() => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current)
    }

    updateTimeoutRef.current = setTimeout(() => {
      requestAnimationFrame(() => {
        try {
          document.body.setAttribute("data-layout-mode", effectiveMode)
        } catch (error) {
          // Silently catch any errors during attribute setting
          console.debug("Layout mode update:", effectiveMode)
        }
      })
    }, 50) // Small debounce to batch rapid changes

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }
    }
  }, [effectiveMode])

  useEffect(() => {
    const saved = localStorage.getItem("mixerViewMode")
    if (saved === "vertical" || saved === "horizontal") {
      setMixerViewMode(saved)
    } else {
      setMixerViewMode("vertical")
    }

    const savedVoiceNav = localStorage.getItem("voiceNavMode")
    if (savedVoiceNav === "category" || savedVoiceNav === "flat") {
      setVoiceNavMode(savedVoiceNav)
    } else {
      setVoiceNavMode("category")
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("mixerViewMode", mixerViewMode)
  }, [mixerViewMode])

  useEffect(() => {
    localStorage.setItem("voiceNavMode", voiceNavMode)
  }, [voiceNavMode])

  return (
    <LayoutContext.Provider
      value={{ mode, effectiveMode, setMode, mixerViewMode, setMixerViewMode, voiceNavMode, setVoiceNavMode }}
    >
      {children}
    </LayoutContext.Provider>
  )
}

export function useLayout() {
  const context = useContext(LayoutContext)
  if (context === undefined) {
    throw new Error("useLayout must be used within a LayoutProvider")
  }
  return context
}
