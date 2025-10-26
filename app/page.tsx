"use client"

import { useState } from "react"
import { TabNavigation } from "@/components/tab-navigation"
import { HomeScreen } from "@/components/home/home-screen"
import { VoiceBrowser } from "@/components/voices/voice-browser"
import { MixerInterface } from "@/components/mixer/mixer-interface"
import { ConfigPanel } from "@/components/config/config-panel"
import { ChordStudio } from "@/components/progressions/chord-studio"
import { useLayout } from "@/lib/layout-context"
import type { Voice } from "@/lib/voice-data"

export interface MixerSettings {
  volume: number
  pan: number
  eq: {
    bass: number
    mid: number
    high: number
  }
}

export interface DSPSettings {
  status: "ON" | "OFF"
  unitID_Hex: string
  effectType: {
    name: string
    msb_Dec: number
    lsb_Dec: number
  }
  parameters: Record<string, number>
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("home")
  const [currentPart, setCurrentPart] = useState<number | null>(null)
  const [previousTab, setPreviousTab] = useState<string>("home")
  const [mixerBank, setMixerBank] = useState(0)
  const [partVoices, setPartVoices] = useState<Record<number, Voice>>({})
  const [channelEffects, setChannelEffects] = useState<Record<number, string>>({})
  const { mixerViewMode } = useLayout()

  const [channelMixer, setChannelMixer] = useState<Record<number, MixerSettings>>({})
  const [channelDSP, setChannelDSP] = useState<Record<number, DSPSettings>>({})

  const handleSelectVoice = (partNumber: number) => {
    console.log("[v0] Page: handleSelectVoice called for part", partNumber)
    setCurrentPart(partNumber)
    setPreviousTab(activeTab)
    setActiveTab("voices")
    console.log("[v0] Page: Switched to voices tab, currentPart set to", partNumber)
  }

  const handleVoiceAssigned = (voice: Voice) => {
    console.log("[v0] Page: handleVoiceAssigned called with voice", voice, "for part", currentPart)

    if (currentPart !== null) {
      setPartVoices((prev) => {
        const updated = { ...prev, [currentPart]: voice }
        console.log("[v0] Page: Updated partVoices", updated)
        return updated
      })
    } else {
      console.log("[v0] Page: ERROR - currentPart is null!")
    }

    console.log("[v0] Page: Switching back to tab", previousTab)
    setActiveTab(previousTab)
  }

  const handleCancelVoiceSelection = () => {
    console.log("[v0] Page: Voice selection cancelled, returning to", previousTab)
    setActiveTab(previousTab)
  }

  const handleEffectAssigned = (channel: number, effectName: string) => {
    setChannelEffects((prev) => ({ ...prev, [channel]: effectName }))
  }

  const handleVoiceAssignedInline = (channel: number, voice: Voice) => {
    console.log("[v0] Page: handleVoiceAssignedInline called for channel", channel, "with voice", voice)
    setPartVoices((prev) => {
      const updated = { ...prev, [channel]: voice }
      console.log("[v0] Page: Updated partVoices inline", updated)
      return updated
    })
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_0068-KWOtxG3niqNY0qYM5S7YiwzptMfF9k.png)",
        }}
      />
      <div className="absolute inset-0 bg-black/10" />
      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="border-b border-amber-500/30 backdrop-blur-md bg-black/20">
          <div className="max-w-7xl mx-auto">
            <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          {activeTab === "home" && <HomeScreen onSelectVoice={handleSelectVoice} partVoices={partVoices} />}

          {activeTab === "voices" && (
            <VoiceBrowser
              currentPart={currentPart}
              onVoiceAssigned={handleVoiceAssigned}
              onCancel={handleCancelVoiceSelection}
            />
          )}

          {activeTab === "mixer" && (
            <MixerInterface
              onSelectVoice={handleSelectVoice}
              partVoices={partVoices}
              channelEffects={channelEffects}
              onEffectAssigned={handleEffectAssigned}
              currentBank={mixerBank}
              onBankChange={setMixerBank}
              viewMode={mixerViewMode}
              onVoiceAssignedInline={handleVoiceAssignedInline}
            />
          )}

          {activeTab === "chord-studio" && <ChordStudio />}

          {activeTab === "config" && <ConfigPanel />}
        </main>
      </div>
    </div>
  )
}
