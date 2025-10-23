"use client"

import { useState, useRef } from "react"
import { useMIDI } from "@/lib/midi-context"
import { VoiceIcon } from "@/components/ui/voice-icon"
import { RotaryKnob } from "@/components/ui/rotary-knob"
import { Music } from "lucide-react"
import { InlineVoiceSelector } from "./inline-voice-selector"
import type { Voice } from "@/lib/voice-data"

interface MixerChannelHorizontalProps {
  channel: number
  partName: string
  voiceName: string
  onSelectVoice: () => void
  onVoiceAssignedInline?: (channel: number, voice: Voice) => void
  voiceSubcategory?: string
  voiceCategory?: string
  currentVoice?: Voice
}

export function MixerChannelHorizontal({
  channel,
  partName,
  voiceName,
  onSelectVoice,
  onVoiceAssignedInline,
  voiceSubcategory = "",
  voiceCategory = "",
  currentVoice,
}: MixerChannelHorizontalProps) {
  const { api } = useMIDI()

  const [volume, setVolume] = useState(100)
  const [pan, setPan] = useState(64)
  const [reverb, setReverb] = useState(40)
  const [chorus, setChorus] = useState(30)
  const [brightness, setBrightness] = useState(64)
  const [bass, setBass] = useState(64)
  const [mid, setMid] = useState(64)
  const [high, setHigh] = useState(64)

  const [showInlineSelector, setShowInlineSelector] = useState(false)
  const voiceButtonRef = useRef<HTMLButtonElement>(null)

  const handleVolumeChange = (value: number) => {
    setVolume(value)
    api.sendCommand({ type: "mixer", action: "volume", channel, value })
  }

  const handlePanChange = (value: number) => {
    setPan(value)
    api.sendCommand({ type: "mixer", action: "pan", channel, value })
  }

  const handleReverbChange = (value: number) => {
    setReverb(value)
    api.sendCommand({ type: "mixer", action: "reverb", channel, value })
  }

  const handleChorusChange = (value: number) => {
    setChorus(value)
    api.sendCommand({ type: "mixer", action: "chorus", channel, value })
  }

  const handleBrightnessChange = (value: number) => {
    setBrightness(value)
    api.sendCommand({ type: "mixer", action: "brightness", channel, value })
  }

  const handleBassChange = (value: number) => {
    setBass(value)
    console.log(`[v0] EQ Bass CH${channel}:`, value)
  }

  const handleMidChange = (value: number) => {
    setMid(value)
    console.log(`[v0] EQ Mid CH${channel}:`, value)
  }

  const handleHighChange = (value: number) => {
    setHigh(value)
    console.log(`[v0] EQ High CH${channel}:`, value)
  }

  const handleVoiceClick = () => {
    if (onVoiceAssignedInline) {
      setShowInlineSelector(true)
    } else {
      onSelectVoice()
    }
  }

  const handleInlineVoiceSelect = (voice: Voice) => {
    if (onVoiceAssignedInline) {
      onVoiceAssignedInline(channel, voice)
    }
  }

  return (
    <>
      <div className="grid grid-cols-[40px_200px_80px_60px_60px_60px_60px_60px_60px_60px_60px] gap-3 items-center py-4 px-3 mb-2 rounded-lg border-2 border-amber-500/20 bg-gradient-to-br from-[rgba(20,20,20,0.75)] to-[rgba(10,10,10,0.85)] backdrop-blur-sm transition-all duration-200 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:border-amber-500/40">
        {/* Channel Number */}
        <div className="text-amber-500 font-bold text-sm text-center">{channel}</div>

        {/* Voice Name - clickable to select voice */}
        <button
          ref={voiceButtonRef}
          onClick={handleVoiceClick}
          className="text-white text-xs font-medium text-left truncate hover:text-amber-500 transition-colors flex items-center gap-2"
        >
          {voiceName === "No Voice" ? (
            <Music className="w-5 h-5 text-zinc-600 flex-shrink-0" />
          ) : (
            <VoiceIcon subcategory={voiceSubcategory} category={voiceCategory} size={20} />
          )}
          <span className="truncate">{voiceName}</span>
        </button>

        {/* Volume Slider */}
        <div className="flex flex-col items-center gap-1">
          <input
            type="range"
            min="0"
            max="127"
            value={volume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500 
              [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg
              [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full 
              [&::-moz-range-thumb]:bg-amber-500 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
          />
          <span className="text-white text-[10px] font-bold">{volume}</span>
        </div>

        {/* Pan Knob */}
        <div className="flex justify-center">
          <RotaryKnob value={pan} onChange={handlePanChange} displayValue={`${pan}`} size="xs" />
        </div>

        {/* Reverb Knob */}
        <div className="flex justify-center">
          <RotaryKnob value={reverb} onChange={handleReverbChange} displayValue={`${reverb}`} size="xs" />
        </div>

        {/* Chorus Knob */}
        <div className="flex justify-center">
          <RotaryKnob value={chorus} onChange={handleChorusChange} displayValue={`${chorus}`} size="xs" />
        </div>

        {/* Brightness Knob */}
        <div className="flex justify-center">
          <RotaryKnob value={brightness} onChange={handleBrightnessChange} displayValue={`${brightness}`} size="xs" />
        </div>

        {/* Bass Knob */}
        <div className="flex justify-center">
          <RotaryKnob value={bass} onChange={handleBassChange} displayValue={`${bass}`} size="xs" />
        </div>

        {/* Mid Knob */}
        <div className="flex justify-center">
          <RotaryKnob value={mid} onChange={handleMidChange} displayValue={`${mid}`} size="xs" />
        </div>

        {/* High Knob */}
        <div className="flex justify-center">
          <RotaryKnob value={high} onChange={handleHighChange} displayValue={`${high}`} size="xs" />
        </div>

        {/* Part Name */}
        <div className="text-zinc-400 text-xs text-center truncate">{partName}</div>
      </div>

      {showInlineSelector && (
        <InlineVoiceSelector
          currentVoice={currentVoice}
          onSelectVoice={handleInlineVoiceSelect}
          onClose={() => setShowInlineSelector(false)}
          triggerRef={voiceButtonRef}
        />
      )}
    </>
  )
}
