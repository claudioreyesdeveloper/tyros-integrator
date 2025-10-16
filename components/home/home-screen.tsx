"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Music, Piano, Drum, Play, Pause, Settings } from "lucide-react"
import type { Voice } from "@/lib/tyros-api"

interface HomeScreenProps {
  onSelectVoice: (part: number) => void
  partVoices: Record<number, Voice>
}

const PERFORMANCE_PARTS = [
  { id: 1, name: "Right 1", icon: Piano, color: "from-blue-500 to-blue-600" },
  { id: 2, name: "Right 2", icon: Piano, color: "from-purple-500 to-purple-600" },
  { id: 3, name: "Right 3", icon: Piano, color: "from-pink-500 to-pink-600" },
  { id: 4, name: "Left", icon: Piano, color: "from-green-500 to-green-600" },
  { id: 5, name: "Pad 1", icon: Drum, color: "from-orange-500 to-orange-600" },
  { id: 6, name: "Pad 2", icon: Drum, color: "from-orange-500 to-orange-600" },
  { id: 7, name: "Pad 3", icon: Drum, color: "from-orange-500 to-orange-600" },
  { id: 8, name: "Pad 4", icon: Drum, color: "from-orange-500 to-orange-600" },
  { id: 9, name: "Pad 5", icon: Drum, color: "from-orange-500 to-orange-600" },
  { id: 10, name: "Pad 6", icon: Drum, color: "from-orange-500 to-orange-600" },
  { id: 11, name: "Pad 7", icon: Drum, color: "from-orange-500 to-orange-600" },
  { id: 12, name: "Pad 8", icon: Drum, color: "from-orange-500 to-orange-600" },
  { id: 13, name: "Pad 9", icon: Drum, color: "from-orange-500 to-orange-600" },
  { id: 14, name: "Pad 10", icon: Drum, color: "from-orange-500 to-orange-600" },
  { id: 15, name: "Pad 11", icon: Drum, color: "from-orange-500 to-orange-600" },
  { id: 16, name: "Pad 12", icon: Drum, color: "from-orange-500 to-orange-600" },
]

export function HomeScreen({ onSelectVoice, partVoices }: HomeScreenProps) {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Tyros5 Integrator</h1>
          <p className="text-muted-foreground">Performance Parts & Voice Assignment</p>
        </div>
        <Button variant="outline" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      {/* Main Performance Parts */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Main Parts</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PERFORMANCE_PARTS.slice(0, 4).map((part) => {
            const voice = partVoices[part.id]
            const Icon = part.icon

            return (
              <Card
                key={part.id}
                className="group relative overflow-hidden border-2 transition-all hover:border-primary hover:shadow-lg cursor-pointer"
                onClick={() => onSelectVoice(part.id)}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${part.color} opacity-5 group-hover:opacity-10 transition-opacity`}
                />
                <div className="relative p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${part.color}`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{part.name}</h3>
                        <p className="text-xs text-muted-foreground">Part {part.id}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    {voice ? (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{voice.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {voice.category} • {voice.sub}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No voice assigned</p>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Multipads */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Multipads</h2>
        <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {PERFORMANCE_PARTS.slice(4).map((part) => {
            const voice = partVoices[part.id]
            const Icon = part.icon

            return (
              <Card
                key={part.id}
                className="group relative overflow-hidden border transition-all hover:border-primary hover:shadow-md cursor-pointer"
                onClick={() => onSelectVoice(part.id)}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${part.color} opacity-5 group-hover:opacity-10 transition-opacity`}
                />
                <div className="relative p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded bg-gradient-to-br ${part.color}`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-sm font-semibold">{part.name}</h3>
                  </div>

                  {voice ? (
                    <p className="text-xs text-muted-foreground truncate">{voice.name}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Not assigned</p>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Style Control */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">Style Control</h3>
            <p className="text-sm text-muted-foreground">No style loaded</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon">
              <Play className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Pause className="h-4 w-4" />
            </Button>
            <Button variant="outline">
              <Music className="h-4 w-4 mr-2" />
              Select Style
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
