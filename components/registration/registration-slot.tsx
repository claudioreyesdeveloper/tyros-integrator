"use client"

import { Save, Download, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface RegistrationSlotProps {
  slotNumber: number
  registration: {
    name: string
    timestamp: string
  } | null
  onSave: () => void
  onLoad: () => void
  onDelete: () => void
}

export function RegistrationSlot({ slotNumber, registration, onSave, onLoad, onDelete }: RegistrationSlotProps) {
  const isEmpty = !registration

  return (
    <div
      className={cn(
        "glossy-panel p-6 transition-all hover:shadow-xl hover:shadow-amber-500/20",
        isEmpty ? "opacity-70" : "opacity-100",
      )}
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <span className="text-2xl font-bold text-black">{slotNumber}</span>
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">{isEmpty ? `Slot ${slotNumber}` : registration.name}</h3>
            <p className="text-sm text-zinc-400">{isEmpty ? "Empty slot" : `Saved ${registration.timestamp}`}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-2 bg-zinc-900/50 border-2 border-amber-500/30 hover:border-amber-500 hover:bg-zinc-800 text-white rounded-lg h-11 font-semibold transition-all"
          onClick={onSave}
        >
          <Save className="w-4 h-4" />
          Save
        </Button>
        {!isEmpty && (
          <>
            <Button
              variant="default"
              size="sm"
              className="glossy-button flex-1 gap-2 h-11 font-semibold"
              onClick={onLoad}
            >
              <Download className="w-4 h-4" />
              Load
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="bg-red-600/80 hover:bg-red-600 border-2 border-red-500/50 h-11 px-4 rounded-lg shadow-lg transition-all"
              onClick={onDelete}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
