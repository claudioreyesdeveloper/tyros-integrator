"use client"

import { useState, useEffect } from "react"
import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { loadVoiceData, getCategories, getSubCategories, type Voice } from "@/lib/voice-data"
import { cn } from "@/lib/utils"

interface PatchFileImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const InlineCheckbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-white/40 shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 data-[state=checked]:text-white",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
      <Check className="h-3 w-3" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
InlineCheckbox.displayName = "InlineCheckbox"

export function PatchFileImportDialog({ open, onOpenChange }: PatchFileImportDialogProps) {
  const [voices, setVoices] = useState<Voice[]>([])
  const [selectedSubCategories, setSelectedSubCategories] = useState<Set<string>>(new Set())
  const [allChecked, setAllChecked] = useState(false)

  useEffect(() => {
    loadVoiceData().then((data) => {
      setVoices(data)
    })
  }, [])

  const categories = getCategories(voices)
  const allSubCategoriesArray = categories.flatMap((category) => getSubCategories(voices, category))
  const uniqueSubCategories = Array.from(new Set(allSubCategoriesArray)).sort()

  const handleSubCategoryToggle = (subCategory: string) => {
    const newSelected = new Set(selectedSubCategories)
    if (newSelected.has(subCategory)) {
      newSelected.delete(subCategory)
    } else {
      newSelected.add(subCategory)
    }
    setSelectedSubCategories(newSelected)
    setAllChecked(newSelected.size === uniqueSubCategories.length)
  }

  const handleCheckAll = () => {
    if (allChecked) {
      setSelectedSubCategories(new Set())
      setAllChecked(false)
    } else {
      setSelectedSubCategories(new Set(uniqueSubCategories))
      setAllChecked(true)
    }
  }

  const handleImport = () => {
    console.log("[v0] Importing patch with selected subcategories:", Array.from(selectedSubCategories))
    // TODO: Implement actual import logic
    onOpenChange(false)
  }

  const handleCancel = () => {
    setSelectedSubCategories(new Set())
    setAllChecked(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[85vh] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-2xl font-bold text-white">Import Patch File</DialogTitle>
          <DialogDescription className="text-white/70">
            Select the voice subcategories to import from the patch file
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-8 flex-1 overflow-hidden">
          {/* List 1: Current Subcategories (read-only) */}
          <div className="flex-1 flex flex-col">
            <div className="mb-4 pb-3 border-b border-amber-500/30 flex-shrink-0">
              <h3 className="text-lg font-bold text-amber-400 uppercase tracking-wide">Current Voice Subcategories</h3>
            </div>

            <div className="flex-1 overflow-y-auto pr-4 space-y-1">
              {uniqueSubCategories.map((subCategory) => (
                <div key={`current-${subCategory}`} className="text-sm text-white py-2 px-3 rounded hover:bg-white/5">
                  {subCategory}
                </div>
              ))}
            </div>
          </div>

          {/* Vertical divider */}
          <div className="w-px bg-gradient-to-b from-transparent via-amber-500/30 to-transparent flex-shrink-0" />

          {/* List 2: New Subcategories with Checkboxes */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-amber-500/30 flex-shrink-0">
              <h3 className="text-lg font-bold text-amber-400 uppercase tracking-wide">New Voice Subcategories</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCheckAll}
                className="bg-amber-500/20 border-amber-500/50 text-white hover:bg-amber-500/30 text-xs"
              >
                {allChecked ? "Uncheck All" : "Check All"}
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto pr-4 space-y-1">
              {uniqueSubCategories.map((subCategory) => (
                <div
                  key={`new-${subCategory}`}
                  className="flex items-center gap-3 py-2 px-3 rounded hover:bg-white/5 transition-colors"
                >
                  <InlineCheckbox
                    id={`sub-${subCategory}`}
                    checked={selectedSubCategories.has(subCategory)}
                    onCheckedChange={() => handleSubCategoryToggle(subCategory)}
                  />
                  <label htmlFor={`sub-${subCategory}`} className="text-sm text-white cursor-pointer flex-1">
                    {subCategory}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3 pt-4 border-t border-white/10 flex-shrink-0">
          <Button
            variant="outline"
            onClick={handleCancel}
            size="lg"
            className="px-8 bg-transparent border-white/30 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            size="lg"
            className="glossy-button px-8 bg-amber-500 hover:bg-amber-600 text-white font-semibold"
            disabled={selectedSubCategories.size === 0}
          >
            Import ({selectedSubCategories.size} selected)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
