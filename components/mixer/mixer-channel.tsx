"use client"

import { useState } from "react"
import { useMIDI } from "@/lib/midi-context"
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
  const [pan, setPan] = useState(64)
  const [reverb, setReverb] = useState(40)
  const [chorus, setChorus] = useState(30)
  const [brightness, setBrightness] = useState(64)
  const [bass, setBass] = useState(64)
  const [mid, setMid] = useState(64)
  const [high, setHigh] = useState(64)

  const handleVolumeChange = (value: number) => {
    setVolume(value)
    api.sendCommand({
      type: "mixer",
      action: "volume",
      channel,
      value,
    })
  }

  const handlePanChange = (value: number) => {
    setPan(value)
    api.sendCommand({
      type: "mixer",
      action: "pan",
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

  const handleBassChange = (value: number) => {
    setBass(value)
    console.log(`[v0] EQ Bass CH${channel}:`, value)
    // TODO: Implement EQ bass command in Tyros API
  }

  const handleMidChange = (value: number) => {
    setMid(value)
    console.log(`[v0] EQ Mid CH${channel}:`, value)
    // TODO: Implement EQ mid command in Tyros API
  }

  const handleHighChange = (value: number) => {
    setHigh(value)
    console.log(`[v0] EQ High CH${channel}:`, value)
    // TODO: Implement EQ high command in Tyros API
  }

  return (
    <div className="premium-card flex flex-col items-center gap-5 md:gap-7 lg:gap-5 w-full max-w-[180px] md:max-w-[280px] lg:max-w-none lg:w-[260px] xl:w-[280px] min-h-[600px] md:min-h-[800px] lg:min-h-[700px] shadow-2xl">
      <button
        onClick={onSelectVoice}
        className="w-full glossy-button px-4 md:px-6 lg:px-4 py-3.5 md:py-5 lg:py-3.5 rounded-xl flex items-center justify-center gap-2.5 md:gap-3 lg:gap-2.5 text-black font-bold text-sm md:text-lg lg:text-sm shadow-lg hover:shadow-xl transition-all"
      >
        <VoiceIcon
          subcategory={voiceSubcategory}
          category={voiceCategory}
          size={20}
          className="md:w-7 md:h-7 lg:w-5 lg:h-5"
        />
        <span className="text-base md:text-xl lg:text-base">Voice</span>
      </button>

      <div className="text-center w-full">
        <div className="text-sm md:text-lg lg:text-sm text-primary font-extrabold tracking-wider mb-1">
          CH {channel}
        </div>
        <div className="premium-text text-base md:text-xl lg:text-base font-bold">{partName}</div>
      </div>

      <div className="w-full">
        <div className="flex flex-col items-center gap-3 md:gap-4 lg:gap-3 px-4 md:px-6 lg:px-4 py-5 md:py-7 lg:py-5 bg-gradient-to-br from-secondary via-secondary/90 to-secondary/70 rounded-xl border-2 md:border-3 lg:border-2 border-primary/30 shadow-inner">
          <VoiceIcon
            subcategory={voiceSubcategory}
            category={voiceCategory}
            size={48}
            className="md:w-16 md:h-16 lg:w-12 lg:h-12"
          />
          <span className="text-sm md:text-lg lg:text-sm font-bold text-center line-clamp-2 text-foreground leading-tight">
            {voiceName}
          </span>
        </div>
      </div>

      <div className="w-full space-y-3 md:space-y-4 lg:space-y-3">
        <div className="premium-label text-center">Volume</div>
        <input
          type="range"
          min="0"
          max="127"
          value={volume}
          onChange={(e) => handleVolumeChange(Number(e.target.value))}
          className="w-full slider-horizontal"
        />
        <div className="text-center value-display">{volume}</div>
      </div>

      <div className="w-full space-y-5 md:space-y-7 lg:space-y-5 flex-1">
        <RotaryKnob value={pan} onChange={handlePanChange} label="Pan" displayValue={`${pan}`} size="md" />
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

      <div className="w-full space-y-3 md:space-y-4 lg:space-y-3">
        <div className="premium-label text-center">EQ</div>
        <div className="px-4 md:px-6 lg:px-4 py-5 md:py-7 lg:py-5 bg-gradient-to-br from-accent/40 via-accent/25 to-accent/15 rounded-xl border-2 md:border-3 lg:border-2 border-primary/50 shadow-lg">
          <div className="flex flex-col gap-4 md:gap-6 lg:gap-4">
            <RotaryKnob value={bass} onChange={handleBassChange} label="Bass" displayValue={`${bass}`} size="sm" />
            <RotaryKnob value={mid} onChange={handleMidChange} label="Mid" displayValue={`${mid}`} size="sm" />
            <RotaryKnob value={high} onChange={handleHighChange} label="High" displayValue={`${high}`} size="sm" />
          </div>
        </div>
      </div>
    </div>
  )
}
