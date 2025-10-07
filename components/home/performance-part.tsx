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
      className="premium-card p-8 flex flex-col items-center gap-6 hover:scale-105 transition-all duration-300 group"
    >
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-secondary to-secondary/60 flex items-center justify-center border-4 border-primary/40 group-hover:border-primary/80 transition-all shadow-lg shadow-primary/20">
        <VoiceIcon subcategory={voice?.sub || ""} className="text-primary" size={48} />
      </div>

      <div className="text-center w-full">
        <h3 className="premium-text text-2xl mb-2">{partName}</h3>
        {voice ? (
          <div className="space-y-1">
            <p className="text-sm premium-label">{voice.sub}</p>
            <p className="text-base font-semibold text-foreground">{voice.voice}</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No Voice</p>
        )}
      </div>
    </button>
  )
}
