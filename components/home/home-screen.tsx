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
    <div className="h-full flex flex-col items-center justify-center p-6 md:p-10 lg:p-8">
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="text-center mb-10 md:mb-14 lg:mb-12">
          <h1 className="text-7xl md:text-9xl lg:text-8xl font-bold text-white mb-4 drop-shadow-[0_6px_16px_rgba(255,255,255,0.6)] tracking-tight">
            Welcome
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 lg:gap-8 max-w-7xl w-full mb-8 md:mb-12 lg:mb-10">
          {[1, 2, 3, 4].map((partNumber) => {
            const voice = partVoices[partNumber]

            return (
              <button
                key={partNumber}
                onClick={() => {
                  console.log("[v0] HomeScreen: Selecting voice for part", partNumber)
                  onSelectVoice(partNumber)
                }}
                className="premium-card p-8 md:p-12 lg:p-10 flex flex-col items-center gap-6 md:gap-10 lg:gap-8 hover:scale-105 transition-all duration-300 group min-h-[240px] md:min-h-[320px] lg:min-h-[240px]"
              >
                <div className="w-24 h-24 md:w-32 md:h-32 lg:w-28 lg:h-28 rounded-full bg-gradient-to-br from-secondary to-secondary/60 flex items-center justify-center border-4 md:border-[6px] lg:border-4 border-primary/50 group-hover:border-primary/90 transition-all shadow-lg shadow-primary/30">
                  <VoiceIcon
                    subcategory={voice?.sub || ""}
                    className="text-primary w-14 h-14 md:w-20 md:h-20 lg:w-14 lg:h-14"
                    size={56}
                  />
                </div>

                <div className="text-center w-full">
                  <h3 className="premium-text text-2xl md:text-4xl lg:text-3xl mb-3">{PART_NAMES[partNumber - 1]}</h3>
                  {voice ? (
                    <p className="text-base md:text-2xl lg:text-xl font-semibold text-white">{voice.voice}</p>
                  ) : (
                    <p className="text-sm md:text-lg lg:text-base text-muted-foreground">No Voice</p>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        <div className="max-w-full md:max-w-2xl lg:max-w-md w-full px-4 md:px-0 mb-8 md:mb-12 lg:mb-8">
          <StylesSelector />
        </div>

        <div className="max-w-full md:max-w-4xl lg:max-w-3xl w-full px-4 md:px-0 mb-8">
          <div className="premium-card p-8 md:p-12 lg:p-8">
            <h3 className="section-header">Style Controls</h3>

            <div className="flex gap-4 md:gap-6 lg:gap-4 mb-8 md:mb-12 lg:mb-8">
              <Button
                onClick={handleStart}
                disabled={isPlaying}
                className="flex-1 h-16 md:h-20 lg:h-16 bg-green-600 hover:bg-green-700 text-white text-base md:text-xl lg:text-base font-bold shadow-lg"
              >
                <Play className="w-5 h-5 md:w-7 md:h-7 lg:w-5 lg:h-5 mr-2" />
                Start
              </Button>
              <Button
                onClick={handleStop}
                disabled={!isPlaying}
                className="flex-1 h-16 md:h-20 lg:h-16 bg-red-600 hover:bg-red-700 text-white text-base md:text-xl lg:text-base font-bold shadow-lg"
              >
                <Square className="w-5 h-5 md:w-7 md:h-7 lg:w-5 lg:h-5 mr-2" />
                Stop
              </Button>
              <Button
                onClick={handleSyncStart}
                className="flex-1 h-16 md:h-20 lg:h-16 bg-blue-600 hover:bg-blue-700 text-white text-base md:text-xl lg:text-base font-bold shadow-lg"
              >
                <PlayCircle className="w-5 h-5 md:w-7 md:h-7 lg:w-5 lg:h-5 mr-2" />
                Sync Start
              </Button>
            </div>

            <div className="mb-8 md:mb-12 lg:mb-8">
              <label className="premium-label mb-3 md:mb-4 lg:mb-3 block">Variation</label>
              <Select value={variation} onValueChange={handleVariationChange}>
                <SelectTrigger className="w-full h-14 md:h-20 lg:h-14 text-base md:text-xl lg:text-base font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VARIATION_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option} className="md:text-xl lg:text-base md:py-4 lg:py-2">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3 md:mb-5 lg:mb-3">
                <label className="premium-label">Tempo</label>
                <span className="value-display">{tempo} BPM</span>
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

        <div className="mt-10 md:mt-14 lg:mt-12 flex flex-col md:flex-row items-center gap-6 md:gap-10 lg:gap-8 text-sm md:text-lg lg:text-base glossy-panel px-8 md:px-12 lg:px-10 py-4 md:py-6 lg:py-5">
          <div className="flex items-center gap-4 md:gap-6 lg:gap-4">
            <div className="w-4 h-4 md:w-6 md:h-6 lg:w-4 lg:h-4 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/60" />
            <span className="premium-label text-base md:text-xl lg:text-base">MIDI: Connected</span>
          </div>
          <div className="hidden md:block w-px h-8 md:h-12 lg:h-8 bg-border" />
          <div className="flex items-center gap-4 md:gap-6 lg:gap-4">
            <div className="w-4 h-4 md:w-6 md:h-6 lg:w-4 lg:h-4 rounded-full bg-primary shadow-lg shadow-primary/60" />
            <span className="premium-label text-base md:text-xl lg:text-base">SmartBridge Ready</span>
          </div>
        </div>
      </div>
    </div>
  )
}
