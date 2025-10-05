"use client"

import { useState } from "react"
import { MixerChannel } from "./mixer-channel"
import { DSPEffectsPanel } from "../effects/dsp-effects-panel"
import { useMIDI } from "@/lib/midi-context"
import { Volume2, Waves, Sparkles } from "lucide-react"
import type { Voice } from "@/lib/voice-data"

const PART_NAMES = [
  "Left",
  "Right 1",
  "Right 2",
  "Right 3",
  "Multi Pad 1",
  "Multi Pad 2",
  "Multi Pad 3",
  "Multi Pad 4",
  "Rhythm 1",
  "Bass",
  "Chord 1",
  "Chord 2",
  "Pad",
  "Phrase 1",
  "Phrase 2",
  "Phrase 3",
  "Song 17",
  "Song 18",
  "Song 19",
  "Song 20",
  "Song 21",
  "Song 22",
  "Song 23",
  "Song 24",
  "Song 25",
  "Song 26",
  "Song 27",
  "Song 28",
  "Song 29",
  "Song 30",
  "Song 31",
  "Song 32",
]

const BANK_NAMES = ["Keyboard/Multi Pads", "Style Parts", "Song Tracks 1", "Song Tracks 2"]

interface MixerInterfaceProps {
  onSelectVoice: (partNumber: number) => void
  partVoices: Record<number, Voice>
  channelEffects: Record<number, string>
  onEffectAssigned: (channel: number, effectName: string) => void
  currentBank?: number
  onBankChange?: (bank: number) => void
}

export function MixerInterface({
  onSelectVoice,
  partVoices,
  channelEffects,
  onEffectAssigned,
  currentBank: externalCurrentBank,
  onBankChange,
}: MixerInterfaceProps) {
  const { sendControlChange } = useMIDI()
  const [internalCurrentBank, setInternalCurrentBank] = useState(0)
  const currentBank = externalCurrentBank !== undefined ? externalCurrentBank : internalCurrentBank

  const [effectsChannel, setEffectsChannel] = useState<number | null>(null)
  const [masterVolume, setMasterVolume] = useState(100)
  const [globalReverb, setGlobalReverb] = useState(40)
  const [globalChorus, setGlobalChorus] = useState(30)

  const startChannel = currentBank * 8 + 1
  const channels = Array.from({ length: 8 }, (_, i) => ({
    channel: startChannel + i,
    partName: PART_NAMES[startChannel + i - 1],
  }))

  const handleMasterVolumeChange = (value: number) => {
    setMasterVolume(value)
    for (let ch = 1; ch <= 32; ch++) {
      sendControlChange(ch, 7, value)
    }
  }

  const handleGlobalReverbChange = (value: number) => {
    setGlobalReverb(value)
    for (let ch = 1; ch <= 32; ch++) {
      sendControlChange(ch, 91, value)
    }
  }

  const handleGlobalChorusChange = (value: number) => {
    setGlobalChorus(value)
    for (let ch = 1; ch <= 32; ch++) {
      sendControlChange(ch, 93, value)
    }
  }

  const handleBankChange = (bank: number) => {
    if (onBankChange) {
      onBankChange(bank)
    } else {
      setInternalCurrentBank(bank)
    }
  }

  return (
    <div className="h-full flex flex-col p-6 bg-gradient-to-b from-background to-black">
      <div className="mb-6 grid grid-cols-3 gap-6">
        <div className="glossy-panel p-6">
          <div className="flex items-center gap-3 mb-4">
            <Volume2 className="w-6 h-6 text-primary" />
            <h3 className="premium-label">Master Volume</h3>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="127"
              value={masterVolume}
              onChange={(e) => handleMasterVolumeChange(Number(e.target.value))}
              className="flex-1 slider-horizontal"
            />
            <span className="text-lg font-mono font-bold text-primary w-12 text-right">{masterVolume}</span>
          </div>
        </div>

        <div className="glossy-panel p-6">
          <div className="flex items-center gap-3 mb-4">
            <Waves className="w-6 h-6 text-primary" />
            <h3 className="premium-label">Global Reverb</h3>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="127"
              value={globalReverb}
              onChange={(e) => handleGlobalReverbChange(Number(e.target.value))}
              className="flex-1 slider-horizontal"
            />
            <span className="text-lg font-mono font-bold text-primary w-12 text-right">{globalReverb}</span>
          </div>
        </div>

        <div className="glossy-panel p-6">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
            <h3 className="premium-label">Global Chorus</h3>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="127"
              value={globalChorus}
              onChange={(e) => handleGlobalChorusChange(Number(e.target.value))}
              className="flex-1 slider-horizontal"
            />
            <span className="text-lg font-mono font-bold text-primary w-12 text-right">{globalChorus}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        {BANK_NAMES.map((name, index) => (
          <button
            key={index}
            onClick={() => handleBankChange(index)}
            className={`flex-1 px-6 py-4 rounded-lg font-bold text-sm transition-all ${
              currentBank === index
                ? "glossy-button text-black"
                : "bg-gradient-to-b from-secondary to-secondary/80 text-foreground border-2 border-border/30 hover:border-border/60"
            }`}
          >
            <div className="premium-text">{name}</div>
            <div className="text-xs opacity-70 mt-1">
              (Ch {index * 8 + 1}-{index * 8 + 8})
            </div>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        <div className="flex gap-3 h-full">
          {channels.map((ch) => (
            <MixerChannel
              key={ch.channel}
              channel={ch.channel}
              partName={ch.partName}
              voiceName={partVoices[ch.channel]?.voice || "No Voice"}
              insertEffect={channelEffects[ch.channel] || "None"}
              onOpenEffects={() => setEffectsChannel(ch.channel)}
              onSelectVoice={() => onSelectVoice(ch.channel)}
            />
          ))}
        </div>
      </div>

      {effectsChannel !== null && (
        <DSPEffectsPanel
          channel={effectsChannel}
          onClose={() => setEffectsChannel(null)}
          onEffectAssigned={(effectName) => {
            onEffectAssigned(effectsChannel, effectName)
            setEffectsChannel(null)
          }}
        />
      )}
    </div>
  )
}
