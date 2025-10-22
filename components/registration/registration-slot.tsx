"use client"

import { Save, Download, Trash2, Plus, Check } from "lucide-react"
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
        "glossy-panel p-4 transition-all cursor-pointer",
        isEmpty ? "opacity-70" : "opacity-100",
        isSelected && "ring-2 ring-blue-500 shadow-xl shadow-blue-500/30",
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center shadow-lg font-bold text-lg",
              isEmpty ? "bg-zinc-700 text-zinc-400" : "bg-gradient-to-br from-blue-500 to-blue-600 text-white",
            )}
          >
            {slotNumber}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-sm truncate">
              {isEmpty ? `Slot ${slotNumber}` : registration.name}
            </h3>
            <p className="text-xs text-zinc-400 truncate">{isEmpty ? "Empty" : registration.timestamp}</p>
          </div>
        </div>
        {!isEmpty && isSelected && <Check className="w-5 h-5 text-blue-400" />}
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1 bg-zinc-900/50 border border-blue-500/30 hover:border-blue-500 hover:bg-zinc-800 text-white rounded-lg h-9 text-xs font-semibold"
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
