"use client"
import type { Voice } from "@/lib/voice-data"
import { VoiceIcon } from "@/components/ui/voice-icon"
import { StylesSelector } from "./styles-selector"

interface HomeScreenProps {
  onSelectVoice: (partNumber: number) => void
  partVoices: Record<number, Voice>
}

const PART_NAMES = ["Left", "Right 1", "Right 2", "Right 3"]

export function HomeScreen({ onSelectVoice, partVoices }: HomeScreenProps) {
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
                    <p className="text-sm md:text-base lg:text-lg font-semibold text-foreground">{voice.voice}</p>
                  ) : (
                    <p className="text-xs md:text-sm text-muted-foreground">No Voice</p>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        <div className="max-w-full md:max-w-lg lg:max-w-md w-full px-4 md:px-0">
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
