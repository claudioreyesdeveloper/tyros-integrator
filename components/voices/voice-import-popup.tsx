"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Upload, Info } from "lucide-react"

interface VoiceImportPopupProps {
  isOpen: boolean
  onClose: () => void
  subCategories: string[]
}

// Mock data for current premium packs - replace with actual data
const CURRENT_PREMIUM_PACKS = [
  { id: "1", name: "Grand Piano Collection", subcategory: "Acoustic Piano", voiceCount: 24 },
  { id: "2", name: "Electric Piano Essentials", subcategory: "Electric Piano", voiceCount: 18 },
  { id: "3", name: "Vintage Organs", subcategory: "Organ", voiceCount: 15 },
  { id: "4", name: "Orchestral Strings", subcategory: "Strings", voiceCount: 32 },
  { id: "5", name: "Brass Section", subcategory: "Brass", voiceCount: 28 },
  { id: "6", name: "Synth Leads Pro", subcategory: "Synth Lead", voiceCount: 45 },
  { id: "7", name: "Acoustic Guitars", subcategory: "Guitar", voiceCount: 22 },
  { id: "8", name: "Bass Collection", subcategory: "Bass", voiceCount: 19 },
]

export function VoiceImportPopup({ isOpen, onClose, subCategories }: VoiceImportPopupProps) {
  const [selectedCurrent, setSelectedCurrent] = useState<Set<string>>(new Set())

  const toggleCurrent = (id: string) => {
    const newSet = new Set(selectedCurrent)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedCurrent(newSet)
  }

  const handleImport = () => {
    console.log("[v0] Importing selected packs:", Array.from(selectedCurrent))
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] glossy-panel border-2 border-primary/30 p-0 flex flex-col">
        <DialogHeader className="p-6 border-b border-border flex-shrink-0">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border-2 border-primary/40">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-white mb-2">Import Cubase Patch Files</DialogTitle>
              <p className="text-sm text-gray-400 leading-relaxed">
                This is a tool to import Cubase patch files to your instrument
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex items-center gap-2 px-6 py-3 bg-primary/10 border-y border-primary/20 flex-shrink-0">
          <Info className="w-4 h-4 text-primary flex-shrink-0" />
          <p className="text-xs text-primary/90 font-medium">All other categories will be imported automatically</p>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-6 p-6 min-h-0">
          {/* Left column: Imported Premium Packs Sub-categories (no checkboxes) */}
          <div className="flex flex-col gap-4 min-h-0">
            <div className="flex items-center justify-between flex-shrink-0">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-1 h-4 bg-gradient-to-b from-primary to-primary/70 rounded-full"></span>
                Imported Premium Packs
              </h3>
              <span className="text-xs text-primary/60 font-semibold">{subCategories.length} sub-categories</span>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 min-h-0">
              <div className="space-y-2">
                {subCategories.map((subCategory) => (
                  <div key={subCategory} className="premium-card p-4 hover:border-primary/50 transition-all">
                    <div className="text-sm font-bold text-white">{subCategory}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column: Current Premium Packs (with checkboxes) */}
          <div className="flex flex-col gap-4 min-h-0">
            <div className="flex items-center justify-between flex-shrink-0">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-1 h-4 bg-gradient-to-b from-primary to-primary/70 rounded-full"></span>
                Current Premium Packs
              </h3>
              <span className="text-xs text-primary/60 font-semibold">{CURRENT_PREMIUM_PACKS.length} packs</span>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 min-h-0">
              <div className="space-y-2">
                {CURRENT_PREMIUM_PACKS.map((pack) => (
                  <div
                    key={pack.id}
                    className="premium-card p-4 flex items-center gap-3 hover:border-primary/50 transition-all"
                  >
                    <Checkbox
                      id={`current-${pack.id}`}
                      checked={selectedCurrent.has(pack.id)}
                      onCheckedChange={() => toggleCurrent(pack.id)}
                      className="border-2 border-primary/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <label htmlFor={`current-${pack.id}`} className="flex-1 cursor-pointer">
                      <div className="text-sm font-bold text-white">{pack.name}</div>
                      <div className="text-xs text-primary/60 mt-1">
                        {pack.subcategory} • {pack.voiceCount} voices
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border flex gap-3 flex-shrink-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-6 glossy-panel border-2 border-border hover:border-primary text-white font-semibold bg-transparent"
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={selectedCurrent.size === 0}
            className="flex-1 glossy-button font-bold"
          >
            Import{" "}
            {selectedCurrent.size > 0
              ? `${selectedCurrent.size} Pack${selectedCurrent.size > 1 ? "s" : ""}`
              : "Selected Packs"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
