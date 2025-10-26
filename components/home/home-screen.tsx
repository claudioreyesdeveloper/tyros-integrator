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
    <div className="h-full overflow-y-auto p-4 md:p-6">
      <div className="w-full flex flex-col gap-4">
        {/* Welcome heading */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-[0_4px_12px_rgba(255,107,0,0.5)] tracking-tight">
            Welcome
          </h1>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((partNumber) => {
            const voice = partVoices[partNumber]

            return (
              <button
                key={partNumber}
                onClick={() => {
                  console.log("[v0] HomeScreen: Selecting voice for part", partNumber)
                  onSelectVoice(partNumber)
                }}
                className="premium-card p-3 flex flex-col items-center gap-2 hover:scale-[1.02] transition-all duration-300 group"
              >
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center border-3 border-amber-500/40 group-hover:border-amber-500 group-hover:shadow-xl group-hover:shadow-amber-500/30 transition-all shadow-lg shadow-amber-500/20">
                  <VoiceIcon subcategory={voice?.sub || ""} className="text-amber-500" size={40} />
                </div>

                <div className="text-center w-full">
                  <h3 className="premium-label text-sm mb-1">{PART_NAMES[partNumber - 1]}</h3>
                  {voice ? (
                    <p className="text-xs font-semibold text-white truncate">{voice.voice}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">No Voice</p>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Styles selector */}
        <StylesSelector />

        <div className="flex items-center justify-center gap-8 text-xs glossy-panel px-6 py-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" />
            <span className="premium-label">MIDI: Connected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-lg shadow-primary/50" />
            <span className="premium-label">SmartBridge Ready</span>
          </div>
        </div>
      </div>
    </div>
  )
}
