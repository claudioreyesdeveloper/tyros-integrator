"use client"

import { useState } from "react"
import type { Voice } from "@/lib/voice-data"
import { VoiceIcon } from "@/components/ui/voice-icon"
import { StylesSelector } from "./styles-selector"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Play, Square, PlayCircle } from "lucide-react"
import { tyrosAPI } from "@/lib/tyros-api"

interface HomeScreenProps {
  onSelectVoice: (partNumber: number) => void
  partVoices: Record<number, Voice>
}

const PART_NAMES = ["Left 1", "Left 2", "Right 1", "Right 2"]

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
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-4 drop-shadow-[0_4px_12px_rgba(255,255,255,0.5)] tracking-tight">
            Welcome
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 lg:gap-6 max-w-7xl w-full mb-6 md:mb-7 lg:mb-8">
          {[1, 2, 3, 4].map((partNumber) => {
            const voice = partVoices[partNumber]

            return (
              <button
                key={partNumber}
                onClick={() => onSelectVoice(partNumber)}
                className="premium-card p-6 md:p-7 lg:p-8 flex flex-col items-center gap-4 md:gap-5 lg:gap-6 hover:scale-105 transition-all duration-300 group"
              >
                <div className="w-20 h-20 md:w-22 md:h-22 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-secondary to-secondary/60 flex items-center justify-center border-4 border-primary/40 group-hover:border-primary/80 transition-all shadow-lg shadow-primary/20">
                  <VoiceIcon subcategory={voice?.sub || ""} className="text-primary" size={48} />
                </div>

                <div className="text-center w-full">
                  <h3 className="premium-text text-xl md:text-2xl lg:text-2xl mb-2">{PART_NAMES[partNumber - 1]}</h3>
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

        <div className="max-w-full md:max-w-lg lg:max-w-md w-full px-4 md:px-0 mb-6">
          <StylesSelector />
        </div>

        <div className="max-w-full md:max-w-2xl w-full px-4 md:px-0 mb-6">
          <div className="premium-card p-6">
            <h3 className="premium-text text-lg mb-4">Style Controls</h3>

            {/* Transport buttons */}
            <div className="flex gap-3 mb-6">
              <Button
                onClick={handleStart}
                disabled={isPlaying}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <Play className="w-4 h-4 mr-2" />
                Start
              </Button>
              <Button
                onClick={handleStop}
                disabled={!isPlaying}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                <Square className="w-4 h-4 mr-2" />
                Stop
              </Button>
              <Button onClick={handleSyncStart} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                <PlayCircle className="w-4 h-4 mr-2" />
                Sync Start
              </Button>
            </div>

            {/* Variation selector */}
            <div className="mb-6">
              <label className="text-sm font-medium text-white mb-2 block">Variation</label>
              <Select value={variation} onValueChange={handleVariationChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VARIATION_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tempo slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-white">Tempo</label>
                <span className="text-sm font-semibold text-white">{tempo} BPM</span>
              </div>
              <Slider
                value={[tempo]}
                onValueChange={handleTempoChange}
                min={30}
                max={400}
                step={1}
                className="w-full"
              />
            </div>
          </div>
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
