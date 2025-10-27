"use client"

import type React from "react"

import { useState, useRef } from "react"
import { MixerChannel } from "./mixer-channel"
import { MixerChannelHorizontal } from "./mixer-channel-horizontal"
import { Download, Upload, Settings, LayoutGrid, LayoutList } from "lucide-react"
import type { Voice } from "@/lib/voice-data"
import { Button } from "@/components/ui/button"
import { useMIDI } from "@/lib/midi-context"
import { useLayout } from "@/lib/layout-context"

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
  "Rhythm 2",
  "Bass",
  "Chord 1",
  "Chord 2",
  "Pad",
  "Phrase 1",
  "Phrase 2",
  "Song 1",
  "Song 2",
  "Song 3",
  "Song 4",
  "Song 5",
  "Song 6",
  "Song 7",
  "Song 8",
  "Song 9",
  "Song 10",
  "Song 11",
  "Song 12",
  "Song 13",
  "Song 14",
  "Song 15",
  "Song 16",
]

interface MixerInterfaceProps {
  onSelectVoice: (partNumber: number) => void
  partVoices: Record<number, Voice>
  channelEffects: Record<number, string>
  onEffectAssigned: (channel: number, effectName: string) => void
  currentBank?: number
  onBankChange?: (bank: number) => void
  viewMode?: "vertical" | "horizontal"
  onVoiceAssignedInline?: (channel: number, voice: Voice) => void
}

export function MixerInterface({
  onSelectVoice,
  partVoices,
  channelEffects,
  onEffectAssigned,
  currentBank: externalCurrentBank,
  onBankChange,
  viewMode: externalViewMode,
  onVoiceAssignedInline,
}: MixerInterfaceProps) {
  const [internalCurrentBank, setInternalCurrentBank] = useState(0)
  const currentBank = externalCurrentBank !== undefined ? externalCurrentBank : internalCurrentBank
  const { mixerViewMode, setMixerViewMode } = useLayout()
  const viewMode = externalViewMode || mixerViewMode
  const [selectedChannel, setSelectedChannel] = useState<number | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { api } = useMIDI()

  const channelsPerView = 8
  const startChannel = currentBank * channelsPerView + 1
  const channels = Array.from({ length: channelsPerView }, (_, i) => ({
    channel: startChannel + i,
    partName: PART_NAMES[startChannel + i - 1],
  }))

  const handleBankChange = (bank: number) => {
    if (onBankChange) {
      onBankChange(bank)
    } else {
      setInternalCurrentBank(bank)
    }
    setSelectedChannel(null)
  }

  const handleSaveMix = () => {
    const mixConfiguration = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      channels: Object.entries(partVoices).map(([channel, voice]) => ({
        channel: Number(channel),
        partName: PART_NAMES[Number(channel) - 1],
        voice: voice,
        effect: channelEffects[Number(channel)] || "None",
      })),
    }

    const blob = new Blob([JSON.stringify(mixConfiguration, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `tyros5-mix-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleOpenMix = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const config = JSON.parse(content)
        alert("Mix configuration loaded successfully!")
      } catch (error) {
        console.error("[v0] Error parsing mix file:", error)
        alert("Error loading mix file. Please check the file format.")
      }
    }
    reader.readAsText(file)

    event.target.value = ""
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileChange} className="hidden" />

      <div className="border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            {[0, 1, 2, 3].map((bank) => (
              <button
                key={bank}
                onClick={() => handleBankChange(bank)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  currentBank === bank
                    ? "bg-amber-500 text-black shadow-lg shadow-amber-500/50"
                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                {bank * 8 + 1}-{bank * 8 + 8}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 mr-4 bg-white/5 rounded-lg p-1">
              <button
                onClick={() => setMixerViewMode("vertical")}
                className={`p-2 rounded transition-all ${
                  viewMode === "vertical"
                    ? "bg-amber-500 text-black"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
                title="Vertical View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setMixerViewMode("horizontal")}
                className={`p-2 rounded transition-all ${
                  viewMode === "horizontal"
                    ? "bg-amber-500 text-black"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
                title="Horizontal View"
              >
                <LayoutList className="w-4 h-4" />
              </button>
            </div>

            <Button
              onClick={handleOpenMix}
              variant="outline"
              size="sm"
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              <Upload className="w-4 h-4 mr-2" />
              Load
            </Button>
            <Button
              onClick={handleSaveMix}
              variant="outline"
              size="sm"
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              <Download className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" size="sm" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {viewMode === "horizontal" ? (
          <div className="space-y-2">
            {channels.map((ch) => (
              <MixerChannelHorizontal
                key={ch.channel}
                channel={ch.channel}
                partName={ch.partName}
                voiceName={partVoices[ch.channel]?.voice || "No Voice"}
                onSelectVoice={() => onSelectVoice(ch.channel)}
                currentVoice={partVoices[ch.channel]}
                voiceSubcategory={partVoices[ch.channel]?.sub || ""}
                voiceCategory={partVoices[ch.channel]?.category || ""}
                onVoiceAssignedInline={onVoiceAssignedInline}
                isSelected={selectedChannel === ch.channel}
                onChannelClick={() => setSelectedChannel(ch.channel)}
              />
            ))}
          </div>
        ) : (
          <div className="flex gap-4 h-full">
            {channels.map((ch) => (
              <MixerChannel
                key={ch.channel}
                channel={ch.channel}
                partName={ch.partName}
                voiceName={partVoices[ch.channel]?.voice || "No Voice"}
                onSelectVoice={() => onSelectVoice(ch.channel)}
                currentVoice={partVoices[ch.channel]}
                voiceSubcategory={partVoices[ch.channel]?.sub || ""}
                voiceCategory={partVoices[ch.channel]?.category || ""}
                onVoiceAssignedInline={onVoiceAssignedInline}
                isSelected={selectedChannel === ch.channel}
                onChannelClick={() => setSelectedChannel(ch.channel)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
