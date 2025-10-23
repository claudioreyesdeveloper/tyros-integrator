"use client"

import { useState } from "react"
import type { Voice } from "@/lib/voice-data"
import { VoiceIcon } from "@/components/ui/voice-icon"
import { StylesSelector } from "./styles-selector"
import { tyrosAPI } from "@/lib/tyros-api"

interface HomeScreenProps {
  onSelectVoice: (partNumber: number) => void
  partVoices: Record<number, Voice>
}

const PART_NAMES = ["Left 1", "Right 1", "Right 2", "Right 3"]

const VARIATION_OPTIONS = [
  "Intro 1",
  "Intro 2",
  "Intro 3",
  "Main 1",
  "Main 2",
  "Main 3",
  "Main 4",
  "Fillin",
  "Outro 1",
  "Outro 2",
  "Outro 3",
]

export function HomeScreen({ onSelectVoice, partVoices }: HomeScreenProps) {
  const [tempo, setTempo] = useState(120)
  const [variation, setVariation] = useState("Main 1")
  const [isPlaying, setIsPlaying] = useState(false)

  const handleStart = () => {
    tyrosAPI.sendCommand({ type: "style", action: "start" })
    setIsPlaying(true)
  }

  const handleStop = () => {
    tyrosAPI.sendCommand({ type: "style", action: "stop" })
    setIsPlaying(false)
  }

  const handleSyncStart = () => {
    tyrosAPI.sendCommand({ type: "style", action: "sync-start", enabled: true })
  }

  const handleTempoChange = (value: number[]) => {
    const newTempo = value[0]
    setTempo(newTempo)
    tyrosAPI.sendCommand({ type: "style", action: "tempo", value: newTempo })
  }

  const handleVariationChange = (value: string) => {
    setVariation(value)
    // Note: The variation command would need to be mapped to the appropriate variation number
    // This is a placeholder - actual implementation would need to map the string to a number
    console.log("[v0] Variation changed to:", value)
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-4 md:p-6 lg:p-8">
      {/* Content */}
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="text-center mb-8 md:mb-10 lg:mb-12">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-4 drop-shadow-[0_4px_12px_rgba(255,107,0,0.5)] tracking-tight">
            Welcome
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 lg:gap-6 max-w-7xl w-full mb-6 md:mb-7 lg:mb-8">
          {[1, 2, 3, 4].map((partNumber) => {
            const voice = partVoices[partNumber]

            return (
              <button
                key={partNumber}
                onClick={() => {
                  console.log("[v0] HomeScreen: Selecting voice for part", partNumber)
                  onSelectVoice(partNumber)
                }}
                className="premium-card p-6 md:p-7 lg:p-8 flex flex-col items-center gap-4 md:gap-5 lg:gap-6 hover:scale-105 transition-all duration-300 group"
              >
                <div className="w-28 h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center border-4 border-amber-500/40 group-hover:border-amber-500 group-hover:shadow-2xl group-hover:shadow-amber-500/30 transition-all shadow-lg shadow-amber-500/20">
                  <VoiceIcon subcategory={voice?.sub || ""} className="text-amber-500" size={80} />
                </div>

                <div className="text-center w-full">
                  <h3 className="premium-label text-xl md:text-2xl lg:text-2xl mb-2">{PART_NAMES[partNumber - 1]}</h3>
                  {voice ? (
                    <p className="text-sm md:text-base lg:text-lg font-semibold text-white">{voice.voice}</p>
                  ) : (
                    <p className="text-xs md:text-sm text-muted-foreground">No Voice</p>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        <div className="max-w-7xl w-full mb-6">
          <StylesSelector />
        </div>

        <div className="mt-8 md:mt-10 lg:mt-12 flex flex-col md:flex-row items-center gap-4 md:gap-6 text-xs md:text-sm glossy-panel px-6 md:px-8 py-3 md:py-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" />
            <span className="premium-label">MIDI: Connected</span>
          </div>
          <div className="hidden md:block w-px h-6 bg-border" />
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-primary shadow-lg shadow-primary/50" />
            <span className="premium-label">SmartBridge Ready</span>
          </div>
        </div>
      </div>
    </div>
  )
}
