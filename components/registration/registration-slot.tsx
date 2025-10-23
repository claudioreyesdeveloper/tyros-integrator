"use client"

import { Save, Download, Trash2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface RegistrationSlotProps {
  slotNumber: number
  registration: {
    name: string
    timestamp: string
  } | null
  isSelected?: boolean
  onSave: () => void
  onLoad: () => void
  onDelete: () => void
  onSelect: () => void
  onAddToSequence?: () => void
}

export function RegistrationSlot({
  slotNumber,
  registration,
  isSelected = false,
  onSave,
  onLoad,
  onDelete,
  onSelect,
  onAddToSequence,
}: RegistrationSlotProps) {
  const isEmpty = !registration

  return (
    <div
      onClick={onSelect}
      className={cn(
        "premium-card p-6 md:p-8 flex flex-col items-center gap-4 md:gap-6 hover:scale-105 transition-all duration-300 group cursor-pointer",
        isSelected && "ring-2 ring-amber-500 shadow-xl shadow-amber-500/30",
      )}
    >
      <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl bg-secondary flex items-center justify-center border-4 border-primary/40 group-hover:border-primary/80 transition-all shadow-2xl shadow-primary/30">
        <div className={cn("text-6xl font-bold", isEmpty ? "text-zinc-400" : "text-amber-500")}>{slotNumber}</div>
      </div>

      <div className="text-center w-full">
        <h3 className="premium-text text-xl md:text-2xl mb-2">{isEmpty ? `Slot ${slotNumber}` : registration.name}</h3>
        <p className="text-xs md:text-sm text-muted-foreground">{isEmpty ? "Empty" : registration.timestamp}</p>
      </div>

      <div className="flex gap-2 w-full">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1 bg-transparent border border-amber-500/30 hover:border-amber-500 hover:bg-amber-500/10 text-white rounded-lg h-9 text-xs font-semibold"
          onClick={(e) => {
            e.stopPropagation()
            onSave()
          }}
        >
          <Save className="w-3 h-3" />
          Save
        </Button>
        {!isEmpty && (
          <>
            <Button
              variant="default"
              size="sm"
              className="glossy-button flex-1 gap-1 h-9 text-xs font-semibold"
              onClick={(e) => {
                e.stopPropagation()
                onLoad()
              }}
            >
              <Download className="w-3 h-3" />
              Load
            </Button>
            {onAddToSequence && (
              <Button
                variant="outline"
                size="sm"
                className="bg-green-600/20 border border-green-500/30 hover:bg-green-600/30 h-9 px-2"
                onClick={(e) => {
                  e.stopPropagation()
                  onAddToSequence()
                }}
              >
                <Plus className="w-3 h-3 text-green-400" />
              </Button>
            )}
            <Button
              variant="destructive"
              size="sm"
              className="bg-red-600/80 hover:bg-red-600 border border-red-500/50 h-9 px-2"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
