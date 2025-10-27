"use client"

import { useState, useRef } from "react"
import { useMIDI } from "@/lib/midi-context"
import { RotaryKnob } from "@/components/ui/rotary-knob"
import { VoiceIcon } from "@/components/ui/voice-icon"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Music, Sparkles } from "lucide-react"
import { InlineVoiceSelector } from "./inline-voice-selector"
import { EffectsPopup } from "./effects-popup"
import type { Voice } from "@/lib/voice-data"

interface MixerChannelProps {
  channel: number
  partName: string
  voiceName: string
  onSelectVoice: () => void
  onVoiceAssignedInline?: (channel: number, voice: Voice) => void
  currentVoice?: Voice
  voiceSubcategory?: string
  voiceCategory?: string
}

export function MixerChannel({
  channel,
  partName,
  voiceName,
  onSelectVoice,
  onVoiceAssignedInline,
  currentVoice,
  voiceSubcategory = "",
  voiceCategory = "",
}: MixerChannelProps) {
  const { api } = useMIDI()
  const [showDetails, setShowDetails] = useState(false)
  const [showInlineSelector, setShowInlineSelector] = useState(false)
  const [showEffects, setShowEffects] = useState(false)
  const voiceButtonRef = useRef<HTMLButtonElement>(null)

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
      <div className="bg-transparent backdrop-blur-sm border-2 border-zinc-800 rounded-lg p-3 flex flex-col gap-3 w-[140px] h-full">
        {/* Voice Button */}
        <button
          ref={voiceButtonRef}
          onClick={handleVoiceClick}
          className="w-full bg-amber-500 hover:bg-amber-600 transition-all px-3 py-2.5 rounded-lg font-bold text-sm text-white"
        >
          Voice
        </button>

        {/* Channel Name */}
        <div className="text-center">
          <div className="text-white font-bold text-sm truncate">{partName}</div>
        </div>

        {/* Voice Display */}
        <div className="bg-zinc-200 rounded-lg p-3 flex flex-col items-center justify-center gap-2 min-h-[80px]">
          {voiceName === "No Voice" ? (
            <>
              <Music className="w-12 h-12 text-zinc-400" />
              <span className="text-xs font-medium text-black">No Voice</span>
            </>
          ) : (
            <>
              <VoiceIcon subcategory={voiceSubcategory} category={voiceCategory} size={40} />
              <span className="text-xs font-medium text-black text-center truncate w-full">{voiceName}</span>
            </>
          )}
        </div>

        {/* Volume Section */}
        <div className="flex flex-col items-center gap-2 py-3">
          <div className="text-amber-500 font-bold text-xs uppercase tracking-wider">Volume</div>
          <input
            type="range"
            min="0"
            max="127"
            value={volume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            className="w-full h-2 bg-zinc-800 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500 
              [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg
              [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full 
              [&::-moz-range-thumb]:bg-amber-500 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
          />
          <div className="text-white font-bold text-sm">{volume}</div>
        </div>

        {/* Effects Button */}
        <button
          onClick={() => setShowEffects(true)}
          className="w-full bg-purple-600 hover:bg-purple-700 transition-all px-3 py-2 rounded-lg font-bold text-xs text-white flex items-center justify-center gap-2"
          title="Effects"
        >
          <Sparkles className="w-4 h-4" />
          Effects
        </button>

        {/* Edit button to open detailed controls popup */}
        <button
          onClick={() => setShowDetails(true)}
          className="w-full bg-zinc-800 hover:bg-zinc-700 transition-all px-3 py-2 rounded-lg font-bold text-xs text-amber-500 border border-zinc-700"
        >
          Edit
        </button>
      </div>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl bg-transparent backdrop-blur-md border-2 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-bold">
              Channel {channel} - {partName}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Voice Selection */}
            <div className="space-y-2">
              <h3 className="text-amber-500 font-bold text-sm uppercase tracking-wider">Voice</h3>
              <button
                onClick={onSelectVoice}
                className="w-full bg-amber-500 hover:bg-amber-600 transition-all px-4 py-3 rounded-lg flex items-center gap-3 font-bold text-white"
              >
                <VoiceIcon subcategory={voiceSubcategory} category={voiceCategory} size={32} />
                <span className="text-base">{voiceName}</span>
              </button>
            </div>

            {/* Main Controls */}
            <div className="space-y-2">
              <h3 className="text-amber-500 font-bold text-sm uppercase tracking-wider">Main Controls</h3>
              <div className="grid grid-cols-4 gap-4">
                <RotaryKnob value={pan} onChange={handlePanChange} label="Pan" displayValue={`${pan}`} size="md" />
                <RotaryKnob
                  value={reverb}
                  onChange={handleReverbChange}
                  label="Reverb"
                  displayValue={`${reverb}`}
                  size="md"
                />
                <RotaryKnob
                  value={chorus}
                  onChange={handleChorusChange}
                  label="Chorus"
                  displayValue={`${chorus}`}
                  size="md"
                />
                <RotaryKnob
                  value={brightness}
                  onChange={handleBrightnessChange}
                  label="Brightness"
                  displayValue={`${brightness}`}
                  size="md"
                />
              </div>
            </div>

            {/* EQ Controls */}
            <div className="space-y-2">
              <h3 className="text-amber-500 font-bold text-sm uppercase tracking-wider">Equalizer</h3>
              <div className="grid grid-cols-3 gap-4">
                <RotaryKnob value={bass} onChange={handleBassChange} label="Bass" displayValue={`${bass}`} size="md" />
                <RotaryKnob value={mid} onChange={handleMidChange} label="Mid" displayValue={`${mid}`} size="md" />
                <RotaryKnob value={high} onChange={handleHighChange} label="High" displayValue={`${high}`} size="md" />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Effects Popup */}
      <EffectsPopup channel={channel} partName={partName} open={showEffects} onOpenChange={setShowEffects} />

      {/* Inline Voice Selector */}
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
