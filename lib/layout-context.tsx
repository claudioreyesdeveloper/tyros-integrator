"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type MixerViewMode = "vertical" | "horizontal"
type VoiceNavMode = "category" | "flat" // category = 3-level, flat = 2-level

interface LayoutContextType {
  mixerViewMode: MixerViewMode
  setMixerViewMode: (mode: MixerViewMode) => void
  voiceNavMode: VoiceNavMode
  setVoiceNavMode: (mode: VoiceNavMode) => void
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined)

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [mixerViewMode, setMixerViewMode] = useState<MixerViewMode>("vertical")
  const [voiceNavMode, setVoiceNavMode] = useState<VoiceNavMode>("category")

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
    <LayoutContext.Provider value={{ mixerViewMode, setMixerViewMode, voiceNavMode, setVoiceNavMode }}>
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
