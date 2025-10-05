"use client"

import { useState, useEffect } from "react"
import { useMIDI } from "@/lib/midi-context"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import { loadEffectData, getEffectCategories, getEffectTypes, type Effect } from "@/lib/effect-data"

interface DSPEffectsPanelProps {
  channel: number
  onClose: () => void
  onEffectAssigned: (effectName: string) => void
}

export function DSPEffectsPanel({ channel, onClose, onEffectAssigned }: DSPEffectsPanelProps) {
  const { sendControlChange } = useMIDI()

  const [effects, setEffects] = useState<Effect[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedEffect, setSelectedEffect] = useState<Effect | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadEffectData().then((data) => {
      setEffects(data)
      setIsLoading(false)
      if (data.length > 0) {
        const categories = getEffectCategories(data)
        if (categories.length > 0) {
          setSelectedCategory(categories[0])
        }
      }
    })
  }, [])

  const categories = getEffectCategories(effects)
  const effectTypes = selectedCategory ? getEffectTypes(effects, selectedCategory) : []

  const handleAssignEffect = () => {
    if (!selectedEffect) return

    sendControlChange(channel, 0, selectedEffect.msb)
    sendControlChange(channel, 32, selectedEffect.lsb)

    console.log(
      `[v0] Assigned effect to channel ${channel}: ${selectedEffect.type} (MSB: ${selectedEffect.msb}, LSB: ${selectedEffect.lsb})`,
    )

    onEffectAssigned(selectedEffect.type)
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-card border border-border rounded-lg shadow-2xl p-8">
          <p className="text-muted-foreground">Loading effects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-balance">DSP Effect Assignment</h2>
            <p className="text-sm text-muted-foreground">Channel {channel}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          <div className="w-1/3 border-r border-border overflow-y-auto">
            <div className="p-4">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-3 block">
                Effect Category
              </Label>
              <div className="space-y-1">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category)
                      setSelectedEffect(null)
                    }}
                    className={`w-full text-left px-4 py-3 rounded-md transition-colors ${
                      selectedCategory === category
                        ? "bg-primary text-primary-foreground font-medium"
                        : "hover:bg-accent text-foreground"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-3 block">Effect Type</Label>
              <div className="space-y-1">
                {effectTypes.map((effect) => (
                  <button
                    key={`${effect.msb}-${effect.lsb}`}
                    onClick={() => setSelectedEffect(effect)}
                    className={`w-full text-left px-4 py-3 rounded-md transition-colors ${
                      selectedEffect?.type === effect.type ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                    }`}
                  >
                    <div className="font-medium">{effect.type}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      MSB: {effect.msb} | LSB: {effect.lsb}
                    </div>
                    {effect.purpose && (
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{effect.purpose}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-6 border-t border-border">
          <div className="text-sm text-muted-foreground">
            {selectedEffect ? (
              <span>
                Selected: <span className="font-medium text-foreground">{selectedEffect.type}</span>
              </span>
            ) : (
              <span>Select an effect to assign</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleAssignEffect} disabled={!selectedEffect}>
              Assign Effect
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
