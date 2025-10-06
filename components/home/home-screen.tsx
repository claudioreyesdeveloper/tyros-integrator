"use client"
import { getVoiceIcon } from "@/lib/voice-icons"
import type { Voice } from "@/lib/voice-data"
import { Music } from "lucide-react"
import { StylesSelector } from "./styles-selector"

interface HomeScreenProps {
  onSelectVoice: (partNumber: number) => void
  partVoices: Record<number, Voice>
}

const PART_NAMES = ["Left", "Right 1", "Right 2", "Right 3"]

export function HomeScreen({ onSelectVoice, partVoices }: HomeScreenProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      {/* Content */}
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold premium-text mb-4 bg-gradient-to-r from-primary via-yellow-400 to-primary bg-clip-text text-transparent drop-shadow-lg">
            Welcome
          </h1>
          <p className="text-xl text-white drop-shadow-lg">Select a voice to begin</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl w-full mb-8">
          {[1, 2, 3, 4].map((partNumber) => {
            const voice = partVoices[partNumber]
            const Icon = voice ? getVoiceIcon(voice.sub) : Music

            return (
              <button
                key={partNumber}
                onClick={() => onSelectVoice(partNumber)}
                className="premium-card p-8 flex flex-col items-center gap-6 hover:scale-105 transition-all duration-300 group"
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-secondary to-secondary/60 flex items-center justify-center border-4 border-primary/40 group-hover:border-primary/80 transition-all shadow-lg shadow-primary/20">
                  <Icon className="w-12 h-12 text-primary" />
                </div>

                <div className="text-center w-full">
                  <h3 className="premium-text text-2xl mb-2">{PART_NAMES[partNumber - 1]}</h3>
                  {voice ? (
                    <div className="space-y-2">
                      <p className="text-sm premium-label">{voice.sub}</p>
                      <p className="text-base font-semibold text-foreground">{voice.voice}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No Voice</p>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        <div className="max-w-md w-full">
          <StylesSelector />
        </div>

        <div className="mt-12 flex items-center gap-6 text-sm glossy-panel px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" />
            <span className="premium-label">MIDI: Connected</span>
          </div>
          <div className="w-px h-6 bg-border" />
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-primary shadow-lg shadow-primary/50" />
            <span className="premium-label">Tyros5 Ready</span>
          </div>
        </div>
      </div>
    </div>
  )
}
