"use client"

import { VoiceIcon } from "@/components/ui/voice-icon"
import type { Voice } from "@/lib/voice-data"

interface PerformancePartProps {
  partNumber: number
  partName: string
  voice?: Voice
  onSelectVoice: () => void
}

export function PerformancePart({ partNumber, partName, voice, onSelectVoice }: PerformancePartProps) {
  return (
    <button
      onClick={onSelectVoice}
      className="premium-card p-6 md:p-8 flex flex-col items-center gap-4 md:gap-6 hover:scale-105 transition-all duration-300 group"
    >
      <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-secondary/80 to-secondary/40 flex items-center justify-center border-4 border-primary/40 group-hover:border-primary/80 transition-all shadow-2xl shadow-primary/30">
        <VoiceIcon subcategory={voice?.sub || ""} category={voice?.category || ""} size={64} />
      </div>

      <div className="text-center w-full">
        <h3 className="premium-text text-xl md:text-2xl mb-2">{partName}</h3>
        {voice ? (
          <p className="text-sm md:text-base font-semibold text-foreground">{voice.voice}</p>
        ) : (
          <p className="text-xs md:text-sm text-muted-foreground">No Voice</p>
        )}
      </div>
    </button>
  )
}
