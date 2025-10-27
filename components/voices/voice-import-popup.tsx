"use client"

import { useState, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Upload, Info } from "lucide-react"
import type { Voice } from "@/lib/voice-data"

interface VoiceImportPopupProps {
  isOpen: boolean
  onClose: () => void
  subCategories: string[]
  voices: Voice[]
}

export function VoiceImportPopup({ isOpen, onClose, subCategories, voices }: VoiceImportPopupProps) {
  const [selectedSubCategories, setSelectedSubCategories] = useState<Set<string>>(new Set())

  const importedSubCategories = useMemo(() => {
    const subCats = new Set<string>()
    voices.forEach((voice) => {
      if (voice.category === "Premium Pack" && voice.sub) {
        subCats.add(voice.sub)
      }
    })
    return Array.from(subCats).sort()
  }, [voices])

  const toggleSubCategory = (subCategory: string) => {
    const newSet = new Set(selectedSubCategories)
    if (newSet.has(subCategory)) {
      newSet.delete(subCategory)
    } else {
      newSet.add(subCategory)
    }
    setSelectedSubCategories(newSet)
  }

  const handleImport = () => {
    console.log("[v0] Importing selected subcategories:", Array.from(selectedSubCategories))
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!w-[98vw] h-[95vh] max-w-none sm:max-w-none glossy-panel border-2 border-primary/30 p-0 flex flex-col">
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
          <div className="flex flex-col gap-4 min-h-0">
            <div className="flex items-center justify-between flex-shrink-0">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-1 h-4 bg-gradient-to-b from-primary to-primary/70 rounded-full"></span>
                Imported Premium Packs
              </h3>
              <span className="text-xs text-primary/60 font-semibold">
                {importedSubCategories.length} subcategories
              </span>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 min-h-0">
              {importedSubCategories.length > 0 ? (
                <div className="space-y-2">
                  {importedSubCategories.map((subCategory) => {
                    const voiceCount = voices.filter(
                      (v) => v.category === "Premium Pack" && v.sub === subCategory,
                    ).length
                    return (
                      <div key={subCategory} className="premium-card p-4 flex items-center justify-between">
                        <div className="text-sm font-bold text-white">{subCategory}</div>
                        <div className="text-xs text-primary/60 font-semibold">{voiceCount}</div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="premium-card p-6 text-center">
                  <p className="text-sm text-gray-400">No imported subcategories found</p>
                  <p className="text-xs text-gray-500 mt-2">Import Cubase patch files to see subcategories here</p>
                </div>
              )}
            </div>
          </div>

          {/* Right column: Current Premium Pack Subcategories (with checkboxes) */}
          <div className="flex flex-col gap-4 min-h-0">
            <div className="flex items-center justify-between flex-shrink-0">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-1 h-4 bg-gradient-to-b from-primary to-primary/70 rounded-full"></span>
                Current Premium Pack Subcategories
              </h3>
              <span className="text-xs text-primary/60 font-semibold">{subCategories.length} subcategories</span>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 min-h-0">
              <div className="space-y-2">
                {subCategories.map((subCategory) => (
                  <div
                    key={subCategory}
                    className="premium-card p-4 flex items-center gap-3 hover:border-primary/50 transition-all"
                  >
                    <Checkbox
                      id={`sub-${subCategory}`}
                      checked={selectedSubCategories.has(subCategory)}
                      onCheckedChange={() => toggleSubCategory(subCategory)}
                      className="border-2 border-primary/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <label htmlFor={`sub-${subCategory}`} className="flex-1 cursor-pointer">
                      <div className="text-sm font-bold text-white">{subCategory}</div>
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
            disabled={selectedSubCategories.size === 0}
            className="flex-1 glossy-button font-bold"
          >
            Import{" "}
            {selectedSubCategories.size > 0
              ? `${selectedSubCategories.size} Subcategor${selectedSubCategories.size > 1 ? "ies" : "y"}`
              : "Selected Subcategories"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
