"use client"

import { useState } from "react"
import { useMIDI } from "@/lib/midi-context"
import { Sliders } from "lucide-react"
import { RotaryKnob } from "@/components/ui/rotary-knob"
import { VoiceIcon } from "@/components/ui/voice-icon"

interface MixerChannelProps {
  channel: number
  partName: string
  voiceName: string
  insertEffect: string
  onOpenEffects: () => void
  onSelectVoice: () => void
  voiceSubcategory?: string
  voiceCategory?: string
}

export function MixerChannel({
  channel,
  partName,
  voiceName,
  insertEffect,
  onOpenEffects,
  onSelectVoice,
  voiceSubcategory = "",
  voiceCategory = "",
}: MixerChannelProps) {
  const { api } = useMIDI()
  const [volume, setVolume] = useState(100)
  const [reverb, setReverb] = useState(40)
  const [chorus, setChorus] = useState(30)
  const [brightness, setBrightness] = useState(64)

  const handleVolumeChange = (value: number) => {
    setVolume(value)
    api.sendCommand({
      type: "mixer",
      action: "volume",
      channel,
      value,
    })
  }

  const handleReverbChange = (value: number) => {
    setReverb(value)
    api.sendCommand({
      type: "mixer",
      action: "reverb",
      channel,
      value,
    })
  }

  const handleChorusChange = (value: number) => {
    setChorus(value)
    api.sendCommand({
      type: "mixer",
      action: "chorus",
      channel,
      value,
    })
  }

  const handleBrightnessChange = (value: number) => {
    setBrightness(value)
    api.sendCommand({
      type: "mixer",
      action: "brightness",
      channel,
      value,
    })
  }

  return (
    <div className="premium-card p-3 md:p-4 lg:p-5 flex flex-col items-center gap-2 md:gap-3 lg:gap-4 w-full max-w-[160px] md:max-w-[170px] lg:max-w-none lg:w-[220px] xl:w-[240px] min-h-[450px] md:min-h-[500px] lg:min-h-[550px] shadow-2xl">
      <button
        onClick={onSelectVoice}
        className="w-full glossy-button px-2 md:px-3 lg:px-4 py-2 md:py-2.5 lg:py-3 rounded-lg flex items-center justify-center gap-2 text-black font-bold text-xs md:text-sm shadow-lg hover:shadow-xl transition-all"
      >
        <VoiceIcon subcategory={voiceSubcategory} category={voiceCategory} size={18} />
        Voice
      </button>

      {/* Track Header */}
      <div className="text-center w-full">
        <div className="text-xs text-primary font-bold tracking-wider">CH {channel}</div>
        <div className="premium-text text-xs md:text-sm mt-1 font-bold">{partName}</div>
      </div>

      <div className="w-full">
        <div className="flex flex-col items-center gap-2 px-2 md:px-3 py-3 md:py-4 lg:py-5 bg-gradient-to-br from-secondary via-secondary/90 to-secondary/70 rounded-lg border-2 border-primary/20 shadow-inner">
          <VoiceIcon subcategory={voiceSubcategory} category={voiceCategory} size={40} />
          <span className="text-xs font-bold text-center line-clamp-2 text-foreground">{voiceName}</span>
        </div>
      </div>

      <div className="w-full space-y-2">
        <div className="premium-label text-center text-xs">Volume</div>
        <input
          type="range"
          min="0"
          max="127"
          value={volume}
          onChange={(e) => handleVolumeChange(Number(e.target.value))}
          className="w-full slider-horizontal"
        />
        <div className="text-center text-xs md:text-sm font-mono font-bold text-primary drop-shadow-md">{volume}</div>
      </div>

      <div className="w-full space-y-2 md:space-y-3 lg:space-y-4 flex-1">
        <RotaryKnob value={reverb} onChange={handleReverbChange} label="Reverb" displayValue={`${reverb}`} size="md" />

        <RotaryKnob value={chorus} onChange={handleChorusChange} label="Chorus" displayValue={`${chorus}`} size="md" />

        <RotaryKnob
          value={brightness}
          onChange={handleBrightnessChange}
          label="Bright"
          displayValue={`${brightness}`}
          size="md"
        />
      </div>

      <div className="w-full space-y-2">
        <div className="px-2 md:px-3 py-2 md:py-3 lg:py-4 bg-gradient-to-br from-accent/30 via-accent/20 to-accent/10 rounded-lg border-2 border-primary/40 text-center shadow-lg">
          <div className="premium-label text-xs mb-1">Insert FX</div>
          <div className="text-xs font-bold mt-1 line-clamp-2 text-white drop-shadow-md">{insertEffect}</div>
        </div>
        <button
          onClick={onOpenEffects}
          className="w-full glossy-button px-2 md:px-3 lg:px-4 py-2 md:py-2.5 lg:py-3 rounded-lg flex items-center justify-center gap-2 text-black font-bold text-xs md:text-sm shadow-lg hover:shadow-xl transition-all"
        >
          <Sliders className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4" />
          DSP
        </button>
      </div>
    </div>
  )
}
