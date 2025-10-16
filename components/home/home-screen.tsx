"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Music, Sliders } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Voice } from "@/lib/voice-data"

interface HomeScreenProps {
  onSelectVoice: (part: number) => void
  partVoices: Record<number, Voice>
}

const PART_NAMES = [
  { id: 1, name: "Right 1", color: "from-red-500 to-rose-600" },
  { id: 2, name: "Right 2", color: "from-orange-500 to-amber-600" },
  { id: 3, name: "Right 3", color: "from-yellow-500 to-orange-600" },
  { id: 4, name: "Left", color: "from-blue-500 to-cyan-600" },
  { id: 5, name: "Pad 1", color: "from-purple-500 to-pink-600" },
  { id: 6, name: "Pad 2", color: "from-emerald-500 to-teal-600" },
  { id: 7, name: "Pad 3", color: "from-indigo-500 to-purple-600" },
  { id: 8, name: "Pad 4", color: "from-pink-500 to-rose-600" },
  { id: 9, name: "Pad 5", color: "from-cyan-500 to-blue-600" },
  { id: 10, name: "Pad 6", color: "from-lime-500 to-green-600" },
  { id: 11, name: "Pad 7", color: "from-amber-500 to-yellow-600" },
  { id: 12, name: "Pad 8", color: "from-teal-500 to-emerald-600" },
  { id: 13, name: "Pad 9", color: "from-rose-500 to-red-600" },
  { id: 14, name: "Pad 10", color: "from-violet-500 to-purple-600" },
  { id: 15, name: "Pad 11", color: "from-sky-500 to-cyan-600" },
  { id: 16, name: "Pad 12", color: "from-green-500 to-emerald-600" },
]

export function HomeScreen({ onSelectVoice, partVoices }: HomeScreenProps) {
  const [hoveredPart, setHoveredPart] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black p-4 md:p-6 lg:p-8">
      <div className="premium-card p-6 md:p-8 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Performance Parts</h1>
            <p className="text-gray-400">Assign voices to keyboard parts and multipads</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-400">
              <span className="font-bold text-amber-500">{Object.keys(partVoices).length}</span> / 16 assigned
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {PART_NAMES.map((part) => {
          const voice = partVoices[part.id]
          const isHovered = hoveredPart === part.id

          return (
            <button
              key={part.id}
              onClick={() => onSelectVoice(part.id)}
              onMouseEnter={() => setHoveredPart(part.id)}
              onMouseLeave={() => setHoveredPart(null)}
              className={cn(
                "group relative p-6 rounded-xl transition-all duration-300",
                "bg-gradient-to-br from-zinc-900/80 to-zinc-900/40",
                "border-2 border-zinc-800 hover:border-amber-500/60",
                "hover:scale-105 hover:shadow-xl hover:shadow-amber-500/20",
                isHovered && "scale-105 shadow-xl shadow-amber-500/20",
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-bold",
                    "bg-gradient-to-r",
                    part.color,
                    "text-white shadow-lg",
                  )}
                >
                  {part.name}
                </div>
                {voice && (
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Music className="w-4 h-4 text-emerald-500" />
                  </div>
                )}
              </div>

              {voice ? (
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white truncate">{voice.voice}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="px-2 py-0.5 bg-zinc-800 rounded">{voice.category}</span>
                    <span className="px-2 py-0.5 bg-zinc-800 rounded">{voice.sub}</span>
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    MSB:{voice.msb} LSB:{voice.lsb} PRG:{voice.prg}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-gray-600">No Voice Assigned</h3>
                  <p className="text-xs text-gray-500">Click to select a voice</p>
                </div>
              )}

              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Sliders className="w-4 h-4 text-amber-500" />
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="premium-card p-6 md:p-8 mt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Style Control</h2>
            <p className="text-sm text-gray-400">Control accompaniment playback</p>
          </div>
          <div className="flex items-center gap-3">
            <Button className="glossy-button" disabled>
              Start
            </Button>
            <Button className="glossy-button bg-transparent" variant="outline" disabled>
              Stop
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
