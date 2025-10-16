"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMIDI } from "@/lib/midi-context"

export function MixerInterface() {
  const { api } = useMIDI()
  const [currentBank, setCurrentBank] = useState(0)
  const [channels, setChannels] = useState(
    Array.from({ length: 16 }, (_, i) => ({
      id: i + 1,
      volume: 100,
      pan: 64,
      reverb: 40,
      chorus: 0,
      muted: false,
    })),
  )

  const channelsPerPage = 8
  const totalBanks = Math.ceil(channels.length / channelsPerPage)
  const visibleChannels = channels.slice(currentBank * channelsPerPage, (currentBank + 1) * channelsPerPage)

  const handleVolumeChange = (channelId: number, value: number[]) => {
    setChannels((prev) => prev.map((ch) => (ch.id === channelId ? { ...ch, volume: value[0] } : ch)))
    api.sendCommand({
      type: "mixer",
      action: "volume",
      channel: channelId - 1,
      value: value[0],
    })
  }

  const handlePanChange = (channelId: number, value: number[]) => {
    setChannels((prev) => prev.map((ch) => (ch.id === channelId ? { ...ch, pan: value[0] } : ch)))
    api.sendCommand({
      type: "mixer",
      action: "pan",
      channel: channelId - 1,
      value: value[0],
    })
  }

  const handleMute = (channelId: number) => {
    setChannels((prev) => prev.map((ch) => (ch.id === channelId ? { ...ch, muted: !ch.muted } : ch)))
    const channel = channels.find((ch) => ch.id === channelId)
    api.sendCommand({
      type: "mixer",
      action: "mute",
      channel: channelId - 1,
      muted: !channel?.muted,
    })
  }

  return (
    <div className="min-h-screen bg-black p-4 md:p-6 lg:p-8">
      <div className="premium-card p-6 md:p-8 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Mixer</h1>
            <p className="text-gray-400">
              Channels {currentBank * channelsPerPage + 1} - {Math.min((currentBank + 1) * channelsPerPage, 16)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setCurrentBank(Math.max(0, currentBank - 1))}
              disabled={currentBank === 0}
              variant="outline"
              size="icon"
              className="glossy-button"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="text-sm font-bold text-white px-4">
              Bank {currentBank + 1} / {totalBanks}
            </div>
            <Button
              onClick={() => setCurrentBank(Math.min(totalBanks - 1, currentBank + 1))}
              disabled={currentBank === totalBanks - 1}
              variant="outline"
              size="icon"
              className="glossy-button"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
        {visibleChannels.map((channel) => (
          <div key={channel.id} className="premium-card p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-bold text-white">CH {channel.id}</div>
              <Button
                onClick={() => handleMute(channel.id)}
                size="icon"
                variant="ghost"
                className={cn("w-8 h-8", channel.muted ? "text-red-500" : "text-gray-400")}
              >
                {channel.muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-400">Volume</label>
              <Slider
                value={[channel.volume]}
                onValueChange={(value) => handleVolumeChange(channel.id, value)}
                max={127}
                step={1}
                className="w-full"
                disabled={channel.muted}
              />
              <div className="text-xs text-center text-gray-500 font-mono">{channel.volume}</div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-400">Pan</label>
              <Slider
                value={[channel.pan]}
                onValueChange={(value) => handlePanChange(channel.id, value)}
                max={127}
                step={1}
                className="w-full"
                disabled={channel.muted}
              />
              <div className="text-xs text-center text-gray-500 font-mono">
                {channel.pan === 64 ? "C" : channel.pan < 64 ? `L${64 - channel.pan}` : `R${channel.pan - 64}`}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-400">Reverb</label>
              <Slider
                value={[channel.reverb]}
                onValueChange={(value) =>
                  setChannels((prev) => prev.map((ch) => (ch.id === channel.id ? { ...ch, reverb: value[0] } : ch)))
                }
                max={127}
                step={1}
                className="w-full"
                disabled={channel.muted}
              />
              <div className="text-xs text-center text-gray-500 font-mono">{channel.reverb}</div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-400">Chorus</label>
              <Slider
                value={[channel.chorus]}
                onValueChange={(value) =>
                  setChannels((prev) => prev.map((ch) => (ch.id === channel.id ? { ...ch, chorus: value[0] } : ch)))
                }
                max={127}
                step={1}
                className="w-full"
                disabled={channel.muted}
              />
              <div className="text-xs text-center text-gray-500 font-mono">{channel.chorus}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
